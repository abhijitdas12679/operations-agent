import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api';

const EMAIL_ROUTES = ['/generate-email', '/email', '/bulk-email', '/email-settings'];

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
    <nav className="top-navbar">
      <Link to="/" className="brand">
        🤖 Ops Agent
      </Link>

      <div className="nav-links">
        <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
          📊 Dashboard
        </Link>

        <div className="nav-dropdown">
          <Link
            to="/generate-email"
            className={`nav-link ${isGenerateEmailActive ? 'active' : ''}`}
          >
            ✉️ Generate Email ▾
          </Link>

          <div className="nav-dropdown-menu">
            <Link to="/email">✉️ Single Email</Link>
            <Link to="/bulk-email">📨 Bulk Email</Link>
            <Link to="/email-settings">⚙️ Email Settings</Link>
          </div>
        </div>

        <Link to="/report" className={`nav-link ${location.pathname === '/report' ? 'active' : ''}`}>
          📋 Report
        </Link>

        <Link to="/meeting" className={`nav-link ${location.pathname === '/meeting' ? 'active' : ''}`}>
          📝 Meeting MOM
        </Link>

        <Link to="/tasks" className={`nav-link ${location.pathname === '/tasks' ? 'active' : ''}`}>
          ✅ Tasks
        </Link>
      </div>

      <div className="profile-wrapper">
        <button className="profile-btn" onClick={() => setOpenMenu(!openMenu)}>
          👤 {profile.username || 'User'}
        </button>

        {openMenu && (
          <div className="profile-menu">
            <h3>Edit Profile</h3>

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

              <button className="btn btn-primary" style={{ width: '100%' }} disabled={saving}>
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
  );
}