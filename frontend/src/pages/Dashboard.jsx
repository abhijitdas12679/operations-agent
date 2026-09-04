import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../api';
import { useTheme } from '../theme';

const FONT = "'Manrope', 'Inter', 'Segoe UI', system-ui, sans-serif";

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  :root {
    --bg-base: #F8FAFC;
    --bg-surface: #FFFFFF;
    --bg-elevated: #F1F5F9;
    --bg-overlay: #E2E8F0;
    --bg-hover: #F1F5F9;

    --border: #E2E8F0;
    --border-strong: rgba(15,23,42,0.12);

    --text-h: #0F172A;
    --text-body: #334155;
    --text-muted: #64748B;
    --text-light: #94A3B8;

    --accent-blue: #1D4ED8;
    --accent-teal: #0F766E;
    --accent-amber: #D97706;

    --pill-blue-bg: #EFF6FF;
    --pill-blue-txt: #1D4ED8;
    --pill-blue-bdr: rgba(29,78,216,0.16);

    --pill-teal-bg: #ECFDF5;
    --pill-teal-txt: #0F766E;
    --pill-teal-bdr: rgba(15,118,110,0.16);

    --sidebar-bg: rgba(255,255,255,0.94);
    --sidebar-shadow: 10px 0 40px rgba(15,23,42,0.05);

    --card-icon-blue-bg: #EFF6FF;
    --card-icon-amber-bg: #FFF7ED;
    --card-icon-teal-bg: #ECFDF5;
    --card-icon-gray-bg: #F1F5F9;

    --card-icon-blue-color: #1D4ED8;
    --card-icon-amber-color: #D97706;
    --card-icon-teal-color: #0F766E;
    --card-icon-gray-color: #0F172A;

    --stat-bar-blue: linear-gradient(90deg,#1D4ED8,#3B82F6);
    --stat-bar-amber: linear-gradient(90deg,#D97706,#F59E0B);
    --stat-bar-teal: linear-gradient(90deg,#0F766E,#14B8A6);
    --stat-bar-gray: linear-gradient(90deg,#0F172A,#475569);

    --nav-active-bg: linear-gradient(135deg,#0F172A,#1E293B);
    --nav-active-bdr: rgba(15,23,42,0.2);
    --nav-active-icon: rgba(255,255,255,0.12);
    --nav-active-ibdr: rgba(255,255,255,0.15);
    --nav-active-txt: #FFFFFF;
    --nav-active-icol: #FFFFFF;

    --hero-shadow: 0 22px 52px rgba(15,23,42,0.08);
    --section-bar: linear-gradient(180deg,#0F172A,#1D4ED8);
    --greeting-grad: linear-gradient(90deg,#0F172A,#1D4ED8);

    --tooltip-bg: #0F172A;
    --tooltip-txt: #FFFFFF;
    --tooltip-shadow: 0 14px 34px rgba(15,23,42,0.25);

    --card-shadow: 0 14px 34px rgba(15,23,42,0.06);
    --hero-glow1: transparent;
    --hero-glow2: transparent;

    --pulsedot-color: #0F766E;
    --pulsedot-shadow: rgba(15,118,110,0.35);

    --row-hover-bg: #F8FAFC;
  }

  [data-theme="dark"] {
    --bg-base: #0A0F1A;
    --bg-surface: #111827;
    --bg-elevated: #1E2433;
    --bg-overlay: #252D3D;
    --bg-hover: #2A3347;

    --border: rgba(255,255,255,0.08);
    --border-strong: rgba(255,255,255,0.14);

    --text-h: #F1F5F9;
    --text-body: #CBD5E1;
    --text-muted: #94A3B8;
    --text-light: #475569;

    --accent-blue: #3B82F6;
    --accent-teal: #14B8A6;
    --accent-amber: #F59E0B;

    --pill-blue-bg: rgba(59,130,246,0.15);
    --pill-blue-txt: #93C5FD;
    --pill-blue-bdr: rgba(59,130,246,0.25);

    --pill-teal-bg: rgba(20,184,166,0.15);
    --pill-teal-txt: #5EEAD4;
    --pill-teal-bdr: rgba(20,184,166,0.25);

    --sidebar-bg: rgba(17,24,39,0.97);
    --sidebar-shadow: 10px 0 40px rgba(0,0,0,0.35);

    --card-icon-blue-bg: rgba(59,130,246,0.12);
    --card-icon-amber-bg: rgba(245,158,11,0.12);
    --card-icon-teal-bg: rgba(20,184,166,0.12);
    --card-icon-gray-bg: rgba(255,255,255,0.07);

    --card-icon-blue-color: #60A5FA;
    --card-icon-amber-color: #FCD34D;
    --card-icon-teal-color: #2DD4BF;
    --card-icon-gray-color: #94A3B8;

    --stat-bar-blue: linear-gradient(90deg,#2563EB,#3B82F6);
    --stat-bar-amber: linear-gradient(90deg,#D97706,#F59E0B);
    --stat-bar-teal: linear-gradient(90deg,#0F766E,#14B8A6);
    --stat-bar-gray: linear-gradient(90deg,#334155,#64748B);

    --nav-active-bg: linear-gradient(135deg,#1E3A5F,#1A3252);
    --nav-active-bdr: rgba(59,130,246,0.25);
    --nav-active-icon: rgba(59,130,246,0.18);
    --nav-active-ibdr: rgba(59,130,246,0.3);
    --nav-active-txt: #F1F5F9;
    --nav-active-icol: #60A5FA;

    --hero-shadow: 0 22px 52px rgba(0,0,0,0.4);
    --section-bar: linear-gradient(180deg,#3B82F6,#14B8A6);
    --greeting-grad: linear-gradient(90deg,#60A5FA,#2DD4BF);

    --tooltip-bg: #0D1117;
    --tooltip-txt: #F1F5F9;
    --tooltip-shadow: 0 14px 34px rgba(0,0,0,0.6);

    --card-shadow: 0 14px 34px rgba(0,0,0,0.3);
    --hero-glow1: rgba(59,130,246,0.12);
    --hero-glow2: rgba(20,184,166,0.10);

    --pulsedot-color: #14B8A6;
    --pulsedot-shadow: rgba(20,184,166,0.4);

    --row-hover-bg: #2A3347;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes pulseDot {
    0%,100% { box-shadow: 0 0 0 0 var(--pulsedot-shadow); }
    50% { box-shadow: 0 0 0 7px transparent; }
  }

  body, #root {
    background: var(--bg-base);
    color: var(--text-body);
    transition: background 0.3s ease, color 0.3s ease;
  }

  .ops-shell {
    background: var(--bg-base);
    transition: background 0.3s ease;
  }

  .ops-stat-card,
  .ops-qa-card {
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, background 0.3s ease;
  }

  .ops-stat-card:hover,
  .ops-qa-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 22px 46px rgba(0,0,0,0.2) !important;
    border-color: var(--border-strong) !important;
  }

  .ops-nav-item {
    transition: background 0.16s ease, transform 0.16s ease, color 0.16s ease;
  }

  .ops-nav-item:hover {
    transform: translateX(3px);
    background: var(--bg-hover) !important;
  }

  .ops-tooltip {
    position: absolute;
    left: 62px;
    top: 50%;
    transform: translateY(-50%) translateX(-6px);
    opacity: 0;
    pointer-events: none;
    white-space: nowrap;
    background: var(--tooltip-bg);
    color: var(--tooltip-txt);
    font-size: 12px;
    font-weight: 800;
    padding: 9px 12px;
    border-radius: 10px;
    box-shadow: var(--tooltip-shadow);
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
    background: var(--tooltip-bg);
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
    background: var(--row-hover-bg);
    transform: translateX(2px);
  }

  @media (max-width: 900px) {
    .ops-layout { flex-direction: column; }
    .ops-sidebar { width: 100% !important; min-height: auto !important; position: relative !important; }
    .ops-main { padding: 22px 16px 50px !important; }
  }
`;

function AppIcon({ type, size = 18, color = 'currentColor', strokeWidth = 2 }) {
  const c = {
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
          <rect x="3" y="3" width="7" height="8" rx="2" {...c} />
          <rect x="14" y="3" width="7" height="5" rx="2" {...c} />
          <rect x="14" y="12" width="7" height="9" rx="2" {...c} />
          <rect x="3" y="15" width="7" height="6" rx="2" {...c} />
        </>
      )}

      {type === 'mail' && (
        <>
          <rect x="3" y="5" width="18" height="14" rx="3" {...c} />
          <path d="M4.5 7.5L12 13l7.5-5.5" {...c} />
        </>
      )}

      {type === 'report' && (
        <>
          <path d="M7 3h7l4 4v14H7a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3Z" {...c} />
          <path d="M14 3v5h5" {...c} />
          <path d="M8 13h8M8 17h6" {...c} />
        </>
      )}

      {type === 'meeting' && (
        <>
          <rect x="4" y="4" width="16" height="16" rx="3" {...c} />
          <path d="M8 8h8M8 12h8M8 16h5" {...c} />
        </>
      )}

      {type === 'tasks' && (
        <>
          <rect x="4" y="4" width="16" height="16" rx="3" {...c} />
          <path d="M8 12l2.4 2.4L16 9" {...c} />
        </>
      )}

      {type === 'arrow' && <path d="M9 6l6 6-6 6" {...c} />}

      {type === 'calendar' && (
        <>
          <rect x="4" y="5" width="16" height="15" rx="3" {...c} />
          <path d="M8 3v4M16 3v4M4 10h16" {...c} />
          <path d="M8 14h2M12 14h2M16 14h1M8 17h2M12 17h2" {...c} />
        </>
      )}

      {type === 'sun' && (
        <>
          <circle cx="12" cy="12" r="4" {...c} />
          <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" {...c} />
        </>
      )}

      {type === 'moon' && (
        <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z" {...c} />
      )}
    </svg>
  );
}

function HeroIllustration({ dark }) {
  return (
    <div style={{ position: 'absolute', right: 34, bottom: 0, width: 360, height: 190, pointerEvents: 'none', opacity: dark ? 0.7 : 0.96 }}>
      <div style={{ position: 'absolute', right: 0, bottom: 0, width: 220, height: 132, borderRadius: '22px 22px 0 0', background: dark ? 'linear-gradient(135deg,#1E2A3A,#0D1117)' : 'linear-gradient(135deg,#1E293B,#0F172A)', boxShadow: dark ? '0 24px 54px rgba(0,0,0,0.5)' : '0 24px 54px rgba(15,23,42,0.28)', border: dark ? '1px solid rgba(255,255,255,0.07)' : 'none' }} />
      <div style={{ position: 'absolute', right: 22, bottom: 22, width: 176, height: 88, borderRadius: 16, background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: 6, padding: 12 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--pulsedot-color)' }} />
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-amber)' }} />
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-blue)' }} />
        </div>
        <div style={{ margin: '0 14px', height: 8, borderRadius: 99, background: dark ? 'rgba(255,255,255,0.1)' : '#CBD5E1' }} />
        <div style={{ margin: '9px 14px 0', height: 8, width: '68%', borderRadius: 99, background: dark ? 'rgba(255,255,255,0.06)' : '#94A3B8' }} />
        <div style={{ position: 'absolute', right: 14, bottom: 14, width: 52, height: 34, borderRadius: 10, background: dark ? 'linear-gradient(135deg,#3B82F6,#14B8A6)' : 'linear-gradient(135deg,#1D4ED8,#0F766E)' }} />
      </div>
      <div style={{ position: 'absolute', left: 18, bottom: 0, width: 158, height: 16, borderRadius: 999, background: dark ? 'rgba(255,255,255,0.1)' : '#475569' }} />
      <div style={{ position: 'absolute', left: 44, bottom: 16, width: 112, height: 78, borderRadius: '20px 20px 8px 8px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', boxShadow: '0 18px 38px rgba(0,0,0,0.2)' }} />
      <div style={{ position: 'absolute', left: 77, bottom: 94, width: 48, height: 48, borderRadius: '50%', background: 'var(--bg-overlay)', border: '1px solid var(--border)' }} />
    </div>
  );
}

const STAT_META = {
  total_emails: { label: 'Emails Generated', icon: 'mail', iconBgVar: '--card-icon-blue-bg', iconColorVar: '--card-icon-blue-color', barVar: '--stat-bar-blue' },
  total_reports: { label: 'Reports Created', icon: 'report', iconBgVar: '--card-icon-amber-bg', iconColorVar: '--card-icon-amber-color', barVar: '--stat-bar-amber' },
  total_meetings: { label: 'Meeting MOMs', icon: 'meeting', iconBgVar: '--card-icon-teal-bg', iconColorVar: '--card-icon-teal-color', barVar: '--stat-bar-teal' },
  total_tasks: { label: 'Total Tasks', icon: 'tasks', iconBgVar: '--card-icon-gray-bg', iconColorVar: '--card-icon-gray-color', barVar: '--stat-bar-gray' },
};

const SHORTCUTS = [
  { path: '/generate-email', label: 'Generate Email', icon: 'mail', desc: 'Compose professional AI emails in seconds', iconBgVar: '--card-icon-blue-bg', accentVar: '--card-icon-blue-color' },
  { path: '/report', label: 'Daily Report', icon: 'report', desc: "Log and share your team's progress", iconBgVar: '--card-icon-amber-bg', accentVar: '--card-icon-amber-color' },
  { path: '/meeting', label: 'Meeting MOM', icon: 'meeting', desc: 'Capture key decisions and action points', iconBgVar: '--card-icon-teal-bg', accentVar: '--card-icon-teal-color' },
  { path: '/tasks', label: 'Add Task', icon: 'tasks', desc: 'Create and assign tasks to your team', iconBgVar: '--card-icon-gray-bg', accentVar: '--card-icon-gray-color' },
];

const NAV_LINKS = [
  { path: '/', label: 'Dashboard', icon: 'dashboard' },
  { path: '/generate-email', label: 'Generate Email', icon: 'mail' },
  { path: '/report', label: 'Reports', icon: 'report' },
  { path: '/meeting', label: 'Meeting MOM', icon: 'meeting' },
  { path: '/tasks', label: 'Tasks', icon: 'tasks' },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function normalizeList(data) {
  if (Array.isArray(data)) return data;
  for (const k of ['items', 'data', 'results', 'emails', 'reports', 'meetings', 'tasks']) {
    if (Array.isArray(data?.[k])) return data[k];
  }
  return [];
}

function getDisplayName(userData) {
  return userData?.full_name || userData?.username || localStorage.getItem('full_name') || localStorage.getItem('username') || 'User';
}

function saveUserData(userData) {
  if (!userData) return;
  const n = getDisplayName(userData);
  if (n && n !== 'User') localStorage.setItem('full_name', n);
  localStorage.setItem('dashboard_user', JSON.stringify(userData));
}

async function safeGet(url) {
  try {
    const r = await api.get(url);
    return r.data;
  } catch {
    return null;
  }
}

function getTaskTotal(analytics, taskList) {
  if (analytics?.total_tasks !== undefined) return Number(analytics.total_tasks) || 0;
  return normalizeList(taskList).length;
}

function SectionLabel({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
      <span style={{ width: 4, height: 22, borderRadius: 99, background: 'var(--section-bar)' }} />
      <span style={{ fontSize: 20, fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--text-h)' }}>{children}</span>
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
        background: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--border)',
        padding: '24px 16px',
        minHeight: '100vh',
        position: 'sticky',
        top: 0,
        backdropFilter: 'blur(18px)',
        boxShadow: 'var(--sidebar-shadow)',
        transition: 'width 0.3s ease, background 0.3s ease',
        overflow: sidebarOpen ? 'hidden' : 'visible',
        zIndex: 20,
      }}
    >
      <div
        onClick={() => setSidebarOpen(!sidebarOpen)}
        title={sidebarOpen ? 'Collapse' : 'Expand'}
        style={{
          padding: '6px 0 18px',
          marginBottom: 18,
          borderBottom: '1px solid var(--border)',
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
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
          }}
        >
          <div style={{ width: 34, height: 34, borderRadius: 11, background: 'var(--bg-surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AppIcon type="dashboard" size={17} color="var(--text-muted)" strokeWidth={2.3} />
          </div>

          {sidebarOpen && (
            <>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--text-h)', letterSpacing: '-0.03em' }}>Navigation</div>
                <div style={{ fontSize: 9, fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 3 }}>Click to collapse</div>
              </div>
              <span style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-muted)', lineHeight: 1 }}>‹</span>
            </>
          )}
        </div>
      </div>

      {sidebarOpen && (
        <div style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-light)', letterSpacing: '0.14em', textTransform: 'uppercase', padding: '12px 12px 10px' }}>
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
                    color: active ? 'var(--nav-active-txt)' : 'var(--text-muted)',
                    background: active ? 'var(--nav-active-bg)' : 'transparent',
                    border: active ? '1px solid var(--nav-active-bdr)' : '1px solid transparent',
                    boxShadow: active ? '0 14px 30px rgba(0,0,0,0.16)' : 'none',
                  }}
                >
                  <span style={{ width: 30, height: 30, borderRadius: 10, background: active ? 'var(--nav-active-icon)' : 'var(--bg-elevated)', border: active ? '1px solid var(--nav-active-ibdr)' : '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <AppIcon type={link.icon} size={16} color={active ? 'var(--nav-active-icol)' : 'var(--text-muted)'} strokeWidth={2.2} />
                  </span>

                  {sidebarOpen && <span style={{ flex: 1 }}>{link.label}</span>}
                </div>

                {!sidebarOpen && <span className="ops-tooltip">{link.label}</span>}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Theme toggle is on the Navbar — no duplicate here */}
      <div style={{ height: 42 }} />
    </aside>
  );
}

function StatCard({ statKey, value, animDelay }) {
  const m = STAT_META[statKey];

  return (
    <div className="ops-stat-card" style={{ background: 'var(--bg-surface)', borderRadius: 20, padding: '22px', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden', animation: 'fadeUp 0.5s ease both', animationDelay: `${animDelay}ms`, boxShadow: 'var(--card-shadow)', minHeight: 176 }}>
      <div style={{ width: 50, height: 50, borderRadius: 14, background: `var(${m.iconBgVar})`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, border: '1px solid var(--border)' }}>
        <AppIcon type={m.icon} size={23} color={`var(${m.iconColorVar})`} strokeWidth={2.2} />
      </div>

      <div style={{ fontSize: 42, fontWeight: 900, color: 'var(--text-h)', lineHeight: 1, letterSpacing: '-0.055em' }}>
        {Number(value || 0).toLocaleString()}
      </div>

      <div style={{ fontSize: 12, fontWeight: 900, color: 'var(--text-muted)', marginTop: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {m.label}
      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, height: 3, width: '100%', background: `var(${m.barVar})` }} />
    </div>
  );
}

function QuickActionCard({ path, label, icon, desc, iconBgVar, accentVar }) {
  return (
    <Link to={path} style={{ textDecoration: 'none' }}>
      <div className="ops-qa-card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '20px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 12, height: '100%', boxShadow: 'var(--card-shadow)' }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: `var(${iconBgVar})`, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AppIcon type={icon} size={22} color={`var(${accentVar})`} strokeWidth={2.2} />
        </div>

        <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--text-h)' }}>{label}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.65 }}>{desc}</div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 900, color: `var(${accentVar})` }}>
          Open <AppIcon type="arrow" size={15} color={`var(${accentVar})`} strokeWidth={2.6} />
        </div>
      </div>
    </Link>
  );
}

function EmptyState({ message }) {
  return (
    <div style={{ padding: '38px 0 34px', textAlign: 'center', color: 'var(--text-light)', fontSize: 13 }}>
      {message}
    </div>
  );
}

function RecentPanel({ title, icon, children }) {
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden', boxShadow: 'var(--card-shadow)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '18px 22px', borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
        <span style={{ width: 36, height: 36, borderRadius: 12, background: 'var(--bg-surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AppIcon type={icon} size={17} color="var(--text-muted)" strokeWidth={2.2} />
        </span>

        <span style={{ fontSize: 15, fontWeight: 900, color: 'var(--text-h)' }}>{title}</span>
      </div>

      <div style={{ padding: '4px 20px 10px' }}>{children}</div>
    </div>
  );
}

function TableRow({ primary, secondary, badge, badgeStyle, date, isLast }) {
  return (
    <div className="ops-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 2px', borderBottom: isLast ? 'none' : '1px solid var(--border)', gap: 16 }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-h)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 260 }}>
          {primary}
        </div>

        {secondary && (
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            {secondary}
          </div>
        )}
      </div>

      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <span style={{ fontSize: 10, fontWeight: 900, padding: '5px 10px', borderRadius: 999, textTransform: 'uppercase', ...badgeStyle }}>
          {badge}
        </span>

        <div style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 6 }}>
          {date}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [theme, toggleTheme] = useTheme();
  const dark = theme === 'dark';

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
  const weekdayText = today.toLocaleDateString('en-IN', { weekday: 'long' });
  const dateText = today.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  useEffect(() => {
    (async () => {
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
    })();
  }, []);

  const statKeys = ['total_emails', 'total_reports', 'total_meetings', 'total_tasks'];

  const sentBadge = {
    background: 'var(--pill-blue-bg)',
    color: 'var(--pill-blue-txt)',
    border: '1px solid var(--pill-blue-bdr)',
  };

  const doneBadge = {
    background: 'var(--pill-teal-bg)',
    color: 'var(--pill-teal-txt)',
    border: '1px solid var(--pill-teal-bdr)',
  };

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      <div className="ops-shell ops-layout" style={{ display: 'flex', minHeight: '100vh', fontFamily: FONT }}>
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        <main className="ops-main" style={{ flex: 1, padding: '34px 40px 64px', overflowY: 'auto', minWidth: 0 }}>
          <div style={{ marginBottom: 34, minHeight: 212, padding: '34px 36px', borderRadius: 24, background: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--hero-shadow)', position: 'relative', overflow: 'hidden', animation: 'fadeUp 0.45s ease both', transition: 'background 0.3s ease, box-shadow 0.3s ease' }}>
            <div style={{ position: 'absolute', top: -60, left: -60, width: 280, height: 280, borderRadius: '50%', background: `radial-gradient(circle, var(--hero-glow1) 0%, transparent 70%)`, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -40, right: 80, width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(circle, var(--hero-glow2) 0%, transparent 70%)`, pointerEvents: 'none' }} />

            <HeroIllustration dark={dark} />

            <div style={{ position: 'absolute', right: 30, top: 30, display: 'flex', alignItems: 'center', gap: 12, padding: '12px 15px', borderRadius: 16, background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', boxShadow: '0 14px 30px rgba(0,0,0,0.1)', backdropFilter: 'blur(12px)', zIndex: 3 }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: 'var(--bg-overlay)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AppIcon type="calendar" size={18} color="var(--text-muted)" strokeWidth={2.1} />
              </div>

              <div>
                <div style={{ fontSize: 12, fontWeight: 900, color: 'var(--text-h)', lineHeight: 1.2 }}>{weekdayText}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginTop: 3 }}>{dateText}</div>
              </div>
            </div>

            <div style={{ position: 'relative', zIndex: 2, maxWidth: 620 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 12px', borderRadius: 999, background: 'var(--pill-teal-bg)', border: '1px solid var(--pill-teal-bdr)', color: 'var(--pill-teal-txt)', fontSize: 11, fontWeight: 900, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 18 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--pulsedot-color)', animation: 'pulseDot 2.1s ease-in-out infinite' }} />
                Operations Command Center
              </div>

              <h1 style={{ fontSize: 42, fontWeight: 900, color: 'var(--text-h)', margin: 0, letterSpacing: '-0.065em', lineHeight: 1.08 }}>
                {getGreeting()},{' '}
                <span style={{ background: 'var(--greeting-grad)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  {displayName}
                </span>
              </h1>

              <p style={{ fontSize: 15, color: 'var(--text-muted)', marginTop: 14, lineHeight: 1.7 }}>
                Monitor emails, reports, meetings and tasks from one professional operations workspace.
              </p>
            </div>
          </div>

          <SectionLabel>Overview</SectionLabel>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 18, marginBottom: 34 }}>
            {statKeys.map((key, i) => (
              <StatCard key={key} statKey={key} value={stats[key]} animDelay={i * 70} />
            ))}
          </div>

          <SectionLabel>Quick Actions</SectionLabel>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 16, marginBottom: 34 }}>
            {SHORTCUTS.map((s) => (
              <QuickActionCard key={s.path} {...s} />
            ))}
          </div>

          <SectionLabel>Recent Activity</SectionLabel>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 18 }}>
            <RecentPanel title="Recent Emails" icon="mail">
              {stats.recent_emails.length ? (
                stats.recent_emails.map((e, i) => (
                  <TableRow
                    key={e.id || i}
                    primary={e.subject || 'Email'}
                    secondary={e.to || e.recipient_email || e.email || ''}
                    badge="Sent"
                    badgeStyle={sentBadge}
                    date={e.created_at ? new Date(e.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}
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