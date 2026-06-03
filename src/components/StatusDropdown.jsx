import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function StatusDropdown({ options, colors, current, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const currentIndex = options.indexOf(current);

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)} className="btn btn--sm" style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid #d1dae6', color: colors[current] || '#475569' }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: colors[current] || '#475569' }} />
        {current.replace('_', ' ')}
        <ChevronDown size={12} />
      </button>
      {open && (
        <div className="modal__box" style={{ position: 'absolute', top: '100%', left: 0, padding: 0, minWidth: 160, marginTop: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          {options.map((s, i) => {
            const isDisabled = disabled ? disabled(s) : i < currentIndex;
            return (
              <button key={s} disabled={isDisabled} onClick={() => { onChange(s); setOpen(false); }}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 14px', border: 'none', background: s === current ? '#f0f4f8' : 'transparent', cursor: isDisabled ? 'not-allowed' : 'pointer', fontSize: '0.82rem', color: isDisabled ? '#ccc' : '#1a3a5c', fontFamily: 'inherit', opacity: isDisabled ? 0.5 : 1 }}>
                {s.replace('_', ' ')}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
