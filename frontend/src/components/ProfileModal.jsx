import React, { useState, useEffect } from 'react';

const ProfileModal = ({ isOpen, onClose, onProfileUpdated }) => {
  const [formData, setFormData] = useState({
    name: 'FitPlan Athlete',
    age: 26,
    gender: 'Male',
    height_cm: 175,
    weight_kg: 72,
    goal: 'muscle_gain',
    experience: 'intermediate',
    activity_level: 'moderate',
    available_time: 30,
    equipment: 'dumbbells',
    location: 'Home Gym',
    dietary_preference: 'High Protein',
    protein_target: 144
  });

  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch current profile
  useEffect(() => {
    if (isOpen) {
      const fetchProfile = async () => {
        try {
          const res = await fetch('/api/profile');
          if (res.ok) {
            const result = await res.json();
            if (result.data) {
              setFormData(result.data);
            }
          }
        } catch (err) {
          console.error('Error fetching profile:', err);
        }
      };
      fetchProfile();
    }
  }, [isOpen]);

  // Dynamically calculate recommended protein
  const getMultiplier = (goal) => {
    if (goal === 'muscle_gain') return 2.0;
    if (goal === 'weight_loss') return 1.8;
    return 1.4; // general_fitness
  };

  const calculatedProteinTarget = Math.round(
    (Number(formData.weight_kg) || 70) * getMultiplier(formData.goal)
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage('');

    try {
      const payload = {
        ...formData,
        age: Number(formData.age),
        height_cm: Number(formData.height_cm),
        weight_kg: Number(formData.weight_kg),
        available_time: Number(formData.available_time),
        protein_target: calculatedProteinTarget
      };

      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setSuccessMessage('Profile and daily protein goals updated successfully!');
        if (onProfileUpdated) onProfileUpdated(data.profile);
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-box profile-modal-box">
        <div className="modal-header">
          <div className="modal-header-title">
            <span className="m-icon">👤</span>
            <div>
              <h3>Athlete Profile & Biometrics</h3>
              <p className="m-sub">Persistent personal settings for tailored workouts</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {successMessage && (
          <div className="modal-success-banner">
            ✓ {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="profile-form-grid">
          {/* Row 1: Name & Age */}
          <div className="form-group">
            <label>Athlete Name</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name || ''} 
              onChange={handleChange} 
              required
            />
          </div>

          <div className="form-group">
            <label>Age</label>
            <input 
              type="number" 
              name="age" 
              value={formData.age || ''} 
              onChange={handleChange} 
              min="14" 
              max="99" 
              required
            />
          </div>

          {/* Row 2: Height & Weight */}
          <div className="form-group">
            <label>Height (cm)</label>
            <input 
              type="number" 
              name="height_cm" 
              value={formData.height_cm || ''} 
              onChange={handleChange} 
              min="100" 
              max="250" 
              required
            />
          </div>

          <div className="form-group">
            <label>Body Weight (kg)</label>
            <input 
              type="number" 
              name="weight_kg" 
              value={formData.weight_kg || ''} 
              onChange={handleChange} 
              min="30" 
              max="250" 
              required
            />
          </div>

          {/* Row 3: Goal & Experience */}
          <div className="form-group">
            <label>Primary Fitness Goal</label>
            <select name="goal" value={formData.goal || 'muscle_gain'} onChange={handleChange}>
              <option value="muscle_gain">Muscle Gain (Hypertrophy)</option>
              <option value="weight_loss">Fat Loss & Conditioning</option>
              <option value="general_fitness">General Health & Mobility</option>
            </select>
          </div>

          <div className="form-group">
            <label>Experience Level</label>
            <select name="experience" value={formData.experience || 'intermediate'} onChange={handleChange}>
              <option value="beginner">Beginner (Foundation)</option>
              <option value="intermediate">Intermediate (Regular Lifter)</option>
              <option value="advanced">Advanced (High Intensity)</option>
            </select>
          </div>

          {/* Row 4: Equipment & Workout Time */}
          <div className="form-group">
            <label>Available Equipment</label>
            <select name="equipment" value={formData.equipment || 'dumbbells'} onChange={handleChange}>
              <option value="dumbbells">Dumbbells & Bench</option>
              <option value="bodyweight">Bodyweight / Calisthenics Only</option>
              <option value="resistance_bands">Resistance Bands</option>
              <option value="full_gym">Full Gym Access</option>
            </select>
          </div>

          <div className="form-group">
            <label>Daily Available Time</label>
            <select name="available_time" value={formData.available_time || 30} onChange={handleChange}>
              <option value={10}>10 Minutes (Express)</option>
              <option value={20}>20 Minutes (Standard)</option>
              <option value={30}>30 Minutes (Optimal)</option>
              <option value={45}>45 Minutes (Intense)</option>
            </select>
          </div>

          {/* Protein Target Calculation Live Preview Card */}
          <div className="profile-protein-preview-box">
            <span className="p-calc-badge">AUTOMATIC MACRO CALCULATION</span>
            <div className="p-calc-content">
              <div>
                <strong>Recommended Daily Protein Target:</strong>
                <p className="p-formula-text">
                  {formData.weight_kg} kg × {getMultiplier(formData.goal)} g/kg ({formData.goal.replace('_', ' ')})
                </p>
              </div>
              <div className="p-calc-result">
                <span>{calculatedProteinTarget}</span>
                <small>g/day</small>
              </div>
            </div>
            <p className="p-disclaimer">
              * Based on evidence-based sports science guidelines (1.4–2.0 g/kg). Adjust as appropriate for your dietary requirements.
            </p>
          </div>

          <div className="modal-actions full-span">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={isSaving}>
              {isSaving ? 'Saving Profile...' : 'Save & Update Goals'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;
