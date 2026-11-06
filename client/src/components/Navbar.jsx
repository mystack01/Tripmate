import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import { useUI } from '../UIContext.jsx';
import PlaneIcon from './PlaneIcon.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { toast, confirm } = useUI();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  async function onLogout() {
    const ok = await confirm({
      title: 'Log out of TripMate?',
      message: 'You will need to sign in again to see your trips.',
      confirmText: 'Log out',
    });
    if (!ok) return;
    logout();
    navigate('/');
    toast('You have been logged out.');
  }

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="brand" aria-label="TripMate home">
          <PlaneIcon /> <span>TripMate</span>
        </Link>
        <nav aria-label="Main navigation" className="nav-links">
          {user && (
            <>
              <NavLink to="/" end>My trips</NavLink>
              <NavLink to="/trips/new">Plan a trip</NavLink>
              {user.role === 'admin' && <NavLink to="/admin">Control tower</NavLink>}
            </>
          )}
          {!user && (
            <>
              <NavLink to="/login">Log in</NavLink>
              <NavLink to="/register" className="nav-cta">Create account</NavLink>
            </>
          )}
        </nav>
        <div className="nav-tools">
          <button
            className="icon-btn"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            aria-label={theme === 'light' ? 'Switch to night mode' : 'Switch to day mode'}
            title={theme === 'light' ? 'Night mode' : 'Day mode'}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          {user && (
            <>
              <span className="avatar" aria-hidden="true">{user.name.charAt(0).toUpperCase()}</span>
              <span className="nav-name">
                {user.name.split(' ')[0]}
                {user.role === 'admin' && <span className="badge badge-ongoing">Admin</span>}
              </span>
              <button className="btn btn-quiet btn-sm" onClick={onLogout}>Log out</button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
