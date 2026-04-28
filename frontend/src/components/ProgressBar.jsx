export function ProgressBar({ value = 0, label = "Progress" }) {
  return (
    <div className="progress-block" aria-label={label}>
      <div className="progress-meta">
        <span>{label}</span>
        <strong>{value}%</strong>
      </div>
      <div className="progress-track">
        <span className="progress-fill" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
