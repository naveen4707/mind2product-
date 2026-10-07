import React, { useState, useEffect } from 'react';

const SAIYAN_MOTIVATION_QUOTES = [
  { text: "Power comes in response to a need, not a desire. Push beyond your limits!", tag: "Limit Breaker" },
  { text: "I'm going to train until my limits break. That's the Saiyan way! Let's crush this set!", tag: "Saiyan Spirit" },
  { text: "There is no ceiling to your strength. Turn on your Kaio-Ken and power through!", tag: "Kaio-Ken" },
  { text: "Whenever you face a barrier, smash right through it! Super Saiyan mode activated!", tag: "Ascension" },
  { text: "Eat a ton of good fuel, hydrate, and lift with everything you've got! 🍚", tag: "Recovery" },
  { text: "Even a low-class warrior can surpass an elite through sheer hard work and discipline!", tag: "Discipline" },
  { text: "Pain is temporary. Victory and peak power are forever! Keep those reps clean!", tag: "Power" },
  { text: "Lend me your energy! We're finishing this workout stronger than yesterday! 🔥", tag: "Spirit Bomb" }
];

const MotivationBuddy = () => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [poweringUp, setPoweringUp] = useState(false);
  const [powerLevel, setPowerLevel] = useState(9001);

  // Auto-cycle quotes every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % SAIYAN_MOTIVATION_QUOTES.length);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const handleNextQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % SAIYAN_MOTIVATION_QUOTES.length);
    triggerAuraBurst();
  };

  const handlePowerUp = () => {
    setPowerLevel((prev) => prev + 500);
    setPoweringUp(true);
    setTimeout(() => setPoweringUp(false), 1200);
  };

  const triggerAuraBurst = () => {
    setPoweringUp(true);
    setTimeout(() => setPoweringUp(false), 900);
  };

  const currentQuote = SAIYAN_MOTIVATION_QUOTES[quoteIndex];

  return (
    <aside 
      className={`motivation-buddy-container ${isMinimized ? 'minimized' : ''}`}
      aria-label="Saiyan Goku Motivation Coach"
    >
      {/* Speech Bubble */}
      {!isMinimized && (
        <div className="buddy-speech-bubble goku-speech-bubble animate-pop">
          <div className="bubble-header">
            <span className="bubble-tag saiyan-tag">🔥 SAIYAN MOTIVATION CODE</span>
            <button 
              className="bubble-close-btn" 
              onClick={() => setIsMinimized(true)}
              title="Minimize Goku coach"
            >
              ×
            </button>
          </div>
          <p className="bubble-quote">
            "{currentQuote.text}"
          </p>
          <div className="bubble-actions">
            <button 
              className="bubble-btn bubble-btn-quote" 
              onClick={handleNextQuote}
              title="Get next Saiyan quote"
            >
              <span>Next Boost ✨</span>
            </button>
            <button 
              className="bubble-btn bubble-btn-powerup" 
              onClick={handlePowerUp}
              title="Power Up with Goku"
            >
              <span>⚡ Power Up ({powerLevel.toLocaleString()})</span>
            </button>
          </div>
          <div className="bubble-tail"></div>
        </div>
      )}

      {/* Floating Particles Burst during Kaio-Ken / Super Saiyan Burst */}
      {poweringUp && (
        <div className="particles-burst saiyan-particles">
          <span className="p-particle p1">⚡</span>
          <span className="p-particle p2">🔥</span>
          <span className="p-particle p3">💥</span>
          <span className="p-particle p4">✨</span>
          <span className="p-particle p5">⭐</span>
        </div>
      )}

      {/* Animated Goku Character Avatar */}
      <div 
        className={`goku-character-wrapper ${poweringUp ? 'super-saiyan-burst' : ''}`}
        onClick={() => {
          if (isMinimized) {
            setIsMinimized(false);
          } else {
            handlePowerUp();
          }
        }}
        title={isMinimized ? "Click to summon Goku Motivator" : "Click to Power Up with Goku!"}
      >
        {/* Pulsating Super Saiyan Golden Aura */}
        <div className="goku-aura-glow"></div>
        
        {/* Real Goku Weightlifting Artwork */}
        <div className="goku-image-container">
          <img 
            src="/images/goku-motivator.jpg" 
            alt="Super Saiyan Goku Heavy Barbell Lift Motivator" 
            className="goku-avatar-img"
          />
        </div>

        {/* Coach Badge */}
        <div className="goku-coach-badge">
          <span>SSJ GOKU</span>
        </div>

        {/* Minimized Indicator Pill */}
        {isMinimized && (
          <div className="minimized-pill saiyan-pill">
            <span>⚡ SSJ Coach</span>
          </div>
        )}
      </div>
    </aside>
  );
};

export default MotivationBuddy;
