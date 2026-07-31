import React, { useState, useEffect, useRef } from 'react';
import { playTripleBeep } from '../utils/audio';
import { Play, Pause, Plus, X, Timer } from 'lucide-react';

export function RestTimer({ defaultRestSeconds }) {
  const [isOpen, setIsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(defaultRestSeconds);
  const [totalSeconds, setTotalSeconds] = useState(defaultRestSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  
  const timerRef = useRef(null);

  // Sync default rest duration if settings change
  useEffect(() => {
    if (!isRunning && !isOpen) {
      setTimeLeft(defaultRestSeconds);
      setTotalSeconds(defaultRestSeconds);
    }
  }, [defaultRestSeconds, isRunning, isOpen]);

  // Main countdown effect
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      clearInterval(timerRef.current);
      setIsRunning(false);
      setIsFinished(true);
      playTripleBeep();
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning, timeLeft]);

  const handleStartTimer = () => {
    setTimeLeft(defaultRestSeconds);
    setTotalSeconds(defaultRestSeconds);
    setIsFinished(false);
    setIsRunning(true);
    setIsOpen(true);
  };

  const handleTogglePause = () => {
    if (isFinished) {
      // Reset & restart
      setTimeLeft(defaultRestSeconds);
      setTotalSeconds(defaultRestSeconds);
      setIsFinished(false);
      setIsRunning(true);
    } else {
      setIsRunning(!isRunning);
    }
  };

  const handleAdd30s = () => {
    setTimeLeft((prev) => prev + 30);
    setTotalSeconds((prev) => prev + 30);
    if (isFinished) {
      setIsFinished(false);
      setIsRunning(true);
    }
  };

  const handleClose = () => {
    setIsRunning(false);
    setIsOpen(false);
    setIsFinished(false);
    clearInterval(timerRef.current);
  };

  const formatMMSS = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const progressPercent = totalSeconds > 0 ? Math.min(100, Math.max(0, (timeLeft / totalSeconds) * 100)) : 0;
  const restMinutesLabel = (defaultRestSeconds / 60).toString();

  return (
    <>
      {/* Floating Rest Button */}
      {!isOpen && (
        <button
          type="button"
          className="floating-timer-btn"
          onClick={handleStartTimer}
          aria-label="Start rest timer"
        >
          <Timer size={18} />
          <span>⏱ Rest {restMinutesLabel} min</span>
        </button>
      )}

      {/* Floating Countdown Bar */}
      {isOpen && (
        <div className="timer-countdown-bar">
          <div className="timer-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Timer size={20} color="var(--color-neon-lime)" />
              <span className="timer-display">
                {isFinished ? 'GO — next set!' : formatMMSS(timeLeft)}
              </span>
            </div>
            
            <button type="button" className="btn-icon" onClick={handleClose} aria-label="Close timer">
              <X size={20} />
            </button>
          </div>

          {/* Progress fill bar */}
          <div className="timer-progress-track">
            <div
              className="timer-progress-fill"
              style={{
                width: `${isFinished ? 100 : progressPercent}%`,
                background: isFinished ? 'var(--legs-color)' : undefined
              }}
            />
          </div>

          <div className="timer-controls">
            <button type="button" className="btn-secondary" onClick={handleAdd30s} style={{ fontSize: '0.8rem' }}>
              <Plus size={14} style={{ display: 'inline', marginRight: '2px' }} />
              30s
            </button>

            <button type="button" className="btn-primary" onClick={handleTogglePause} style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
              {isFinished ? (
                <>Restart</>
              ) : isRunning ? (
                <><Pause size={14} /> Pause</>
              ) : (
                <><Play size={14} /> Resume</>
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
