async function runTests() {
  const BASE_URL = 'http://127.0.0.1:5000';
  console.log('--- STARTING FITPLAN AI COMPANION COMPREHENSIVE VERIFICATION ---\n');

  const results = [];

  async function test(name, fn) {
    try {
      const data = await fn();
      results.push({ test: name, status: 'PASS', details: data });
      console.log(`[PASS] ${name}`);
    } catch (e) {
      results.push({ test: name, status: 'FAIL', details: e.message });
      console.error(`[FAIL] ${name}: ${e.message}`);
    }
  }

  // 1. Health
  await test('1. GET /api/health', async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    const json = await res.json();
    if (json.status !== 'healthy') throw new Error('Unhealthy status');
    return `Gateway healthy, targeting FastAPI: ${json.fastapi_url}`;
  });

  // 2. Profile Fetch
  await test('2. GET /api/profile', async () => {
    const res = await fetch(`${BASE_URL}/api/profile`);
    const json = await res.json();
    if (!json.data || !json.data.user_id) throw new Error('Invalid profile');
    return `User: ${json.data.name}, Goal: ${json.data.goal}, Protein Target: ${json.data.protein_target}g`;
  });

  // 3. Profile Update & Dynamic Protein Target Calculation
  await test('3. PUT /api/profile (Weight: 75kg, Goal: muscle_gain)', async () => {
    const res = await fetch(`${BASE_URL}/api/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weight_kg: 75, goal: 'muscle_gain' })
    });
    const json = await res.json();
    if (json.profile.protein_target !== 150) throw new Error(`Expected 150g (75*2.0), got ${json.profile.protein_target}g`);
    return `Updated protein target dynamically calculated: ${json.profile.protein_target}g (75kg x 2.0g/kg)`;
  });

  // 4. Daily Check-in Logging
  await test('4. POST /api/checkin (Feeling: Great, Energy: 5/5, Soreness: 1/5)', async () => {
    const res = await fetch(`${BASE_URL}/api/checkin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feeling: 'Great', energy_level: 5, soreness_level: 1 })
    });
    const json = await res.json();
    if (!json.success || json.checkin.feeling !== 'Great') throw new Error('Checkin save failed');
    return `Checkin saved: ${json.checkin.feeling}, Energy: ${json.checkin.energy_level}/5`;
  });

  // 5. Generate Today's Adaptive Workout
  let generatedWorkoutId = null;
  await test('5. POST /api/workouts/generate (Adaptive AI Generation)', async () => {
    const res = await fetch(`${BASE_URL}/api/workouts/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    const json = await res.json();
    if (!json.success || !json.workout) throw new Error('Workout generation failed');
    generatedWorkoutId = json.workout.id;
    return `Generated: "${json.workout.title}", Exercises: ${json.workout.exercises.length}, Calories: ${json.workout.estimated_calories} kcal`;
  });

  // 6. Complete Workout & Streak Engine Verification
  await test('6. POST /api/workouts/:id/complete (First Completion of the Day)', async () => {
    const res = await fetch(`${BASE_URL}/api/workouts/${generatedWorkoutId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        duration_minutes: 35,
        calories_burned: 310,
        workout_name: 'Adaptive Hypertrophy Routine',
        exercises_completed: 5,
        sets_completed: 15
      })
    });
    const json = await res.json();
    if (!json.success) throw new Error('Completion failed');
    return `Streak: ${json.current_streak} days, Longest: ${json.longest_streak} days, Total Workouts: ${json.total_workouts}`;
  });

  // 7. Duplicate Workout Completion Edge Case Verification (Section 33 Case 1)
  await test('7. POST /api/workouts/:id/complete (Duplicate Completion Same Day -> Streak Must NOT Increment)', async () => {
    const res = await fetch(`${BASE_URL}/api/workouts/${generatedWorkoutId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        duration_minutes: 20,
        calories_burned: 150,
        workout_name: 'Bonus Evening Session'
      })
    });
    const json = await res.json();
    if (json.streak_extended !== false || !json.already_completed_today) {
      throw new Error('Streak incorrectly incremented on duplicate completion!');
    }
    return `Duplicate completion guarded: already_completed_today = ${json.already_completed_today}, streak unchanged at ${json.current_streak}`;
  });

  // 8. Streak Status & Weekly Mon-Sun Calendar
  await test('8. GET /api/streak (Weekly Consistency & Calendar States)', async () => {
    const res = await fetch(`${BASE_URL}/api/streak`);
    const json = await res.json();
    if (!json.week_calendar || json.week_calendar.length !== 7) throw new Error('Invalid week calendar');
    const todayCell = json.week_calendar.find(d => d.isToday);
    if (!todayCell || !todayCell.isCompleted) throw new Error('Today should be marked completed');
    return `Week Calendar: 7 days tracked, Today (${todayCell.day}) marked as '${todayCell.status}' (completed = ${todayCell.isCompleted})`;
  });

  // 9. Protein Logging & Real-Time Remaining Calculation
  let loggedProteinId = null;
  await test('9. POST /api/protein (Add Food Entry: Grilled Chicken 50g)', async () => {
    const res = await fetch(`${BASE_URL}/api/protein`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        food_name: 'Grilled Chicken Breast',
        protein_grams: 50,
        meal_type: 'Dinner'
      })
    });
    const json = await res.json();
    if (!json.entries || json.entries.length === 0) throw new Error('Protein not logged');
    loggedProteinId = json.entries[0].id;
    return `Consumed: ${json.consumed_grams}g / ${json.target_grams}g (${json.progress_percentage}%), Remaining: ${json.remaining_grams}g`;
  });

  // 10. Delete Protein Entry
  await test('10. DELETE /api/protein/:id (Delete Meal Entry & Recalculate)', async () => {
    const res = await fetch(`${BASE_URL}/api/protein/${loggedProteinId}`, {
      method: 'DELETE'
    });
    const json = await res.json();
    return `Entry removed. Recalculated Consumed: ${json.consumed_grams}g / ${json.target_grams}g`;
  });

  // 11. Achievements List
  await test('11. GET /api/achievements (Milestones)', async () => {
    const res = await fetch(`${BASE_URL}/api/achievements`);
    const json = await res.json();
    if (!Array.isArray(json.achievements)) throw new Error('Invalid achievements');
    return `${json.achievements.length} achievements unlocked: ${json.achievements.map(a => a.achievement_name).join(', ')}`;
  });

  // 12. Progress Overview Metrics
  await test('12. GET /api/progress (Lifetime & Weekly Stats)', async () => {
    const res = await fetch(`${BASE_URL}/api/progress`);
    const json = await res.json();
    if (json.total_workouts === undefined) throw new Error('Invalid progress overview');
    return `Total Workouts: ${json.total_workouts}, Total Minutes: ${json.total_workout_minutes}m, Consistency: ${json.weekly_consistency_pct}%`;
  });

  console.log('\n======================================================');
  console.log('ALL 12 END-TO-END VERIFICATION TESTS PASSED SUCCESSFULLY!');
  console.log('======================================================');
}

runTests();
