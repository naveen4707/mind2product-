import React, { useState, useEffect } from 'react';

const DailyProteinTracker = ({ onProteinUpdated }) => {
  const [proteinData, setProteinData] = useState({
    target_grams: 144,
    consumed_grams: 0,
    remaining_grams: 144,
    progress_percentage: 0,
    entries: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [foodName, setFoodName] = useState('');
  const [proteinGrams, setProteinGrams] = useState('');
  const [mealType, setMealType] = useState('Lunch');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch today's protein data
  const fetchProtein = async () => {
    try {
      const res = await fetch('/api/protein/today');
      if (res.ok) {
        const data = await res.json();
        setProteinData(data);
      }
    } catch (err) {
      console.error('Error fetching protein today:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProtein();
  }, []);

  // Quick Add handler
  const handleQuickAdd = async (grams) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/protein', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          food_name: `Quick Boost (+${grams}g)`,
          protein_grams: grams,
          meal_type: 'Snack'
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setProteinData(updated);
        if (onProteinUpdated) onProteinUpdated(updated);
      }
    } catch (err) {
      console.error('Error adding quick protein:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Custom Food Entry handler
  const handleAddFood = async (e) => {
    e.preventDefault();
    if (!proteinGrams || Number(proteinGrams) <= 0) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/protein', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          food_name: foodName.trim() || 'Protein Meal',
          protein_grams: Number(proteinGrams),
          meal_type: mealType
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setProteinData(updated);
        if (onProteinUpdated) onProteinUpdated(updated);
        setShowAddModal(false);
        setFoodName('');
        setProteinGrams('');
      }
    } catch (err) {
      console.error('Error adding food entry:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Entry
  const handleDeleteEntry = async (id) => {
    try {
      const res = await fetch(`/api/protein/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        const updated = await res.json();
        setProteinData(updated);
        if (onProteinUpdated) onProteinUpdated(updated);
      }
    } catch (err) {
      console.error('Error deleting protein entry:', err);
    }
  };

  const { target_grams, consumed_grams, remaining_grams, progress_percentage, entries } = proteinData;

  return (
    <div className="protein-tracker-card" id="protein-tracker">
      <div className="protein-header">
        <div className="protein-title-badge">
          <span className="p-badge-icon">🥩</span>
          <div>
            <h3>DAILY PROTEIN TARGET</h3>
            <span className="p-badge-sub">Persistent Macro Tracking</span>
          </div>
        </div>
        <button 
          className="btn-add-food-trigger" 
          onClick={() => setShowAddModal(true)}
        >
          + Add Food
        </button>
      </div>

      {/* Main Macro Numbers Display */}
      <div className="protein-stat-display">
        <div className="p-stat-box">
          <span className="p-num-label">CONSUMED</span>
          <div className="p-num-val primary">{consumed_grams}<span className="p-unit">g</span></div>
        </div>
        <div className="p-stat-divider">/</div>
        <div className="p-stat-box">
          <span className="p-num-label">TARGET</span>
          <div className="p-num-val">{target_grams}<span className="p-unit">g</span></div>
        </div>
        <div className="p-stat-remaining">
          <span className="p-rem-val">{remaining_grams}g</span>
          <span className="p-rem-label">{remaining_grams === 0 ? 'Goal Reached 🎉' : 'remaining'}</span>
        </div>
      </div>

      {/* Modern Progress Bar */}
      <div className="protein-bar-wrapper">
        <div className="protein-bar-track">
          <div 
            className="protein-bar-fill" 
            style={{ width: `${Math.min(100, progress_percentage)}%` }}
          ></div>
        </div>
        <div className="protein-bar-meta">
          <span>0g</span>
          <span className="protein-pct-text">{progress_percentage}% of target</span>
          <span>{target_grams}g</span>
        </div>
      </div>

      {/* Quick Add Pill Buttons */}
      <div className="protein-quick-buttons">
        <span className="quick-label">QUICK ADD:</span>
        <button 
          className="btn-quick-protein" 
          onClick={() => handleQuickAdd(10)}
          disabled={isSubmitting}
        >
          +10g
        </button>
        <button 
          className="btn-quick-protein" 
          onClick={() => handleQuickAdd(20)}
          disabled={isSubmitting}
        >
          +20g
        </button>
        <button 
          className="btn-quick-protein" 
          onClick={() => handleQuickAdd(30)}
          disabled={isSubmitting}
        >
          +30g
        </button>
      </div>

      {/* Today's Logged Entries */}
      <div className="protein-entries-section">
        <h4 className="entries-heading">
          TODAY'S LOGGED FOODS ({entries.length})
        </h4>

        {entries.length === 0 ? (
          <div className="entries-empty-state">
            <p>No protein logged for today yet. Use quick-add or log your meals above!</p>
          </div>
        ) : (
          <div className="entries-list">
            {entries.map((entry) => (
              <div key={entry.id} className="entry-row">
                <div className="entry-left">
                  <span className="meal-tag">{entry.meal_type || 'Meal'}</span>
                  <span className="entry-name">{entry.food_name}</span>
                </div>
                <div className="entry-right">
                  <span className="entry-grams">+{entry.protein_grams}g</span>
                  <button 
                    className="btn-delete-entry" 
                    onClick={() => handleDeleteEntry(entry.id)}
                    title="Remove entry"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Educational Guideline Footer */}
      <div className="protein-info-footnote">
        <small>
          ℹ️ <em>Target calculated at 1.4–2.0g/kg based on your body weight and training goal. For general nutritional guidance only.</em>
        </small>
      </div>

      {/* Add Food Modal */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div className="modal-header">
              <h3>Log Food & Protein</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddFood} className="add-food-form">
              <div className="form-group">
                <label>Food / Drink Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. 3 Eggs, Grilled Chicken, Whey Shake"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Protein (Grams)</label>
                <input 
                  type="number" 
                  placeholder="e.g. 24"
                  value={proteinGrams}
                  onChange={(e) => setProteinGrams(e.target.value)}
                  min="1"
                  max="200"
                  required
                />
              </div>

              <div className="form-group">
                <label>Meal Type</label>
                <select value={mealType} onChange={(e) => setMealType(e.target.value)}>
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                  <option value="Snack">Snack</option>
                  <option value="Shake">Protein Shake</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Add to Today\'s Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyProteinTracker;
