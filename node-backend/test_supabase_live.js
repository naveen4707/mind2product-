const { supabase } = require('./supabaseServer');

async function testSupabaseLive() {
  console.log('=== TESTING REAL SUPABASE TABLES ===\n');

  try {
    // 1. Test profiles
    console.log('1. Testing profiles table...');
    const testProfile = {
      user_id: 'default_user',
      name: 'FitPlan Super Athlete',
      age: 27,
      height_cm: 180,
      weight_kg: 78,
      goal: 'muscle_gain',
      protein_target: 156,
      current_streak: 1,
      longest_streak: 1,
      total_workouts: 1,
      total_workout_minutes: 35
    };

    const { data: profData, error: profErr } = await supabase
      .from('profiles')
      .upsert(testProfile, { onConflict: 'user_id' })
      .select()
      .single();

    if (profErr) throw new Error('Profile error: ' + profErr.message);
    console.log('✓ Profile successfully saved to Supabase:', profData.name, `(${profData.protein_target}g protein)`);

    // 2. Test workouts
    console.log('\n2. Testing workouts table...');
    const testWorkout = {
      user_id: 'default_user',
      workout_date: new Date().toISOString().split('T')[0],
      title: 'Supabase Cloud Verification Workout',
      goal: 'muscle_gain',
      duration: 30,
      rounds: 3,
      rest_period: '45 seconds',
      experience: 'intermediate',
      estimated_calories: 280,
      muscle_group: 'Chest & Core',
      exercises: [
        { name: 'Dumbbell Bench Press', sets: 3, reps: '12 reps' },
        { name: 'Diamond Push-ups', sets: 3, reps: '15 reps' }
      ],
      trainer_tip: 'Focus on explosive press and controlled eccentric phase.',
      status: 'completed'
    };

    const { data: wkData, error: wkErr } = await supabase
      .from('workouts')
      .insert([testWorkout])
      .select()
      .single();

    if (wkErr) throw new Error('Workout insert error: ' + wkErr.message);
    console.log('✓ Workout successfully saved to Supabase with ID:', wkData.id);

    // 3. Test workout_completions
    console.log('\n3. Testing workout_completions table...');
    const todayStr = new Date().toISOString().split('T')[0];
    const testCompletion = {
      user_id: 'default_user',
      workout_id: wkData.id,
      workout_date: todayStr,
      workout_name: wkData.title,
      duration_minutes: 30,
      calories_burned: 280,
      exercises_completed: 2,
      notes: 'Real cloud execution verification'
    };

    // Upsert or insert check
    const { data: compData, error: compErr } = await supabase
      .from('workout_completions')
      .upsert(testCompletion, { onConflict: 'user_id, workout_date' })
      .select()
      .single();

    if (compErr) throw new Error('Workout completion error: ' + compErr.message);
    console.log('✓ Workout completion recorded in Supabase for date:', compData.workout_date);

    // 4. Test protein_entries
    console.log('\n4. Testing protein_entries table...');
    const testProtein = {
      user_id: 'default_user',
      entry_date: todayStr,
      food_name: 'Grilled Salmon with Quinoa',
      protein_grams: 48,
      meal_type: 'Dinner'
    };

    const { data: protData, error: protErr } = await supabase
      .from('protein_entries')
      .insert([testProtein])
      .select()
      .single();

    if (protErr) throw new Error('Protein insert error: ' + protErr.message);
    console.log('✓ Protein entry saved in Supabase:', protData.food_name, `(+${protData.protein_grams}g)`);

    // Verify reading total protein for today from Supabase
    const { data: allTodayProtein, error: readProtErr } = await supabase
      .from('protein_entries')
      .select('*')
      .eq('user_id', 'default_user')
      .eq('entry_date', todayStr);

    if (readProtErr) throw new Error('Protein read error: ' + readProtErr.message);
    const totalGrams = allTodayProtein.reduce((sum, item) => sum + Number(item.protein_grams), 0);
    console.log(`✓ Total protein for today read from Supabase: ${totalGrams}g across ${allTodayProtein.length} entries`);

    // 5. Test daily_checkins
    console.log('\n5. Testing daily_checkins table...');
    const testCheckin = {
      user_id: 'default_user',
      checkin_date: todayStr,
      feeling: 'Great',
      energy_level: 5,
      soreness_level: 1,
      notes: 'Feeling fully energized after recovery'
    };

    const { data: chkData, error: chkErr } = await supabase
      .from('daily_checkins')
      .upsert(testCheckin, { onConflict: 'user_id, checkin_date' })
      .select()
      .single();

    if (chkErr) throw new Error('Checkin error: ' + chkErr.message);
    console.log('✓ Daily checkin saved to Supabase:', chkData.feeling, `(Energy: ${chkData.energy_level}/5)`);

    // 6. Test achievements
    console.log('\n6. Testing achievements table...');
    const testAchievement = {
      user_id: 'default_user',
      achievement_type: 'streak_3',
      achievement_name: '3-Day Ignition',
      description: 'Trained 3 days in a row! Momentum is building.',
      icon: '🔥'
    };

    const { data: achData, error: achErr } = await supabase
      .from('achievements')
      .upsert(testAchievement, { onConflict: 'user_id, achievement_type' })
      .select()
      .single();

    if (achErr) throw new Error('Achievement error: ' + achErr.message);
    console.log('✓ Achievement recorded in Supabase:', achData.achievement_name, achData.icon);

    console.log('\n======================================================');
    console.log('ALL SUPABASE CLOUD DATABASE TESTS PASSED 100%!');
    console.log('======================================================');
  } catch (err) {
    console.error('\n❌ Supabase test failed:', err.message);
    process.exit(1);
  }
}

testSupabaseLive();
