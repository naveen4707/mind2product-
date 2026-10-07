import React, { useState } from 'react';

const GOAL_OPTIONS = [
  {
    id: 'weight_loss',
    icon: '🎯',
    label: 'Weight Loss',
    subtitle: 'High calorie burn & cardio intervals'
  },
  {
    id: 'muscle_gain',
    icon: '💪',
    label: 'Muscle Gain',
    subtitle: 'Hypertrophy & progressive overload'
  },
  {
    id: 'general_fitness',
    icon: '❤️',
    label: 'General Fitness',
    subtitle: 'Functional stamina & core mobility'
  }
];

const TIME_OPTIONS = [
  { value: 10, label: '10 min', rounds: '1 Round' },
  { value: 20, label: '20 min', rounds: '2 Rounds' },
  { value: 30, label: '30 min', rounds: '3 Rounds' },
  { value: 45, label: '45 min', rounds: '4 Rounds' }
];

const EXPERIENCE_OPTIONS = [
  {
    id: 'beginner',
    label: 'Beginner',
    tag: 'Foundation',
    description: 'Mastering proper form & building baseline stamina'
  },
  {
    id: 'intermediate',
    label: 'Intermediate',
    tag: 'Progression',
    description: 'Higher volume, compound movements & dynamic pacing'
  },
  {
    id: 'advanced',
    label: 'Advanced',
    tag: 'Intensity',
    description: 'Explosive drills, intense intervals & peak endurance'
  }
];

const WorkoutForm = ({ onWorkoutGenerated, isLoading, setIsLoading }) => {
  // Defaults specified in prompt: Goal: Weight Loss, Time: 20 min, Experience: Beginner
  const [goal, setGoal] = useState('weight_loss');
  const [time, setTime] = useState(20);
  const [experience, setExperience] = useState('beginner');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Validate inputs
    if (!goal || !time || !experience) {
      setErrorMessage('Please ensure Goal, Time, and Experience level are selected.');
      return;
    }

    setIsLoading(true);

    try {
      // Send POST request to Node.js backend gateway
      const response = await fetch('/api/generate-workout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          goal,
          time: Number(time),
          experience
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate workout plan from gateway.');
      }

      // Hand off data to display in WorkoutResult
      onWorkoutGenerated(data);
    } catch (err) {
      console.error('API Error:', err);
      setErrorMessage(err.message || 'Network error occurred while contacting FitPlan AI servers.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="planner" className="planner-section">
      <div className="section-header">
        <span className="section-pill">CUSTOMIZER</span>
        <h2 className="section-title">Design Your Session</h2>
        <p className="section-subtitle">Select your parameters to trigger our rule-based personalization engine</p>
      </div>

      <form className="workout-form-card" onSubmit={handleSubmit}>
        {errorMessage && (
          <div className="form-error-alert" role="alert">
            <span className="alert-icon">⚠️</span>
            <div className="alert-text">
              <strong>Generation Error:</strong> {errorMessage}
            </div>
          </div>
        )}

        {/* 1. FITNESS GOAL */}
        <div className="form-group">
          <div className="form-label-row">
            <span className="step-number">01</span>
            <label className="form-label">Fitness Goal</label>
          </div>
          <div className="goal-grid">
            {GOAL_OPTIONS.map((item) => {
              const isSelected = goal === item.id;
              return (
                <button
                  type="button"
                  key={item.id}
                  id={`goal-btn-${item.id}`}
                  className={`goal-card ${isSelected ? 'active' : ''}`}
                  onClick={() => setGoal(item.id)}
                >
                  <div className="goal-card-top">
                    <span className="goal-icon">{item.icon}</span>
                    {isSelected && <span className="selection-check">✓</span>}
                  </div>
                  <div className="goal-card-title">{item.label}</div>
                  <div className="goal-card-desc">{item.subtitle}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. AVAILABLE TIME */}
        <div className="form-group">
          <div className="form-label-row">
            <span className="step-number">02</span>
            <label className="form-label">Available Time</label>
          </div>
          <div className="time-grid">
            {TIME_OPTIONS.map((item) => {
              const isSelected = time === item.value;
              return (
                <button
                  type="button"
                  key={item.value}
                  id={`time-btn-${item.value}`}
                  className={`time-button ${isSelected ? 'active' : ''}`}
                  onClick={() => setTime(item.value)}
                >
                  <span className="time-value">{item.label}</span>
                  <span className="time-rounds">{item.rounds}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. EXPERIENCE LEVEL */}
        <div className="form-group">
          <div className="form-label-row">
            <span className="step-number">03</span>
            <label className="form-label">Experience Level</label>
          </div>
          <div className="experience-grid">
            {EXPERIENCE_OPTIONS.map((item) => {
              const isSelected = experience === item.id;
              return (
                <button
                  type="button"
                  key={item.id}
                  id={`exp-btn-${item.id}`}
                  className={`experience-card ${isSelected ? 'active' : ''}`}
                  onClick={() => setExperience(item.id)}
                >
                  <div className="experience-card-header">
                    <span className="experience-name">{item.label}</span>
                    <span className="experience-badge">{item.tag}</span>
                  </div>
                  <p className="experience-desc">{item.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="form-action">
          <button
            type="submit"
            id="generate-workout-btn"
            className="btn-primary submit-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="btn-loading-content">
                <span className="spinner"></span>
                <span>Generating your plan...</span>
              </span>
            ) : (
              <span>Generate My Workout ✨</span>
            )}
          </button>
        </div>
      </form>
    </section>
  );
};

export default WorkoutForm;
