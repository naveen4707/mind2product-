import React, { useState, useEffect } from 'react';

const ALL_MILESTONES = [
  { id: 'first_workout', name: 'First Workout', desc: 'Completed your very first workout session!', icon: '⚡' },
  { id: 'streak_3', name: '3-Day Ignition', desc: 'Trained 3 days in a row! Momentum is building.', icon: '🔥' },
  { id: 'streak_7', name: '7-Day Warrior', desc: 'Full week of uninterrupted daily consistency!', icon: '🛡️' },
  { id: 'streak_14', name: '14-Day Beast', desc: 'Two solid weeks of discipline and grit!', icon: '⚔️' },
  { id: 'streak_30', name: '30-Day Master', desc: 'One month streak! You built a permanent habit.', icon: '👑' },
  { id: 'streak_50', name: '50-Day Titan', desc: 'Fifty days of relentless dedication.', icon: '🌟' },
  { id: 'streak_100', name: 'Centurion', desc: '100 consecutive days of fitness excellence.', icon: '🏆' },
  { id: 'workouts_10', name: '10 Workouts Club', desc: 'Logged 10 total training sessions.', icon: '🎯' },
  { id: 'workouts_25', name: 'Quarter Century', desc: '25 total workouts in the bag.', icon: '💎' },
  { id: 'workouts_50', name: 'Half Century', desc: '50 workouts logged! Stronger than ever.', icon: '🚀' },
  { id: 'workouts_100', name: 'Century Club', desc: '100 lifetime workout sessions achieved.', icon: '🥇' }
];

const AchievementsModal = ({ isOpen, onClose, refreshTrigger }) => {
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const fetchAchievements = async () => {
        try {
          const res = await fetch('/api/achievements');
          if (res.ok) {
            const data = await res.json();
            setUnlockedAchievements(data.achievements || []);
          }
        } catch (err) {
          console.error('Error fetching achievements:', err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchAchievements();
    }
  }, [isOpen, refreshTrigger]);

  if (!isOpen) return null;

  const unlockedMap = {};
  unlockedAchievements.forEach(a => {
    unlockedMap[a.achievement_type] = a;
  });

  return (
    <div className="modal-backdrop">
      <div className="modal-box achievements-modal-box">
        <div className="modal-header">
          <div className="modal-header-title">
            <span className="m-icon">🏆</span>
            <div>
              <h3>Streak & Training Milestones</h3>
              <p className="m-sub">
                {unlockedAchievements.length} of {ALL_MILESTONES.length} Achievements Unlocked
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {isLoading ? (
          <div className="history-loading">
            <div className="spinner"></div>
            <p>Loading achievements...</p>
          </div>
        ) : (
          <div className="achievements-grid">
            {ALL_MILESTONES.map((milestone) => {
              const isUnlocked = Boolean(unlockedMap[milestone.id]);
              const unlockData = unlockedMap[milestone.id];

              return (
                <div 
                  key={milestone.id} 
                  className={`achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`}
                >
                  <div className="ach-icon-circle">
                    {isUnlocked ? milestone.icon : '🔒'}
                  </div>
                  <div className="ach-details">
                    <div className="ach-title-row">
                      <h4>{milestone.name}</h4>
                      {isUnlocked && <span className="unlocked-badge">Earned ✓</span>}
                    </div>
                    <p className="ach-desc">{milestone.desc}</p>
                    {isUnlocked && unlockData?.achieved_at && (
                      <span className="ach-date">
                        Unlocked on {new Date(unlockData.achieved_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="modal-actions">
          <button className="btn-submit" onClick={onClose}>
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default AchievementsModal;
