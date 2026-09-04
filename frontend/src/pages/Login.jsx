import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const C = {
  pageBg: 'var(--oa-page-bg)',
  card: 'var(--oa-card)',
  border: 'var(--oa-border)',
  textH: 'var(--oa-text-h)',
  textB: 'var(--oa-text-b)',
  textMuted: 'var(--oa-text-muted)',
  textLight: 'var(--oa-text-light)',
  primary: 'var(--oa-primary)',
  primaryDark: 'var(--oa-primary-dark)',
  primarySoft: 'var(--oa-primary-soft)',
  successBg: 'var(--oa-success-bg)',
  successText: 'var(--oa-success-text)',
  dangerBg: 'var(--oa-danger-bg)',
  dangerText: 'var(--oa-danger-text)',
};

const FONT = "'Inter', 'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif";

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    background: ${C.pageBg};
  }

  .auth-input {
    width: 100%;
    border: 1px solid ${C.border};
    background: var(--oa-card);
    border-radius: 12px;
    padding: 12px 14px;
    font-size: 13px;
    color: ${C.textH};
    outline: none;
    font-family: ${FONT};
    transition: 0.18s ease;
  }

  .auth-input:focus {
    border-color: ${C.primary};
    box-shadow: 0 0 0 4px rgba(var(--oa-focus-rgb), 0.12);
  }

  .auth-label {
    display: block;
    font-size: 12px;
    color: ${C.textMuted};
    font-weight: 700;
    margin-bottom: 7px;
  }

  .auth-btn {
    border: none;
    border-radius: 12px;
    padding: 12px 15px;
    font-size: 13px;
    font-weight: 800;
    cursor: pointer;
    font-family: ${FONT};
    transition: 0.18s ease;
  }

  .auth-btn:hover {
    transform: translateY(-1px);
  }

  .auth-btn-primary {
    background: linear-gradient(135deg, #4F46E5, #2563EB);
    color: #fff;
    box-shadow: 0 10px 24px rgba(var(--oa-focus-rgb), 0.26);
  }

  .auth-btn-secondary {
    background: ${C.primarySoft};
    color: ${C.primaryDark};
  }

  .auth-btn-link {
    background: transparent;
    border: none;
    color: ${C.primaryDark};
    cursor: pointer;
    font-weight: 800;
    margin-top: 14px;
    width: 100%;
    font-family: ${FONT};
  }

  .auth-alert-error,
  .auth-alert-success {
    padding: 13px 15px;
    border-radius: 14px;
    margin-bottom: 14px;
    font-size: 13px;
    font-weight: 700;
    border: 1px solid transparent;
    line-height: 1.6;
  }

  .auth-alert-error {
    background: ${C.dangerBg};
    color: ${C.dangerText};
    border-color: var(--oa-danger-bg);
  }

  .auth-alert-success {
    background: ${C.successBg};
    color: ${C.successText};
    border-color: var(--oa-success-bg);
  }

  @media (max-width: 900px) {
    .auth-layout {
      grid-template-columns: 1fr !important;
    }

    .auth-left {
      display: none !important;
    }

    .auth-page {
      padding: 24px 18px !important;
    }
  }
`;

export default function Login() {
  const navigate = useNavigate();

  const [mode, setMode] = useState('login');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [loginForm, setLoginForm] = useState({
    username: '',
    password: '',
  });

  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    full_name: '',
    designation: '',
    password: '',
  });

  const [forgotForm, setForgotForm] = useState({
    email: '',
  });

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    clearMessages();
  };

  const saveUserProfile = async (loginData) => {
    localStorage.setItem('token', loginData.access_token);

    try {
      const profileRes = await api.get('/users/me');
      const profile = profileRes.data;

      localStorage.setItem('user', JSON.stringify(profile));
      localStorage.setItem('dashboard_user', JSON.stringify(profile));
      localStorage.setItem('username', profile.username || loginData.username || '');
      localStorage.setItem('full_name', profile.full_name || '');
      localStorage.setItem('designation', profile.designation || '');
      localStorage.setItem('email', profile.email || '');
    } catch {
      localStorage.setItem('username', loginData.username || loginForm.username);
    }
  };

  const login = async (e) => {
    e.preventDefault();
    clearMessages();

    try {
      const res = await api.post('/auth/login', loginForm);
      await saveUserProfile(res.data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
    }
  };

  const register = async (e) => {
    e.preventDefault();
    clearMessages();

    try {
      await api.post('/auth/register', registerForm);

      setSuccess('Registration successful. Please login.');
      setMode('login');

      setRegisterForm({
        username: '',
        email: '',
        full_name: '',
        designation: '',
        password: '',
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed');
    }
  };

  const forgotPassword = async (e) => {
    e.preventDefault();
    clearMessages();

    try {
      const res = await api.post('/auth/forgot-password', forgotForm);
      setSuccess(res.data.message || 'Password reset link sent.');
      setForgotForm({ email: '' });
    } catch (err) {
      setError(err.response?.data?.detail || 'Password reset request failed');
    }
  };

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      <div
        className="auth-page"
        style={{
          minHeight: '100vh',
          background: C.pageBg,
          padding: 32,
          fontFamily: FONT,
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <div
          className="auth-layout"
          style={{
            width: '100%',
            maxWidth: 980,
            display: 'grid',
            gridTemplateColumns: '1fr 460px',
            borderRadius: 28,
            overflow: 'hidden',
            background: C.card,
            border: `1px solid ${C.border}`,
            boxShadow: '0 24px 70px rgba(var(--oa-shadow-rgb), 0.10)',
          }}
        >
          <div
            className="auth-left"
            style={{
              padding: 42,
                  background:
                'var(--oa-hero-grad)',
              borderRight: `1px solid ${C.border}`,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: 620,
            }}
          >
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  padding: '7px 11px',
                  borderRadius: 999,
                  background: C.primarySoft,
                  color: C.primaryDark,
                  fontSize: 12,
                  fontWeight: 800,
                  marginBottom: 16,
                }}
              >
                Operations Workspace
              </div>

              <h1
                style={{
                  fontSize: 38,
                  lineHeight: 1.1,
                  fontWeight: 900,
                  color: C.textH,
                  letterSpacing: '-1.2px',
                  margin: 0,
                  maxWidth: 420,
                }}
              >
                Manage reports, emails, meetings and tasks in one place.
              </h1>

              <p
                style={{
                  marginTop: 16,
                  color: C.textMuted,
                  fontSize: 14,
                  lineHeight: 1.8,
                  maxWidth: 440,
                }}
              >
                Sign in to access your AI-powered Operations Agent dashboard and continue your
                daily workflow.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 12,
              }}
            >
              {[
                ['AI', 'Emails'],
                ['PDF', 'Reports'],
                ['MOM', 'Meetings'],
              ].map(([top, bottom]) => (
                <div
                  key={bottom}
                  style={{
                    background: 'var(--oa-card-inner)',
                    border: `1px solid ${C.border}`,
                    borderRadius: 18,
                    padding: 16,
                  }}
                >
                  <div style={{ fontSize: 22, fontWeight: 900, color: C.primary }}>{top}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.textMuted }}>
                    {bottom}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: 34 }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 18,
                  background: 'var(--oa-icon-grad)',
                  color: '#fff',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 18,
                  fontWeight: 900,
                  margin: '0 auto 14px',
                  boxShadow: '0 12px 28px rgba(var(--oa-focus-rgb), 0.28)',
                }}
              >
                OA
              </div>

              <h1 style={{ fontSize: 26, fontWeight: 900, margin: 0, color: C.textH }}>
                Operations Agent
              </h1>

              <p style={{ color: C.textMuted, marginTop: 7, fontSize: 13 }}>
                {mode === 'login' && 'Login with username or email'}
                {mode === 'register' && 'Create your account'}
                {mode === 'forgot' && 'Enter your registered email'}
              </p>
            </div>

            {mode !== 'forgot' && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className={`auth-btn ${
                    mode === 'login' ? 'auth-btn-primary' : 'auth-btn-secondary'
                  }`}
                  style={{ flex: 1 }}
                >
                  Login
                </button>

                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className={`auth-btn ${
                    mode === 'register' ? 'auth-btn-primary' : 'auth-btn-secondary'
                  }`}
                  style={{ flex: 1 }}
                >
                  Register
                </button>
              </div>
            )}

            {error && <div className="auth-alert-error">{error}</div>}
            {success && <div className="auth-alert-success">{success}</div>}

            {mode === 'login' && (
              <form onSubmit={login}>
                <div style={{ marginBottom: 15 }}>
                  <label className="auth-label">Username or Email</label>
                  <input
                    className="auth-input"
                    name="username"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                    required
                    placeholder="Enter username or email"
                  />
                </div>

                <div style={{ marginBottom: 18 }}>
                  <label className="auth-label">Password</label>
                  <input
                    className="auth-input"
                    type="password"
                    name="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    required
                    placeholder="Enter password"
                    maxLength={72}
                  />
                </div>

                <button className="auth-btn auth-btn-primary" style={{ width: '100%' }}>
                  Login
                </button>

                <button
                  type="button"
                  onClick={() => switchMode('forgot')}
                  className="auth-btn-link"
                >
                  Forgot Password?
                </button>
              </form>
            )}

            {mode === 'register' && (
              <form onSubmit={register}>
                {[
                  ['Username', 'username', 'text'],
                  ['Email', 'email', 'email'],
                  ['Your Full Name', 'full_name', 'text'],
                  ['Your Designation', 'designation', 'text'],
                ].map(([label, key, type]) => (
                  <div style={{ marginBottom: 15 }} key={key}>
                    <label className="auth-label">{label}</label>
                    <input
                      className="auth-input"
                      type={type}
                      value={registerForm[key]}
                      onChange={(e) =>
                        setRegisterForm({
                          ...registerForm,
                          [key]: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                ))}

                <div style={{ marginBottom: 18 }}>
                  <label className="auth-label">Password</label>
                  <input
                    className="auth-input"
                    type="password"
                    value={registerForm.password}
                    onChange={(e) =>
                      setRegisterForm({
                        ...registerForm,
                        password: e.target.value,
                      })
                    }
                    required
                    minLength={6}
                    maxLength={72}
                  />
                </div>

                <button className="auth-btn auth-btn-primary" style={{ width: '100%' }}>
                  Register
                </button>
              </form>
            )}

            {mode === 'forgot' && (
              <form onSubmit={forgotPassword}>
                <div style={{ marginBottom: 18 }}>
                  <label className="auth-label">Registered Email</label>
                  <input
                    className="auth-input"
                    type="email"
                    value={forgotForm.email}
                    onChange={(e) => setForgotForm({ email: e.target.value })}
                    required
                    placeholder="Enter your registered email"
                  />
                </div>

                <button className="auth-btn auth-btn-primary" style={{ width: '100%' }}>
                  Send Reset Link
                </button>

                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="auth-btn-link"
                >
                  Back to Login
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}