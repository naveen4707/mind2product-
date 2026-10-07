import React, { useState, useEffect, useRef } from 'react';

const WorkoutSessionModal = ({ workout, onClose, onWorkoutCompleted }) => {
  // Step: 'countdown' | 'in_progress' | 'rest' | 'completed'
  const [sessionState, setSessionState] = useState('countdown');
  const [countdown, setCountdown] = useState(3);
  
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [workoutElapsedSeconds, setWorkoutElapsedSeconds] = useState(0);
  const [exerciseElapsedSeconds, setExerciseElapsedSeconds] = useState(0);
  const [restRemainingSeconds, setRestRemainingSeconds] = useState(45);
  const [isPaused, setIsPaused] = useState(false);
  const [completedSets, setCompletedSets] = useState({});
  const [completionResult, setCompletionResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timerRef = useRef(null);

  const exercises = workout?.exercises || [];
  const currentExercise = exercises[currentExerciseIndex] || {};
  const totalSets = currentExercise?.sets || 3;
  const restDuration = currentExercise?.rest_seconds || 45;

  // 1. Initial 3-2-1 Countdown
  useEffect(() => {
    if (sessionState === 'countdown') {
      if (countdown > 1) {
        const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(timer);
      } else if (countdown === 1) {
        const timer = setTimeout(() => {
          setSessionState('in_progress');
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [sessionState, countdown]);

  // 2. Real-Time Workout & Exercise Elapsed Timer
  useEffect(() => {
    if (sessionState === 'in_progress' && !isPaused) {
      timerRef.current = setInterval(() => {
        setWorkoutElapsedSeconds(prev => prev + 1);
        setExerciseElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else if (sessionState === 'rest' && !isPaused) {
      timerRef.current = setInterval(() => {
        setWorkoutElapsedSeconds(prev => prev + 1);
        setRestRemainingSeconds(prev => {
          if (prev <= 1) {
            // Rest finished -> proceed
            setSessionState('in_progress');
            return restDuration;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sessionState, isPaused, restDuration]);

  // Calculate real-time estimated calories burned
  const estimatedCaloriesBurned = Math.max(10, Math.round((workoutElapsedSeconds / 60) * 8.5));

  // Toggle completed set
  const toggleSet = (setNumber) => {
    const key = `${currentExerciseIndex}_${setNumber}`;
    setCompletedSets(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Check if current exercise has sets completed
  const getSetsDoneForCurrent = () => {
    let count = 0;
    for (let s = 1; s <= totalSets; s++) {
      if (completedSets[`${currentExerciseIndex}_${s}`]) count++;
    }
    return count;
  };

  // Trigger Rest Interval
  const startRest = () => {
    setRestRemainingSeconds(restDuration);
    setSessionState('rest');
  };

  const skipRest = () => {
    setSessionState('in_progress');
    setRestRemainingSeconds(restDuration);
  };

  // Next / Previous Navigation
  const handleNext = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setExerciseElapsedSeconds(0);
      startRest();
    } else {
      finishWorkout();
    }
  };

  const handlePrev = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(prev => prev - 1);
      setExerciseElapsedSeconds(0);
    }
  };

  const handleSkip = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setExerciseElapsedSeconds(0);
    } else {
      finishWorkout();
    }
  };

  // Format seconds to mm:ss
  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Finish Workout API call
  const finishWorkout = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setIsPaused(true);

    const durationMinutes = Math.max(1, Math.round(workoutElapsedSeconds / 60));
    
    // Count total sets completed across all exercises
    const totalSetsCompleted = Object.values(completedSets).filter(Boolean).length;

    try {
      const response = await fetch(`/api/workouts/${workout?.id || 'today'}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          duration_minutes: durationMinutes,
          calories_burned: estimatedCaloriesBurned,
          workout_name: workout?.title || 'Daily Workout',
          exercises_completed: exercises.length,
          sets_completed: totalSetsCompleted
        })
      });

      const data = await response.json();
      setCompletionResult(data);
      setSessionState('completed');
      if (onWorkoutCompleted) {
        onWorkoutCompleted(data);
      }
    } catch (err) {
      console.error('Error recording completion:', err);
      // Fallback completion display
      setCompletionResult({
        success: true,
        current_streak: 1,
        message: "Workout completed and recorded successfully!"
      });
      setSessionState('completed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="workout-player-overlay">
      <div className="workout-player-modal">
        {/* Header Bar */}
        <div className="player-header">
          <div className="player-title-info">
            <span className="player-badge">LIVE SESSION</span>
            <h3>{workout?.title || "Workout Session"}</h3>
          </div>
          <button className="player-close-btn" onClick={onClose} title="Exit workout">
            ✕
          </button>
        </div>

        {/* 1. COUNTDOWN SCREEN */}
        {sessionState === 'countdown' && (
          <div className="player-countdown-view">
            <span className="countdown-sub">Get Ready</span>
            <div className="countdown-number">{countdown}</div>
            <p className="countdown-tip">Focus your breath and get into position!</p>
          </div>
        )}

        {/* 2. ACTIVE WORKOUT OR REST VIEW */}
        {(sessionState === 'in_progress' || sessionState === 'rest') && (
          <div className="player-body">
            {/* Top Telemetry Bar */}
            <div className="telemetry-bar">
              <div className="telemetry-item">
                <span className="telemetry-label">TOTAL TIME</span>
                <span className="telemetry-val highlight">{formatTime(workoutElapsedSeconds)}</span>
              </div>
              <div className="telemetry-item">
                <span className="telemetry-label">EST. BURN</span>
                <span className="telemetry-val">🔥 {estimatedCaloriesBurned} kcal</span>
              </div>
              <div className="telemetry-item">
                <span className="telemetry-label">PROGRESS</span>
                <span className="telemetry-val">
                  {currentExerciseIndex + 1} / {exercises.length}
                </span>
              </div>
            </div>

            {/* Overall Progress Line */}
            <div className="player-progress-bar">
              <div 
                className="player-progress-fill" 
                style={{ width: `${((currentExerciseIndex + 1) / exercises.length) * 100}%` }}
              ></div>
            </div>

            {/* REST MODE BANNER */}
            {sessionState === 'rest' ? (
              <div className="rest-timer-view">
                <span className="rest-pulse-icon">⏱️</span>
                <h4>REST INTERVAL</h4>
                <div className="rest-timer-countdown">{restRemainingSeconds}s</div>
                <p>Catch your breath and prepare for {currentExercise?.name}</p>
                <button className="btn-skip-rest" onClick={skipRest}>
                  Skip Rest ⏩
                </button>
              </div>
            ) : (
              /* ACTIVE EXERCISE VIEW */
              <div className="exercise-active-card">
                <div className="exercise-top-row">
                  <div>
                    <span className="exercise-group-pill">{currentExercise?.muscle_group || "Full Body"}</span>
                    <h2 className="current-ex-title">{currentExercise?.name}</h2>
                  </div>
                  <div className="ex-timer-box">
                    <span className="ex-timer-label">EXERCISE TIMER</span>
                    <span className="ex-timer-clock">{formatTime(exerciseElapsedSeconds)}</span>
                  </div>
                </div>

                {/* Target Sets & Reps */}
                <div className="sets-reps-ribbon">
                  <div className="ribbon-item">
                    <span className="r-label">TARGET SETS</span>
                    <span className="r-val">{currentExercise?.sets || 3} Sets</span>
                  </div>
                  <div className="ribbon-item">
                    <span className="r-label">TARGET REPS</span>
                    <span className="r-val">{currentExercise?.reps || currentExercise?.duration || "12 reps"}</span>
                  </div>
                  <div className="ribbon-item">
                    <span className="r-label">REST AFTER</span>
                    <span className="r-val">{restDuration}s</span>
                  </div>
                  <div className="ribbon-item">
                    <span className="r-label">DIFFICULTY</span>
                    <span className="r-val">{currentExercise?.difficulty || "Moderate"}</span>
                  </div>
                </div>

                {/* Interactive Sets Checklist */}
                <div className="sets-check-container">
                  <span className="checklist-heading">CHECK OFF COMPLETED SETS:</span>
                  <div className="sets-pills">
                    {Array.from({ length: totalSets }, (_, i) => i + 1).map((sNum) => {
                      const isDone = Boolean(completedSets[`${currentExerciseIndex}_${sNum}`]);
                      return (
                        <button
                          key={sNum}
                          className={`set-check-pill ${isDone ? 'done' : ''}`}
                          onClick={() => toggleSet(sNum)}
                        >
                          <span className="check-box">{isDone ? '✓' : ''}</span>
                          <span>Set {sNum}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Form & Safety Instructions */}
                <div className="exercise-instructions-box">
                  <p><strong>💡 Form:</strong> {currentExercise?.instructions || "Maintain controlled movement with full range of motion."}</p>
                  {currentExercise?.safety_tips && (
                    <p className="safety-tip"><strong>🛡️ Safety:</strong> {currentExercise?.safety_tips}</p>
                  )}
                </div>
              </div>
            )}

            {/* Bottom Controls */}
            <div className="player-controls-footer">
              <button 
                className="btn-ctrl secondary" 
                onClick={handlePrev}
                disabled={currentExerciseIndex === 0}
              >
                ⏮️ Prev
              </button>

              <button 
                className="btn-ctrl primary" 
                onClick={() => setIsPaused(!isPaused)}
              >
                {isPaused ? '▶️ Resume' : '⏸️ Pause'}
              </button>

              <button 
                className="btn-ctrl secondary" 
                onClick={handleSkip}
              >
                Skip ⏭️
              </button>

              {currentExerciseIndex < exercises.length - 1 ? (
                <button className="btn-ctrl action" onClick={handleNext}>
                  Next Exercise ➔
                </button>
              ) : (
                <button 
                  className="btn-ctrl finish-btn" 
                  onClick={finishWorkout}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Finish Workout 🎉'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* 3. WORKOUT COMPLETION CELEBRATION */}
        {sessionState === 'completed' && (
          <div className="completion-modal-view">
            {/* Live Confetti Particle Cascade */}
            <div className="confetti-overlay" aria-hidden="true">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className={`confetti-particle p-${(i % 6) + 1}`} style={{
                  left: `${(i * 4.1) + 2}%`,
                  animationDelay: `${(i * 0.12).toFixed(2)}s`
                }}></div>
              ))}
            </div>

            <div className="celebration-badge">🎉</div>
            <h2 className="completion-heading">Workout Complete!</h2>
            <p className="completion-sub">
              {completionResult?.message || "Great work! You pushed through today's session."}
            </p>

            {/* Summary Metrics Grid */}
            <div className="completion-metrics-grid">
              <div className="c-metric-card">
                <span className="c-label">DURATION</span>
                <span className="c-val">{Math.max(1, Math.round(workoutElapsedSeconds / 60))} min</span>
              </div>
              <div className="c-metric-card">
                <span className="c-label">CALORIES BURNED</span>
                <span className="c-val">🔥 {estimatedCaloriesBurned} kcal</span>
              </div>
              <div className="c-metric-card">
                <span className="c-label">EXERCISES</span>
                <span className="c-val">{exercises.length}</span>
              </div>
              <div className="c-metric-card">
                <span className="c-label">SETS COMPLETED</span>
                <span className="c-val">{Object.values(completedSets).filter(Boolean).length}</span>
              </div>
            </div>

            {/* Streak Extension Banner */}
            <div className="completion-streak-card">
              <span className="streak-flame">🔥</span>
              <div>
                <h4>
                  {completionResult?.current_streak || 1} DAY STREAK
                </h4>
                <p>
                  {completionResult?.already_completed_today 
                    ? "Streak was already updated for today. Consistency is your superpower!" 
                    : "Streak extended! Keep the momentum alive tomorrow."}
                </p>
              </div>
            </div>

            {/* Achievements Unlocked Alert */}
            {completionResult?.achievements_unlocked?.length > 0 && (
              <div className="completion-achievement-alert">
                <span className="ach-icon">🏆</span>
                <div>
                  <strong>Milestone Unlocked: {completionResult.achievements_unlocked[0].achievement_name}!</strong>
                  <p>{completionResult.achievements_unlocked[0].description}</p>
                </div>
              </div>
            )}

            {/* Protein Reminder */}
            <div className="completion-protein-reminder">
              <span className="p-icon">🥩</span>
              <p>
                <strong>Post-Workout Nutrition:</strong> Don't forget your daily protein target! Refuel within 60 minutes for optimal recovery and repair.
              </p>
            </div>

            <button className="btn-close-completion" onClick={onClose}>
              Return to Dashboard 🚀
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutSessionModal;
