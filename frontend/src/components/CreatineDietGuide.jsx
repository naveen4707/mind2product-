import React, { useState } from 'react';

const CreatineDietGuide = () => {
  const [weightKg, setWeightKg] = useState(70);
  const [protocol, setProtocol] = useState('loading'); // 'loading' or 'steady'
  const [goal, setGoal] = useState('muscle_gain'); // 'muscle_gain', 'weight_loss', 'general_fitness'

  // Calculations
  const loadingDosePerDay = Math.round(weightKg * 0.3); // standard 0.3g/kg or ~20g
  const maintenanceDose = Math.max(3, Math.round(weightKg * 0.04 * 10) / 10); // 3-5g
  const recommendedWaterLiters = (Math.round((weightKg * 0.045 + 0.8) * 10) / 10).toFixed(1);

  return (
    <section id="creatine-guide" className="guide-section">
      {/* Visual Header Banner */}
      <div className="guide-hero-card">
        <div className="guide-hero-grid">
          <div className="guide-hero-text">
            <div className="section-pill">SCIENCE-BACKED NUTRITION</div>
            <h2 className="guide-hero-title">The Complete Creatine & Diet Workflow</h2>
            <p className="guide-hero-subtitle">
              Maximize power output, accelerate ATP replenishment, and hydrate muscle cells with our calibrated intake protocol.
            </p>
            <div className="quick-stats-pills">
              <span className="q-pill">⚡ +15% Peak Power</span>
              <span className="q-pill">💧 Intracellular Hydration</span>
              <span className="q-pill">🧠 Cognitive Support</span>
            </div>
          </div>
          <div className="guide-hero-image-wrapper">
            <img 
              src="/images/creatine-nutrition.jpg" 
              alt="Creatine Monohydrate and healthy diet meal prep" 
              className="guide-hero-img"
            />
            <div className="img-floating-tag">
              <span>Pure Monohydrate • 100% Creapure® Standard</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Creatine Calculator Card */}
      <div className="calculator-card">
        <div className="card-header-row">
          <div className="card-badge-icon">🧮</div>
          <div>
            <h3 className="card-title">Personalized Creatine & Hydration Calculator</h3>
            <p className="card-desc">Fine-tune your daily gram intake and water targets based on your body weight.</p>
          </div>
        </div>

        <div className="calc-controls-grid">
          {/* Weight Input */}
          <div className="calc-input-group">
            <label className="calc-label">
              Body Weight: <span className="highlight-val">{weightKg} kg</span> ({Math.round(weightKg * 2.20462)} lbs)
            </label>
            <input 
              type="range" 
              min="45" 
              max="130" 
              value={weightKg} 
              onChange={(e) => setWeightKg(Number(e.target.value))}
              className="calc-range-slider"
            />
            <div className="slider-ticks">
              <span>45 kg</span>
              <span>85 kg</span>
              <span>130 kg</span>
            </div>
          </div>

          {/* Protocol Toggle */}
          <div className="calc-input-group">
            <label className="calc-label">Saturation Protocol:</label>
            <div className="protocol-toggle-group">
              <button 
                type="button"
                className={`protocol-btn ${protocol === 'loading' ? 'active' : ''}`}
                onClick={() => setProtocol('loading')}
              >
                <span className="proto-title">🚀 Fast Saturation (Loading)</span>
                <span className="proto-sub">5–7 days fast track</span>
              </button>
              <button 
                type="button"
                className={`protocol-btn ${protocol === 'steady' ? 'active' : ''}`}
                onClick={() => setProtocol('steady')}
              >
                <span className="proto-title">⚖️ Steady Saturation</span>
                <span className="proto-sub">3–4 weeks baseline</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Calculator Output */}
        <div className="calc-output-grid">
          {protocol === 'loading' ? (
            <div className="calc-result-box highlight-box">
              <span className="result-label">Phase 1: Loading (Days 1–7)</span>
              <div className="result-big-num">
                {Math.min(25, Math.max(18, loadingDosePerDay))} <span className="unit">g / day</span>
              </div>
              <p className="result-detail">
                Split into 4 equal doses of ~5g across the day (Morning, Pre-workout, Post-workout, Evening) with meals.
              </p>
            </div>
          ) : (
            <div className="calc-result-box highlight-box">
              <span className="result-label">Daily Steady Dosage</span>
              <div className="result-big-num">
                {maintenanceDose} <span className="unit">g / day</span>
              </div>
              <p className="result-detail">
                Single daily scoop taken consistently with water, carbohydrate, or protein. Reaches full saturation within 21–28 days.
              </p>
            </div>
          )}

          <div className="calc-result-box">
            <span className="result-label">Phase 2: Long-Term Maintenance</span>
            <div className="result-big-num">
              {maintenanceDose} <span className="unit">g / day</span>
            </div>
            <p className="result-detail">
              Keep muscle phosphocreatine stores at 100% saturation indefinitely without needing to cycle off.
            </p>
          </div>

          <div className="calc-result-box water-box">
            <span className="result-label">Daily Water Hydration Target</span>
            <div className="result-big-num">
              {recommendedWaterLiters} <span className="unit">Liters / day</span>
            </div>
            <p className="result-detail">
              Creatine draws water into the muscle cell sarcoplasm. Keep fluid levels optimal to prevent cramping.
            </p>
          </div>
        </div>
      </div>

      {/* Creatine Daily Intake Workflow Timeline */}
      <div className="timeline-card">
        <h3 className="card-title">Daily Intake & Timing Workflow</h3>
        <p className="card-desc">Synchronize creatine intake with your nutrient partition windows for optimal bioavailability.</p>

        <div className="workflow-timeline">
          <div className="timeline-step">
            <div className="step-time">07:30 AM</div>
            <div className="step-dot"></div>
            <div className="step-body">
              <h4 className="step-title">Morning Hydration & Electrolytes</h4>
              <p className="step-text">500ml water with a pinch of Himalayan salt or lemon to rehydrate cellular fluids.</p>
            </div>
          </div>

          <div className="timeline-step">
            <div className="step-time">Pre-Workout (-45m)</div>
            <div className="step-dot"></div>
            <div className="step-body">
              <h4 className="step-title">Fuel & Blood Flow</h4>
              <p className="step-text">Light carbohydrate snack (banana, oats) to prime muscle glycogen and blood sugar.</p>
            </div>
          </div>

          <div className="timeline-step active-step">
            <div className="step-time">Post-Workout (+15m)</div>
            <div className="step-dot pulse-dot"></div>
            <div className="step-body">
              <h4 className="step-title">🌟 The Golden Saturation Window</h4>
              <p className="step-text">
                Consume <strong>3–5g Creatine Monohydrate</strong> with 25–30g Whey Protein and fast carbs (dextrose/fruit juice). Insulin spikes drive creatine directly into sensitized muscle cells!
              </p>
            </div>
          </div>

          <div className="timeline-step">
            <div className="step-time">08:00 PM</div>
            <div className="step-dot"></div>
            <div className="step-body">
              <h4 className="step-title">Evening Recovery Meal</h4>
              <p className="step-text">Whole food dinner rich in micronutrients, magnesium, and lean amino acids for overnight rebuilding.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Diet Plan Synergy Cards */}
      <div className="diet-synergy-block">
        <h3 className="card-title text-center">Diet Strategies Tailored to Your Goal</h3>
        <p className="card-desc text-center">How to align your macronutrients with creatine supplementation.</p>

        <div className="synergy-grid">
          <div className="synergy-card">
            <div className="synergy-header">
              <span className="syn-icon">🎯</span>
              <h4>Weight Loss / Cutting</h4>
            </div>
            <ul className="syn-list">
              <li><strong>Protein:</strong> 2.0g – 2.4g / kg to spare lean muscle mass.</li>
              <li><strong>Calorie Deficit:</strong> 300–500 kcal below maintenance.</li>
              <li><strong>Creatine Role:</strong> Preserves strength & explosive energy while on restricted calories.</li>
            </ul>
          </div>

          <div className="synergy-card featured-synergy">
            <div className="synergy-header">
              <span className="syn-icon">💪</span>
              <h4>Muscle Hypertrophy / Bulking</h4>
            </div>
            <ul className="syn-list">
              <li><strong>Protein:</strong> 1.8g – 2.2g / kg with steady amino distribution.</li>
              <li><strong>Caloric Surplus:</strong> +300–450 kcal clean surplus.</li>
              <li><strong>Creatine Role:</strong> Maximizes ATP energy regeneration and intracellular muscle fullness.</li>
            </ul>
          </div>

          <div className="synergy-card">
            <div className="synergy-header">
              <span className="syn-icon">❤️</span>
              <h4>General Longevity & Stamina</h4>
            </div>
            <ul className="syn-list">
              <li><strong>Balance:</strong> 40% Carbs, 30% Protein, 30% Healthy Fats.</li>
              <li><strong>Whole Foods:</strong> Anti-inflammatory Mediterranean diet profile.</li>
              <li><strong>Creatine Role:</strong> Brain cellular health, neuroprotection, and fatigue reduction.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CreatineDietGuide;
