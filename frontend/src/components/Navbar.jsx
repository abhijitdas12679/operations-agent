import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api';

const EMAIL_ROUTES = ['/generate-email', '/email', '/bulk-email', '/email-settings'];

const C = {
  navy: '#0F172A',
  navy2: '#1E293B',
  blue: '#1D4ED8',
  teal: '#0F766E',
  amber: '#D97706',
  bg: '#FFFFFF',
  softBg: '#F8FAFC',
  border: '#E2E8F0',
  text: '#0F172A',
  muted: '#64748B',
  light: '#94A3B8',
  danger: '#DC2626',
};

const FONT = "'Manrope', 'Inter', 'Segoe UI', system-ui, sans-serif";

const NAVBAR_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');

  .top-navbar {
    height: 72px;
    width: 100%;
    background: rgba(255,255,255,0.94);
    border-bottom: 1px solid ${C.border};
    box-shadow: 0 8px 28px rgba(15,23,42,0.06);
    backdrop-filter: blur(18px);
    display: flex;
    align-items: center;
    padding: 0 28px;
    gap: 28px;
    position: sticky;
    top: 0;
    z-index: 80;
    font-family: ${FONT};
  }

  .brand {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    min-width: 178px;
    text-decoration: none;
    color: ${C.text};
  }

  .brand-mark {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    background: linear-gradient(135deg, ${C.navy}, ${C.blue});
    color: #FFFFFF;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 900;
    letter-spacing: -0.03em;
    box-shadow: 0 14px 30px rgba(15,23,42,0.24);
    flex-shrink: 0;
  }

  .brand-text {
    display: flex;
    flex-direction: column;
    line-height: 1.1;
  }

  .brand-title {
    font-size: 16px;
    font-weight: 900;
    color: ${C.text};
    letter-spacing: -0.04em;
  }

  .brand-subtitle {
    margin-top: 4px;
    font-size: 9.5px;
    font-weight: 800;
    color: ${C.muted};
    letter-spacing: 0.13em;
    text-transform: uppercase;
  }

  .nav-links {
    display: flex;
    align-items: center;
    gap: 7px;
    flex: 1;
    min-width: 0;
  }

  .nav-link {
    height: 40px;
    padding: 0 13px;
    border-radius: 12px;
    text-decoration: none;
    color: ${C.muted};
    font-size: 13px;
    font-weight: 800;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    border: 1px solid transparent;
    transition: background 0.16s ease, color 0.16s ease, transform 0.16s ease, box-shadow 0.16s ease;
    white-space: nowrap;
  }

  .nav-link:hover {
    background: ${C.softBg};
    color: ${C.text};
    transform: translateY(-1px);
  }

  .nav-link.active {
    background: linear-gradient(135deg, ${C.navy}, ${C.navy2});
    color: #FFFFFF;
    border-color: rgba(15,23,42,0.2);
    box-shadow: 0 12px 26px rgba(15,23,42,0.16);
  }

  .nav-link.active svg {
    color: #FFFFFF;
    stroke: #FFFFFF;
  }

  .nav-icon {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }

  .nav-dropdown {
    position: relative;
  }

  .nav-dropdown-menu {
    position: absolute;
    left: 0;
    top: calc(100% + 12px);
    width: 230px;
    background: #FFFFFF;
    border: 1px solid ${C.border};
    border-radius: 16px;
    box-shadow: 0 24px 54px rgba(15,23,42,0.14);
    padding: 8px;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-6px);
    transition: opacity 0.16s ease, transform 0.16s ease, visibility 0.16s ease;
  }

  .nav-dropdown:hover .nav-dropdown-menu {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }

  .nav-dropdown-menu a {
    height: 42px;
    padding: 0 12px;
    border-radius: 11px;
    color: ${C.muted};
    text-decoration: none;
    font-size: 13px;
    font-weight: 800;
    display: flex;
    align-items: center;
    gap: 10px;
    transition: background 0.15s ease, color 0.15s ease;
  }

  .nav-dropdown-menu a:hover {
    background: ${C.softBg};
    color: ${C.text};
  }

  .profile-wrapper {
    position: relative;
    flex-shrink: 0;
  }

  .profile-btn {
    height: 44px;
    border-radius: 14px;
    border: 1px solid ${C.border};
    background: #FFFFFF;
    color: ${C.text};
    padding: 0 12px 0 8px;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-family: ${FONT};
    font-weight: 900;
    font-size: 13px;
    cursor: pointer;
    box-shadow: 0 10px 24px rgba(15,23,42,0.06);
    transition: background 0.16s ease, transform 0.16s ease, box-shadow 0.16s ease;
  }

  .profile-btn:hover {
    background: ${C.softBg};
    transform: translateY(-1px);
    box-shadow: 0 14px 30px rgba(15,23,42,0.1);
  }

  .profile-avatar {
    width: 30px;
    height: 30px;
    border-radius: 10px;
    background: linear-gradient(135deg, ${C.navy}, ${C.blue});
    color: #FFFFFF;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 900;
    box-shadow: 0 10px 20px rgba(29,78,216,0.18);
  }

  .profile-chevron {
    margin-left: 2px;
    transition: transform 0.16s ease;
  }

  .profile-chevron.open {
    transform: rotate(180deg);
  }

  .profile-menu {
    position: absolute;
    right: 0;
    top: calc(100% + 14px);
    width: 360px;
    background: #FFFFFF;
    border: 1px solid ${C.border};
    border-radius: 20px;
    box-shadow: 0 28px 70px rgba(15,23,42,0.18);
    padding: 20px;
    animation: profileDrop 0.18s ease both;
  }

  @keyframes profileDrop {
    from { opacity: 0; transform: translateY(-8px) scale(0.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  .profile-menu-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding-bottom: 16px;
    border-bottom: 1px solid ${C.border};
    margin-bottom: 16px;
  }

  .profile-menu-avatar {
    width: 42px;
    height: 42px;
    border-radius: 14px;
    background: linear-gradient(135deg, ${C.navy}, ${C.blue});
    color: #FFFFFF;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 900;
    box-shadow: 0 14px 28px rgba(15,23,42,0.18);
  }

  .profile-menu h3 {
    margin: 0;
    color: ${C.text};
    font-size: 16px;
    font-weight: 900;
    letter-spacing: -0.03em;
  }

  .profile-menu-subtitle {
    margin-top: 3px;
    color: ${C.muted};
    font-size: 12px;
    font-weight: 700;
  }

  .form-group {
    margin-bottom: 13px;
  }

  .form-group label {
    display: block;
    margin-bottom: 6px;
    color: ${C.slate};
    font-size: 12px;
    font-weight: 900;
  }

  .form-group input {
    width: 100%;
    height: 42px;
    border-radius: 12px;
    border: 1px solid ${C.border};
    background: #FFFFFF;
    padding: 0 12px;
    color: ${C.text};
    font-family: ${FONT};
    font-size: 13px;
    font-weight: 700;
    outline: none;
    transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
  }

  .form-group input:focus {
    border-color: ${C.blue};
    box-shadow: 0 0 0 4px rgba(29,78,216,0.1);
  }

  .form-group input:disabled {
    background: ${C.softBg};
    color: ${C.light};
    cursor: not-allowed;
  }

  .profile-save-btn {
    width: 100%;
    height: 44px;
    border: 0;
    border-radius: 12px;
    background: linear-gradient(135deg, ${C.navy}, ${C.blue});
    color: #FFFFFF;
    font-family: ${FONT};
    font-size: 13px;
    font-weight: 900;
    cursor: pointer;
    box-shadow: 0 14px 30px rgba(29,78,216,0.18);
    transition: transform 0.16s ease, box-shadow 0.16s ease, opacity 0.16s ease;
  }

  .profile-save-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 18px 36px rgba(29,78,216,0.24);
  }

  .profile-save-btn:disabled {
    opacity: 0.65;
    cursor: not-allowed;
    transform: none;
  }

  .profile-menu hr {
    border: 0;
    height: 1px;
    background: ${C.border};
    margin: 18px 0;
  }

  .signout-btn {
    width: 100%;
    height: 42px;
    border-radius: 12px;
    border: 1px solid rgba(220,38,38,0.18);
    background: #FEF2F2;
    color: ${C.danger};
    font-family: ${FONT};
    font-size: 13px;
    font-weight: 900;
    cursor: pointer;
    transition: background 0.16s ease, transform 0.16s ease;
  }

  .signout-btn:hover {
    background: #FEE2E2;
    transform: translateY(-1px);
  }

  @media (max-width: 980px) {
    .top-navbar {
      height: auto;
      flex-wrap: wrap;
      padding: 14px 18px;
      gap: 14px;
    }

    .brand {
      min-width: auto;
    }

    .nav-links {
      order: 3;
      width: 100%;
      overflow-x: auto;
      padding-bottom: 4px;
    }

    .profile-menu {
      right: 0;
      width: min(360px, calc(100vw - 32px));
    }
  }
`;

function Icon({ type, size = 16, color = 'currentColor', strokeWidth = 2 }) {
  const common = {
    fill: 'none',
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };

  return (
    <svg className="nav-icon" width={size} height={size} viewBox="0 0 24 24">
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

      {type === 'bulk' && (
        <>
          <rect x="3" y="7" width="14" height="11" rx="2" {...common} />
          <path d="M5 9.5l5 3.5 5-3.5" {...common} />
          <path d="M8 4h11a2 2 0 0 1 2 2v8" {...common} />
        </>
      )}

      {type === 'settings' && (
        <>
          <circle cx="12" cy="12" r="3" {...common} />
          <path
            d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1A2 2 0 0 1 4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1A2 2 0 0 1 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1A2 2 0 0 1 19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1a2 2 0 0 1 0 4H21a1.7 1.7 0 0 0-1.6 1Z"
            {...common}
          />
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

      {type === 'chevron-down' && <path d="M6 9l6 6 6-6" {...common} />}
      {type === 'user' && (
        <>
          <circle cx="12" cy="8" r="4" {...common} />
          <path d="M4 21a8 8 0 0 1 16 0" {...common} />
        </>
      )}
    </svg>
  );
}

function getInitial(profile) {
  const source = profile.full_name || profile.username || 'U';
  return source.charAt(0).toUpperCase();
}

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [openMenu, setOpenMenu] = useState(false);
  const [profile, setProfile] = useState({
    username: localStorage.getItem('username') || '',
    full_name: '',
    email: '',
    designation: '',
  });

  const [originalEmail, setOriginalEmail] = useState('');
  const [saving, setSaving] = useState(false);

  const isGenerateEmailActive = EMAIL_ROUTES.includes(location.pathname);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const loadProfile = async () => {
    try {
      const res = await api.get('/user/profile');

      setProfile({
        username: res.data.username || '',
        full_name: res.data.full_name || '',
        email: res.data.email || '',
        designation: res.data.designation || '',
      });

      setOriginalEmail(res.data.email || '');
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handle = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const saveProfile = async (e) => {
    e.preventDefault();

    const emailChanged =
      profile.email.toLowerCase() !== originalEmail.toLowerCase();

    if (emailChanged) {
      const ok = window.confirm(
        'Your email is changing. Your connected SMTP account will be disconnected. You must reconnect Email Settings again. Continue?'
      );

      if (!ok) return;
    }

    setSaving(true);

    try {
      const res = await api.put('/user/profile', {
        full_name: profile.full_name,
        email: profile.email,
        designation: profile.designation,
      });

      setProfile({
        username: res.data.username || '',
        full_name: res.data.full_name || '',
        email: res.data.email || '',
        designation: res.data.designation || '',
      });

      setOriginalEmail(res.data.email || '');
      alert('Profile updated successfully.');
      setOpenMenu(false);
    } catch (err) {
      alert(err.response?.data?.detail || 'Profile update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <style>{NAVBAR_CSS}</style>

      <nav className="top-navbar">
        <Link to="/" className="brand">
          <span className="brand-mark">OA</span>
          <span className="brand-text">
            <span className="brand-title">Ops Agent</span>
            <span className="brand-subtitle">Workspace</span>
          </span>
        </Link>

        <div className="nav-links">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            <Icon type="dashboard" />
            Dashboard
          </Link>

          <div className="nav-dropdown">
            <Link
              to="/generate-email"
              className={`nav-link ${isGenerateEmailActive ? 'active' : ''}`}
            >
              <Icon type="mail" />
              Generate Email
              <Icon type="chevron-down" size={13} strokeWidth={2.4} />
            </Link>

            <div className="nav-dropdown-menu">
              <Link to="/email">
                <Icon type="mail" />
                Single Email
              </Link>

              <Link to="/bulk-email">
                <Icon type="bulk" />
                Bulk Email
              </Link>

              <Link to="/email-settings">
                <Icon type="settings" />
                Email Settings
              </Link>
            </div>
          </div>

          <Link to="/report" className={`nav-link ${location.pathname === '/report' ? 'active' : ''}`}>
            <Icon type="report" />
            Report
          </Link>

          <Link to="/meeting" className={`nav-link ${location.pathname === '/meeting' ? 'active' : ''}`}>
            <Icon type="meeting" />
            Meeting MOM
          </Link>

          <Link to="/tasks" className={`nav-link ${location.pathname === '/tasks' ? 'active' : ''}`}>
            <Icon type="tasks" />
            Tasks
          </Link>
        </div>

        <div className="profile-wrapper">
          <button className="profile-btn" onClick={() => setOpenMenu(!openMenu)}>
            <span className="profile-avatar">{getInitial(profile)}</span>
            {profile.username || 'User'}
            <Icon
              type="chevron-down"
              size={13}
              strokeWidth={2.4}
              color={C.muted}
            />
          </button>

          {openMenu && (
            <div className="profile-menu">
              <div className="profile-menu-header">
                <div className="profile-menu-avatar">{getInitial(profile)}</div>

                <div>
                  <h3>Edit Profile</h3>
                  <div className="profile-menu-subtitle">
                    Manage your account details
                  </div>
                </div>
              </div>

              <form onSubmit={saveProfile}>
                <div className="form-group">
                  <label>Username</label>
                  <input value={profile.username} disabled />
                </div>

                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    name="full_name"
                    value={profile.full_name}
                    onChange={handle}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handle}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Designation</label>
                  <input
                    name="designation"
                    value={profile.designation}
                    onChange={handle}
                    required
                  />
                </div>

                <button className="profile-save-btn" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </form>

              <hr />

              <button className="signout-btn" onClick={logout}>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}