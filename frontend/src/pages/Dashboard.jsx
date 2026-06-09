import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(r => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page"><p>Loading dashboard…</p></div>;

  const statCards = [
    { label: 'Emails Generated', num: stats?.total_emails ?? 0, icon: '✉️' },
    { label: 'Reports Created', num: stats?.total_reports ?? 0, icon: '📋' },
    { label: 'Meetings MOMs', num: stats?.total_meetings ?? 0, icon: '📝' },
    { label: 'Total Tasks', num: stats?.total_tasks ?? 0, icon: '✅' },
    { label: 'Pending Tasks', num: stats?.pending_tasks ?? 0, icon: '⏳' },
    { label: 'Done Tasks', num: stats?.done_tasks ?? 0, icon: '🎉' },
  ];

  const shortcuts = [
    { path: '/generate-email', label: 'Generate Email', icon: '✉️', color: '#3a7bd5' },
    { path: '/report', label: 'Daily Report', icon: '📋', color: '#00c9a7' },
    { path: '/meeting', label: 'Meeting MOM', icon: '📝', color: '#f093fb' },
    { path: '/tasks', label: 'Add Task', icon: '✅', color: '#f5a623' },
  ];

  return (
    <div className="page">
      <h1 className="page-title">📊 Dashboard</h1>

      <div className="stats-grid">
        {statCards.map(({ label, num, icon }) => (
          <div className="stat-card" key={label}>
            <div style={{ fontSize: '28px', marginBottom: '6px' }}>{icon}</div>
            <div className="stat-num">{num}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <h2 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '14px', color: '#1F538A' }}>
        Quick Actions
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '14px', marginBottom: '32px' }}>
        {shortcuts.map(({ path, label, icon, color }) => (
          <Link key={path} to={path} style={{ textDecoration: 'none' }}>
            <div className="card" style={{ textAlign: 'center', cursor: 'pointer', borderTop: `4px solid ${color}` }}>
              <div style={{ fontSize: '30px', marginBottom: '8px' }}>{icon}</div>
              <div style={{ fontWeight: '600', fontSize: '14px', color: '#1a2332' }}>{label}</div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Recent Emails */}
        <div className="card">
          <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '14px', color: '#1F538A' }}>Recent Emails</h3>
          {stats?.recent_emails?.length ? (
            <table>
              <thead><tr><th>Subject</th><th>Date</th></tr></thead>
              <tbody>
                {stats.recent_emails.map(e => (
                  <tr key={e.id}>
                    <td style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.subject}</td>
                    <td style={{ color: '#6b7c93', fontSize: '12px' }}>{new Date(e.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p style={{ color: '#6b7c93', fontSize: '13px' }}>No emails yet</p>}
        </div>

        {/* Recent Reports */}
        <div className="card">
          <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '14px', color: '#1F538A' }}>Recent Reports</h3>
          {stats?.recent_reports?.length ? (
            <table>
              <thead><tr><th>Team</th><th>Date</th></tr></thead>
              <tbody>
                {stats.recent_reports.map(r => (
                  <tr key={r.id}>
                    <td>{r.team_name}</td>
                    <td style={{ color: '#6b7c93', fontSize: '12px' }}>{r.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p style={{ color: '#6b7c93', fontSize: '13px' }}>No reports yet</p>}
        </div>
      </div>
    </div>
  );
}
