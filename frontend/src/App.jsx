import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CompanionDashboard from './components/CompanionDashboard';
import WorkoutForm from './components/WorkoutForm';
import WorkoutResult from './components/WorkoutResult';
import WorkoutHistory from './components/WorkoutHistory';
import CreatineDietGuide from './components/CreatineDietGuide';
import FitnessGadgets from './components/FitnessGadgets';
import MotivationBuddy from './components/MotivationBuddy';
import SupabaseSync from './components/SupabaseSync';
import LiveCursor from './components/LiveCursor';

function App() {
  const [workout, setWorkout] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  const handleWorkoutGenerated = (newWorkout) => {
    setWorkout(newWorkout);
    // Smooth-scroll to the result without reloading the page
    setTimeout(() => {
      const resultElement = document.getElementById('result');
      if (resultElement) {
        resultElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleReset = () => {
    const plannerElement = document.getElementById('planner');
    if (plannerElement) {
      plannerElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavigate = (tab) => {
    setActiveTab(tab);
    let targetId = 'hero';
    if (tab === 'dashboard') targetId = 'dashboard';
    if (tab === 'planner') targetId = 'planner';
    if (tab === 'history') targetId = 'workout-history';
    if (tab === 'creatine') targetId = 'creatine-guide';
    if (tab === 'gadgets') targetId = 'gadgets';

    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="app-container">
      {/* Live Interactive Kinetic Cursor Layer */}
      <LiveCursor />

      {/* Background Decorative Blobs */}
      <div className="bg-glow bg-glow-1"></div>
      <div className="bg-glow bg-glow-2"></div>

      <Navbar activeTab={activeTab} setActiveTab={handleNavigate} />

      <main className="main-content">
        <Hero onNavigate={handleNavigate} />

        {/* 1. Primary AI Fitness Companion Dashboard */}
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 2rem', width: '100%' }}>
          <CompanionDashboard />
        </div>

        {/* Supabase Persistence & Status Sync */}
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1.5rem 1rem' }}>
          <SupabaseSync activeWorkout={workout} />
        </div>

        {/* 2. Custom Workout Planner Generator */}
        <WorkoutForm 
          onWorkoutGenerated={handleWorkoutGenerated} 
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />

        {workout && (
          <WorkoutResult 
            workout={workout} 
            onReset={handleReset} 
          />
        )}

        {/* 3. Workout History & Training Log */}
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem 1.5rem 2rem', width: '100%' }}>
          <WorkoutHistory />
        </div>

        {/* 4. Creatine & Nutrition AI Workflow */}
        <CreatineDietGuide />

        {/* 5. Smart Fitness Hardware & Wearable Telemetry */}
        <FitnessGadgets />
      </main>

      {/* Fitness Disclaimer */}
      <footer className="footer-container">
        <div className="disclaimer-card">
          <span className="disclaimer-icon">🛡️</span>
          <p className="disclaimer-text">
            Workout suggestions are for general fitness purposes only. Exercise within your ability and stop if you experience pain or discomfort.
          </p>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} FitPlan AI. Full-Stack Rule-Based Personalization Companion.</p>
          <div className="stack-tags">
            <span className="stack-tag">React.js</span>
            <span className="stack-tag">Node.js Express Gateway</span>
            <span className="stack-tag">FastAPI AI Core</span>
            <span className="stack-tag">Supabase Database</span>
            <span className="stack-tag">Streak Engine</span>
            <span className="stack-tag">Protein Tracker</span>
          </div>
        </div>
      </footer>
      {/* Floating Animated Motivation Coach Character */}
      <MotivationBuddy />
    </div>
  );
}

export default App;
