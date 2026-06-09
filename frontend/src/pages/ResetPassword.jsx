import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';

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
          maxWidth: '430px',
          background: '#fff',
          padding: '30px',
          borderRadius: '18px',
          boxShadow: '0 16px 40px rgba(15,23,42,.14)',
        }}
      >
        <h1 style={{ fontSize: '25px', fontWeight: 900, marginBottom: '6px', color: '#1f538a' }}>
          Create New Password
        </h1>

        <p style={{ color: '#64748b', marginBottom: '22px' }}>
          Enter your new password below.
        </p>

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

        <form onSubmit={resetPassword}>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              value={form.new_password}
              onChange={(e) => setForm({ ...form, new_password: e.target.value })}
              required
              minLength={6}
              maxLength={72}
              placeholder="Enter new password"
            />
          </div>

          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              value={form.confirm_password}
              onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
              required
              minLength={6}
              maxLength={72}
              placeholder="Confirm new password"
            />
          </div>

          <button className="btn btn-primary" style={{ width: '100%' }} disabled={saving}>
            {saving ? 'Updating...' : 'Update Password'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '16px' }}>
          <Link to="/login" style={{ color: '#1f538a', fontWeight: 800 }}>
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}