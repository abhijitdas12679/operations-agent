import React, { useEffect, useState } from 'react';
import api from '../api';

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
  warningBg: 'var(--oa-warning-bg)',
  warningText: 'var(--oa-warning-text)',
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

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .smtp-card {
    background: ${C.card};
    border: 1px solid ${C.border};
    border-radius: 20px;
    box-shadow: 0 16px 40px rgba(var(--oa-shadow-rgb), 0.06);
    animation: fadeUp 0.3s ease both;
  }

  .smtp-input,
  .smtp-select {
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

  .smtp-input:focus,
  .smtp-select:focus {
    border-color: ${C.primary};
    box-shadow: 0 0 0 4px rgba(var(--oa-focus-rgb), 0.12);
  }

  .smtp-label {
    display: block;
    font-size: 12px;
    color: ${C.textMuted};
    font-weight: 700;
    margin-bottom: 7px;
  }

  .smtp-btn {
    border: none;
    border-radius: 12px;
    padding: 11px 16px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    font-family: ${FONT};
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: 0.18s ease;
  }

  .smtp-btn:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  .smtp-btn-primary {
    background: linear-gradient(135deg, #4F46E5, #2563EB);
    color: #fff;
    box-shadow: 0 10px 24px rgba(var(--oa-focus-rgb), 0.26);
  }

  .smtp-btn-secondary {
    background: ${C.primarySoft};
    color: ${C.primaryDark};
  }

  .smtp-btn-danger {
    background: ${C.dangerBg};
    color: ${C.dangerText};
  }

  .smtp-btn-light {
    background: var(--oa-subtle-bg);
    color: ${C.textB};
    border: 1px solid ${C.border};
  }

  .smtp-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .smtp-section-label {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 14px;
  }

  .smtp-section-label span:first-child {
    width: 34px;
    height: 3px;
    border-radius: 999px;
    background: var(--oa-bar-grad);
  }

  .smtp-section-label span:last-child {
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${C.textMuted};
  }

  .smtp-alert-success,
  .smtp-alert-warning,
  .smtp-alert-info {
    padding: 13px 15px;
    border-radius: 14px;
    margin-bottom: 16px;
    font-size: 13px;
    font-weight: 700;
    border: 1px solid transparent;
    line-height: 1.6;
  }

  .smtp-alert-success {
    background: ${C.successBg};
    color: ${C.successText};
    border-color: var(--oa-success-bg);
  }

  .smtp-alert-warning {
    background: ${C.warningBg};
    color: ${C.warningText};
    border-color: var(--oa-warning-bg);
  }

  .smtp-alert-info {
    background: ${C.primarySoft};
    color: ${C.primaryDark};
    border-color: var(--oa-primary-soft);
  }

  .smtp-info-box {
    background: var(--oa-card);
    border: 1px solid ${C.border};
    border-radius: 18px;
    padding: 18px;
    margin-bottom: 16px;
  }

  .smtp-guide-list {
    margin: 0;
    padding-left: 18px;
    color: ${C.textB};
    font-size: 13px;
    line-height: 1.85;
  }

  .smtp-guide-values {
    margin-top: 14px;
    padding: 14px;
    background: var(--oa-subtle-bg);
    border-radius: 14px;
    border: 1px solid ${C.border};
    font-size: 13px;
    color: ${C.textB};
    line-height: 1.8;
  }

  .smtp-mini-note {
    margin-top: 10px;
    padding: 11px 13px;
    background: ${C.primarySoft};
    border: 1px solid var(--oa-primary-soft);
    border-radius: 13px;
    color: ${C.primaryDark};
    font-size: 12px;
    line-height: 1.6;
    font-weight: 600;
  }

  .smtp-port-note {
    margin-top: 10px;
    padding: 11px 13px;
    background: ${C.warningBg};
    border: 1px solid var(--oa-warning-bg);
    border-radius: 13px;
    color: ${C.warningText};
    font-size: 12px;
    line-height: 1.6;
    font-weight: 700;
  }

  @media (max-width: 900px) {
    .smtp-grid {
      grid-template-columns: 1fr !important;
    }

    .smtp-page {
      padding: 24px 18px 48px !important;
    }
  }
`;

function SectionLabel({ children }) {
  return (
    <div className="smtp-section-label">
      <span />
      <span>{children}</span>
    </div>
  );
}

function GuideBox({ title, children, style }) {
  return (
    <div className="smtp-info-box" style={{ ...style }}>
      {title && (
        <h3
          style={{
            fontSize: 15,
            fontWeight: 800,
            color: C.textH,
            margin: '0 0 10px',
          }}
        >
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

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
    <>
      <style>{GLOBAL_CSS}</style>

      <div
        className="smtp-page"
        style={{
          minHeight: '100vh',
          background: C.pageBg,
          fontFamily: FONT,
          padding: '32px 36px 64px',
        }}
      >
        <div
          className="smtp-card"
          style={{
            padding: 28,
            marginBottom: 24,
            background: 'var(--oa-hero-grad)',
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
                marginBottom: 12,
              }}
            >
              Email Delivery Setup
            </div>

            <h1
              style={{
                fontSize: 30,
                fontWeight: 800,
                color: C.textH,
                letterSpacing: '-0.8px',
                margin: 0,
              }}
            >
              Email Sender Settings
            </h1>

            <p
              style={{
                fontSize: 14,
                color: C.textMuted,
                margin: '8px 0 0',
                maxWidth: 760,
                lineHeight: 1.7,
              }}
            >
              Connect your Gmail, Outlook, or custom SMTP account so the system can send emails
              from your own verified email address.
            </p>
          </div>
        </div>

        <div
          className="smtp-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(320px, 520px) minmax(280px, 1fr)',
            gap: 22,
            alignItems: 'start',
          }}
        >
          <div>
            <SectionLabel>SMTP Connection</SectionLabel>

            <div className="smtp-card" style={{ padding: 22 }}>
              <h2 style={{ fontSize: 17, fontWeight: 800, margin: '0 0 6px', color: C.textH }}>
                Connect Your Email Account
              </h2>

              <p style={{ color: C.textMuted, fontSize: 13, margin: '0 0 18px', lineHeight: 1.7 }}>
                Select your email provider, enter your email address, paste your app password, then
                save and test the connection.
              </p>

              {connected && (
                <div className="smtp-alert-success">
                  Connected sender: <b>{connected.smtp_email}</b>
                </div>
              )}

              <div className="smtp-alert-info">
                Gmail and Outlook both commonly use SMTP port <b>587</b> for secure email sending.
                So seeing the same port number for both providers is correct, not an error.
              </div>

              <form onSubmit={submit}>
                <div style={{ marginBottom: 15 }}>
                  <label className="smtp-label">Email Provider</label>
                  <select
                    className="smtp-select"
                    value={form.provider}
                    onChange={(e) => changeProvider(e.target.value)}
                  >
                    <option value="gmail">Gmail</option>
                    <option value="outlook">Outlook</option>
                    <option value="custom">Custom SMTP</option>
                  </select>
                </div>

                <div style={{ marginBottom: 15 }}>
                  <label className="smtp-label">SMTP Host</label>
                  <input
                    className="smtp-input"
                    value={form.smtp_host}
                    onChange={(e) => setForm({ ...form, smtp_host: e.target.value })}
                    required
                  />
                </div>

                <div style={{ marginBottom: 15 }}>
                  <label className="smtp-label">SMTP Port</label>
                  <input
                    className="smtp-input"
                    type="number"
                    value={form.smtp_port}
                    onChange={(e) => setForm({ ...form, smtp_port: Number(e.target.value) })}
                    required
                  />

                  <div className="smtp-port-note">
                    Port 587 is the correct secure SMTP port for both Gmail and Outlook. It is used
                    for sending email safely through TLS.
                  </div>
                </div>

                <div style={{ marginBottom: 15 }}>
                  <label className="smtp-label">Your Registered Email</label>
                  <input
                    className="smtp-input"
                    type="email"
                    value={form.smtp_email}
                    onChange={(e) => setForm({ ...form, smtp_email: e.target.value })}
                    required
                    placeholder="your registered email"
                  />
                </div>

                <div style={{ marginBottom: 15 }}>
                  <label className="smtp-label">App Password</label>
                  <input
                    className="smtp-input"
                    type="password"
                    value={form.app_password}
                    onChange={(e) => setForm({ ...form, app_password: e.target.value })}
                    required
                    placeholder="Paste Gmail/Outlook app password"
                  />

                  <div className="smtp-mini-note">
                    Do not enter your normal email password here. Use the special App Password
                    generated from Gmail or Outlook security settings.
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label className="smtp-label">From Name</label>
                  <input
                    className="smtp-input"
                    value={form.from_name}
                    onChange={(e) => setForm({ ...form, from_name: e.target.value })}
                    placeholder="Example: Abhijit Das"
                  />
                </div>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button className="smtp-btn smtp-btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Email Account'}
                  </button>

                  {connected && (
                    <>
                      <button type="button" className="smtp-btn smtp-btn-secondary" onClick={test}>
                        Send Test Email
                      </button>

                      <button type="button" className="smtp-btn smtp-btn-danger" onClick={disconnect}>
                        Disconnect
                      </button>
                    </>
                  )}
                </div>
              </form>
            </div>
          </div>

          <div>
            <SectionLabel>Setup Guide</SectionLabel>

            <div className="smtp-card" style={{ padding: 22 }}>
              <GuideBox title="Gmail Setup">
                <ol className="smtp-guide-list">
                  <li>Open your Gmail account in the browser.</li>
                  <li>Click your profile icon and open <b>Manage your Google Account</b>.</li>
                  <li>Go to <b>Security</b>.</li>
                  <li>Turn on <b>2-Step Verification</b>.</li>
                  <li>After that, search for <b>App Passwords</b>.</li>
                  <li>Create a new app password named <b>Operations Agent</b>.</li>
                  <li>Copy the 16-character password shown by Google.</li>
                  <li>Paste it into the <b>App Password</b> field on this page.</li>
                </ol>

                <div className="smtp-guide-values">
                  <div><b>Provider:</b> Gmail</div>
                  <div><b>SMTP Host:</b> smtp.gmail.com</div>
                  <div><b>SMTP Port:</b> 587</div>
                  <div><b>Email:</b> Your Gmail address</div>
                  <div><b>Password:</b> Gmail App Password</div>
                </div>
              </GuideBox>

              <GuideBox title="Outlook Setup">
                <ol className="smtp-guide-list">
                  <li>Open your Outlook or Microsoft account in the browser.</li>
                  <li>Go to your account <b>Security</b> settings.</li>
                  <li>Turn on <b>Two-step verification</b> if required.</li>
                  <li>Create an <b>App Password</b> from Microsoft security settings.</li>
                  <li>Copy the generated app password.</li>
                  <li>Paste it into the <b>App Password</b> field on this page.</li>
                </ol>

                <div className="smtp-guide-values">
                  <div><b>Provider:</b> Outlook</div>
                  <div><b>SMTP Host:</b> smtp.office365.com</div>
                  <div><b>SMTP Port:</b> 587</div>
                  <div><b>Email:</b> Your Outlook email address</div>
                  <div><b>Password:</b> Outlook App Password</div>
                </div>
              </GuideBox>

              <GuideBox title="Important Notes" style={{ marginBottom: 0 }}>
                <ul className="smtp-guide-list">
                  <li>Port <b>587</b> is correct for both Gmail and Outlook SMTP sending.</li>
                  <li>Your SMTP email should match your registered account email.</li>
                  <li>Do not use your normal Gmail or Outlook password.</li>
                  <li>Always use the App Password generated from your email security settings.</li>
                  <li>After saving, click <b>Send Test Email</b> to confirm everything is working.</li>
                </ul>
              </GuideBox>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}