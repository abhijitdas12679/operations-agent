import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../api';

const C = {
  pageBg: '#F8F7FF',
  sidebar: '#FFFFFF',
  card: '#FFFFFF',
  border: '#F0ECFF',
  textH: '#1A1035',
  textMuted: '#8B7EC8',
  textLight: '#B0A8D4',
};

const FONT = "'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif";

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .ops-stat-card {
    transition: transform 0.22s ease, box-shadow 0.22s ease;
  }

  .ops-stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 48px rgba(0,0,0,0.1);
  }

  .ops-qa-card {
    transition: transform 0.18s ease, box-shadow 0.18s ease;
  }

  .ops-qa-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 32px rgba(0,0,0,0.08);
  }

  .ops-nav-item {
    transition: background 0.14s, color 0.14s;
  }

  .ops-nav-item:hover {
    background: #F3F0FF;
    color: #5B21B6;
  }
`;

const STAT_META = {
  total_emails: {
    label: 'Emails Generated',
    icon: '✉️',
    iconBg: '#EDE9FE',
    barColor: 'linear-gradient(90deg,#7C3AED,#A78BFA)',
    cornerBg: '#EDE9FE',
  },
  total_reports: {
    label: 'Reports Created',
    icon: '📋',
    iconBg: '#DBEAFE',
    barColor: 'linear-gradient(90deg,#3B82F6,#93C5FD)',
    cornerBg: '#EFF6FF',
  },
  total_meetings: {
    label: 'Meeting MOMs',
    icon: '📝',
    iconBg: '#D1FAE5',
    barColor: 'linear-gradient(90deg,#10B981,#6EE7B7)',
    cornerBg: '#ECFDF5',
  },
  total_tasks: {
    label: 'Total Tasks',
    icon: '🗂️',
    iconBg: '#E0E7FF',
    barColor: 'linear-gradient(90deg,#6366F1,#A5B4FC)',
    cornerBg: '#EEF2FF',
  },
};

const SHORTCUTS = [
  {
    path: '/generate-email',
    label: 'Generate Email',
    icon: '✉️',
    desc: 'Compose professional AI emails in seconds',
    iconBg: '#EDE9FE',
    accent: '#7C3AED',
  },
  {
    path: '/report',
    label: 'Daily Report',
    icon: '📋',
    desc: "Log and share your team's progress",
    iconBg: '#DBEAFE',
    accent: '#3B82F6',
  },
  {
    path: '/meeting',
    label: 'Meeting MOM',
    icon: '📝',
    desc: 'Capture key decisions and action points',
    iconBg: '#D1FAE5',
    accent: '#10B981',
  },
  {
    path: '/tasks',
    label: 'Add Task',
    icon: '✅',
    desc: 'Create and assign tasks to your team',
    iconBg: '#FEF3C7',
    accent: '#F59E0B',
  },
];

const NAV_LINKS = [
  { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { path: '/generate-email', label: 'Generate Email', icon: '✉️' },
  { path: '/report', label: 'Reports', icon: '📋' },
  { path: '/meeting', label: 'Meeting MOM', icon: '📝' },
  { path: '/tasks', label: 'Tasks', icon: '✅' },
];

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function normalizeList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.emails)) return data.emails;
  if (Array.isArray(data?.reports)) return data.reports;
  if (Array.isArray(data?.meetings)) return data.meetings;
  if (Array.isArray(data?.tasks)) return data.tasks;
  return [];
}

function getDisplayName() {
  return localStorage.getItem('username') || 'User';
}

function saveUserData(userData) {
  if (!userData) return;

  const fullName = getDisplayName(userData);

  if (fullName && fullName !== 'User') {
    localStorage.setItem('full_name', fullName);
  }

  localStorage.setItem('dashboard_user', JSON.stringify(userData));
}

async function safeGet(url) {
  try {
    const res = await api.get(url);
    return res.data;
  } catch {
    return null;
  }
}

function getTaskTotal(analyticsData, taskListData) {
  if (analyticsData?.total_tasks !== undefined) {
    return Number(analyticsData.total_tasks) || 0;
  }

  return normalizeList(taskListData).length;
}

function SectionLabel({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
      <span
        style={{
          width: 3,
          height: 16,
          borderRadius: 2,
          background: 'linear-gradient(180deg,#7C3AED,#4F46E5)',
        }}
      />
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: C.textLight,
        }}
      >
        {children}
      </span>
    </div>
  );
}

function Sidebar() {
  const loc = useLocation();

  return (
    <aside
      style={{
        width: 220,
        flexShrink: 0,
        background: C.sidebar,
        borderRight: `1px solid ${C.border}`,
        padding: '28px 16px',
        minHeight: '100vh',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px', marginBottom: 30 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg,#7C3AED,#4F46E5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            boxShadow: '0 4px 14px rgba(124,58,237,0.3)',
          }}
        >
          OA
        </div>

        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: C.textH }}>Ops Agent</div>
          <div style={{ fontSize: 10, color: C.textMuted, fontWeight: 500 }}>AI Workspace</div>
        </div>
      </div>

      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: '#C4BAE8',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          padding: '4px 12px 8px',
        }}
      >
        Main
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {NAV_LINKS.map((link) => {
          const active = loc.pathname === link.path;

          return (
            <Link key={link.path} to={link.path} style={{ textDecoration: 'none' }}>
              <div
                className="ops-nav-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 10,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: active ? 700 : 500,
                  color: active ? '#5B21B6' : C.textMuted,
                  background: active ? 'linear-gradient(135deg,#EDE9FE,#DDD6FE)' : 'transparent',
                }}
              >
                <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{link.icon}</span>
                <span style={{ flex: 1 }}>{link.label}</span>
                {link.dot && !active && (
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: link.dot }} />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}

function StatCard({ statKey, value, animDelay }) {
  const m = STAT_META[statKey];

  return (
    <div
      className="ops-stat-card"
      style={{
        background: C.card,
        borderRadius: 18,
        padding: '22px 22px 0',
        border: `1px solid ${C.border}`,
        position: 'relative',
        overflow: 'hidden',
        animation: 'fadeUp 0.4s ease both',
        animationDelay: `${animDelay}ms`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 80,
          height: 80,
          borderRadius: '0 18px 0 80px',
          background: m.cornerBg,
          opacity: 0.6,
        }}
      />

      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: m.iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 22,
          marginBottom: 14,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {m.icon}
      </div>

      <div style={{ fontSize: 38, fontWeight: 800, color: C.textH, lineHeight: 1 }}>
        {Number(value || 0).toLocaleString()}
      </div>

      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: C.textMuted,
          marginTop: 6,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        {m.label}
      </div>

      <div
        style={{
          display: 'inline-flex',
          fontSize: 11,
          fontWeight: 600,
          padding: '3px 8px',
          borderRadius: 20,
          marginTop: 10,
          marginBottom: 18,
          background: '#ECFDF5',
          color: '#047857',
        }}
      >
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: 3,
          width: '100%',
          background: m.barColor,
        }}
      />
    </div>
  );
}

function QuickActionCard({ path, label, icon, desc, iconBg, accent }) {
  return (
    <Link to={path} style={{ textDecoration: 'none' }}>
      <div
        className="ops-qa-card"
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          borderTop: `3px solid ${accent}`,
          borderRadius: 16,
          padding: '18px',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          height: '100%',
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
          }}
        >
          {icon}
        </div>

        <div style={{ fontSize: 13, fontWeight: 700, color: C.textH }}>{label}</div>
        <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.5 }}>{desc}</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: accent, marginTop: 'auto' }}>→</div>
      </div>
    </Link>
  );
}

function EmptyState({ message }) {
  return (
    <div style={{ padding: '28px 0 20px', textAlign: 'center', color: C.textLight, fontSize: 13 }}>
      {message}
    </div>
  );
}

function RecentPanel({ title, icon, children }) {
  return (
    <div
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 18,
        padding: '22px 22px 8px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <span>{icon}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: C.textH }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function TableRow({ primary, secondary, badge, badgeStyle, date, isLast }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 0',
        borderBottom: isLast ? 'none' : '1px solid #F8F5FF',
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: C.textH,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: 180,
          }}
        >
          {primary}
        </div>
        {secondary && <div style={{ fontSize: 11, color: C.textLight, marginTop: 2 }}>{secondary}</div>}
      </div>

      <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: 20,
            ...badgeStyle,
          }}
        >
          {badge}
        </span>
        <div style={{ fontSize: 11, color: C.textLight, marginTop: 4 }}>{date}</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [displayName, setDisplayName] = useState('User');

  const [stats, setStats] = useState({
    total_emails: 0,
    total_reports: 0,
    total_meetings: 0,
    total_tasks: 0,
    recent_emails: [],
    recent_reports: [],
  });

  useEffect(() => {
    const loadDashboard = async () => {
      const userData = await safeGet('/users/me');

      saveUserData(userData);
      setDisplayName(getDisplayName(userData));

      const emailData = await safeGet('/email/history');
      const reportData = await safeGet('/report/history');
      const meetingData = await safeGet('/meeting/history');

      const taskAnalytics = await safeGet('/tasks/analytics/summary');
      const taskList = await safeGet('/tasks/list');

      const emails = normalizeList(emailData);
      const reports = normalizeList(reportData);
      const meetings = normalizeList(meetingData);

      setStats({
        total_emails: emails.length,
        total_reports: reports.length,
        total_meetings: meetings.length,
        total_tasks: getTaskTotal(taskAnalytics, taskList),
        recent_emails: emails.slice(0, 5),
        recent_reports: reports.slice(0, 5),
      });
    };

    loadDashboard();
  }, []);

  const statKeys = ['total_emails', 'total_reports', 'total_meetings', 'total_tasks'];
  const sentBadge = { background: '#EDE9FE', color: '#5B21B6' };
  const doneBadge = { background: '#D1FAE5', color: '#047857' };

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      <div style={{ display: 'flex', minHeight: '100vh', background: C.pageBg, fontFamily: FONT }}>
        <Sidebar />

        <main style={{ flex: 1, padding: '36px 40px 64px', overflowY: 'auto', minWidth: 0 }}>
          <div style={{ marginBottom: 34 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: C.textH, margin: 0 }}>
              {getGreeting()}, {displayName} 👋
            </h1>

            <p style={{ fontSize: 13, color: C.textMuted, marginTop: 4 }}>
              Here's what's happening in your workspace today
            </p>
          </div>

          <SectionLabel>Overview</SectionLabel>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(200px, 1fr))',
              gap: 16,
              marginBottom: 32,
            }}
          >
            {statKeys.map((key, i) => (
              <StatCard key={key} statKey={key} value={stats[key]} animDelay={i * 60} />
            ))}
          </div>

          <SectionLabel>Quick Actions</SectionLabel>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 14,
              marginBottom: 32,
            }}
          >
            {SHORTCUTS.map((s) => (
              <QuickActionCard key={s.path} {...s} />
            ))}
          </div>

          <SectionLabel>Recent Activity</SectionLabel>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: 16,
            }}
          >
            <RecentPanel title="Recent Emails" icon="✉️">
              {stats.recent_emails.length ? (
                stats.recent_emails.map((e, i) => (
                  <TableRow
                    key={e.id || i}
                    primary={e.subject || 'Email'}
                    secondary={e.to || e.recipient_email || e.email || ''}
                    badge="Sent"
                    badgeStyle={sentBadge}
                    date={
                      e.created_at
                        ? new Date(e.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                          })
                        : ''
                    }
                    isLast={i === stats.recent_emails.length - 1}
                  />
                ))
              ) : (
                <EmptyState message="No emails generated yet" />
              )}
            </RecentPanel>

            <RecentPanel title="Recent Reports" icon="📋">
              {stats.recent_reports.length ? (
                stats.recent_reports.map((r, i) => (
                  <TableRow
                    key={r.id || i}
                    primary={r.team_name || r.title || 'Daily Report'}
                    secondary={r.description || 'Daily report'}
                    badge="Done"
                    badgeStyle={doneBadge}
                    date={r.date || ''}
                    isLast={i === stats.recent_reports.length - 1}
                  />
                ))
              ) : (
                <EmptyState message="No reports created yet" />
              )}
            </RecentPanel>
          </div>
        </main>
      </div>
    </>
  );
}