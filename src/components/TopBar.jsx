import React from 'react';
import { getNonEmptySessionCount } from '../utils/storage';

export function TopBar({ userName, workouts }) {
  const count = getNonEmptySessionCount(workouts);
  const sessionNumber = count === 0 ? 1 : count;

  return (
    <header className="top-bar">
      <div className="top-bar-logo">
        <div className="top-bar-logo-icon">⚡</div>
        <span>BakiBuild</span>
      </div>
      <div className="top-bar-user-badge num-font">
        {userName} · Session {sessionNumber}
      </div>
    </header>
  );
}
