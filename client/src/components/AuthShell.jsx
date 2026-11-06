import Flap from './Flap.jsx';

export default function AuthShell({ headline, line, children }) {
  return (
    <div className="auth">
      <aside className="auth-side">
        <Flap text={headline} size="lg" />
        <p>{line}</p>
      </aside>
      <section className="auth-main">
        <div className="auth-box">{children}</div>
      </section>
    </div>
  );
}
