import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../api';

const C = {
  pageBg: '#F8FAFC',
  sidebar: 'rgba(255,255,255,0.94)',
  card: '#FFFFFF',
  border: '#E2E8F0',
  textH: '#0F172A',
  textMuted: '#64748B',
  textLight: '#94A3B8',
  navy: '#0F172A',
  blue: '#1D4ED8',
  teal: '#0F766E',
  amber: '#D97706',
  slate: '#334155',
};

const FONT = "'Manrope', 'Inter', 'Segoe UI', system-ui, sans-serif";

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes pulseDot {
    0%, 100% { box-shadow: 0 0 0 0 rgba(15,118,110,0.35); }
    50% { box-shadow: 0 0 0 7px rgba(15,118,110,0); }
  }

  .ops-shell {
    background:
      radial-gradient(circle at 20% 0%, rgba(29,78,216,0.08), transparent 30%),
      radial-gradient(circle at 95% 15%, rgba(15,118,110,0.08), transparent 26%),
      linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%);
  }

  .ops-stat-card,
  .ops-qa-card {
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  }

  .ops-stat-card:hover,
  .ops-qa-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 22px 46px rgba(15,23,42,0.12) !important;
    border-color: rgba(15,23,42,0.12) !important;
  }

  .ops-nav-item {
    transition: background 0.16s ease, transform 0.16s ease, color 0.16s ease;
  }

  .ops-nav-item:hover {
    transform: translateX(3px);
    background: #F1F5F9 !important;
  }

  .ops-tooltip {
    position: absolute;
    left: 62px;
    top: 50%;
    transform: translateY(-50%) translateX(-6px);
    opacity: 0;
    pointer-events: none;
    white-space: nowrap;
    background: #0F172A;
    color: #fff;
    font-size: 12px;
    font-weight: 800;
    padding: 9px 12px;
    border-radius: 10px;
    box-shadow: 0 14px 34px rgba(15,23,42,0.25);
    transition: opacity 0.18s ease, transform 0.18s ease;
    z-index: 99;
  }

  .ops-tooltip::before {
    content: "";
    position: absolute;
    left: -5px;
    top: 50%;
    width: 10px;
    height: 10px;
    background: #0F172A;
    transform: translateY(-50%) rotate(45deg);
  }

  .ops-nav-wrap:hover .ops-tooltip {
    opacity: 1;
    transform: translateY(-50%) translateX(0);
  }

  .ops-row {
    transition: background 0.16s ease, transform 0.16s ease;
  }

  .ops-row:hover {
    background: #F8FAFC;
    transform: translateX(2px);
  }

  @media (max-width: 900px) {
    .ops-layout {
      flex-direction: column;
    }

    .ops-sidebar {
      width: 100% !important;
      min-height: auto !important;
      position: relative !important;
    }

    .ops-main {
      padding: 22px 16px 50px !important;
    }
  }
