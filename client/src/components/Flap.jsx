// Split-flap display tiles, like an airport departure board.
export default function Flap({ text, size = 'md', label, delay = 0 }) {
  const chars = String(text).toUpperCase().split('');
  return (
    <span className={`flap flap-${size}`} role="img" aria-label={label || String(text)}>
      {chars.map((c, i) =>
        c === ' ' ? (
          <span key={i} className="flap-gap" aria-hidden="true" />
        ) : (
          <span key={i} className="flap-tile" aria-hidden="true" style={{ animationDelay: `${delay + i * 55}ms` }}>
            {c}
          </span>
        )
      )}
    </span>
  );
}
