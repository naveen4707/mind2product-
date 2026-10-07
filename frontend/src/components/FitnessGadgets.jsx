import React, { useState } from 'react';

const GEAR_ITEMS = [
  {
    id: 'dumbbells',
    title: 'Precision Knurled Dumbbells',
    category: 'Strength & Hypertrophy',
    image: '/images/dumbbells-gear.jpg',
    badge: 'Hardware',
    description: 'Aircraft-grade knurled steel with emerald metallic collars. Engineered for strict biomechanical balance and maximum grip traction during heavy compound lifts.',
    specs: ['5kg to 40kg range', 'Anti-slip diamond knurl', 'Dual rubberized dampeners']
  },
  {
    id: 'smartwatch',
    title: 'Biometric Telemetry Smartwatch',
    category: 'Telemetry & Tracking',
    image: '/images/smart-gadgets.jpg',
    badge: 'Wearable Tech',
    description: 'Continuous photoplethysmography (PPG) optical sensor monitoring real-time HRV, lactate threshold BPM, and VO2 Max kinetics during interval circuits.',
    specs: ['5ATM Waterproof', 'Sub-second HR sampling', 'Multi-zone haptic pacing']
  },
  {
    id: 'weightlifting',
    title: 'Heavy Strength & Iron Core Station',
    category: 'Powerlifting & Bodybuilding',
    image: '/images/weightlifting.jpg',
    badge: 'Performance',
    description: 'Designed for progressive overload drills, unilateral single-arm DB rows, Bulgarian split squats, and explosive dumbbell snatches.',
    specs: ['Chalk-ready knurling', 'Impact tested', 'High-density bench support']
  }
];

const FitnessGadgets = () => {
  const [age, setAge] = useState(25);
  const maxHeartRate = 220 - age;

  const zones = [
    { name: 'Zone 1: Recovery', range: `${Math.round(maxHeartRate * 0.50)} - ${Math.round(maxHeartRate * 0.60)} BPM`, percent: '50-60%', purpose: 'Active warm-up, cellular recovery, and lactic flush', color: '#38BDF8' },
    { name: 'Zone 2: Aerobic Base', range: `${Math.round(maxHeartRate * 0.60)} - ${Math.round(maxHeartRate * 0.70)} BPM`, percent: '60-70%', purpose: 'Mitochondrial density, maximal fatty acid oxidation', color: '#10B981' },
    { name: 'Zone 3: Aerobic Tempo', range: `${Math.round(maxHeartRate * 0.70)} - ${Math.round(maxHeartRate * 0.80)} BPM`, percent: '70-80%', purpose: 'Cardiovascular endurance, steady tempo stamina', color: '#F59E0B' },
    { name: 'Zone 4: Anaerobic Threshold', range: `${Math.round(maxHeartRate * 0.80)} - ${Math.round(maxHeartRate * 0.90)} BPM`, percent: '80-90%', purpose: 'Lactate tolerance, high-intensity circuit intervals', color: '#F97316' },
    { name: 'Zone 5: VO2 Max Peak', range: `${Math.round(maxHeartRate * 0.90)} - ${maxHeartRate} BPM`, percent: '90-100%', purpose: 'Maximal neuromuscular power, sprint bursts (15-45s)', color: '#EF4444' }
  ];

  return (
    <section id="gadgets" className="gadgets-section">
      <div className="section-header">
        <span className="section-pill">SMART HARDWARE & TELEMETRY</span>
        <h2 className="section-title">Fitness Gear & Connected Gadgets</h2>
        <p className="section-subtitle">
          Explore cutting-edge gym hardware, smart wearables, and biometric monitoring to amplify your workouts.
        </p>
      </div>

      {/* Featured Gear Showcase Grid */}
      <div className="gear-showcase-grid">
        {GEAR_ITEMS.map((item) => (
          <div key={item.id} className="gear-card">
            <div className="gear-img-container">
              <img src={item.image} alt={item.title} className="gear-img" />
              <span className="gear-badge">{item.badge}</span>
            </div>
            <div className="gear-content">
              <span className="gear-cat">{item.category}</span>
              <h3 className="gear-title">{item.title}</h3>
              <p className="gear-desc">{item.description}</p>
              <div className="gear-specs-list">
                {item.specs.map((spec, sIdx) => (
                  <span key={sIdx} className="gear-spec-tag">✓ {spec}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Biometric Heart Rate Zone Calculator */}
      <div className="hr-zone-card">
        <div className="hr-header-row">
          <div className="card-badge-icon">⌚</div>
          <div>
            <h3 className="card-title">Interactive Wearable Telemetry & Heart Rate Zones</h3>
            <p className="card-desc">Calculate your exact cardiovascular training zones for your smart fitness tracker.</p>
          </div>
        </div>

        <div className="hr-controls">
          <label className="calc-label">
            Athlete Age: <span className="highlight-val">{age} years</span>
          </label>
          <input 
            type="range" 
            min="16" 
            max="80" 
            value={age} 
            onChange={(e) => setAge(Number(e.target.value))}
            className="calc-range-slider"
          />
          <div className="slider-ticks">
            <span>16 yrs</span>
            <span>48 yrs</span>
            <span>80 yrs</span>
          </div>
        </div>

        <div className="max-hr-banner">
          <span>Estimated Peak Max Heart Rate (HR_max = 220 - Age):</span>
          <span className="max-hr-stat">{maxHeartRate} BPM</span>
        </div>

        {/* Zones List */}
        <div className="zones-list">
          {zones.map((zone, idx) => (
            <div key={idx} className="zone-item">
              <div className="zone-indicator" style={{ backgroundColor: zone.color }}></div>
              <div className="zone-name-col">
                <span className="zone-title">{zone.name}</span>
                <span className="zone-percent">{zone.percent}</span>
              </div>
              <div className="zone-bpm-col">
                <span className="zone-bpm-badge" style={{ borderColor: zone.color, color: zone.color }}>
                  {zone.range}
                </span>
              </div>
              <div className="zone-purpose-col">
                <p className="zone-purpose-text">{zone.purpose}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FitnessGadgets;
