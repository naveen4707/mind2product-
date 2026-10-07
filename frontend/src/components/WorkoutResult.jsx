import React, { useState } from 'react';

const WorkoutResult = ({ workout, onReset }) => {
  const [completedExercises, setCompletedExercises] = useState({});

  if (!workout) return null;

  const toggleComplete = (idx) => {
    setCompletedExercises((prev) => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const completedCount = Object.values(completedExercises).filter(Boolean).length;
  const totalCount = workout.exercises ? workout.exercises.length : 0;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <section id="result" className="result-section animate-fade-in-up">
      <div className="result-card">
        {/* Top Header Banner */}
        <div className="result-header">
          <div className="result-badge">
            <span className="sparkle">⚡</span>
            <span>YOUR PERSONALIZED PLAN</span>
          </div>
          <h2 className="result-title">{workout.title}</h2>
          <div className="result-metadata-pills">
            <span className="meta-pill meta-goal">🎯 {workout.goal.replace('_', ' ').toUpperCase()}</span>
            <span className="meta-pill meta-exp">🏆 {workout.experience.toUpperCase()}</span>
          </div>
        </div>

        {/* Highlight Stats Row */}
        <div className="stats-row">
          <div className="stat-card">
            <span className="stat-icon">⏱️</span>
            <span className="stat-value">{workout.time} MINUTES</span>
            <span className="stat-label">Session Duration</span>
          </div>

          <div className="stat-card stat-accent">
            <span className="stat-icon">🔄</span>
            <span className="stat-value">{workout.rounds} {workout.rounds === 1 ? 'ROUND' : 'ROUNDS'}</span>
            <span className="stat-label">Total Volume</span>
          </div>

          <div className="stat-card">
            <span className="stat-icon">☕</span>
            <span className="stat-value">{workout.rest.toUpperCase()}</span>
            <span className="stat-label">Interval Recovery</span>
          </div>
        </div>

        {/* Progress Tracker */}
        {totalCount > 0 && (
          <div className="progress-bar-container">
            <div className="progress-info">
              <span>Routine Progress: {completedCount} of {totalCount} completed</span>
              <span className="progress-percentage">{progressPercent}%</span>
            </div>
            <div className="progress-track">
              <div 
                className="progress-fill" 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Exercises Section */}
        <div className="exercises-block">
          <div className="exercises-header">
            <h3 className="exercises-title">Workout Exercises</h3>
            <span className="exercises-hint">Click any card to mark completed</span>
          </div>

          <div className="exercises-list">
            {workout.exercises && workout.exercises.map((exercise, index) => {
              const formattedNumber = String(index + 1).padStart(2, '0');
              const isDone = !!completedExercises[index];
              return (
                <div 
                  key={index}
                  className={`exercise-card ${isDone ? 'is-completed' : ''}`}
                  style={{ animationDelay: `${index * 80}ms` }}
                  onClick={() => toggleComplete(index)}
                >
                  <div className="exercise-number">{formattedNumber}</div>
                  <div className="exercise-details">
                    <h4 className="exercise-name">{exercise.name}</h4>
                    <span className="exercise-duration-badge">{exercise.duration}</span>
                  </div>
                  <div className="exercise-check">
                    <div className={`checkbox-circle ${isDone ? 'checked' : ''}`}>
                      {isDone ? '✓' : ''}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trainer Tip */}
        <div className="trainer-tip-card">
          <div className="trainer-tip-icon">💡</div>
          <div className="trainer-tip-content">
            <div className="trainer-tip-title">Trainer Tip</div>
            <p className="trainer-tip-text">{workout.tip}</p>
          </div>
        </div>

        {/* Action Button */}
        <div className="result-actions">
          <button 
            id="create-another-btn"
            className="btn-secondary create-another-btn" 
            onClick={onReset}
          >
            <span>← Create Another Workout</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default WorkoutResult;
