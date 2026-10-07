const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
const { supabase, isSupabaseConfigured } = require('../supabaseServer');

const DATA_DIR = path.join(__dirname);
const LOCAL_STORE_FILE = path.join(DATA_DIR, 'local_store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Default initial user profile
const DEFAULT_PROFILE = {
  id: randomUUID(),
  user_id: 'default_user',
  name: 'FitPlan Athlete',
  age: 26,
  gender: 'Not Specified',
  height_cm: 175,
  weight_kg: 72,
  goal: 'muscle_gain',
  experience: 'intermediate',
  activity_level: 'moderate',
  available_time: 30,
  equipment: 'dumbbells',
  location: 'Home Gym',
  dietary_preference: 'High Protein',
  protein_target: 144, // 72kg * 2.0g/kg for muscle gain
  current_streak: 0,
  longest_streak: 0,
  total_workouts: 0,
  total_workout_minutes: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// Check if string is a valid UUID
function isValidUUID(str) {
  if (typeof str !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

// Calculate recommended protein target
function calculateProteinTarget(weightKg, goal) {
  const weight = Number(weightKg) || 70;
  let multiplier = 1.6; // default general
  if (goal === 'muscle_gain') {
    multiplier = 2.0; // 1.6-2.2 g/kg
  } else if (goal === 'weight_loss') {
    multiplier = 1.8; // 1.6-2.2 g/kg (preserves lean mass in deficit)
  } else if (goal === 'general_fitness') {
    multiplier = 1.4; // 1.2-1.6 g/kg
  }
  return Math.round(weight * multiplier);
}

// Get standard YYYY-MM-DD date string (Local Date)
function getLocalDateString(date = new Date()) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper to calculate difference in calendar days
function daysBetween(dateStr1, dateStr2) {
  const d1 = new Date(dateStr1 + 'T00:00:00');
  const d2 = new Date(dateStr2 + 'T00:00:00');
  const diffTime = d2.getTime() - d1.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

// Read local store fallback
function readLocalStore() {
  if (!fs.existsSync(LOCAL_STORE_FILE)) {
    const initialData = {
      profile: { ...DEFAULT_PROFILE },
      workouts: [],
      workout_completions: [],
      protein_entries: [],
      daily_checkins: [],
      achievements: []
    };
    fs.writeFileSync(LOCAL_STORE_FILE, JSON.stringify(initialData, null, 2), 'utf8');
    return initialData;
  }
  try {
    const raw = fs.readFileSync(LOCAL_STORE_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading local_store.json, resetting:', err.message);
    const initialData = {
      profile: { ...DEFAULT_PROFILE },
      workouts: [],
      workout_completions: [],
      protein_entries: [],
      daily_checkins: [],
      achievements: []
    };
    fs.writeFileSync(LOCAL_STORE_FILE, JSON.stringify(initialData, null, 2), 'utf8');
    return initialData;
  }
}

// Write local store fallback
function writeLocalStore(data) {
  try {
    fs.writeFileSync(LOCAL_STORE_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing local_store.json:', err.message);
  }
}

// Store manager with Supabase persistence and fallback
class FitPlanStore {
  constructor() {
    this.userId = 'default_user';
  }

  // --- 1. PROFILE ---
  async getProfile() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', this.userId)
          .maybeSingle();

        if (!error && data) {
          return { data, source: 'supabase' };
        }
      } catch (e) {
        // Fallback to local
      }
    }
    const local = readLocalStore();
    return { data: local.profile, source: 'local' };
  }

  async updateProfile(updates) {
    const current = (await this.getProfile()).data;
    const weight = updates.weight_kg !== undefined ? Number(updates.weight_kg) : current.weight_kg;
    const goal = updates.goal || current.goal;
    const proteinTarget = updates.protein_target || calculateProteinTarget(weight, goal);

    const merged = {
      ...current,
      ...updates,
      weight_kg: weight,
      goal: goal,
      protein_target: proteinTarget,
      updated_at: new Date().toISOString()
    };

    // Ensure id is a valid UUID
    if (!isValidUUID(merged.id)) {
      merged.id = randomUUID();
    }

    // Attempt Supabase upsert
    let supabaseSaved = false;
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .upsert({ ...merged, user_id: this.userId }, { onConflict: 'user_id' })
          .select()
          .maybeSingle();

        if (!error && data) {
          supabaseSaved = true;
          merged.id = data.id;
        } else if (error) {
          console.warn('Supabase profile update warning:', error.message);
        }
      } catch (e) {
        console.warn('Supabase profile update exception:', e.message);
      }
    }

    // Always update local cache
    const local = readLocalStore();
    local.profile = merged;
    writeLocalStore(local);

    return { profile: merged, supabaseSynced: supabaseSaved };
  }

  // --- 2. WORKOUTS ---
  async getTodayWorkout() {
    const today = getLocalDateString();
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('workouts')
          .select('*')
          .eq('user_id', this.userId)
          .eq('workout_date', today)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          return data;
        }
      } catch (e) {}
    }
    const local = readLocalStore();
    return local.workouts.find(w => w.workout_date === today) || null;
  }

  async saveWorkout(workoutData) {
    const today = getLocalDateString();
    const workoutUUID = isValidUUID(workoutData.id) ? workoutData.id : randomUUID();

    const newWorkout = {
      id: workoutUUID,
      user_id: this.userId,
      workout_date: today,
      title: workoutData.title || "Personalized Routine",
      goal: workoutData.goal || "muscle_gain",
      duration: Number(workoutData.time) || Number(workoutData.duration) || 30,
      rounds: Number(workoutData.rounds) || 3,
      rest_period: workoutData.rest || workoutData.rest_period || "45 seconds",
      experience: workoutData.experience || "intermediate",
      estimated_calories: workoutData.estimated_calories || 280,
      muscle_group: workoutData.muscle_group || "Full Body",
      exercises: workoutData.exercises || [],
      trainer_tip: workoutData.tip || workoutData.trainer_tip || "",
      status: "pending",
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('workouts')
          .insert([newWorkout]);
        if (error) console.warn('Supabase workout insert warning:', error.message);
      } catch (e) {
        console.warn('Supabase workout insert exception:', e.message);
      }
    }

    const local = readLocalStore();
    local.workouts = local.workouts.filter(w => w.id !== newWorkout.id);
    local.workouts.unshift(newWorkout);
    writeLocalStore(local);

    return newWorkout;
  }

  // --- 3. WORKOUT COMPLETION & ACCURATE STREAK ENGINE ---
  async completeWorkout(workoutId, details = {}) {
    const today = getLocalDateString();
    const now = new Date();
    const local = readLocalStore();
    const profile = (await this.getProfile()).data;

    let alreadyCompletedToday = false;

    // 1. Check Supabase completions if available
    let allCompletions = [];
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('workout_completions')
          .select('*')
          .eq('user_id', this.userId)
          .order('workout_date', { ascending: false });

        if (!error && data) {
          allCompletions = data;
        }
      } catch (e) {}
    }

    if (allCompletions.length === 0) {
      allCompletions = local.workout_completions;
    }

    // Check if there is already a completion for today
    const existingToday = allCompletions.find(c => c.workout_date === today);
    if (existingToday) {
      alreadyCompletedToday = true;
    }

    // Calculate Streak
    let currentStreak = profile.current_streak || 0;
    let longestStreak = profile.longest_streak || 0;
    let totalWorkouts = profile.total_workouts || 0;
    let totalMinutes = profile.total_workout_minutes || 0;

    const duration = Number(details.duration_minutes) || Number(details.duration) || 30;
    const calories = Number(details.calories_burned) || Number(details.calories) || 250;
    const workoutName = details.workout_name || details.title || "Daily Workout";
    const exercisesCompleted = Number(details.exercises_completed) || 5;

    let streakExtended = false;

    if (!alreadyCompletedToday) {
      // Find the most recent completion prior to today
      const previousCompletions = allCompletions
        .filter(c => c.workout_date < today)
        .sort((a, b) => b.workout_date.localeCompare(a.workout_date));

      if (previousCompletions.length > 0) {
        const lastDate = previousCompletions[0].workout_date;
        const diff = daysBetween(lastDate, today);

        if (diff === 1) {
          // Completed yesterday -> Streak increments by 1
          currentStreak += 1;
          streakExtended = true;
        } else {
          // Missed one or more days -> Streak resets to 1
          currentStreak = 1;
          streakExtended = true;
        }
      } else {
        // First ever completion
        currentStreak = 1;
        streakExtended = true;
      }

      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }

      totalWorkouts += 1;
      totalMinutes += duration;
    }

    // Ensure valid UUID for completion
    const validWorkoutUUID = isValidUUID(workoutId) ? workoutId : null;

    const completionRecord = {
      id: randomUUID(),
      user_id: this.userId,
      workout_id: validWorkoutUUID,
      workout_date: today,
      workout_name: workoutName,
      duration_minutes: duration,
      calories_burned: calories,
      exercises_completed: exercisesCompleted,
      notes: details.notes || "Completed in full session mode",
      completed_at: now.toISOString()
    };

    // Save completion to Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('workout_completions')
          .upsert(completionRecord, { onConflict: 'user_id, workout_date' });

        // Update workout status if UUID is valid
        if (validWorkoutUUID) {
          await supabase
            .from('workouts')
            .update({ status: 'completed', completed_at: now.toISOString() })
            .eq('id', validWorkoutUUID);
        }
      } catch (e) {
        console.warn('Supabase completion insert exception:', e.message);
      }
    }

    // Save to local store
    if (!existingToday) {
      local.workout_completions.unshift(completionRecord);
    }
    const targetWk = local.workouts.find(w => w.id === workoutId);
    if (targetWk) {
      targetWk.status = 'completed';
      targetWk.completed_at = now.toISOString();
    }
    writeLocalStore(local);

    // Update Profile with new stats
    await this.updateProfile({
      current_streak: currentStreak,
      longest_streak: longestStreak,
      total_workouts: totalWorkouts,
      total_workout_minutes: totalMinutes
    });

    // Check & Award Milestones
    const newAchievements = await this.evaluateMilestones(currentStreak, totalWorkouts);

    return {
      success: true,
      already_completed_today: alreadyCompletedToday,
      streak_extended: streakExtended,
      current_streak: currentStreak,
      longest_streak: longestStreak,
      total_workouts: totalWorkouts,
      total_workout_minutes: totalMinutes,
      completion: completionRecord,
      achievements_unlocked: newAchievements,
      message: alreadyCompletedToday 
        ? "Workout logged! Your daily streak was already counted for today."
        : `Great work! You completed today's workout and extended your streak to ${currentStreak} day${currentStreak > 1 ? 's' : ''}!`
    };
  }

  // --- 4. ACHIEVEMENTS & MILESTONES ---
  async evaluateMilestones(streak, totalWorkouts) {
    const milestones = [
      { id: 'first_workout', name: 'First Workout', desc: 'Completed your very first workout session!', icon: '⚡', check: () => totalWorkouts >= 1 },
      { id: 'streak_3', name: '3-Day Ignition', desc: 'Trained 3 days in a row! Momentum is building.', icon: '🔥', check: () => streak >= 3 },
      { id: 'streak_7', name: '7-Day Warrior', desc: 'Full week of uninterrupted daily consistency!', icon: '🛡️', check: () => streak >= 7 },
      { id: 'streak_14', name: '14-Day Beast', desc: 'Two solid weeks of discipline and grit!', icon: '⚔️', check: () => streak >= 14 },
      { id: 'streak_30', name: '30-Day Master', desc: 'One month streak! You built a permanent habit.', icon: '👑', check: () => streak >= 30 },
      { id: 'streak_50', name: '50-Day Titan', desc: 'Fifty days of relentless dedication.', icon: '🌟', check: () => streak >= 50 },
      { id: 'streak_100', name: 'Centurion', desc: '100 consecutive days of fitness excellence.', icon: '🏆', check: () => streak >= 100 },
      { id: 'workouts_10', name: '10 Workouts Club', desc: 'Logged 10 total training sessions.', icon: '🎯', check: () => totalWorkouts >= 10 },
      { id: 'workouts_25', name: 'Quarter Century', desc: '25 total workouts in the bag.', icon: '💎', check: () => totalWorkouts >= 25 },
      { id: 'workouts_50', name: 'Half Century', desc: '50 workouts logged! Stronger than ever.', icon: '🚀', check: () => totalWorkouts >= 50 },
      { id: 'workouts_100', name: 'Century Club', desc: '100 lifetime workout sessions achieved.', icon: '🥇', check: () => totalWorkouts >= 100 }
    ];

    const currentAchievements = await this.getAchievements();
    const existingIds = new Set(currentAchievements.map(a => a.achievement_type));
    const newlyUnlocked = [];

    for (const m of milestones) {
      if (m.check() && !existingIds.has(m.id)) {
        const achievementRecord = {
          id: randomUUID(),
          user_id: this.userId,
          achievement_type: m.id,
          achievement_name: m.name,
          description: m.desc,
          icon: m.icon,
          achieved_at: new Date().toISOString()
        };

        if (isSupabaseConfigured && supabase) {
          try {
            await supabase
              .from('achievements')
              .upsert(achievementRecord, { onConflict: 'user_id, achievement_type' });
          } catch (e) {
            console.warn('Supabase achievement insert exception:', e.message);
          }
        }

        const local = readLocalStore();
        local.achievements.push(achievementRecord);
        writeLocalStore(local);

        newlyUnlocked.push(achievementRecord);
      }
    }

    return newlyUnlocked;
  }

  async getAchievements() {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('achievements')
          .select('*')
          .eq('user_id', this.userId)
          .order('achieved_at', { ascending: false });

        if (!error && data && data.length > 0) return data;
      } catch (e) {}
    }
    const local = readLocalStore();
    return local.achievements || [];
  }

  // --- 5. DAILY PROTEIN TRACKING & LOGICAL DAY RESETS ---
  async getTodayProtein() {
    const today = getLocalDateString();
    let entries = [];

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('protein_entries')
          .select('*')
          .eq('user_id', this.userId)
          .eq('entry_date', today)
          .order('created_at', { ascending: false });

        if (!error && data) {
          entries = data;
        }
      } catch (e) {}
    }

    if (entries.length === 0) {
      const local = readLocalStore();
      entries = local.protein_entries.filter(e => e.entry_date === today);
    }

    const profile = (await this.getProfile()).data;
    const target = profile.protein_target || calculateProteinTarget(profile.weight_kg, profile.goal);
    const consumed = entries.reduce((acc, curr) => acc + (Number(curr.protein_grams) || 0), 0);
    const remaining = Math.max(0, target - consumed);
    const percentage = target > 0 ? Math.min(100, Math.round((consumed / target) * 100)) : 0;

    return {
      date: today,
      target_grams: target,
      consumed_grams: consumed,
      remaining_grams: remaining,
      progress_percentage: percentage,
      entries: entries
    };
  }

  async addProteinEntry(entry) {
    const today = getLocalDateString();
    const proteinGrams = Number(entry.protein_grams) || 0;
    const newEntry = {
      id: randomUUID(),
      user_id: this.userId,
      entry_date: today,
      food_name: entry.food_name || 'Protein Boost',
      protein_grams: proteinGrams,
      meal_type: entry.meal_type || 'Snack',
      time_logged: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('protein_entries').insert([newEntry]);
        if (error) console.warn('Supabase protein insert warning:', error.message);
      } catch (e) {
        console.warn('Supabase protein insert exception:', e.message);
      }
    }

    const local = readLocalStore();
    local.protein_entries.unshift(newEntry);
    writeLocalStore(local);

    return await this.getTodayProtein();
  }

  async deleteProteinEntry(entryId) {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('protein_entries')
          .delete()
          .eq('id', entryId)
          .eq('user_id', this.userId);
      } catch (e) {}
    }

    const local = readLocalStore();
    local.protein_entries = local.protein_entries.filter(e => e.id !== entryId);
    writeLocalStore(local);

    return await this.getTodayProtein();
  }

  // --- 6. DAILY CHECK-IN (ENERGY & SORENESS) ---
  async getTodayCheckin() {
    const today = getLocalDateString();
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('daily_checkins')
          .select('*')
          .eq('user_id', this.userId)
          .eq('checkin_date', today)
          .maybeSingle();

        if (!error && data) return data;
      } catch (e) {}
    }
    const local = readLocalStore();
    return local.daily_checkins.find(c => c.checkin_date === today) || null;
  }

  async saveCheckin(checkinData) {
    const today = getLocalDateString();
    const record = {
      id: randomUUID(),
      user_id: this.userId,
      checkin_date: today,
      feeling: checkinData.feeling || 'Good',
      energy_level: Number(checkinData.energy_level) || 4,
      soreness_level: Number(checkinData.soreness_level) || 2,
      notes: checkinData.notes || '',
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('daily_checkins')
          .upsert(record, { onConflict: 'user_id, checkin_date' });
      } catch (e) {
        console.warn('Supabase checkin upsert exception:', e.message);
      }
    }

    const local = readLocalStore();
    local.daily_checkins = local.daily_checkins.filter(c => c.checkin_date !== today);
    local.daily_checkins.unshift(record);
    writeLocalStore(local);

    return record;
  }

  // --- 7. WEEKLY CALENDAR & STREAK STATUS ---
  async getStreakStatus() {
    const profile = (await this.getProfile()).data;
    const today = getLocalDateString();
    const completions = await this.getWorkoutHistory('all');

    // Calculate Weekly activity for current week (Mon -> Sun)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const distanceToMonday = (dayOfWeek + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - distanceToMonday);

    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weekCalendar = [];
    let completedThisWeek = 0;

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dStr = getLocalDateString(d);
      const isCompleted = completions.some(c => c.workout_date === dStr);
      let status = 'future';

      if (isCompleted) {
        status = 'completed';
        completedThisWeek++;
      } else if (dStr === today) {
        status = 'today';
      } else if (dStr < today) {
        status = 'missed';
      }

      weekCalendar.push({
        day: weekDays[i],
        date: dStr,
        status: status,
        isCompleted: isCompleted,
        isToday: dStr === today
      });
    }

    const weeklyConsistency = Math.round((completedThisWeek / 7) * 100);

    return {
      current_streak: profile.current_streak || 0,
      longest_streak: profile.longest_streak || 0,
      total_workouts: profile.total_workouts || 0,
      completed_today: weekCalendar.find(d => d.isToday)?.isCompleted || false,
      week_calendar: weekCalendar,
      completed_this_week: completedThisWeek,
      weekly_consistency_pct: weeklyConsistency,
      motivational_message: this.generateMotivationalMessage(profile, completedThisWeek)
    };
  }

  // --- 8. WORKOUT HISTORY & PROGRESS ANALYTICS ---
  async getWorkoutHistory(filter = 'all') {
    let history = [];
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('workout_completions')
          .select('*')
          .eq('user_id', this.userId)
          .order('completed_at', { ascending: false });

        if (!error && data) {
          history = data;
        }
      } catch (e) {}
    }

    if (history.length === 0) {
      const local = readLocalStore();
      history = local.workout_completions;
    }

    const now = new Date();
    if (filter === 'week') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return history.filter(h => new Date(h.completed_at) >= oneWeekAgo);
    } else if (filter === 'month') {
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return history.filter(h => new Date(h.completed_at) >= oneMonthAgo);
    } else if (filter === '3months') {
      const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      return history.filter(h => new Date(h.completed_at) >= threeMonthsAgo);
    }

    return history;
  }

  async getProgressOverview() {
    const profile = (await this.getProfile()).data;
    const history = await this.getWorkoutHistory('all');
    const proteinData = await this.getTodayProtein();
    const streakStatus = await this.getStreakStatus();

    const totalMinutes = history.reduce((acc, curr) => acc + (Number(curr.duration_minutes) || 0), 0);
    const totalCalories = history.reduce((acc, curr) => acc + (Number(curr.calories_burned) || 0), 0);

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const monthlyWorkouts = history.filter(h => new Date(h.completed_at) >= thirtyDaysAgo).length;

    return {
      current_streak: profile.current_streak || 0,
      longest_streak: profile.longest_streak || 0,
      total_workouts: history.length || profile.total_workouts || 0,
      weekly_workouts: streakStatus.completed_this_week,
      monthly_workouts: monthlyWorkouts,
      total_workout_minutes: totalMinutes || profile.total_workout_minutes || 0,
      total_calories_burned: totalCalories,
      protein_target: proteinData.target_grams,
      protein_consumed_today: proteinData.consumed_grams,
      weekly_consistency_pct: streakStatus.weekly_consistency_pct,
      recent_workouts: history.slice(0, 5)
    };
  }

  // Helper for dynamic motivation messages
  generateMotivationalMessage(profile, completedThisWeek) {
    const streak = profile.current_streak || 0;
    if (streak >= 7) {
      return `🔥 Unstoppable! You're on an incredible ${streak}-day streak! Keep the warrior spirit high!`;
    } else if (streak >= 3) {
      return `⚡ Great momentum! ${streak} days in a row! You're forging real fitness discipline!`;
    } else if (streak === 1) {
      return `💪 You've ignited your streak! Come back tomorrow to keep the flame alive.`;
    } else if (completedThisWeek >= 4) {
      return `🎯 Outstanding work: ${completedThisWeek} workouts completed this week! You're crushing your goals.`;
    } else {
      return `🚀 Ready to get stronger today? A 30-minute workout today continues your fitness journey!`;
    }
  }
}

const store = new FitPlanStore();

module.exports = {
  store,
  calculateProteinTarget,
  getLocalDateString
};
