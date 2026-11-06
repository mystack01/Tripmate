import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import { useUI } from '../UIContext.jsx';
import AuthShell from '../components/AuthShell.jsx';

function strength(pw) {
  let s = 0;
  if (pw.length >= 8) s += 1;
  if (pw.length >= 12) s += 1;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s += 1;
  if (/\d/.test(pw)) s += 1;
  if (/[^A-Za-z0-9]/.test(pw)) s += 1;
  return s; // 0-5
}
const LABELS = ['Too short', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'];

export default function Register() {
  const { user, register } = useAuth();
  const { toast } = useUI();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const score = strength(form.password);

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await register(form.name, form.email, form.password);
      toast('Account created. Welcome aboard.');
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell headline="Welcome aboard" line="Create an account to plan trips with live weather, maps and budgets.">
      <h1>Create your account</h1>
      <form onSubmit={onSubmit} noValidate>
        <label htmlFor="name">Full name</label>
        <input id="name" name="name" autoComplete="name" value={form.name} onChange={onChange} required />
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={onChange} required />
        <label htmlFor="password">Password</label>
        <div className="input-group">
          <input id="password" name="password" type={show ? 'text' : 'password'} autoComplete="new-password" value={form.password} onChange={onChange} aria-describedby="pw-hint" required />
          <button type="button" className="btn btn-quiet btn-sm" onClick={() => setShow(!show)} aria-pressed={show}>
            {show ? 'Hide' : 'Show'}
          </button>
        </div>
        <div className="meter" aria-hidden="true">
          <span style={{ width: `${(score / 5) * 100}%` }} data-score={score} />
        </div>
        <small id="pw-hint">
          {form.password ? `Strength: ${LABELS[score]}. ` : ''}Use 8 or more characters with a letter and a number.
        </small>
        <p className="error" role="alert">{error}</p>
        <button className="btn btn-block" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button>
      </form>
      <p className="muted">Already registered? <Link to="/login">Log in</Link></p>
    </AuthShell>
  );
}
