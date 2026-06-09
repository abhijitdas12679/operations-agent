import React, { useEffect, useState } from 'react';
import api from '../api';

export default function EmailSettings() {
  const [connected, setConnected] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    provider: 'gmail',
    smtp_host: 'smtp.gmail.com',
    smtp_port: 587,
    smtp_email: '',
    app_password: '',
    from_name: '',
  });

  const loadSetting = async () => {
    try {
      const res = await api.get('/smtp/me');
      setConnected(res.data);

      if (res.data) {
        setForm({
          provider: res.data.provider || 'gmail',
          smtp_host: res.data.smtp_host || 'smtp.gmail.com',
          smtp_port: res.data.smtp_port || 587,
          smtp_email: res.data.smtp_email || '',
          app_password: '',
          from_name: res.data.from_name || '',
        });
      }
    } catch {
      setConnected(null);
    }
  };

  useEffect(() => {
    loadSetting();
  }, []);

  const changeProvider = (provider) => {
    if (provider === 'gmail') {
      setForm({
        ...form,
        provider,
        smtp_host: 'smtp.gmail.com',
        smtp_port: 587,
      });
    } else if (provider === 'outlook') {
      setForm({
        ...form,
        provider,
        smtp_host: 'smtp.office365.com',
        smtp_port: 587,
      });
    } else {
      setForm({
        ...form,
        provider,
      });
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/smtp/connect', form);
      alert('Email account connected successfully.');
      setForm({ ...form, app_password: '' });
      loadSetting();
    } catch (err) {
      alert(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  const test = async () => {
    try {
      const res = await api.post('/smtp/test');
      alert(res.data.message);
    } catch (err) {
      alert(err.response?.data?.detail || err.message);
    }
  };

  const disconnect = async () => {
    if (!window.confirm('Disconnect your email account?')) return;

    try {
      await api.delete('/smtp/disconnect');
      setConnected(null);
      setForm({
        provider: 'gmail',
        smtp_host: 'smtp.gmail.com',
        smtp_port: 587,
        smtp_email: '',
        app_password: '',
        from_name: '',
      });
      alert('Email account disconnected.');
    } catch (err) {
      alert(err.response?.data?.detail || err.message);
    }
  };

  return (
    <div className="page">
      <h1 className="page-title">⚙️ Email Sender Settings</h1>

      <div className="card">
        <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '14px' }}>
          Connect Your Email Account
        </h2>

        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '16px' }}>
          Your emails will be sent from your registered email address. Use Gmail or Outlook App Password.
        </p>

        {connected && (
          <div className="alert alert-success">
            Connected sender: <b>{connected.smtp_email}</b>
          </div>
        )}

        <form onSubmit={submit}>
          <div className="form-group">
            <label>Email Provider</label>
            <select
              value={form.provider}
              onChange={(e) => changeProvider(e.target.value)}
            >
              <option value="gmail">Gmail</option>
              <option value="outlook">Outlook</option>
              <option value="custom">Custom SMTP</option>
            </select>
          </div>

          <div className="form-group">
            <label>SMTP Host</label>
            <input
              value={form.smtp_host}
              onChange={(e) => setForm({ ...form, smtp_host: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>SMTP Port</label>
            <input
              type="number"
              value={form.smtp_port}
              onChange={(e) => setForm({ ...form, smtp_port: Number(e.target.value) })}
              required
            />
          </div>

          <div className="form-group">
            <label>Your Registered Email</label>
            <input
              type="email"
              value={form.smtp_email}
              onChange={(e) => setForm({ ...form, smtp_email: e.target.value })}
              required
              placeholder="your registered email"
            />
          </div>

          <div className="form-group">
            <label>App Password</label>
            <input
              type="password"
              value={form.app_password}
              onChange={(e) => setForm({ ...form, app_password: e.target.value })}
              required
              placeholder="Gmail/Outlook app password"
            />
          </div>

          <div className="form-group">
            <label>From Name</label>
            <input
              value={form.from_name}
              onChange={(e) => setForm({ ...form, from_name: e.target.value })}
              placeholder="Example: Abhijit Das"
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Email Account'}
            </button>

            {connected && (
              <>
                <button type="button" className="btn btn-secondary" onClick={test}>
                  Send Test Email
                </button>

                <button type="button" className="btn btn-secondary" onClick={disconnect}>
                  Disconnect
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}