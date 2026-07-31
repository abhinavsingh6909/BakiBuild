import React, { useState } from 'react';

const REST_OPTIONS = [
  { label: '1.5 min', seconds: 90 },
  { label: '2 min', seconds: 120 },
  { label: '2.5 min', seconds: 150 },
  { label: '3 min', seconds: 180 }
];

export function FirstLaunchSetup({ onComplete }) {
  const [name, setName] = useState('');
  const [restSeconds, setRestSeconds] = useState(90);

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalName = name.trim() || 'Athlete';
    onComplete({
      done: true,
      name: finalName,
      restSeconds
    });
  };

  return (
    <div className="setup-container fade-in">
      <div className="setup-header">
        <div className="setup-logo-badge">⚡</div>
        <h1 className="setup-title">BakiBuild</h1>
        <p className="setup-tagline">Master progressive overload. Dominate your PPL split every single workout.</p>
      </div>

      <form className="setup-form" onSubmit={handleSubmit}>
        <label className="setup-label">
          YOUR NAME
          <input
            type="text"
            className="input-field"
            placeholder="e.g. Alex"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
        </label>

        <div className="setup-label">
          REST DURATION BETWEEN SETS
          <div className="rest-picker">
            {REST_OPTIONS.map((opt) => (
              <button
                key={opt.seconds}
                type="button"
                className={`rest-pill ${restSeconds === opt.seconds ? 'selected' : ''}`}
                onClick={() => setRestSeconds(opt.seconds)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="ppl-preview-box">
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            PPL Rotation Sequence
          </span>
          <div className="ppl-preview-pills">
            <span className="ppl-preview-pill push">PUSH</span>
            <span className="ppl-preview-pill pull">PULL</span>
            <span className="ppl-preview-pill legs">LEGS</span>
            <span className="ppl-preview-pill push">PUSH</span>
            <span className="ppl-preview-pill pull">PULL</span>
            <span className="ppl-preview-pill legs">LEGS</span>
          </div>
        </div>

        <button type="submit" className="btn-primary" style={{ padding: '14px', fontSize: '1.05rem', marginTop: '12px' }}>
          Start training →
        </button>
      </form>

      <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        All data stored locally on your device · 100% Offline
      </div>
    </div>
  );
}
