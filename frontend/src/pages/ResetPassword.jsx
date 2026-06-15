import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';

const C = {
  pageBg: '#F6F7FB',
  card: '#FFFFFF',
  border: '#E6E8F0',
  textH: '#111827',
  textB: '#4B5563',
  textMuted: '#6B7280',
  textLight: '#9CA3AF',
  primary: '#4F46E5',
  primaryDark: '#3730A3',
  primarySoft: '#EEF2FF',
  successBg: '#ECFDF5',
  successText: '#047857',
  dangerBg: '#FEF2F2',
  dangerText: '#B91C1C',
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

  .reset-input {
    width: 100%;
    border: 1px solid ${C.border};
    background: #FFFFFF;
    border-radius: 12px;
    padding: 12px 14px;
    font-size: 13px;
    color: ${C.textH};
    outline: none;
    font-family: ${FONT};
    transition: 0.18s ease;
  }

  .reset-input:focus {
    border-color: ${C.primary};
    box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.12);
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
    padding: 12px 15px;
    font-size: 13px;
    font-weight: 800;
    cursor: pointer;
    font-family: ${FONT};
    transition: 0.18s ease;
  }

  .reset-btn:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  .reset-btn-primary {
    background: linear-gradient(135deg, #4F46E5, #2563EB);
    color: #fff;
    box-shadow: 0 10px 24px rgba(79, 70, 229, 0.26);
  }

  .reset-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .reset-alert-error,
  .reset-alert-success {
    padding: 13px 15px;
    border-radius: 14px;
    margin-bottom: 14px;
    font-size: 13px;
    font-weight: 700;
    border: 1px solid transparent;
    line-height: 1.6;
  }

  .reset-alert-error {
    background: ${C.dangerBg};
    color: ${C.dangerText};
    border-color: #FECACA;
  }

  .reset-alert-success {
    background: ${C.successBg};
    color: ${C.successText};
    border-color: #A7F3D0;
  }

  @media (max-width: 900px) {
    .reset-layout {
      grid-template-columns: 1fr !important;
    }

    .reset-left {
      display: none !important;
    }

    .reset-page {
      padding: 24px 18px !important;
    }
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
        className="reset-page"
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
          className="reset-layout"
          style={{
            width: '100%',
            maxWidth: 920,
            display: 'grid',
            gridTemplateColumns: '1fr 440px',
            borderRadius: 28,
            overflow: 'hidden',
            background: C.card,
            border: `1px solid ${C.border}`,
            boxShadow: '0 24px 70px rgba(17, 24, 39, 0.10)',
          }}
        >
          <div
            className="reset-left"
            style={{
              padding: 42,
              background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFF 45%, #EEF2FF 100%)',
              borderRight: `1px solid ${C.border}`,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: 540,
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
                Secure Account Recovery
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
                Create a new password for your Operations Agent account.
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
                Use a strong password to keep your reports, emails, tasks, and meeting data secure.
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
                ['6+', 'Characters'],
                ['72', 'Max Length'],
                ['TLS', 'Secure'],
              ].map(([top, bottom]) => (
                <div
                  key={bottom}
                  style={{
                    background: '#FFFFFF',
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
                  background: 'linear-gradient(135deg,#4F46E5,#2563EB)',
                  color: '#fff',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 18,
                  fontWeight: 900,
                  margin: '0 auto 14px',
                  boxShadow: '0 12px 28px rgba(79,70,229,0.28)',
                }}
              >
                PW
              </div>

              <h1 style={{ fontSize: 26, fontWeight: 900, margin: 0, color: C.textH }}>
                Create New Password
              </h1>

              <p style={{ color: C.textMuted, marginTop: 7, fontSize: 13, lineHeight: 1.6 }}>
                Enter and confirm your new password below.
              </p>
            </div>

            {error && <div className="reset-alert-error">{error}</div>}
            {success && <div className="reset-alert-success">{success}</div>}

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
                  fontSize: 13,
                }}
              >
                Back to Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}