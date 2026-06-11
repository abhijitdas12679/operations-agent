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

  .email-card {
    background: ${C.card};
    border: 1px solid ${C.border};
    border-radius: 18px;
    box-shadow: 0 14px 42px rgba(124, 58, 237, 0.06);
    animation: fadeUp 0.35s ease both;
  }

  .email-input,
  .email-textarea,
  .email-select {
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

  .email-input:focus,
  .email-textarea:focus,
  .email-select:focus {
    border-color: ${C.primary};
    box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.10);
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

  .email-btn-primary {
    background: linear-gradient(135deg, #7C3AED, #4F46E5);
    color: #fff;
    box-shadow: 0 8px 22px rgba(124, 58, 237, 0.25);
  }

  .email-btn-secondary {
    background: ${C.primarySoft};
    color: ${C.primaryDark};
  }

  .email-btn:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  .email-section-label {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 14px;
  }

  .email-section-label span:first-child {
    width: 3px;
    height: 16px;
    border-radius: 2px;
    background: linear-gradient(180deg,#7C3AED,#4F46E5);
  }

  .email-section-label span:last-child {
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: ${C.textLight};
  }

  .email-history-item {
    width: 100%;
    text-align: left;
    border: 1px solid ${C.border};
    border-radius: 14px;
    padding: 13px 14px;
    margin-bottom: 10px;
    cursor: pointer;
    background: #FBFAFF;
  }

  .email-history-item:hover {
    background: #F3F0FF;
  }

  .email-alert-error {
    background: #FEE2E2;
    color: #991B1B;
    padding: 11px 13px;
    border-radius: 12px;
    margin-bottom: 14px;
    font-size: 13px;
    font-weight: 700;
  }

  .email-alert-success {
    background: #ECFDF5;
    color: #047857;
    padding: 11px 13px;
    border-radius: 12px;
    margin-bottom: 14px;
    font-size: 13px;
    font-weight: 700;
  }

  @media (max-width: 1180px) {
    .email-grid {
      grid-template-columns: 1fr !important;
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
        background: isSent ? '#ECFDF5' : isFailed ? '#FEE2E2' : C.primarySoft,
        color: isSent ? '#047857' : isFailed ? '#B91C1C' : C.primaryDark,
        padding: '5px 9px',
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
            marginBottom: 16,
          }}
        >
          <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: C.textH }}>
            Recent Emails
          </h2>

          <button
            type="button"
            className="email-btn email-btn-secondary"
            onClick={onRefreshHistory}
            disabled={loadingHistory}
          >
            {loadingHistory ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {history.length === 0 && !loadingHistory && (
          <div style={{ padding: '28px 0', textAlign: 'center', color: C.textLight, fontSize: 13 }}>
            No email history found yet
          </div>
        )}

        <div style={{ maxHeight: 620, overflowY: 'auto', paddingRight: 4 }}>
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

                  <div style={{ fontSize: 11, color: C.textLight, marginTop: 4 }}>
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
        style={{
          minHeight: '100vh',
          background: C.pageBg,
          fontFamily: FONT,
          padding: '36px 40px 64px',
        }}
      >
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: C.textH, margin: 0 }}>
            Single Email Generator ✉️
          </h1>

          <p style={{ fontSize: 13, color: C.textMuted, marginTop: 4 }}>
            Generate, preview, edit, and send professional AI emails
          </p>
        </div>

        {!smtpConnected && (
          <div className="email-alert-error">
            Please connect email sender from Email Settings.
          </div>
        )}

        {smtpConnected && (
          <div className="email-alert-success">
            Connected Email: <b>{smtpConnected.smtp_email}</b>
          </div>
        )}

        <div
          className="email-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '360px minmax(520px, 1fr) 380px',
            gap: 20,
            alignItems: 'start',
            width: '100%',
          }}
        >
          <div>
            <SectionLabel>Create Email</SectionLabel>

            <div className="email-card" style={{ padding: 22 }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 18, color: C.textH }}>
                Generate Email
              </h2>

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

                <button className="email-btn email-btn-primary" disabled={loading} style={{ width: '100%' }}>
                  {loading ? 'Generating...' : '🤖 Generate Email'}
                </button>
              </form>
            </div>
          </div>

          <div>
            <SectionLabel>Email Preview</SectionLabel>

            <div className="email-card" style={{ minHeight: 620, padding: 22 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 16,
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: C.textH }}>
                  Preview & Edit
                </h2>
              </div>

              {!result && (
                <div style={{ padding: '60px 20px', textAlign: 'center', color: C.textLight, fontSize: 13 }}>
                  Generated email preview will appear here.
                </div>
              )}

              {result && (
                <>
                  <div
                    style={{
                      background: '#FBFAFF',
                      border: `1px solid ${C.border}`,
                      borderRadius: 14,
                      padding: 14,
                      marginBottom: 16,
                    }}
                  >
                    <p style={{ marginBottom: 6, fontSize: 13, color: C.textB }}>
                      <b>To:</b> {result.recipient || 'N/A'} — {result.recipient_email || 'N/A'}
                    </p>

                    <p style={{ marginBottom: 8, fontSize: 13, color: C.textB }}>
                      <b>Created:</b> {formatDate(result.created_at)}
                    </p>

                    <StatusBadge status={result.status} />
                  </div>

                  {!editing ? (
                    <>
                      <div
                        style={{
                          border: `1px solid ${C.border}`,
                          borderRadius: 16,
                          overflow: 'hidden',
                          marginBottom: 16,
                        }}
                      >
                        <div
                          style={{
                            background: 'linear-gradient(135deg, #F5F3FF, #EEF2FF)',
                            borderBottom: `1px solid ${C.border}`,
                            padding: '16px 20px',
                          }}
                        >
                          <div style={{ fontSize: 11, fontWeight: 800, color: C.textMuted, marginBottom: 6 }}>
                            SUBJECT
                          </div>

                          <div style={{ fontSize: 20, fontWeight: 800, color: C.textH }}>
                            {result.subject}
                          </div>
                        </div>

                        <div style={{ padding: 20, background: '#fff' }}>
                          <div style={{ fontSize: 11, fontWeight: 800, color: C.textMuted, marginBottom: 14 }}>
                            EMAIL BODY
                          </div>

                          <pre
                            style={{
                              whiteSpace: 'pre-wrap',
                              fontFamily: FONT,
                              fontSize: 14,
                              lineHeight: 1.8,
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
                          ✏️ Edit Email
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
                          onChange={(e) => setResult({ ...result, generated_email: e.target.value })}
                          style={{ minHeight: 420, fontFamily: FONT, resize: 'vertical' }}
                        />
                      </div>

                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <button className="email-btn email-btn-primary" onClick={saveEdit} disabled={savingEdit}>
                          {savingEdit ? 'Saving...' : 'Save Edit'}
                        </button>

                        <button className="email-btn email-btn-secondary" onClick={() => setEditing(false)}>
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