require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { checkBackendSupabase, isSupabaseConfigured, supabase } = require('./supabaseServer');
const { store, calculateProteinTarget, getLocalDateString } = require('./data/store');

const app = express();
const PORT = process.env.PORT || 5000;
const FASTAPI_URL = process.env.FASTAPI_URL || 'http://127.0.0.1:8000';

// Configure CORS for local development
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    return callback(null, true); // Allow dev origin variations
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// ==========================================
// 1. SYSTEM & HEALTH
// ==========================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'FitPlan AI Companion Gateway',
    fastapi_url: FASTAPI_URL,
    supabase_configured: isSupabaseConfigured,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/supabase/status', async (req, res) => {
  try {
    const status = await checkBackendSupabase();
    res.json(status);
  } catch (error) {
    res.status(500).json({ connected: false, error: error.message });
  }
});

// ==========================================
// 2. USER PROFILE ENDPOINTS
// ==========================================
app.get('/api/profile', async (req, res) => {
  try {
    const result = await store.getProfile();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/profile', async (req, res) => {
  try {
    const updates = req.body;
    const result = await store.updateProfile(updates);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. WORKOUTS & ADAPTIVE GENERATION
// ==========================================
// Get today's workout
app.get('/api/workouts/today', async (req, res) => {
  try {
    const todayWorkout = await store.getTodayWorkout();
    if (todayWorkout) {
      return res.json({ workout: todayWorkout, exists: true });
    }
    return res.json({ workout: null, exists: false, message: "No workout generated for today yet." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate or Regenerate today's adaptive workout
app.post('/api/workouts/generate', async (req, res) => {
  try {
    const profile = (await store.getProfile()).data;
    const checkin = await store.getTodayCheckin();
    const history = await store.getWorkoutHistory('all');

    // Adaptive factors:
    // 1. Previous muscle group
    let previousMuscleGroup = null;
    if (history.length > 0) {
      previousMuscleGroup = history[0].notes || history[0].workout_name || null;
    }

    // 2. Daily check-in metrics
    const energyLevel = checkin ? checkin.energy_level : (req.body.energy_level || 4);
    const sorenessLevel = checkin ? checkin.soreness_level : (req.body.soreness_level || 2);

    // Merge request overrides with stored profile
    const goal = req.body.goal || profile.goal || 'muscle_gain';
    const time = Number(req.body.time) || Number(profile.available_time) || 30;
    const experience = req.body.experience || profile.experience || 'intermediate';
    const equipment = req.body.equipment || profile.equipment || 'dumbbells';

    // Call FastAPI Recommendation Engine
    const fastApiResponse = await fetch(`${FASTAPI_URL}/generate-workout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        goal,
        time,
        experience,
        equipment,
        previous_muscle_group: previousMuscleGroup,
        energy_level: energyLevel,
        soreness_level: sorenessLevel
      })
    });

    const aiPlan = await fastApiResponse.json();
    if (!fastApiResponse.ok) {
      return res.status(fastApiResponse.status).json({
        error: aiPlan.detail || 'Error from AI recommendation engine'
      });
    }

    // Save as Today's workout
    const savedWorkout = await store.saveWorkout(aiPlan);

    return res.status(200).json({
      success: true,
      workout: savedWorkout,
      adaptive_insights: {
        energy_level: energyLevel,
        soreness_level: sorenessLevel,
        previous_muscle_group: previousMuscleGroup,
        protein_target: profile.protein_target
      }
    });
  } catch (error) {
    console.error('Error generating workout:', error.message);
    return res.status(502).json({
      error: 'Unable to communicate with the FastAPI AI engine at ' + FASTAPI_URL + '. Details: ' + error.message
    });
  }
});

// Backward-compatible generate endpoint
app.post('/api/generate-workout', async (req, res) => {
  const { goal, time, experience } = req.body;
  if (!goal || time === undefined || !experience) {
    return res.status(400).json({
      error: 'Missing required fields: goal, time, and experience are all required.'
    });
  }

  try {
    const fastApiResponse = await fetch(`${FASTAPI_URL}/generate-workout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal, time: Number(time), experience })
    });
    const responseData = await fastApiResponse.json();
    if (!fastApiResponse.ok) {
      return res.status(fastApiResponse.status).json({
        error: responseData.detail || 'Error from AI recommendation engine'
      });
    }
    return res.status(200).json(responseData);
  } catch (error) {
    return res.status(502).json({
      error: 'Unable to communicate with the FastAPI AI engine: ' + error.message
    });
  }
});

// Start Workout session
app.post('/api/workouts/:id/start', async (req, res) => {
  const workoutId = req.params.id;
  res.json({
    success: true,
    workout_id: workoutId,
    session_started_at: new Date().toISOString(),
    status: 'in_progress'
  });
});

// Complete Workout & Update Streak
app.post('/api/workouts/:id/complete', async (req, res) => {
  try {
    const workoutId = req.params.id;
    const details = req.body;
    const completionResult = await store.completeWorkout(workoutId, details);
    res.json(completionResult);
  } catch (err) {
    console.error('Error completing workout:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get Workout History
app.get('/api/workouts/history', async (req, res) => {
  try {
    const filter = req.query.filter || 'all';
    const history = await store.getWorkoutHistory(filter);
    res.json({ history });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Backward-compatible /api/workouts listing
app.get('/api/workouts', async (req, res) => {
  try {
    const history = await store.getWorkoutHistory('all');
    res.json({ workouts: history });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save Workout directly to Supabase & Store
app.post('/api/workouts', async (req, res) => {
  try {
    const workoutData = req.body;
    if (!workoutData || (!workoutData.title && !workoutData.workout_name)) {
      return res.status(400).json({ error: 'Workout details are required.' });
    }
    const savedWorkout = await store.saveWorkout(workoutData);
    return res.status(201).json({ success: true, workout: savedWorkout });
  } catch (err) {
    console.error('Error in POST /api/workouts:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. DAILY STREAK & CALENDAR
// ==========================================
app.get('/api/streak', async (req, res) => {
  try {
    const streakStatus = await store.getStreakStatus();
    res.json(streakStatus);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 5. PROGRESS OVERVIEW & DASHBOARD
// ==========================================
app.get('/api/progress', async (req, res) => {
  try {
    const overview = await store.getProgressOverview();
    res.json(overview);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 6. PROTEIN TRACKING & LOGS
// ==========================================
app.get('/api/protein/today', async (req, res) => {
  try {
    const proteinData = await store.getTodayProtein();
    res.json(proteinData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/protein', async (req, res) => {
  try {
    const entry = req.body;
    if (!entry.protein_grams) {
      return res.status(400).json({ error: 'protein_grams is required.' });
    }
    const updated = await store.addProteinEntry(entry);
    res.status(201).json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/protein/:id', async (req, res) => {
  try {
    const entryId = req.params.id;
    const updated = await store.deleteProteinEntry(entryId);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 7. DAILY CHECK-IN
// ==========================================
app.get('/api/checkin/today', async (req, res) => {
  try {
    const checkin = await store.getTodayCheckin();
    res.json({ checkin, exists: Boolean(checkin) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/checkin', async (req, res) => {
  try {
    const record = await store.saveCheckin(req.body);
    res.status(201).json({ success: true, checkin: record });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 8. ACHIEVEMENTS & MILESTONES
// ==========================================
app.get('/api/achievements', async (req, res) => {
  try {
    const achievements = await store.getAchievements();
    res.json({ achievements });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`FitPlan AI Gateway running at http://127.0.0.1:${PORT}`);
  console.log(`Targeting FastAPI at ${FASTAPI_URL}`);
  console.log(`Supabase status: ${isSupabaseConfigured ? 'Connected to ' + process.env.SUPABASE_URL : 'Not configured'}`);
});
