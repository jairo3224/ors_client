export default function Modal({ children, onClose, maxWidth = 480 }) {
  return (
    <div className="modal" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal__box" style={{ maxWidth }}>
        {children}
      </div>
    </div>
  );
}

export function ModalHeader({ children, onClose }) {
  return (
    <div className="modal__header">
      <h3 style={{ margin: 0, color: '#1a3a5c', fontSize: '1.1rem' }}>{children}</h3>
      <button className="modal__close" onClick={onClose}>✕</button>
    </div>
  );
}

export function ModalActions({ children }) {
  return <div className="modal__actions">{children}</div>;
}
