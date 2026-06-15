import React, { useEffect, useState } from 'react';
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

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes emailSpin {
    to { transform: rotate(360deg); }
  }

  .email-card {
    background: ${C.card};
    border: 1px solid ${C.border};
    border-radius: 20px;
    box-shadow: 0 16px 40px rgba(17, 24, 39, 0.06);
    animation: fadeUp 0.3s ease both;
  }

  .email-input,
  .email-textarea,
  .email-select {
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

  .email-input:focus,
  .email-textarea:focus,
  .email-select:focus {
    border-color: ${C.primary};
    box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.12);
  }

  .email-label {
    display: block;
    font-size: 12px;
    color: ${C.textMuted};
    font-weight: 700;
    margin-bottom: 7px;
  }

  .email-btn {
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

  .email-btn:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  .email-btn-primary {
    background: linear-gradient(135deg, #4F46E5, #2563EB);
    color: #fff;
    box-shadow: 0 10px 24px rgba(79, 70, 229, 0.26);
  }

  .email-btn-secondary {
    background: ${C.primarySoft};
    color: ${C.primaryDark};
  }

  .email-btn-light {
    background: #F9FAFB;
    color: ${C.textB};
    border: 1px solid ${C.border};
  }

  .email-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .email-section-label {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 14px;
  }

  .email-section-label span:first-child {
    width: 34px;
    height: 3px;
    border-radius: 999px;
    background: linear-gradient(90deg, #4F46E5, #2563EB);
  }

  .email-section-label span:last-child {
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${C.textMuted};
  }

  .email-history-item {
    width: 100%;
    text-align: left;
    border: 1px solid ${C.border};
    border-radius: 16px;
    padding: 14px;
    margin-bottom: 10px;
    cursor: pointer;
    background: #FFFFFF;
    transition: 0.18s ease;
  }

  .email-history-item:hover {
    background: #F8FAFC;
    transform: translateY(-1px);
    box-shadow: 0 10px 22px rgba(17, 24, 39, 0.05);
  }

  .email-alert-error,
  .email-alert-success {
    padding: 13px 15px;
    border-radius: 14px;
    margin-bottom: 18px;
    font-size: 13px;
    font-weight: 700;
    border: 1px solid transparent;
  }

  .email-alert-error {
    background: ${C.dangerBg};
    color: ${C.dangerText};
    border-color: #FECACA;
  }

  .email-alert-success {
    background: ${C.successBg};
    color: ${C.successText};
    border-color: #A7F3D0;
  }

  .email-empty-state {
    padding: 80px 20px;
    text-align: center;
    color: ${C.textLight};
    font-size: 13px;
    background: #F9FAFB;
    border-radius: 18px;
    border: 1px dashed ${C.border};
  }

  .email-scroll::-webkit-scrollbar {
    width: 6px;
  }

  .email-scroll::-webkit-scrollbar-thumb {
    background: #CBD5E1;
    border-radius: 999px;
  }

  .email-spinner {
    width: 15px;
    height: 15px;
    border: 2px solid rgba(255,255,255,0.45);
    border-top-color: #fff;
    border-radius: 50%;
    animation: emailSpin 0.75s linear infinite;
  }

  @media (max-width: 1180px) {
    .email-grid {
      grid-template-columns: 1fr !important;
    }

    .email-page {
      padding: 24px 18px 48px !important;
    }
  }
`;

function SectionLabel({ children }) {
  return (
    <div className="email-section-label">
      <span />
      <span>{children}</span>
    </div>
  );
}

function StatusBadge({ status }) {
  const isSent = status === 'sent';
  const isFailed = status === 'failed';

  return (
    <span
      style={{
        background: isSent ? C.successBg : isFailed ? C.dangerBg : C.primarySoft,
        color: isSent ? C.successText : isFailed ? C.dangerText : C.primaryDark,
        padding: '6px 10px',
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 800,
        textTransform: 'capitalize',
        display: 'inline-block',
      }}
    >
      {status || 'draft'}
    </span>
  );
}

function formatDate(dateValue) {
  if (!dateValue) return 'N/A';
  return new Date(dateValue).toLocaleString();
}

function EmailHistoryPanel({ history, loadingHistory, onSelectHistory, onRefreshHistory }) {
  return (
    <div>
      <SectionLabel>Email History</SectionLabel>

      <div className="email-card" style={{ padding: 22 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            marginBottom: 18,
          }}
        >
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, color: C.textH }}>
              Recent Emails
            </h2>
            <p style={{ fontSize: 12, color: C.textMuted, margin: '4px 0 0' }}>
              View previous generated emails
            </p>
          </div>

          <button
            type="button"
            className="email-btn email-btn-light"
            onClick={onRefreshHistory}
            disabled={loadingHistory}
          >
            {loadingHistory ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {history.length === 0 && !loadingHistory && (
          <div className="email-empty-state" style={{ padding: '42px 16px' }}>
            No email history found yet
          </div>
        )}

        <div className="email-scroll" style={{ maxHeight: 620, overflowY: 'auto', paddingRight: 4 }}>
          {history.map((item) => (
            <button
              key={item.id}
              type="button"
              className="email-history-item"
              onClick={() => onSelectHistory(item)}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 800,
                      color: C.textH,
                      fontSize: 13,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      marginBottom: 5,
                    }}
                  >
                    {item.subject || 'No Subject'}
                  </div>

                  <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.4 }}>
                    {item.recipient || 'N/A'} • {item.recipient_email || 'N/A'}
                  </div>

                  <div style={{ fontSize: 11, color: C.textLight, marginTop: 5 }}>
                    {formatDate(item.created_at)}
                  </div>
                </div>

                <StatusBadge status={item.status} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function EmailGenerator() {
  const [form, setForm] = useState({
    subject: '',
    recipient: '',
    recipient_email: '',
    tone: 'professional',
    context: '',
  });

  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [smtpConnected, setSmtpConnected] = useState(null);

  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [sending, setSending] = useState(false);
  const [editing, setEditing] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  const tones = ['professional', 'friendly', 'formal', 'assertive', 'apologetic', 'persuasive'];

  const loadHistory = async () => {
    setLoadingHistory(true);

    try {
      const res = await api.get('/email/history');
      const singleHistory = (res.data || []).filter((item) => !item.batch_id);
      setHistory(singleHistory);
    } catch (err) {
      console.error(err);
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    api
      .get('/smtp/me')
      .then((res) => setSmtpConnected(res.data))
      .catch(() => setSmtpConnected(null));

    loadHistory();
  }, []);

  const handle = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const generate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await api.post('/email/generate', form);

      let emailBody = res.data.generated_email || '';
      const subjectRegex = new RegExp(`^subject\\s*:\\s*${form.subject}`, 'i');
      emailBody = emailBody.replace(subjectRegex, '').trim();

      setResult({
        ...res.data,
        subject: form.subject,
        generated_email: emailBody,
      });

      setEditing(false);
      loadHistory();
    } catch (err) {
      alert(err.response?.data?.detail || 'Email generation failed');
    } finally {
      setLoading(false);
    }
  };

  const openHistoryItem = (item) => {
    setResult(item);
    setEditing(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saveEdit = async () => {
    if (!result?.id) return;

    setSavingEdit(true);

    try {
      const res = await api.put(`/email/history/${result.id}/content`, {
        subject: result.subject,
        generated_email: result.generated_email,
      });

      setResult({
        ...res.data,
        subject: result.subject,
      });

      setEditing(false);
      loadHistory();
      alert('Edited email saved successfully.');
    } catch (err) {
      alert(err.response?.data?.detail || err.message);
    } finally {
      setSavingEdit(false);
    }
  };

  const sendEmail = async () => {
    if (!smtpConnected) {
      alert('Please connect Email Settings first.');
      return;
    }

    if (!result?.id) {
      alert('Please generate an email first.');
      return;
    }

    setSending(true);

    try {
      const res = await api.post(`/email/history/${result.id}/send`, {
        subject: result.subject,
        generated_email: result.generated_email,
      });

      alert(res.data.status === 'sent' ? 'Email sent successfully.' : res.data.error_message);

      setResult({
        ...result,
        ...res.data,
      });

      loadHistory();
    } catch (err) {
      alert(err.response?.data?.detail || err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      <div
        className="email-page"
        style={{
          minHeight: '100vh',
          background: C.pageBg,
          fontFamily: FONT,
          padding: '32px 36px 64px',
        }}
      >
        <div
          className="email-card"
          style={{
            padding: 28,
            marginBottom: 24,
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFF 45%, #EEF2FF 100%)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 20,
              alignItems: 'center',
              flexWrap: 'wrap',
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
                AI Email Automation
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
                Single Email Generator
              </h1>

              <p
                style={{
                  fontSize: 14,
                  color: C.textMuted,
                  margin: '8px 0 0',
                  maxWidth: 680,
                }}
              >
                Generate professional emails, preview the content, edit before sending, and track
                all previous single-email activity.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(90px, 1fr))',
                gap: 12,
                minWidth: 320,
              }}
            >
              <div className="email-card" style={{ padding: 16 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: C.textH }}>
                  {history.length}
                </div>
                <div style={{ fontSize: 12, color: C.textMuted, fontWeight: 700 }}>
                  History
                </div>
              </div>

              <div className="email-card" style={{ padding: 16 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: C.primary }}>
                  {result ? 1 : 0}
                </div>
                <div style={{ fontSize: 12, color: C.textMuted, fontWeight: 700 }}>
                  Generated
                </div>
              </div>

              <div className="email-card" style={{ padding: 16 }}>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: result?.status === 'sent' ? C.successText : C.textH,
                    textTransform: 'capitalize',
                  }}
                >
                  {result?.status === 'sent' ? 'Sent' : 'Draft'}
                </div>
                <div style={{ fontSize: 12, color: C.textMuted, fontWeight: 700 }}>
                  Status
                </div>
              </div>
            </div>
          </div>
        </div>

        {!smtpConnected && (
          <div className="email-alert-error">
            Please connect your email sender from Email Settings before sending emails.
          </div>
        )}

        {smtpConnected && (
          <div className="email-alert-success">
            Connected email account: <b>{smtpConnected.smtp_email}</b>
          </div>
        )}

        <div
          className="email-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '360px minmax(520px, 1fr) 380px',
            gap: 22,
            alignItems: 'start',
            width: '100%',
          }}
        >
          <div>
            <SectionLabel>Create Email</SectionLabel>

            <div className="email-card" style={{ padding: 22 }}>
              <h2 style={{ fontSize: 17, fontWeight: 800, margin: '0 0 4px', color: C.textH }}>
                Generate Email
              </h2>

              <p style={{ fontSize: 12, color: C.textMuted, margin: '0 0 18px' }}>
                Enter recipient details and context to create a polished email.
              </p>

              <form onSubmit={generate}>
                <div style={{ marginBottom: 15 }}>
                  <label className="email-label">Subject</label>
                  <input
                    className="email-input"
                    name="subject"
                    value={form.subject}
                    onChange={handle}
                    required
                    placeholder="Example: Project Update"
                  />
                </div>

                <div style={{ marginBottom: 15 }}>
                  <label className="email-label">Recipient Name / Role</label>
                  <input
                    className="email-input"
                    name="recipient"
                    value={form.recipient}
                    onChange={handle}
                    required
                    placeholder="Example: Rahul Sharma"
                  />
                </div>

                <div style={{ marginBottom: 15 }}>
                  <label className="email-label">Recipient Email</label>
                  <input
                    className="email-input"
                    type="email"
                    name="recipient_email"
                    value={form.recipient_email}
                    onChange={handle}
                    required
                    placeholder="example@email.com"
                  />
                </div>

                <div style={{ marginBottom: 15 }}>
                  <label className="email-label">Tone</label>
                  <select className="email-select" name="tone" value={form.tone} onChange={handle}>
                    {tones.map((tone) => (
                      <option key={tone} value={tone}>
                        {tone.charAt(0).toUpperCase() + tone.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: 18 }}>
                  <label className="email-label">Context / Purpose</label>
                  <textarea
                    className="email-textarea"
                    name="context"
                    value={form.context}
                    onChange={handle}
                    required
                    placeholder="Describe the email purpose..."
                    style={{ minHeight: 145, resize: 'vertical' }}
                  />
                </div>

                <button
                  className="email-btn email-btn-primary"
                  disabled={loading}
                  style={{ width: '100%' }}
                >
                  {loading ? (
                    <>
                      <span className="email-spinner" />
                      Generating...
                    </>
                  ) : (
                    'Generate Email'
                  )}
                </button>
              </form>
            </div>
          </div>

          <div>
            <SectionLabel>Email Preview</SectionLabel>

            <div className="email-card" style={{ minHeight: 640, padding: 22 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 18,
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, color: C.textH }}>
                    Preview & Edit
                  </h2>

                  <p style={{ fontSize: 12, color: C.textMuted, margin: '4px 0 0' }}>
                    Review the generated email before sending.
                  </p>
                </div>
              </div>

              {!result && (
                <div className="email-empty-state">
                  Generated email preview will appear here.
                </div>
              )}

              {result && (
                <>
                  <div
                    style={{
                      background: '#F9FAFB',
                      border: `1px solid ${C.border}`,
                      borderRadius: 16,
                      padding: 16,
                      marginBottom: 16,
                    }}
                  >
                    <p style={{ margin: '0 0 7px', fontSize: 13, color: C.textB }}>
                      <b>To:</b> {result.recipient || 'N/A'} — {result.recipient_email || 'N/A'}
                    </p>

                    <p style={{ margin: '0 0 10px', fontSize: 13, color: C.textB }}>
                      <b>Created:</b> {formatDate(result.created_at)}
                    </p>

                    <StatusBadge status={result.status} />
                  </div>

                  {!editing ? (
                    <>
                      <div
                        style={{
                          border: `1px solid ${C.border}`,
                          borderRadius: 18,
                          background: '#FFFFFF',
                          overflow: 'hidden',
                          marginBottom: 16,
                        }}
                      >
                        <div
                          style={{
                            background: 'linear-gradient(135deg, #F8FAFC, #EEF2FF)',
                            borderBottom: `1px solid ${C.border}`,
                            padding: '18px 20px',
                          }}
                        >
                          <div
                            style={{
                              fontSize: 11,
                              fontWeight: 800,
                              color: C.textMuted,
                              marginBottom: '7px',
                              letterSpacing: '0.08em',
                            }}
                          >
                            SUBJECT
                          </div>

                          <div style={{ fontSize: 20, fontWeight: 800, color: C.textH }}>
                            {result.subject}
                          </div>
                        </div>

                        <div style={{ padding: 20 }}>
                          <div
                            style={{
                              fontSize: 11,
                              fontWeight: 800,
                              color: C.textMuted,
                              marginBottom: '14px',
                              letterSpacing: '0.08em',
                            }}
                          >
                            EMAIL BODY
                          </div>

                          <pre
                            style={{
                              whiteSpace: 'pre-wrap',
                              fontFamily: FONT,
                              fontSize: 14,
                              lineHeight: 1.85,
                              color: C.textB,
                              margin: 0,
                            }}
                          >
                            {result.generated_email}
                          </pre>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <button
                          className="email-btn email-btn-secondary"
                          onClick={() => setEditing(true)}
                          disabled={result.status === 'sent'}
                        >
                          Edit Email
                        </button>

                        <button
                          className="email-btn email-btn-primary"
                          onClick={sendEmail}
                          disabled={sending || result.status === 'sent'}
                        >
                          {sending ? 'Sending...' : 'Send Email'}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ marginBottom: 15 }}>
                        <label className="email-label">Edit Subject</label>
                        <input
                          className="email-input"
                          value={result.subject || ''}
                          onChange={(e) => setResult({ ...result, subject: e.target.value })}
                        />
                      </div>

                      <div style={{ marginBottom: 15 }}>
                        <label className="email-label">Edit Email Body</label>
                        <textarea
                          className="email-textarea"
                          value={result.generated_email || ''}
                          onChange={(e) =>
                            setResult({
                              ...result,
                              generated_email: e.target.value,
                            })
                          }
                          style={{
                            minHeight: 420,
                            fontFamily: FONT,
                            resize: 'vertical',
                            lineHeight: 1.75,
                          }}
                        />
                      </div>

                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <button
                          className="email-btn email-btn-primary"
                          onClick={saveEdit}
                          disabled={savingEdit}
                        >
                          {savingEdit ? 'Saving...' : 'Save Edit'}
                        </button>

                        <button
                          className="email-btn email-btn-light"
                          onClick={() => setEditing(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          <EmailHistoryPanel
            history={history}
            loadingHistory={loadingHistory}
            onSelectHistory={openHistoryItem}
            onRefreshHistory={loadHistory}
          />
        </div>
      </div>
    </>
  );
}