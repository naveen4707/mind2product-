import React, { useState, useEffect } from 'react';

const FEELING_OPTIONS = [
  { label: 'Great', emoji: '💪', defaultEnergy: 5, defaultSoreness: 1 },
  { label: 'Good', emoji: '🙂', defaultEnergy: 4, defaultSoreness: 2 },
  { label: 'Okay', emoji: '😐', defaultEnergy: 3, defaultSoreness: 3 },
  { label: 'Tired', emoji: '😴', defaultEnergy: 2, defaultSoreness: 3 },
  { label: 'Sore', emoji: '😓', defaultEnergy: 2, defaultSoreness: 5 }
];

const DailyCheckin = ({ onCheckinSaved }) => {
  const [selectedFeeling, setSelectedFeeling] = useState('Good');
  const [energyLevel, setEnergyLevel] = useState(4);
  const [sorenessLevel, setSorenessLevel] = useState(2);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load today's checkin if exists
  useEffect(() => {
    const fetchCheckin = async () => {
      try {
        const res = await fetch('/api/checkin/today');
        if (res.ok) {
          const data = await res.json();
          if (data.exists && data.checkin) {
            setSelectedFeeling(data.checkin.feeling);
            setEnergyLevel(data.checkin.energy_level);
            setSorenessLevel(data.checkin.soreness_level);
            setIsSaved(true);
          }
        }
      } catch (err) {
        console.error('Error fetching today checkin:', err);
      }
    };
    fetchCheckin();
  }, []);

  const handleSelectFeeling = (opt) => {
    setSelectedFeeling(opt.label);
    setEnergyLevel(opt.defaultEnergy);
    setSorenessLevel(opt.defaultSoreness);
    saveCheckin(opt.label, opt.defaultEnergy, opt.defaultSoreness);
  };

  const saveCheckin = async (feeling, energy, soreness) => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feeling: feeling || selectedFeeling,
          energy_level: energy || energyLevel,
          soreness_level: soreness || sorenessLevel
        })
      });
      if (res.ok) {
        setIsSaved(true);
        if (onCheckinSaved) onCheckinSaved({ feeling, energy, soreness });
      }
    } catch (err) {
      console.error('Error saving checkin:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Adaptive advice based on current ratings
  const getAdaptiveTip = () => {
    if (sorenessLevel >= 4) {
      return "⚠️ High muscle soreness detected. Workouts will favor complementary stabilizers, mobility, and lighter tempo today.";
    }
    if (energyLevel <= 2) {
      return "⚡ Low energy level detected. Workouts will adjust volume to prevent overtraining while preserving your streak.";
    }
    return "🔥 Prime condition! Full training volume recommended to maximize progress.";
  };

  return (
    <div className="checkin-widget-card" id="daily-checkin">
      <div className="checkin-header">
        <span className="checkin-icon">📋</span>
        <div>
          <h4>DAILY CHECK-IN</h4>
          <p className="checkin-sub">How are you feeling today?</p>
        </div>
      </div>

      {/* Feelings Selector Pills */}
      <div className="feelings-selector-row">
        {FEELING_OPTIONS.map((opt) => (
          <button
            key={opt.label}
            className={`feeling-btn ${selectedFeeling === opt.label ? 'active' : ''}`}
            onClick={() => handleSelectFeeling(opt)}
            disabled={isSaving}
          >
            <span className="f-emoji">{opt.emoji}</span>
            <span className="f-label">{opt.label}</span>
          </button>
        ))}
      </div>

      {/* Sliders for Energy and Soreness */}
      <div className="checkin-sliders-grid">
        <div className="slider-control-group">
          <div className="slider-label-row">
            <span>⚡ Energy Level:</span>
            <span className="slider-val-badge">{energyLevel} / 5</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="5" 
            value={energyLevel} 
            onChange={(e) => {
              const val = Number(e.target.value);
              setEnergyLevel(val);
              saveCheckin(selectedFeeling, val, sorenessLevel);
            }} 
            className="styled-range-input"
          />
        </div>

        <div className="slider-control-group">
          <div className="slider-label-row">
            <span>🩹 Soreness Level:</span>
            <span className="slider-val-badge">{sorenessLevel} / 5</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="5" 
            value={sorenessLevel} 
            onChange={(e) => {
              const val = Number(e.target.value);
              setSorenessLevel(val);
              saveCheckin(selectedFeeling, energyLevel, val);
            }} 
            className="styled-range-input"
          />
        </div>
      </div>

      {/* Adaptive Recommendation Feedback */}
      <div className="checkin-adaptive-feedback">
        <p className="feedback-text">{getAdaptiveTip()}</p>
        {isSaved && <span className="checkin-saved-tag">✓ Sync Active</span>}
      </div>
    </div>
  );
};

export default DailyCheckin;