`;

function AppIcon({ type, size = 18, color = 'currentColor', strokeWidth = 2 }) {
  const common = {
    fill: 'none',
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };

  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      {type === 'dashboard' && (
        <>
          <rect x="3" y="3" width="7" height="8" rx="2" {...common} />
          <rect x="14" y="3" width="7" height="5" rx="2" {...common} />
          <rect x="14" y="12" width="7" height="9" rx="2" {...common} />
          <rect x="3" y="15" width="7" height="6" rx="2" {...common} />
        </>
      )}

      {type === 'mail' && (
        <>
          <rect x="3" y="5" width="18" height="14" rx="3" {...common} />
          <path d="M4.5 7.5L12 13l7.5-5.5" {...common} />
        </>
      )}

      {type === 'report' && (
        <>
          <path d="M7 3h7l4 4v14H7a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3Z" {...common} />
          <path d="M14 3v5h5" {...common} />
          <path d="M8 13h8M8 17h6" {...common} />
        </>
      )}

      {type === 'meeting' && (
        <>
          <rect x="4" y="4" width="16" height="16" rx="3" {...common} />
          <path d="M8 8h8M8 12h8M8 16h5" {...common} />
        </>
      )}

      {type === 'tasks' && (
        <>
          <rect x="4" y="4" width="16" height="16" rx="3" {...common} />
          <path d="M8 12l2.4 2.4L16 9" {...common} />
        </>
      )}

      {type === 'arrow' && <path d="M9 6l6 6-6 6" {...common} />}

      {type === 'calendar' && (
        <>
          <rect x="4" y="5" width="16" height="15" rx="3" {...common} />
          <path d="M8 3v4M16 3v4M4 10h16" {...common} />
          <path d="M8 14h2M12 14h2M16 14h1M8 17h2M12 17h2" {...common} />
        </>
      )}
    </svg>
  );
}

function HeroIllustration() {
  return (
    <div
      style={{
        position: 'absolute',
        right: 34,
        bottom: 0,
        width: 360,
        height: 190,
        pointerEvents: 'none',
        opacity: 0.96,
      }}
    >
      <div
        style={{
          position: 'absolute',
          right: 0,
          bottom: 0,
          width: 220,
          height: 132,
          borderRadius: '22px 22px 0 0',
          background: 'linear-gradient(135deg,#1E293B,#0F172A)',
          boxShadow: '0 24px 54px rgba(15,23,42,0.28)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          right: 22,
          bottom: 22,
          width: 176,
          height: 88,
          borderRadius: 16,
          background: '#F8FAFC',
          border: '1px solid rgba(226,232,240,0.95)',
        }}
      >
        <div style={{ display: 'flex', gap: 6, padding: 12 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#0F766E' }} />
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#D97706' }} />
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#1D4ED8' }} />
        </div>

        <div style={{ margin: '0 14px', height: 8, borderRadius: 99, background: '#CBD5E1' }} />
        <div style={{ margin: '9px 14px 0', height: 8, width: '68%', borderRadius: 99, background: '#94A3B8' }} />
        <div
          style={{
            position: 'absolute',
            right: 14,
            bottom: 14,
            width: 52,
            height: 34,
            borderRadius: 10,
            background: 'linear-gradient(135deg,#1D4ED8,#0F766E)',
          }}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          left: 18,
          bottom: 0,
          width: 158,
          height: 16,
          borderRadius: 999,
          background: '#475569',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: 44,
          bottom: 16,
          width: 112,
          height: 78,
          borderRadius: '20px 20px 8px 8px',
          background: 'linear-gradient(135deg,#FFFFFF,#E2E8F0)',
          border: '1px solid rgba(203,213,225,0.95)',
          boxShadow: '0 18px 38px rgba(15,23,42,0.13)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: 77,
          bottom: 94,
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'linear-gradient(135deg,#334155,#0F172A)',
        }}
      />
    </div>
  );
}

const STAT_META = {
  total_emails: {
    label: 'Emails Generated',
    icon: 'mail',
    iconBg: '#EFF6FF',
    iconColor: '#1D4ED8',
    barColor: 'linear-gradient(90deg,#1D4ED8,#3B82F6)',
  },
  total_reports: {
    label: 'Reports Created',
    icon: 'report',
    iconBg: '#FFF7ED',
    iconColor: '#D97706',
    barColor: 'linear-gradient(90deg,#D97706,#F59E0B)',
  },
  total_meetings: {
    label: 'Meeting MOMs',
    icon: 'meeting',
    iconBg: '#ECFDF5',
    iconColor: '#0F766E',
    barColor: 'linear-gradient(90deg,#0F766E,#14B8A6)',
  },
  total_tasks: {
    label: 'Total Tasks',
    icon: 'tasks',
    iconBg: '#F1F5F9',
    iconColor: '#0F172A',
    barColor: 'linear-gradient(90deg,#0F172A,#475569)',
  },
};

const SHORTCUTS = [
  {
    path: '/generate-email',
    label: 'Generate Email',
    icon: 'mail',
    desc: 'Compose professional AI emails in seconds',
    iconBg: '#EFF6FF',
    accent: '#1D4ED8',
  },
  {
    path: '/report',
    label: 'Daily Report',
    icon: 'report',
    desc: "Log and share your team's progress",
    iconBg: '#FFF7ED',
    accent: '#D97706',
  },
  {
    path: '/meeting',
    label: 'Meeting MOM',
    icon: 'meeting',
    desc: 'Capture key decisions and action points',
    iconBg: '#ECFDF5',
    accent: '#0F766E',
  },
  {
    path: '/tasks',
    label: 'Add Task',
    icon: 'tasks',
    desc: 'Create and assign tasks to your team',
    iconBg: '#F1F5F9',
    accent: '#0F172A',
  },
];

const NAV_LINKS = [
  { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { path: '/generate-email', label: 'Generate Email', icon: 'mail' },
  { path: '/report', label: 'Reports', icon: 'report' },
  { path: '/meeting', label: 'Meeting MOM', icon: 'meeting' },
  { path: '/tasks', label: 'Tasks', icon: 'tasks' },
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
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
      <span
        style={{
          width: 4,
          height: 22,
          borderRadius: 99,
          background: 'linear-gradient(180deg,#0F172A,#1D4ED8)',
        }}
      />

      <span
        style={{
          fontSize: 20,
          fontWeight: 900,
          letterSpacing: '-0.04em',
          color: C.textH,
        }}
      >
        {children}
      </span>
    </div>
  );
}

function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const loc = useLocation();

  return (
    <aside
      className="ops-sidebar"
      style={{
        width: sidebarOpen ? 248 : 86,
        flexShrink: 0,
        background: C.sidebar,
        borderRight: `1px solid ${C.border}`,
        padding: '24px 16px',
        minHeight: '100vh',
        position: 'sticky',
        top: 0,
        backdropFilter: 'blur(18px)',
        boxShadow: '10px 0 40px rgba(15,23,42,0.05)',
        transition: 'width 0.3s ease',
        overflow: sidebarOpen ? 'hidden' : 'visible',
        zIndex: 20,
      }}
    >
      <div
        onClick={() => setSidebarOpen(!sidebarOpen)}
        title={sidebarOpen ? 'Collapse navigation' : 'Expand navigation'}
        style={{
          padding: '6px 0 18px',
          marginBottom: 18,
          borderBottom: `1px solid ${C.border}`,
          display: 'flex',
          justifyContent: sidebarOpen ? 'flex-start' : 'center',
          cursor: 'pointer',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            width: sidebarOpen ? '100%' : 'auto',
            padding: sidebarOpen ? '10px 12px' : '10px',
            borderRadius: 16,
            background: '#F8FAFC',
            border: `1px solid ${C.border}`,
            boxShadow: '0 10px 24px rgba(15,23,42,0.05)',
            transition: 'background 0.18s ease, transform 0.18s ease',
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 11,
              background: '#FFFFFF',
              border: `1px solid ${C.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <AppIcon type="dashboard" size={17} color={C.navy} strokeWidth={2.3} />
          </div>

          {sidebarOpen && (
            <>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 900,
                    color: C.textH,
                    letterSpacing: '-0.03em',
                  }}
                >
                  Navigation
                </div>
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 900,
                    color: C.textMuted,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    marginTop: 3,
                  }}
                >
                  Click to collapse
                </div>
              </div>

              <span
                style={{
                  fontSize: 18,
                  fontWeight: 900,
                  color: C.textMuted,
                  lineHeight: 1,
                }}
              >
                ‹
              </span>
            </>
          )}
        </div>
      </div>

      {sidebarOpen && (
        <div
          style={{
            fontSize: 10,
            fontWeight: 900,
            color: '#94A3B8',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            padding: '12px 12px 10px',
          }}
        >
          Main
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {NAV_LINKS.map((link) => {
          const active = loc.pathname === link.path;

          return (
            <Link key={link.path} to={link.path} style={{ textDecoration: 'none' }}>
              <div className="ops-nav-wrap" style={{ position: 'relative' }}>
                <div
                  className="ops-nav-item"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: sidebarOpen ? 'flex-start' : 'center',
                    gap: 11,
                    padding: sidebarOpen ? '11px 12px' : '11px 0',
                    borderRadius: 13,
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: active ? 900 : 700,
                    color: active ? '#FFFFFF' : '#64748B',
                    background: active ? 'linear-gradient(135deg,#0F172A,#1E293B)' : 'transparent',
                    border: active ? '1px solid rgba(15,23,42,0.2)' : '1px solid transparent',
                    boxShadow: active ? '0 14px 30px rgba(15,23,42,0.16)' : 'none',
                  }}
                >
                  <span
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 10,
                      background: active ? 'rgba(255,255,255,0.12)' : '#FFFFFF',
                      border: active ? '1px solid rgba(255,255,255,0.15)' : `1px solid ${C.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <AppIcon type={link.icon} size={16} color={active ? '#FFFFFF' : '#64748B'} strokeWidth={2.2} />
                  </span>

                  {sidebarOpen && <span style={{ flex: 1 }}>{link.label}</span>}
                </div>

                {!sidebarOpen && <span className="ops-tooltip">{link.label}</span>}
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
        background: '#FFFFFF',
        borderRadius: 20,
        padding: '22px',
        border: `1px solid ${C.border}`,
        position: 'relative',
        overflow: 'hidden',
        animation: 'fadeUp 0.5s ease both',
        animationDelay: `${animDelay}ms`,
        boxShadow: '0 14px 34px rgba(15,23,42,0.06)',
        minHeight: 176,
      }}
    >
      <div
        style={{
          width: 50,
          height: 50,
          borderRadius: 14,
          background: m.iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 18,
          border: `1px solid ${C.border}`,
        }}
      >
        <AppIcon type={m.icon} size={23} color={m.iconColor} strokeWidth={2.2} />
      </div>

      <div style={{ fontSize: 42, fontWeight: 900, color: C.textH, lineHeight: 1, letterSpacing: '-0.055em' }}>
        {Number(value || 0).toLocaleString()}
      </div>

      <div
        style={{
          fontSize: 12,
          fontWeight: 900,
          color: C.textMuted,
          marginTop: 8,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        {m.label}
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: 4,
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
          background: '#FFFFFF',
          border: `1px solid ${C.border}`,
          borderRadius: 20,
          padding: '20px',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          height: '100%',
          boxShadow: '0 14px 34px rgba(15,23,42,0.06)',
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: iconBg,
            border: `1px solid ${C.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AppIcon type={icon} size={22} color={accent} strokeWidth={2.2} />
        </div>

        <div style={{ fontSize: 14, fontWeight: 900, color: C.textH }}>{label}</div>
        <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.65 }}>{desc}</div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 900, color: accent }}>
          Open <AppIcon type="arrow" size={15} color={accent} strokeWidth={2.6} />
        </div>
      </div>
    </Link>
  );
}

