import React from 'react';
import { formatFriendlyDate, formatIndianNumber } from '../utils/storage';
import { History, CheckCircle2, Dumbbell, Footprints } from 'lucide-react';

export function HistoryTab({ workouts, stepsData }) {
  // Filter for non-empty sessions only (at least 1 exercise)
  const validSessions = (workouts || [])
    .filter(w => Array.isArray(w.exercises) && w.exercises.length > 0)
    .slice()
    .reverse(); // Reverse chronological

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="card-title">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <History size={20} color="var(--color-neon-lime)" />
          <span>Workout History</span>
        </div>
        <span className="num-font" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {validSessions.length} {validSessions.length === 1 ? 'Session' : 'Sessions'}
        </span>
      </div>

      {validSessions.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
          <Dumbbell size={36} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
          <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>No workouts logged yet</div>
          <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>
            Head over to the Today tab to start your first PPL session!
          </p>
        </div>
      ) : (
        validSessions.map((session) => {
          const type = (session.dayType || 'push').toLowerCase();
          const daySteps = stepsData[session.date];
          const hasSteps = daySteps !== undefined && daySteps !== null;

          return (
            <div key={session.id} className="card">
              {/* Card Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={`day-pill active ${type}`} style={{ padding: '4px 10px', fontSize: '0.75rem', cursor: 'default' }}>
                    {type.toUpperCase()}
                  </span>
                  {session.done && (
                    <span style={{ color: 'var(--color-neon-lime)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 700 }}>
                      <CheckCircle2 size={14} color="var(--color-neon-lime)" /> Done
                    </span>
                  )}
                </div>

                <div className="num-font" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {formatFriendlyDate(session.date)}
                </div>
              </div>

              {/* Exercises & Sets Row */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
                {session.exercises.map((ex) => {
                  const setFormattedString = (ex.sets || [])
                    .map(s => `${s.weight}×${s.reps}`)
                    .join(' · ');

                  return (
                    <div key={ex.id} style={{ background: 'var(--bg-input)', padding: '10px 12px', borderRadius: '8px' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                        {ex.name}
                      </div>
                      <div className="num-font" style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                        {setFormattedString || <span style={{ color: 'var(--text-muted)' }}>No sets recorded</span>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer: Steps logged right next to exercises */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px', paddingTop: '8px', borderTop: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Footprints size={15} color="var(--color-neon-lime)" />
                  {hasSteps ? (
                    <span className="num-font" style={{ fontWeight: 700, color: 'var(--color-light-volt)' }}>
                      {formatIndianNumber(daySteps)} steps {daySteps >= 5000 ? '✓' : '–'}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>No steps logged for this date</span>
                  )}
                </div>

                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  {session.exercises.length} {session.exercises.length === 1 ? 'exercise' : 'exercises'}
                </span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
