import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

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

  const login = async (e) => {
    e.preventDefault();
    clearMessages();

    try {
      const res = await api.post('/auth/login', loginForm);

      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('username', res.data.username);

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
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: 'linear-gradient(135deg, #eef5ff, #f8fafc)',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '450px',
          background: '#fff',
          padding: '30px',
          borderRadius: '18px',
          boxShadow: '0 16px 40px rgba(15,23,42,.14)',
        }}
      >
        <h1 style={{ fontSize: '25px', fontWeight: 900, marginBottom: '6px', color: '#1f538a' }}>
          🤖 Operations Agent
        </h1>

        <p style={{ color: '#64748b', marginBottom: '22px' }}>
          {mode === 'login' && 'Login with username or email'}
          {mode === 'register' && 'Create your account'}
          {mode === 'forgot' && 'Enter your registered email'}
        </p>

        {mode !== 'forgot' && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
            <button
              type="button"
              onClick={() => switchMode('login')}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '9px',
                border: '1px solid #cbd5e1',
                background: mode === 'login' ? '#1F538A' : '#fff',
                color: mode === 'login' ? '#fff' : '#0f172a',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => switchMode('register')}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '9px',
                border: '1px solid #cbd5e1',
                background: mode === 'register' ? '#1F538A' : '#fff',
                color: mode === 'register' ? '#fff' : '#0f172a',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              Register
            </button>
          </div>
        )}

        {error && (
          <div style={{
            background: '#fee2e2',
            color: '#991b1b',
            padding: '11px',
            borderRadius: '9px',
            marginBottom: '14px',
            fontSize: '14px',
            fontWeight: 600,
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            background: '#dcfce7',
            color: '#166534',
            padding: '11px',
            borderRadius: '9px',
            marginBottom: '14px',
            fontSize: '14px',
            fontWeight: 600,
          }}>
            {success}
          </div>
        )}

        {mode === 'login' && (
          <form onSubmit={login}>
            <div className="form-group">
              <label>Username or Email</label>
              <input
                name="username"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                required
                placeholder="Enter username or email"
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                required
                placeholder="Enter password"
                maxLength={72}
              />
            </div>

            <button className="btn btn-primary" style={{width: '80%', display: 'block', margin: '0 auto',}}>
              Login
            </button>

            <button
              type="button"
              onClick={() => switchMode('forgot')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#1f538a',
                cursor: 'pointer',
                fontWeight: 800,
                marginTop: '14px',
                width: '100%',
              }}
            >
              Forgot Password?
            </button>
          </form>
        )}

        {mode === 'register' && (
          <form onSubmit={register}>
            <div className="form-group">
              <label>Username</label>
              <input
                value={registerForm.username}
                onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={registerForm.email}
                onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Your Full Name</label>
              <input
                value={registerForm.full_name}
                onChange={(e) => setRegisterForm({ ...registerForm, full_name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Your Designation</label>
              <input
                value={registerForm.designation}
                onChange={(e) => setRegisterForm({ ...registerForm, designation: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={registerForm.password}
                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                required
                minLength={6}
                maxLength={72}
              />
            </div>

            <button className="btn btn-primary" style={{ width: '100%' }}>
              Register
            </button>
          </form>
        )}

        {mode === 'forgot' && (
          <form onSubmit={forgotPassword}>
            <div className="form-group">
              <label>Registered Email</label>
              <input
                type="email"
                value={forgotForm.email}
                onChange={(e) => setForgotForm({ email: e.target.value })}
                required
                placeholder="Enter your registered email"
              />
            </div>

            <button className="btn btn-primary" style={{width: '80%', display: 'block', margin: '0 auto',}}>
              Send Reset Link
            </button>

            <button
              type="button"
              onClick={() => switchMode('login')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#1f538a',
                cursor: 'pointer',
                fontWeight: 800,
                marginTop: '14px',
                width: '100%',
              }}
            >
              Back to Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}