import React, { useState, useEffect } from 'react';

const WorkoutHistory = ({ refreshTrigger }) => {
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const fetchHistory = async (selectedFilter) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/workouts/history?filter=${selectedFilter}`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
      }
    } catch (err) {
      console.error('Error fetching workout history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(filter);
  }, [filter, refreshTrigger]);

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="workout-history-container" id="workout-history">
      <div className="history-header">
        <div>
          <h3>WORKOUT HISTORY</h3>
          <p className="history-sub">Your verified training log from Supabase</p>
        </div>

        {/* Filter Pills */}
        <div className="history-filter-pills">
          <button 
            className={`filter-btn ${filter === 'week' ? 'active' : ''}`}
            onClick={() => setFilter('week')}
          >
            This Week
          </button>
          <button 
            className={`filter-btn ${filter === 'month' ? 'active' : ''}`}
            onClick={() => setFilter('month')}
          >
            This Month
          </button>
          <button 
            className={`filter-btn ${filter === '3months' ? 'active' : ''}`}
            onClick={() => setFilter('3months')}
          >
            Last 3 Months
          </button>
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Time
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="history-loading">
          <div className="spinner"></div>
          <p>Loading your training logs...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="history-empty-card">
          <span className="empty-icon">🏋️</span>
          <h4>No Workouts Logged in This Period</h4>
          <p>Complete today's workout to start recording your personal fitness history.</p>
        </div>
      ) : (
        <div className="history-grid">
          {history.map((item) => (
            <div key={item.id} className="history-item-card">
              <div className="h-top-row">
                <span className="h-date">{formatDate(item.completed_at || item.workout_date)}</span>
                <span className="h-status-badge">Completed ✓</span>
              </div>
              <h4 className="h-title">{item.workout_name || 'Personalized Workout'}</h4>

              <div className="h-metrics-ribbon">
                <div className="h-metric">
                  <span className="hm-label">DURATION</span>
                  <span className="hm-val">{item.duration_minutes} min</span>
                </div>
                <div className="h-metric">
                  <span className="hm-label">BURNED</span>
                  <span className="hm-val">🔥 {item.calories_burned} kcal</span>
                </div>
                <div className="h-metric">
                  <span className="hm-label">EXERCISES</span>
                  <span className="hm-val">{item.exercises_completed || 5}</span>
                </div>
              </div>

              {item.notes && <p className="h-notes">📝 {item.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkoutHistory;
