import React, { useState } from 'react';
import { getTodayDateString, formatFriendlyDate, formatIndianNumber } from '../utils/storage';
import { Footprints, CheckCircle2, Save, Trophy } from 'lucide-react';

const STEP_GOAL = 5000;

export function StepsTab({ stepsData, onUpdateSteps }) {
  const todayStr = getTodayDateString();
  const currentTodaySteps = stepsData[todayStr] || 0;

  const [inputSteps, setInputSteps] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    const parsed = parseInt(inputSteps, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      onUpdateSteps(todayStr, parsed);
      setInputSteps('');
    }
  };

  const percentage = Math.min(100, Math.round((currentTodaySteps / STEP_GOAL) * 100));
  const isGoalReached = currentTodaySteps >= STEP_GOAL;

  // Compute SVG circular ring parameters
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Extract last 7 recorded days sorted chronologically descending
  const sortedDates = Object.keys(stepsData).sort().reverse().slice(0, 7);

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Circular Progress Card */}
      <div className="card" style={{ alignItems: 'center', textAlign: 'center' }}>
        <div className="card-title" style={{ width: '100%', justifyContent: 'center', gap: '8px' }}>
          <Footprints size={20} color="var(--legs-color)" />
          <span>Today's Step Progress</span>
        </div>

        <div className="steps-ring-container">
          <svg width="200" height="200" className="steps-circle-svg">
            <circle
              className="steps-circle-bg"
              cx="100"
              cy="100"
              r={radius}
              strokeWidth="14"
              fill="transparent"
            />
            <circle
              className="steps-circle-progress"
              cx="100"
              cy="100"
              r={radius}
              strokeWidth="14"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>

          <div className="steps-inner-content">
            <span className="steps-count-large num-font">
              {formatIndianNumber(currentTodaySteps)}
            </span>
            <span className="steps-target-subtext num-font">
              / {formatIndianNumber(STEP_GOAL)} steps
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--legs-color)', marginTop: '4px' }}>
              {percentage}% Complete
            </span>
          </div>
        </div>

        {isGoalReached && (
          <div className="steps-celebration-badge">
            <Trophy size={16} />
            <span>5,000 Steps Goal Achieved! 🎉</span>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSave} className="input-group" style={{ width: '100%', marginTop: '8px' }}>
          <input
            type="number"
            inputMode="numeric"
            className="input-field num-font"
            placeholder={`Log steps (e.g. 6200)`}
            value={inputSteps}
            onChange={(e) => setInputSteps(e.target.value)}
            min="0"
          />
          <button type="submit" className="btn-primary" style={{ background: 'var(--legs-color)' }}>
            <Save size={16} />
            Save
          </button>
        </form>
      </div>

      {/* Last 7 Recorded Days List */}
      <div className="card">
        <div className="card-title">
          <span>Recent 7 Days Log</span>
          <span className="num-font" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target: 5,000</span>
        </div>

        {sortedDates.length === 0 ? (
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>
            No steps recorded yet. Log your first steps above!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {sortedDates.map((dateKey) => {
              const val = stepsData[dateKey];
              const hit = val >= STEP_GOAL;
              return (
                <div key={dateKey} className="set-row">
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>
                      {formatFriendlyDate(dateKey)}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {dateKey === todayStr ? 'Today' : dateKey}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="num-font" style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                      {formatIndianNumber(val)}
                    </span>
                    <span style={{
                      fontWeight: 800,
                      fontSize: '1rem',
                      color: hit ? 'var(--legs-color)' : 'var(--text-muted)',
                      width: '20px',
                      textAlign: 'center'
                    }}>
                      {hit ? '✓' : '–'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
