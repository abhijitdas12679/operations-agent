import React, { useEffect, useState } from 'react';
import api from '../api';

const C = {
  pageBg: '#F8F7FF',
  card: '#FFFFFF',
  border: '#F0ECFF',
  textH: '#1A1035',
  textB: '#4B4569',
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

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .smtp-card {
    background: ${C.card};
    border: 1px solid ${C.border};
    border-radius: 18px;
    box-shadow: 0 14px 42px rgba(124, 58, 237, 0.06);
    animation: fadeUp 0.35s ease both;
  }

  .smtp-input,
  .smtp-select {
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

  .smtp-input:focus,
  .smtp-select:focus {
    border-color: ${C.primary};
    box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.10);
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
    padding: 10px 15px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    font-family: ${FONT};
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
  }

  .smtp-btn-primary {
    background: linear-gradient(135deg, #7C3AED, #4F46E5);
    color: #fff;
    box-shadow: 0 8px 22px rgba(124, 58, 237, 0.25);
  }

  .smtp-btn-secondary {
    background: ${C.primarySoft};
    color: ${C.primaryDark};
  }

  .smtp-btn-danger {
    background: #FEE2E2;
    color: #B91C1C;
  }

  .smtp-btn:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  .smtp-section-label {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 14px;
  }

  .smtp-section-label span:first-child {
    width: 3px;
    height: 16px;
    border-radius: 2px;
    background: linear-gradient(180deg,#7C3AED,#4F46E5);
  }

  .smtp-section-label span:last-child {
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: ${C.textLight};
  }

  .smtp-alert-success {
    background: #ECFDF5;
    color: #047857;
    padding: 12px 14px;
    border-radius: 12px;
    margin-bottom: 16px;
    font-size: 13px;
    font-weight: 700;
  }

  .smtp-info-box {
    background: #FBFAFF;
    border: 1px solid ${C.border};
    border-radius: 16px;
    padding: 18px;
  }

  .smtp-guide-list {
    margin: 0;
    padding-left: 18px;
    color: ${C.textMuted};
    font-size: 13px;
    line-height: 1.85;
  }

  .smtp-guide-values {
    margin-top: 12px;
    padding: 12px;
    background: #F8F7FF;
    border-radius: 12px;
    border: 1px solid ${C.border};
    font-size: 13px;
    color: ${C.textB};
    line-height: 1.8;
  }

  .smtp-mini-note {
    margin-top: 10px;
    padding: 10px 12px;
    background: #F5F3FF;
    border: 1px solid #DDD6FE;
    border-radius: 12px;
    color: ${C.primaryDark};
    font-size: 12px;
    line-height: 1.6;
    font-weight: 600;
  }

  @media (max-width: 900px) {
    .smtp-grid {
      grid-template-columns: 1fr !important;
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
    <div className="smtp-info-box" style={{ marginBottom: 14, ...style }}>
      {title && (
        <h3
          style={{
            fontSize: 14,
            fontWeight: 800,
            color: C.textH,
            marginBottom: 10,
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
        style={{
          minHeight: '100vh',
          background: C.pageBg,
          fontFamily: FONT,
          padding: '36px 40px 64px',
        }}
      >
        <div style={{ marginBottom: 34 }}>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: C.textH,
              letterSpacing: '-0.6px',
              margin: 0,
            }}
          >
            Email Sender Settings ⚙️
          </h1>

          <p style={{ fontSize: 13, color: C.textMuted, marginTop: 4 }}>
            Connect your Gmail, Outlook, or custom SMTP account to send emails.
          </p>
        </div>

        <div
          className="smtp-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(320px, 520px) minmax(280px, 1fr)',
            gap: 20,
            alignItems: 'start',
          }}
        >
          <div>
            <SectionLabel>SMTP Connection</SectionLabel>

            <div className="smtp-card" style={{ padding: 22 }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 8, color: C.textH }}>
                Connect Your Email Account
              </h2>

              <p style={{ color: C.textMuted, fontSize: 13, marginBottom: 18, lineHeight: 1.6 }}>
                Your emails will be sent from your own email address. Select your email provider, enter your email, paste the app password, then save and test.
              </p>

              {connected && (
                <div className="smtp-alert-success">
                  Connected sender: <b>{connected.smtp_email}</b>
                </div>
              )}

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
                    Do not enter your normal email password here. Use the special App Password generated from Gmail or Outlook security settings.
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
              <GuideBox title="📧 Gmail Setup">
                <ol className="smtp-guide-list">
                  <li>Open your Gmail account in the browser.</li>
                  <li>Click your profile icon and open <b>Manage your Google Account</b>.</li>
                  <li>Go to <b>Security</b>.</li>
                  <li>Turn on <b>2-Step Verification</b>. Google may ask you to verify your phone number.</li>
                  <li>After 2-Step Verification is enabled, search for <b>App Passwords</b>.</li>
                  <li>Create a new app password. You can name it <b>Operations Agent</b>.</li>
                  <li>Google will show a 16-character password. Copy it.</li>
                  <li>Paste that password into the <b>App Password</b> field on this page.</li>
                </ol>

                <div className="smtp-guide-values">
                  <div><b>Provider:</b> Gmail</div>
                  <div><b>SMTP Host:</b> smtp.gmail.com</div>
                  <div><b>SMTP Port:</b> 587</div>
                  <div><b>Email:</b> Your Gmail address</div>
                  <div><b>Password:</b> Gmail App Password</div>
                </div>
              </GuideBox>

              <GuideBox title="📨 Outlook Setup">
                <ol className="smtp-guide-list">
                  <li>Open your Outlook or Microsoft account in the browser.</li>
                  <li>Go to your account <b>Security</b> settings.</li>
                  <li>Turn on <b>Two-step verification</b> if Microsoft asks for it.</li>
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

              <GuideBox title="⚠️ Important Notes" style={{ marginBottom: 0 }}>
                <ul className="smtp-guide-list">
                  <li>Your SMTP email should match your registered account email.</li>
                  <li>Do not use your normal Gmail or Outlook password.</li>
                  <li>Always use the App Password generated from your email security settings.</li>
                  <li>After saving, click <b>Send Test Email</b> to confirm everything is working.</li>
                  <li>If test email is successful, your email account is connected correctly.</li>
                </ul>
              </GuideBox>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}