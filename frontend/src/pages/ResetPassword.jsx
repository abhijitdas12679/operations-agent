import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';

const C = {
  pageBg: '#F8F7FF',
  card: '#FFFFFF',
  border: '#F0ECFF',
  textH: '#1A1035',
  textMuted: '#8B7EC8',
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

  .reset-input {
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

  .reset-input:focus {
    border-color: ${C.primary};
    box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.10);
  }

  .reset-label {
    display: block;
    font-size: 12px;
    color: ${C.textMuted};
    font-weight: 700;
    margin-bottom: 7px;
  }

  .reset-btn {
    border: none;
    border-radius: 12px;
    padding: 11px 15px;
    font-size: 13px;
    font-weight: 800;
    cursor: pointer;
    font-family: ${FONT};
  }

  .reset-btn-primary {
    background: linear-gradient(135deg, #7C3AED, #4F46E5);
    color: #fff;
    box-shadow: 0 8px 22px rgba(124, 58, 237, 0.25);
  }

  .reset-btn:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
`;

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get('token') || '';

  const [form, setForm] = useState({
    new_password: '',
    confirm_password: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const resetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('Reset token is missing. Please request password reset again.');
      return;
    }

    if (form.new_password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (form.new_password !== form.confirm_password) {
      setError('New password and confirm password do not match.');
      return;
    }

    setSaving(true);

    try {
      const res = await api.post('/auth/reset-password', {
        token,
        new_password: form.new_password,
      });

      setSuccess(res.data.message || 'Password updated successfully.');

      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Password reset failed');
    } finally {
      setSaving(false);
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
            maxWidth: 440,
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
              🔐
            </div>

            <h1 style={{ fontSize: 25, fontWeight: 900, margin: 0, color: C.textH }}>
              Create New Password
            </h1>

            <p style={{ color: C.textMuted, marginTop: 6, fontSize: 13 }}>
              Enter your new password below.
            </p>
          </div>

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

          <form onSubmit={resetPassword}>
            <div style={{ marginBottom: 15 }}>
              <label className="reset-label">New Password</label>
              <input
                className="reset-input"
                type="password"
                value={form.new_password}
                onChange={(e) => setForm({ ...form, new_password: e.target.value })}
                required
                minLength={6}
                maxLength={72}
                placeholder="Enter new password"
              />
            </div>

            <div style={{ marginBottom: 18 }}>
              <label className="reset-label">Confirm New Password</label>
              <input
                className="reset-input"
                type="password"
                value={form.confirm_password}
                onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
                required
                minLength={6}
                maxLength={72}
                placeholder="Confirm new password"
              />
            </div>

            <button
              className="reset-btn reset-btn-primary"
              style={{ width: '100%' }}
              disabled={saving}
            >
              {saving ? 'Updating...' : 'Update Password'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 16 }}>
            <Link
              to="/login"
              style={{
                color: C.primaryDark,
                fontWeight: 800,
                textDecoration: 'none',
              }}
            >
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}