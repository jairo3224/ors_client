export default function Badge({ label, color, transform = true }) {
  return (
    <span className="badge" style={{ background: `${color}18`, color }}>
      {transform ? label.replace('_', ' ') : label}
    </span>
  );
}
