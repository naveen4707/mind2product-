import React, { useState, useEffect } from 'react';
import StreakTracker from './StreakTracker';
import DailyProteinTracker from './DailyProteinTracker';
import DailyCheckin from './DailyCheckin';
import WorkoutSessionModal from './WorkoutSessionModal';
import ProfileModal from './ProfileModal';
import AchievementsModal from './AchievementsModal';
import WorkoutHistory from './WorkoutHistory';

const CompanionDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [todayWorkout, setTodayWorkout] = useState(null);
  const [isWorkoutLoading, setIsWorkoutLoading] = useState(false);
  const [activeSessionWorkout, setActiveSessionWorkout] = useState(null);
  
  // Modals state
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [showHistorySection, setShowHistorySection] = useState(false);

  // Global refresh trigger to synchronize components after completions/updates
  const [refreshKey, setRefreshKey] = useState(0);

  // Load Profile & Today's Workout
  const loadDashboardData = async () => {
    try {
      const [profRes, wkRes] = await Promise.all([
        fetch('/api/profile'),
        fetch('/api/workouts/today')
      ]);

      if (profRes.ok) {
        const pData = await profRes.json();
        setProfile(pData.data);
      }

      if (wkRes.ok) {
        const wData = await wkRes.json();
        if (wData.exists && wData.workout) {
          setTodayWorkout(wData.workout);
        }
      }
    } catch (err) {
      console.error('Error loading companion dashboard data:', err);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [refreshKey]);

  // Generate / Regenerate Today's Workout
  const handleGenerateTodayWorkout = async () => {
    setIsWorkoutLoading(true);
    try {
      const res = await fetch('/api/workouts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      if (res.ok) {
        const data = await res.json();
        setTodayWorkout(data.workout);
        setRefreshKey(k => k + 1);
      }
    } catch (err) {
      console.error('Error generating workout:', err);
    } finally {
      setIsWorkoutLoading(false);
    }
  };

  const handleWorkoutCompleted = (result) => {
    setRefreshKey(k => k + 1);
  };

  const greetingName = profile?.name ? profile.name.toUpperCase() : 'ATHLETE';

  return (
    <section className="companion-dashboard" id="dashboard">
      {/* 1. TOP ATHLETE GREETING & HEADER ACTION BAR */}
      <div className="dashboard-welcome-banner">
        <div className="welcome-text-col">
          <span className="welcome-salutation">GOOD MORNING, {greetingName} 👋</span>
          <h1 className="welcome-heading">Ready to get stronger today?</h1>
          <p className="welcome-sub">
            Your AI companion has tailored today's routine based on your recovery, training history, and protein goals.
          </p>
        </div>

        <div className="welcome-action-buttons">
          <button 
            className="btn-dash-action" 
            onClick={() => setIsProfileOpen(true)}
            title="Edit Athlete Profile"
          >
            👤 Profile
          </button>
          <button 
            className="btn-dash-action" 
            onClick={() => setIsAchievementsOpen(true)}
            title="View Achievements"
          >
            🏆 Badges
          </button>
          <button 
            className="btn-dash-action" 
            onClick={() => setShowHistorySection(!showHistorySection)}
            title="Toggle Workout History"
          >
            📜 {showHistorySection ? 'Hide History' : 'History'}
          </button>
        </div>
      </div>

      {/* 2. STREAK TRACKER COMPONENT */}
      <StreakTracker refreshTrigger={refreshKey} />

      {/* 3. MAIN DASHBOARD TWO-COLUMN GRID */}
      <div className="dashboard-main-grid">
        {/* LEFT COLUMN: TODAY'S PLAN & RECOVERY CHECKIN */}
        <div className="grid-col-left">
          {/* TODAY'S PLAN CARD */}
          <div className="today-plan-card">
            <div className="plan-card-header">
              <div className="plan-badge-group">
                <span className="live-plan-pill">TODAY'S PLAN</span>
                <span className="plan-date-text">
                  {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
              </div>
              <button 
                className="btn-regen-plan" 
                onClick={handleGenerateTodayWorkout}
                disabled={isWorkoutLoading}
                title="Regenerate adaptive workout"
              >
                {isWorkoutLoading ? 'Generating...' : '🔄 Adapt / Refresh'}
              </button>
            </div>

            {todayWorkout ? (
              <div className="plan-card-content">
                <div className="plan-title-row">
                  <div>
                    <h2 className="plan-title">{todayWorkout.title}</h2>
                    <span className="plan-muscle-target">
                      🎯 Target: {todayWorkout.muscle_group || 'Full Body'}
                    </span>
                  </div>
                  <div className="plan-status-pill">
                    {todayWorkout.status === 'completed' ? '✅ Completed' : '⚡ Ready to Start'}
                  </div>
                </div>

                {/* Key Specs Ribbon */}
                <div className="plan-specs-ribbon">
                  <div className="spec-pill">
                    <span className="spec-icon">⏱️</span>
                    <span>{todayWorkout.duration} min</span>
                  </div>
                  <div className="spec-pill">
                    <span className="spec-icon">🔥</span>
                    <span>{todayWorkout.estimated_calories} kcal</span>
                  </div>
                  <div className="spec-pill">
                    <span className="spec-icon">🔁</span>
                    <span>{todayWorkout.rounds} rounds</span>
                  </div>
                  <div className="spec-pill">
                    <span className="spec-icon">🛡️</span>
                    <span style={{ textTransform: 'capitalize' }}>{todayWorkout.experience}</span>
                  </div>
                </div>

                {/* Exercises Quick List */}
                <div className="plan-exercises-preview">
                  <span className="preview-label">EXERCISES INCLUDED:</span>
                  <div className="preview-list">
                    {(todayWorkout.exercises || []).map((ex, i) => (
                      <div key={i} className="preview-item">
                        <span className="p-num">{i + 1}</span>
                        <div className="p-details">
                          <strong>{ex.name}</strong>
                          <small>{ex.sets || 3} sets • {ex.reps || ex.duration || '12 reps'}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Trainer Coach Tip */}
                {todayWorkout.trainer_tip && (
                  <div className="coach-tip-box">
                    <span className="coach-icon">💡</span>
                    <p><strong>Coach Tip:</strong> {todayWorkout.trainer_tip}</p>
                  </div>
                )}

                {/* Start Workout Button */}
                <div className="plan-action-row">
                  <button 
                    className="btn-start-session" 
                    onClick={() => setActiveSessionWorkout(todayWorkout)}
                  >
                    🚀 Start Today's Workout
                  </button>
                </div>
              </div>
            ) : (
              /* Empty state: No workout generated yet */
              <div className="plan-empty-state">
                <span className="empty-state-icon">⚡</span>
                <h3>No Workout Generated for Today</h3>
                <p>FitPlan AI is ready to create a personalized session using your profile and energy levels.</p>
                <button 
                  className="btn-generate-initial" 
                  onClick={handleGenerateTodayWorkout}
                  disabled={isWorkoutLoading}
                >
                  {isWorkoutLoading ? 'Crafting Routine...' : 'Generate Today\'s Workout'}
                </button>
              </div>
            )}
          </div>

          {/* DAILY CHECK-IN CARD */}
          <DailyCheckin onCheckinSaved={() => setRefreshKey(k => k + 1)} />

          {/* ADAPTIVE AI RECOMMENDATION INSIGHT */}
          <div className="ai-adaptive-insight-card">
            <div className="insight-header">
              <span className="insight-icon">🧠</span>
              <h4>AI ADAPTIVE INSIGHT</h4>
            </div>
            <p className="insight-text">
              {profile?.current_streak >= 3 
                ? `You've sustained a ${profile.current_streak}-day streak! Progressive overload is active with controlled rest periods to avoid plateaus.` 
                : "Consistent stimulus drives habit formation. Complete today's session to extend your consecutive training streak."}
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: DAILY PROTEIN TRACKER & PROGRESS OVERVIEW */}
        <div className="grid-col-right">
          {/* DAILY PROTEIN TRACKER */}
          <DailyProteinTracker onProteinUpdated={() => setRefreshKey(k => k + 1)} />

          {/* YOUR PROGRESS LIFETIME SUMMARY */}
          <div className="lifetime-progress-card">
            <h4 className="lp-heading">YOUR PROGRESS</h4>
            <div className="lp-metrics-grid">
              <div className="lp-box">
                <span className="lp-label">TOTAL WORKOUTS</span>
                <span className="lp-val">{profile?.total_workouts || 0}</span>
              </div>
              <div className="lp-box">
                <span className="lp-label">LONGEST STREAK</span>
                <span className="lp-val">{profile?.longest_streak || 0} days</span>
              </div>
              <div className="lp-box">
                <span className="lp-label">WORKOUT TIME</span>
                <span className="lp-val">
                  {Math.floor((profile?.total_workout_minutes || 0) / 60)}h {(profile?.total_workout_minutes || 0) % 60}m
                </span>
              </div>
              <div className="lp-box">
                <span className="lp-label">DAILY PROTEIN TARGET</span>
                <span className="lp-val highlight">{profile?.protein_target || 144}g</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. OPTIONAL EXPANDABLE WORKOUT HISTORY */}
      {showHistorySection && (
        <div className="history-drawer-wrapper">
          <WorkoutHistory refreshTrigger={refreshKey} />
        </div>
      )}

      {/* 5. WORKOUT PLAYER / TIMER MODAL */}
      {activeSessionWorkout && (
        <WorkoutSessionModal 
          workout={activeSessionWorkout} 
          onClose={() => setActiveSessionWorkout(null)}
          onWorkoutCompleted={handleWorkoutCompleted}
        />
      )}

      {/* 6. PROFILE MODAL */}
      <ProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
        onProfileUpdated={(up) => {
          setProfile(up);
          setRefreshKey(k => k + 1);
        }}
      />

      {/* 7. ACHIEVEMENTS MODAL */}
      <AchievementsModal 
        isOpen={isAchievementsOpen} 
        onClose={() => setIsAchievementsOpen(false)} 
        refreshTrigger={refreshKey}
      />
    </section>
  );
};

export default CompanionDashboard;
