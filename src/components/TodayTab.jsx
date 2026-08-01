import React, { useState, useEffect } from 'react';
import {
  getTodayDateString,
  formatFriendlyDate,
  getAutoSuggestedDayType,
  PPL_ROTATION
} from '../utils/storage';
import { Plus, Trash2, CheckCircle2, Lock, Unlock, Zap, ChevronRight } from 'lucide-react';

export function TodayTab({ workouts, onSaveWorkouts }) {
  const todayStr = getTodayDateString();

  // Auto-suggested day type based on rotation of previous logged sessions
  const suggestedDayType = getAutoSuggestedDayType(workouts);

  // Active day type selected by pill buttons
  const [activeDayType, setActiveDayType] = useState(suggestedDayType);

  // Input state for adding exercise
  const [newExerciseName, setNewExerciseName] = useState('');

  // Per-exercise set logger input state { [exerciseId]: { weight: '', reps: '' } }
  const [setInputs, setSetInputs] = useState({});

  // Find existing session for today with matching activeDayType
  const currentSessionIndex = workouts.findIndex(
    w => w.date === todayStr && (w.dayType || '').toLowerCase() === activeDayType
  );

  const currentSession = currentSessionIndex >= 0 ? workouts[currentSessionIndex] : null;
  const isLocked = currentSession ? !!currentSession.done : false;
  const currentExercises = currentSession ? currentSession.exercises || [] : [];

  // Helper to update or insert today's session into workouts state
  const updateCurrentSession = (updatedExercises, doneFlag = isLocked) => {
    let updatedWorkouts = [...workouts];
    if (currentSessionIndex >= 0) {
      updatedWorkouts[currentSessionIndex] = {
        ...updatedWorkouts[currentSessionIndex],
        exercises: updatedExercises,
        done: doneFlag
      };
    } else {
      // Create new session entry for today + activeDayType
      const newSession = {
        id: `w-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        date: todayStr,
        dayType: activeDayType,
        done: doneFlag,
        exercises: updatedExercises
      };
      updatedWorkouts.push(newSession);
    }
    onSaveWorkouts(updatedWorkouts);
  };

  // Find most recent previous session of the SAME day type
  const previousSession = workouts
    .filter(
      w =>
        (w.dayType || '').toLowerCase() === activeDayType &&
        (w.date !== todayStr || workouts.indexOf(w) < currentSessionIndex) &&
        Array.isArray(w.exercises) &&
        w.exercises.length > 0
    )
    .pop(); // Most recent previous

  // Add new exercise
  const handleAddExercise = (e) => {
    e.preventDefault();
    const trimmed = newExerciseName.trim();
    if (!trimmed || isLocked) return;

    const newExercise = {
      id: `ex-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: trimmed,
      sets: []
    };

    updateCurrentSession([...currentExercises, newExercise]);
    setNewExerciseName('');
  };

  // Delete exercise
  const handleDeleteExercise = (exId) => {
    if (isLocked) return;
    const updated = currentExercises.filter(ex => ex.id !== exId);
    updateCurrentSession(updated);
  };

  // Log set for an exercise
  const handleLogSet = (exId, e) => {
    e.preventDefault();
    if (isLocked) return;

    const inputData = setInputs[exId] || {};
    const weightVal = parseFloat(inputData.weight);
    const repsVal = parseInt(inputData.reps, 10);

    if (isNaN(weightVal) || weightVal < 0 || isNaN(repsVal) || repsVal <= 0) {
      return;
    }

    const updatedExercises = currentExercises.map(ex => {
      if (ex.id === exId) {
        return {
          ...ex,
          sets: [...ex.sets, { weight: weightVal, reps: repsVal }]
        };
      }
      return ex;
    });

    updateCurrentSession(updatedExercises);

    // Reset set input fields for this exercise
    setSetInputs(prev => ({
      ...prev,
      [exId]: { weight: '', reps: '' }
    }));
  };

  // Delete set
  const handleDeleteSet = (exId, setIndex) => {
    if (isLocked) return;
    const updatedExercises = currentExercises.map(ex => {
      if (ex.id === exId) {
        return {
          ...ex,
          sets: ex.sets.filter((_, idx) => idx !== setIndex)
        };
      }
      return ex;
    });
    updateCurrentSession(updatedExercises);
  };

  // Lock / Unlock session
  const handleToggleLock = () => {
    if (!currentSession || currentExercises.length === 0) return;
    updateCurrentSession(currentExercises, !isLocked);
  };

  // Helper to find previous session's matching exercise ghost sets
  const getPreviousGhostSets = (exName) => {
    if (!previousSession) return null;
    const match = previousSession.exercises.find(
      e => e.name.trim().toLowerCase() === exName.trim().toLowerCase()
    );
    if (!match || !match.sets || match.sets.length === 0) return null;
    return match.sets;
  };

  // Helper to compute Progressive Overload comparison chip
  const getOverloadChipData = (exName, currentSets) => {
    if (!previousSession || !currentSets || currentSets.length === 0) return null;

    const prevMatch = previousSession.exercises.find(
      e => e.name.trim().toLowerCase() === exName.trim().toLowerCase()
    );
    if (!prevMatch || !prevMatch.sets || prevMatch.sets.length === 0) return null;

    const prevMaxWeight = Math.max(...prevMatch.sets.map(s => Number(s.weight) || 0));
    const currentMaxWeight = Math.max(...currentSets.map(s => Number(s.weight) || 0));

    const diff = currentMaxWeight - prevMaxWeight;
    // Format nicely without trailing zeros
    const diffFormatted = Math.abs(diff) % 1 === 0 ? Math.abs(diff) : Math.abs(diff).toFixed(1);

    if (diff > 0) {
      return { type: 'higher', text: `▲ +${diffFormatted}kg overload` };
    } else if (diff === 0) {
      return { type: 'equal', text: `＝ same as last` };
    } else {
      return { type: 'lower', text: `▼ −${diffFormatted}kg vs last` };
    }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header & Day Type Badge */}
      <div className="card" style={{ padding: '20px 16px' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {formatFriendlyDate(todayStr)} · Today
        </div>

        <div className={`day-type-badge ${activeDayType}`}>
          {activeDayType.toUpperCase()} DAY
        </div>

        {/* Day Override Pill Buttons */}
        <div className="day-pills">
          {PPL_ROTATION.map((type) => (
            <button
              key={type}
              type="button"
              className={`day-pill ${type} ${activeDayType === type ? 'active' : ''}`}
              onClick={() => setActiveDayType(type)}
            >
              {type.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Previous Session Callout */}
      {previousSession && (
        <div className="callout fade-in">
          <Zap size={16} color="var(--color-neon-lime)" style={{ flexShrink: 0 }} />
          <div>
            <strong>Last {activeDayType.toUpperCase()} day:</strong>{' '}
            {formatFriendlyDate(previousSession.date)} · {previousSession.exercises.length} exercises.{' '}
            <span style={{ color: 'var(--color-light-volt)', fontWeight: 800 }}>Beat it.</span>
          </div>
        </div>
      )}

      {/* Locked Status Banner */}
      {isLocked && (
        <div className="locked-status-bar fade-in">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={18} />
            <span>Session Locked</span>
          </div>
          <button type="button" className="btn-secondary" onClick={handleToggleLock} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
            <Unlock size={14} style={{ display: 'inline', marginRight: '4px' }} />
            Edit
          </button>
        </div>
      )}

      {/* Add Exercise Input (Hidden when locked) */}
      {!isLocked && (
        <form onSubmit={handleAddExercise} className="input-group">
          <input
            type="text"
            className="input-field"
            placeholder="Add exercise (e.g. Bench press)"
            value={newExerciseName}
            onChange={(e) => setNewExerciseName(e.target.value)}
          />
          <button type="submit" className="btn-primary">
            <Plus size={18} />
            Add
          </button>
        </form>
      )}

      {/* Exercise Cards */}
      {currentExercises.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '28px 16px', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '0.9rem' }}>No exercises added for today's {activeDayType.toUpperCase()} session yet.</p>
          <p style={{ fontSize: '0.8rem', marginTop: '6px', color: 'var(--text-secondary)' }}>
            Type an exercise name above to get started!
          </p>
        </div>
      ) : (
        currentExercises.map((ex) => {
          const ghostSets = getPreviousGhostSets(ex.name);
          const overloadChip = getOverloadChipData(ex.name, ex.sets);
          const currentInputs = setInputs[ex.id] || { weight: '', reps: '' };

          return (
            <div key={ex.id} className="card fade-in">
              <div className="card-title">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span>{ex.name}</span>
                  {overloadChip && (
                    <span className={`overload-chip ${overloadChip.type}`}>
                      {overloadChip.text}
                    </span>
                  )}
                </div>

                {!isLocked && (
                  <button
                    type="button"
                    className="btn-icon"
                    onClick={() => handleDeleteExercise(ex.id)}
                    aria-label="Delete exercise"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              {/* Last Time Ghost Line */}
              {ghostSets && (
                <div className="ghost-line num-font">
                  <span className="ghost-line-label">LAST TIME:</span>
                  <span>
                    {ghostSets.map(s => `${s.weight}×${s.reps}`).join(' · ')}
                  </span>
                </div>
              )}

              {/* Logged Sets List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {ex.sets.map((s, idx) => (
                  <div key={idx} className="set-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="set-number">SET {idx + 1}</span>
                      <span className="num-font" style={{ fontWeight: 700 }}>
                        {s.weight}kg × {s.reps}reps
                      </span>
                    </div>

                    {!isLocked && (
                      <button
                        type="button"
                        className="btn-icon"
                        onClick={() => handleDeleteSet(ex.id, idx)}
                        aria-label="Delete set"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Log Set Inputs (Hidden when locked) */}
              {!isLocked && (
                <form
                  onSubmit={(e) => handleLogSet(ex.id, e)}
                  className="input-group"
                  style={{ marginTop: '4px' }}
                >
                  <input
                    type="number"
                    step="any"
                    inputMode="decimal"
                    className="input-field num-font"
                    placeholder="kg"
                    value={currentInputs.weight}
                    onChange={(e) =>
                      setSetInputs({
                        ...setInputs,
                        [ex.id]: { ...currentInputs, weight: e.target.value }
                      })
                    }
                  />
                  <input
                    type="number"
                    inputMode="numeric"
                    className="input-field num-font"
                    placeholder="reps"
                    value={currentInputs.reps}
                    onChange={(e) =>
                      setSetInputs({
                        ...setInputs,
                        [ex.id]: { ...currentInputs, reps: e.target.value }
                      })
                    }
                  />
                  <button type="submit" className="btn-primary" style={{ padding: '8px 12px', fontSize: '0.85rem' }}>
                    Log set
                  </button>
                </form>
              )}
            </div>
          );
        })
      )}

      {/* Done / Lock Finish Button */}
      {currentExercises.length > 0 && !isLocked && (
        <button
          type="button"
          className="btn-primary"
          onClick={handleToggleLock}
          style={{
            padding: '14px',
            fontSize: '1rem',
            background: 'linear-gradient(135deg, var(--color-neon-lime), var(--color-light-volt))',
            color: 'var(--color-midnight-bg)',
            marginTop: '8px'
          }}
        >
          <CheckCircle2 size={20} />
          Done — finish {activeDayType.toUpperCase()} day ✓
        </button>
      )}
    </div>
  );
}
