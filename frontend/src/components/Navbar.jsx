import React from 'react';

const Navbar = ({ activeTab, setActiveTab }) => {
  const handleNav = (tabId) => {
    if (setActiveTab) {
      setActiveTab(tabId);
    }
    const targetMap = {
      home: 'hero',
      dashboard: 'dashboard',
      planner: 'planner',
      creatine: 'creatine-guide',
      gadgets: 'gadgets',
      history: 'workout-history'
    };
    const el = document.getElementById(targetMap[tabId] || tabId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="navbar-container">
      <nav className="navbar">
        <div className="navbar-brand" onClick={() => handleNav('home')}>
          <div className="brand-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.5 6.5H4C2.89543 6.5 2 7.39543 2 8.5V15.5C2 16.6046 2.89543 17.5 4 17.5H6.5M17.5 6.5H20C21.1046 6.5 22 7.39543 22 8.5V15.5C22 16.6046 21.1046 17.5 20 17.5H17.5M6.5 12H17.5M6.5 4V20M17.5 4V20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="brand-name">FitPlan <span className="brand-accent">AI</span></span>
        </div>

        <div className="navbar-links">
          <button 
            className={`nav-link ${activeTab === 'dashboard' ? 'nav-active' : ''}`} 
            onClick={() => handleNav('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`nav-link ${activeTab === 'planner' ? 'nav-active' : ''}`} 
            onClick={() => handleNav('planner')}
          >
            Planner
          </button>
          <button 
            className={`nav-link ${activeTab === 'history' ? 'nav-active' : ''}`} 
            onClick={() => handleNav('history')}
          >
            History
          </button>
          <button 
            className={`nav-link ${activeTab === 'creatine' ? 'nav-active' : ''}`} 
            onClick={() => handleNav('creatine')}
          >
            Creatine & Diet
          </button>
          <button 
            className={`nav-link ${activeTab === 'gadgets' ? 'nav-active' : ''}`} 
            onClick={() => handleNav('gadgets')}
          >
            Smart Gadgets
          </button>

          <div className="engine-badge">
            <span className="badge-pulse"></span>
            <span>AI Companion</span>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
