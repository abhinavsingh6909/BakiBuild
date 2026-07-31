import React from 'react';
import { Dumbbell, Footprints, History } from 'lucide-react';

export function BottomNav({ activeTab, setActiveTab }) {
  return (
    <nav className="bottom-nav">
      <button
        type="button"
        className={`nav-tab ${activeTab === 'today' ? 'active' : ''}`}
        onClick={() => setActiveTab('today')}
      >
        <Dumbbell className="nav-icon" size={20} />
        <span>Today</span>
      </button>

      <button
        type="button"
        className={`nav-tab ${activeTab === 'steps' ? 'active' : ''}`}
        onClick={() => setActiveTab('steps')}
      >
        <Footprints className="nav-icon" size={20} />
        <span>Steps</span>
      </button>

      <button
        type="button"
        className={`nav-tab ${activeTab === 'history' ? 'active' : ''}`}
        onClick={() => setActiveTab('history')}
      >
        <History className="nav-icon" size={20} />
        <span>History</span>
      </button>
    </nav>
  );
}
