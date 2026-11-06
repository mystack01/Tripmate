import { useEffect, useMemo, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import { useUI } from '../UIContext.jsx';
import Flap from '../components/Flap.jsx';
import CountUp from '../components/CountUp.jsx';
import { flagEmoji, fmtDate } from '../utils.js';

export default function Admin() {
  const { user: me } = useAuth();
  const { toast, confirm } = useUI();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');

  useEffect(() => {
    Promise.all([api('/admin/users'), api('/admin/stats')])
      .then(([u, s]) => {
        setUsers(u.users);
        setStats(s);
      })
      .catch((e) => setError(e.message));
  }, []);

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    return users.filter((u) => `${u.name} ${u.email}`.toLowerCase().includes(term));
  }, [users, q]);

  async function changeRole(u, role) {
    const ok = await confirm({
      title: role === 'admin' ? `Make ${u.name} an admin?` : `Remove admin rights from ${u.name}?`,
      message:
        role === 'admin'
          ? 'Admins can see platform statistics, change roles and delete accounts.'
          : 'They will become a regular user and lose access to the control tower.',
      confirmText: role === 'admin' ? 'Make admin' : 'Remove admin',
    });
    if (!ok) return;
    try {
      await api(`/admin/users/${u.id}/role`, { method: 'PATCH', body: { role } });
      setUsers((list) => list.map((x) => (x.id === u.id ? { ...x, role } : x)));
      toast(role === 'admin' ? `${u.name} is now an admin.` : `${u.name} is now a regular user.`);
    } catch (e) {
      toast(e.message, 'error');
    }
  }

  async function removeUser(u) {
    const ok = await confirm({
      title: `Delete ${u.name}?`,
      message: `This permanently deletes the account and all ${u.tripCount} of their trips.`,
      confirmText: 'Delete user',
      danger: true,
    });
    if (!ok) return;
    try {
      await api(`/admin/users/${u.id}`, { method: 'DELETE' });
      setUsers((list) => list.filter((x) => x.id !== u.id));
      setStats((s) => (s ? { ...s, users: s.users - 1, trips: s.trips - u.tripCount } : s));
      toast('User deleted.');
    } catch (e) {
      toast(e.message, 'error');
    }
  }

  const maxDest = Math.max(1, ...(stats?.topDestinations || []).map((d) => d.count));
  const maxMonth = Math.max(1, ...(stats?.months || []).flatMap((m) => [m.users, m.trips]));

  return (
    <div className="container page">
      <div className="page-head">
        <h1>Control tower</h1>
        <Flap text="ADMIN" size="md" />
      </div>
      <p className="muted lead-sm">
        You are signed in as an administrator. Here you can watch platform activity, promote or demote users, and delete accounts.
      </p>
      {error && <p className="error" role="alert">{error}</p>}

      {stats && (
        <>
          <dl className="tiles">
            <div className="tile"><dd><CountUp value={stats.users} /></dd><dt>Users</dt></div>
            <div className="tile"><dd><CountUp value={stats.trips} /></dd><dt>Trips planned</dt></div>
            <div className="tile"><dd><CountUp value={stats.activities} /></dd><dt>Activities</dt></div>
            <div className="tile"><dd><CountUp value={stats.avgDays} decimals={1} /></dd><dt>Average trip length (days)</dt></div>
          </dl>

          <div className="two-col">
            <section className="panel">
              <h2>Most planned destinations</h2>
              {stats.topDestinations.length === 0 && <p className="muted">No trips yet.</p>}
              <ul className="hbars">
                {stats.topDestinations.map((d) => (
                  <li key={d._id}>
                    <span>{flagEmoji(d.countryCode)} {d._id}</span>
                    <div className="bar"><span style={{ width: `${(d.count / maxDest) * 100}%` }} /></div>
                    <strong>{d.count}</strong>
                  </li>
                ))}
              </ul>
            </section>

            <section className="panel">
              <h2>Last six months</h2>
              <div className="cols" role="img" aria-label="New users and trips per month">
                {stats.months.map((m) => (
                  <div key={m.label} className="col">
                    <div className="col-bars">
                      <span className="b-users" style={{ height: `${(m.users / maxMonth) * 100}%` }} title={`${m.users} new users`} />
                      <span className="b-trips" style={{ height: `${(m.trips / maxMonth) * 100}%` }} title={`${m.trips} new trips`} />
                    </div>
                    <small>{m.label}</small>
                  </div>
                ))}
              </div>
              <p className="legend-inline"><i className="key-users" /> New users <i className="key-trips" /> New trips</p>
            </section>
          </div>
        </>
      )}

      <section className="stack">
        <div className="row between">
          <h2>Users</h2>
          <input type="search" aria-label="Search users" placeholder="Search by name or email" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="panel table-wrap">
          <table className="ledger-table">
            <thead>
              <tr>
                <th scope="col">Name</th><th scope="col">Email</th><th scope="col">Role</th>
                <th scope="col">Trips</th><th scope="col">Joined</th><th scope="col"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {shown.map((u) => {
                const self = u.id === me.id;
                return (
                  <tr key={u.id}>
                    <td>{u.name}{self && <span className="muted"> (you)</span>}</td>
                    <td>{u.email}</td>
                    <td><span className={`badge ${u.role === 'admin' ? 'badge-ongoing' : 'badge-past'}`}>{u.role}</span></td>
                    <td>{u.tripCount}</td>
                    <td>{fmtDate(u.createdAt)}</td>
                    <td className="actions">
                      {!self && (
                        <>
                          <button className="btn btn-quiet btn-sm" onClick={() => changeRole(u, u.role === 'admin' ? 'user' : 'admin')}>
                            {u.role === 'admin' ? 'Remove admin' : 'Make admin'}
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => removeUser(u)}>Delete</button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
              {shown.length === 0 && <tr><td colSpan="6" className="muted">No users match your search.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
