import React, { useState, useEffect } from 'react';

const StreakTracker = ({ refreshTrigger }) => {
  const [streakData, setStreakData] = useState({
    current_streak: 0,
    longest_streak: 0,
    total_workouts: 0,
    completed_today: false,
    week_calendar: [
      { day: 'Mon', status: 'missed', isCompleted: false, isToday: false },
      { day: 'Tue', status: 'missed', isCompleted: false, isToday: false },
      { day: 'Wed', status: 'today', isCompleted: false, isToday: true },
      { day: 'Thu', status: 'future', isCompleted: false, isToday: false },
      { day: 'Fri', status: 'future', isCompleted: false, isToday: false },
      { day: 'Sat', status: 'future', isCompleted: false, isToday: false },
      { day: 'Sun', status: 'future', isCompleted: false, isToday: false }
    ],
    completed_this_week: 0,
    weekly_consistency_pct: 0,
    motivational_message: "Ready to train today? Complete your session to build your streak!"
  });

  const fetchStreak = async () => {
    try {
      const res = await fetch('/api/streak');
      if (res.ok) {
        const data = await res.json();
        setStreakData(data);
      }
    } catch (err) {
      console.error('Error fetching streak data:', err);
    }
  };

  useEffect(() => {
    fetchStreak();
  }, [refreshTrigger]);

  const {
    current_streak,
    longest_streak,
    total_workouts,
    completed_today,
    week_calendar,
    completed_this_week,
    weekly_consistency_pct,
    motivational_message
  } = streakData;

  return (
    <div className="streak-tracker-widget" id="streak-tracker">
      <div className="streak-main-display">
        {/* Animated Flame Badge */}
        <div className={`flame-container ${current_streak > 0 ? 'flame-active' : 'flame-cold'}`}>
          <span className="flame-icon">🔥</span>
          <div className="streak-counter-text">
            <span className="streak-number">{current_streak}</span>
            <span className="streak-label">DAY STREAK</span>
          </div>
        </div>

        {/* Motivational Banner */}
        <div className="streak-motivation-box">
          <p className="streak-quote">{motivational_message}</p>
          <span className="streak-status-pill">
            {completed_today ? '✅ Completed Today' : '⏳ Today\'s Workout Pending'}
          </span>
        </div>

        {/* Lifetime Stats Triplet */}
        <div className="streak-stats-triplet">
          <div className="stat-pill">
            <span className="s-label">CURRENT</span>
            <span className="s-val">{current_streak} days</span>
          </div>
          <div className="stat-pill">
            <span className="s-label">LONGEST</span>
            <span className="s-val">{longest_streak} days</span>
          </div>
          <div className="stat-pill">
            <span className="s-label">TOTAL SESSIONS</span>
            <span className="s-val">{total_workouts}</span>
          </div>
        </div>
      </div>

      {/* Weekly Activity Calendar (Mon - Sun) */}
      <div className="weekly-calendar-section">
        <div className="calendar-header-row">
          <span className="cal-title">WEEKLY CONSISTENCY</span>
          <span className="cal-meta">
            {completed_this_week} / 7 workouts ({weekly_consistency_pct}%)
          </span>
        </div>

        <div className="week-days-grid">
          {week_calendar.map((item, idx) => {
            let statusClass = 'day-future';
            let icon = '·';
            if (item.status === 'completed') {
              statusClass = 'day-completed';
              icon = '✓';
            } else if (item.status === 'today') {
              statusClass = item.isCompleted ? 'day-completed day-today' : 'day-today';
              icon = item.isCompleted ? '✓' : '○';
            } else if (item.status === 'missed') {
              statusClass = 'day-missed';
              icon = '—';
            }

            return (
              <div key={idx} className={`week-day-cell ${statusClass}`}>
                <span className="day-name">{item.day}</span>
                <div className="day-badge">
                  <span>{icon}</span>
                </div>
                <span className="day-status-label">
                  {item.status === 'completed' ? 'Done' : item.status === 'today' ? 'Today' : item.status === 'missed' ? 'Rest' : ''}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StreakTracker;
