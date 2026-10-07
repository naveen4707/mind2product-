import React from 'react';

const Hero = ({ onNavigate }) => {
  const scrollToPlanner = () => {
    if (onNavigate) {
      onNavigate('planner');
    } else {
      const plannerEl = document.getElementById('planner');
      if (plannerEl) {
        plannerEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section id="hero" className="hero-section">
      <div className="hero-content">
        <div className="hero-pill-badge">
          <span className="sparkle-icon">✨</span>
          <span>AI PERSONALIZED FITNESS</span>
        </div>

        <h1 className="hero-title">
          Your Workout.<br />
          <span className="hero-highlight">Your Way.</span>
        </h1>

        <p className="hero-description">
          Get a personalized workout plan based on your fitness goal, available time, and experience level.
        </p>

        <div className="hero-cta-wrapper">
          <button 
            id="hero-cta-btn"
            className="btn-primary hero-cta-btn" 
            onClick={scrollToPlanner}
          >
            <span>Create My Workout</span>
            <span className="arrow-icon">→</span>
          </button>
        </div>

        {/* Metric Badges */}
        <div className="hero-metrics">
          <div className="metric-chip">
            <span className="chip-icon">⚡</span>
            <span>Rule-Based Precision</span>
          </div>
          <div className="metric-chip">
            <span className="chip-icon">⏱️</span>
            <span>10 - 45 Min Sessions</span>
          </div>
          <div className="metric-chip">
            <span className="chip-icon">🎯</span>
            <span>100% Calibrated</span>
          </div>
          <div className="metric-chip">
            <span className="chip-icon">🧪</span>
            <span>Creatine & Diet Hub</span>
          </div>
        </div>

        {/* Visual Feature Showcase Cards with Real Photography */}
        <div className="hero-visual-showcase">
          <div 
            className="showcase-card"
            onClick={() => onNavigate && onNavigate('planner')}
          >
            <div className="showcase-img-box">
              <img src="/images/dumbbells-gear.jpg" alt="Dumbbells and weights fitness gear" />
              <div className="showcase-overlay">
                <span className="showcase-badge">AI Generator</span>
                <span className="showcase-title">Workout Planner</span>
              </div>
            </div>
          </div>

          <div 
            className="showcase-card"
            onClick={() => onNavigate && onNavigate('creatine')}
          >
            <div className="showcase-img-box">
              <img src="/images/creatine-nutrition.jpg" alt="Creatine diet workflow and meal prep" />
              <div className="showcase-overlay">
                <span className="showcase-badge">Diet Protocol</span>
                <span className="showcase-title">Creatine & Nutrition</span>
              </div>
            </div>
          </div>

          <div 
            className="showcase-card"
            onClick={() => onNavigate && onNavigate('gadgets')}
          >
            <div className="showcase-img-box">
              <img src="/images/smart-gadgets.jpg" alt="Smart fitness gadgets and smartwatch telemetry" />
              <div className="showcase-overlay">
                <span className="showcase-badge">Hardware</span>
                <span className="showcase-title">Connected Gadgets</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
