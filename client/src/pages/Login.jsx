import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import { useUI } from '../UIContext.jsx';
import AuthShell from '../components/AuthShell.jsx';

export default function Login() {
  const { user, login } = useAuth();
  const { toast } = useUI();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(form.email, form.password);
      toast('Welcome back.');
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell headline="Welcome back" line="Your trips, forecasts and packing lists are right where you left them.">
      <h1>Log in</h1>
      <form onSubmit={onSubmit} noValidate>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={onChange} required />
        <label htmlFor="password">Password</label>
        <div className="input-group">
          <input id="password" name="password" type={show ? 'text' : 'password'} autoComplete="current-password" value={form.password} onChange={onChange} required />
          <button type="button" className="btn btn-quiet btn-sm" onClick={() => setShow(!show)} aria-pressed={show}>
            {show ? 'Hide' : 'Show'}
          </button>
        </div>
        <p className="error" role="alert">{error}</p>
        <button className="btn btn-block" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
      </form>
      <p className="muted">New to TripMate? <Link to="/register">Create an account</Link></p>
    </AuthShell>
  );
}