function EmptyState({ message }) {
  return (
    <div style={{ padding: '38px 0 34px', textAlign: 'center', color: C.textLight, fontSize: 13 }}>
      {message}
    </div>
  );
}

function RecentPanel({ title, icon, children }) {
  return (
    <div
      style={{
        background: '#FFFFFF',
        border: `1px solid ${C.border}`,
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: '0 14px 34px rgba(15,23,42,0.06)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 11,
          padding: '18px 22px',
          borderBottom: `1px solid ${C.border}`,
          background: '#F8FAFC',
        }}
      >
        <span
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            background: '#FFFFFF',
            border: `1px solid ${C.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AppIcon type={icon} size={17} color={C.navy} strokeWidth={2.2} />
        </span>

        <span style={{ fontSize: 15, fontWeight: 900, color: C.textH }}>{title}</span>
      </div>

      <div style={{ padding: '4px 20px 10px' }}>{children}</div>
    </div>
  );
}

function TableRow({ primary, secondary, badge, badgeStyle, date, isLast }) {
  return (
    <div
      className="ops-row"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 2px',
        borderBottom: isLast ? 'none' : `1px solid ${C.border}`,
        gap: 16,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 800,
            color: C.textH,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: 260,
          }}
        >
          {primary}
        </div>

        {secondary && <div style={{ fontSize: 11, color: C.textMuted, marginTop: 4 }}>{secondary}</div>}
      </div>

      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 900,
            padding: '5px 10px',
            borderRadius: 999,
            textTransform: 'uppercase',
            ...badgeStyle,
          }}
        >
          {badge}
        </span>

        <div style={{ fontSize: 11, color: C.textLight, marginTop: 6 }}>{date}</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [displayName, setDisplayName] = useState('User');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [stats, setStats] = useState({
    total_emails: 0,
    total_reports: 0,
    total_meetings: 0,
    total_tasks: 0,
    recent_emails: [],
    recent_reports: [],
  });

  const today = new Date();

  const weekdayText = today.toLocaleDateString('en-IN', {
    weekday: 'long',
  });

  const dateText = today.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
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
  const sentBadge = { background: '#EFF6FF', color: '#1D4ED8', border: '1px solid rgba(29,78,216,0.16)' };
  const doneBadge = { background: '#ECFDF5', color: '#0F766E', border: '1px solid rgba(15,118,110,0.16)' };

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      <div className="ops-shell ops-layout" style={{ display: 'flex', minHeight: '100vh', fontFamily: FONT }}>
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="ops-main" style={{ flex: 1, padding: '34px 40px 64px', overflowY: 'auto', minWidth: 0 }}>
          <div
            style={{
              marginBottom: 34,
              minHeight: 212,
              padding: '34px 36px',
              borderRadius: 24,
              background:
                'linear-gradient(135deg,rgba(255,255,255,0.97),rgba(248,250,252,0.92)), linear-gradient(90deg,rgba(15,23,42,0.04),rgba(29,78,216,0.06))',
              border: `1px solid ${C.border}`,
              boxShadow: '0 22px 52px rgba(15,23,42,0.08)',
              position: 'relative',
              overflow: 'hidden',
              animation: 'fadeUp 0.45s ease both',
            }}
          >
            <HeroIllustration />

            <div
              style={{
                position: 'absolute',
                right: 30,
                top: 30,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 15px',
                borderRadius: 16,
                background: 'rgba(255,255,255,0.9)',
                border: `1px solid ${C.border}`,
                boxShadow: '0 14px 30px rgba(15,23,42,0.1)',
                backdropFilter: 'blur(12px)',
                zIndex: 3,
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  background: '#F8FAFC',
                  border: `1px solid ${C.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AppIcon type="calendar" size={18} color="#0F172A" strokeWidth={2.1} />
              </div>

              <div>
                <div style={{ fontSize: 12, fontWeight: 900, color: C.textH, lineHeight: 1.2 }}>
                  {weekdayText}
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, marginTop: 3 }}>
                  {dateText}
                </div>
              </div>
            </div>

            <div style={{ position: 'relative', zIndex: 2, maxWidth: 620 }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '7px 12px',
                  borderRadius: 999,
                  background: '#ECFDF5',
                  border: '1px solid rgba(15,118,110,0.16)',
                  color: '#0F766E',
                  fontSize: 11,
                  fontWeight: 900,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  marginBottom: 18,
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: '#0F766E',
                    animation: 'pulseDot 2.1s ease-in-out infinite',
                  }}
                />
                Operations Command Center
              </div>

              <h1
                style={{
                  fontSize: 42,
                  fontWeight: 900,
                  color: C.textH,
                  margin: 0,
                  letterSpacing: '-0.065em',
                  lineHeight: 1.08,
                }}
              >
                {getGreeting()},{' '}
                <span
                  style={{
                    background: 'linear-gradient(90deg,#0F172A,#1D4ED8)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {displayName}
                </span>
              </h1>

              <p style={{ fontSize: 15, color: C.textMuted, marginTop: 14, lineHeight: 1.7 }}>
                Monitor emails, reports, meetings and tasks from one professional operations workspace.
              </p>
            </div>
          </div>

          <SectionLabel>Overview</SectionLabel>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: 18,
              marginBottom: 34,
            }}
          >
            {statKeys.map((key, i) => (
              <StatCard key={key} statKey={key} value={stats[key]} animDelay={i * 70} />
            ))}
          </div>

          <SectionLabel>Quick Actions</SectionLabel>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
              gap: 16,
              marginBottom: 34,
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
              gap: 18,
            }}
          >
            <RecentPanel title="Recent Emails" icon="mail">
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

            <RecentPanel title="Recent Reports" icon="report">
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