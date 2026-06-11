import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const C = {
  pageBg: '#F8F7FF',
  card: '#FFFFFF',
  border: '#F0ECFF',
  textH: '#1A1035',
  textMuted: '#8B7EC8',
  textLight: '#B0A8D4',
  primary: '#7C3AED',
  primaryDark: '#5B21B6',
  primarySoft: '#EDE9FE',
};

const FONT = "'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif";

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after {
    box-sizing: border-box;
  }

  .auth-input {
    width: 100%;
    border: 1px solid #E5DEFF;
    background: #FFFFFF;
    border-radius: 12px;
    padding: 11px 13px;
    font-size: 13px;
    color: ${C.textH};
    outline: none;
    font-family: ${FONT};
  }

  .auth-input:focus {
    border-color: ${C.primary};
    box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.10);
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
    padding: 11px 15px;
    font-size: 13px;
    font-weight: 800;
    cursor: pointer;
    font-family: ${FONT};
  }

  .auth-btn-primary {
    background: linear-gradient(135deg, #7C3AED, #4F46E5);
    color: #fff;
    box-shadow: 0 8px 22px rgba(124, 58, 237, 0.25);
  }

  .auth-btn-secondary {
    background: ${C.primarySoft};
    color: ${C.primaryDark};
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
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: C.pageBg,
          padding: 20,
          fontFamily: FONT,
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 460,
            background: C.card,
            padding: 30,
            borderRadius: 22,
            border: `1px solid ${C.border}`,
            boxShadow: '0 18px 50px rgba(124,58,237,0.10)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                background: 'linear-gradient(135deg,#7C3AED,#4F46E5)',
                color: '#fff',
                display: 'grid',
                placeItems: 'center',
                fontSize: 23,
                margin: '0 auto 12px',
              }}
            >
              🤖
            </div>

            <h1 style={{ fontSize: 25, fontWeight: 900, margin: 0, color: C.textH }}>
              Operations Agent
            </h1>

            <p style={{ color: C.textMuted, marginTop: 6, fontSize: 13 }}>
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
                className={`auth-btn ${mode === 'login' ? 'auth-btn-primary' : 'auth-btn-secondary'}`}
                style={{ flex: 1 }}
              >
                Login
              </button>

              <button
                type="button"
                onClick={() => switchMode('register')}
                className={`auth-btn ${mode === 'register' ? 'auth-btn-primary' : 'auth-btn-secondary'}`}
                style={{ flex: 1 }}
              >
                Register
              </button>
            </div>
          )}

          {error && (
            <div
              style={{
                background: '#FEE2E2',
                color: '#991B1B',
                padding: 12,
                borderRadius: 12,
                marginBottom: 14,
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              style={{
                background: '#ECFDF5',
                color: '#047857',
                padding: 12,
                borderRadius: 12,
                marginBottom: 14,
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {success}
            </div>
          )}

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
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: C.primaryDark,
                  cursor: 'pointer',
                  fontWeight: 800,
                  marginTop: 14,
                  width: '100%',
                }}
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
                    onChange={(e) => setRegisterForm({ ...registerForm, [key]: e.target.value })}
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
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
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
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: C.primaryDark,
                  cursor: 'pointer',
                  fontWeight: 800,
                  marginTop: 14,
                  width: '100%',
                }}
              >
                Back to Login
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}