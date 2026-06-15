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

  .bulk-card {
    background: ${C.card};
    border: 1px solid ${C.border};
    border-radius: 20px;
    box-shadow: 0 16px 40px rgba(17, 24, 39, 0.06);
    animation: fadeUp 0.3s ease both;
  }

  .bulk-input,
  .bulk-textarea,
  .bulk-select {
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

  .bulk-input:focus,
  .bulk-textarea:focus,
  .bulk-select:focus {
    border-color: ${C.primary};
    box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.12);
  }

  .bulk-label {
    display: block;
    font-size: 12px;
    color: ${C.textMuted};
    font-weight: 700;
    margin-bottom: 7px;
  }

  .bulk-btn {
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

  .bulk-btn:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  .bulk-btn-primary {
    background: linear-gradient(135deg, #4F46E5, #2563EB);
    color: #fff;
    box-shadow: 0 10px 24px rgba(79, 70, 229, 0.26);
  }

  .bulk-btn-secondary {
    background: ${C.primarySoft};
    color: ${C.primaryDark};
  }

  .bulk-btn-light {
    background: #F9FAFB;
    color: ${C.textB};
    border: 1px solid ${C.border};
  }

  .bulk-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .bulk-section-label {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 14px;
  }

  .bulk-section-label span:first-child {
    width: 34px;
    height: 3px;
    border-radius: 999px;
    background: linear-gradient(90deg, #4F46E5, #2563EB);
  }

  .bulk-section-label span:last-child {
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${C.textMuted};
  }

  .bulk-history-item,
  .bulk-recipient-item {
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

  .bulk-history-item:hover,
  .bulk-recipient-item:hover {
    background: #F8FAFC;
    transform: translateY(-1px);
    box-shadow: 0 10px 22px rgba(17, 24, 39, 0.05);
  }

  .bulk-alert-error,
  .bulk-alert-success {
    padding: 13px 15px;
    border-radius: 14px;
    margin-bottom: 18px;
    font-size: 13px;
    font-weight: 700;
    border: 1px solid transparent;
  }

  .bulk-alert-error {
    background: ${C.dangerBg};
    color: ${C.dangerText};
    border-color: #FECACA;
  }

  .bulk-alert-success {
    background: ${C.successBg};
    color: ${C.successText};
    border-color: #A7F3D0;
  }

  .bulk-scroll::-webkit-scrollbar {
    width: 6px;
  }

  .bulk-scroll::-webkit-scrollbar-thumb {
    background: #CBD5E1;
    border-radius: 999px;
  }

  @media (max-width: 1180px) {
    .bulk-grid {
      grid-template-columns: 1fr !important;
    }

    .bulk-page {
      padding: 24px 18px 48px !important;
    }
  }
`;

function SectionLabel({ children }) {
  return (
    <div className="bulk-section-label">
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

function cleanEmailBody(body, subject) {
  if (!body) return '';

  let cleaned = body.trim();
  cleaned = cleaned.replace(/^subject\s*:\s*.*$/im, '').trim();

  if (subject) {
    const escapedSubject = subject.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const subjectRegex = new RegExp(`^${escapedSubject}\\s*`, 'i');
    cleaned = cleaned.replace(subjectRegex, '').trim();
  }

  return cleaned;
}

function formatDate(dateValue) {
  if (!dateValue) return 'N/A';
  return new Date(dateValue).toLocaleString();
}

function BulkHistoryPanel({ history, loadingHistory, onSelectHistory, onRefreshHistory }) {
  return (
    <div>
      <SectionLabel>Email History</SectionLabel>

      <div className="bulk-card" style={{ padding: 22 }}>
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
              Recent Bulk Emails
            </h2>
            <p style={{ fontSize: 12, color: C.textMuted, margin: '4px 0 0' }}>
              Track generated and sent email batches
            </p>
          </div>

          <button
            type="button"
            className="bulk-btn bulk-btn-light"
            onClick={onRefreshHistory}
            disabled={loadingHistory}
          >
            {loadingHistory ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {history.length === 0 && !loadingHistory && (
          <div
            style={{
              padding: '42px 16px',
              textAlign: 'center',
              color: C.textLight,
              fontSize: 13,
              background: '#F9FAFB',
              borderRadius: 16,
              border: `1px dashed ${C.border}`,
            }}
          >
            No bulk email history found yet
          </div>
        )}

        <div className="bulk-scroll" style={{ maxHeight: 620, overflowY: 'auto', paddingRight: 4 }}>
          {history.map((item) => (
            <button
              key={item.id}
              type="button"
              className="bulk-history-item"
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

export default function BulkEmailSender() {
  const [form, setForm] = useState({
    subject: '',
    tone: 'professional',
    context: '',
  });

  const [file, setFile] = useState(null);
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [history, setHistory] = useState([]);
  const [smtpConnected, setSmtpConnected] = useState(null);

  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [sending, setSending] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const tones = ['professional', 'friendly', 'formal', 'assertive', 'apologetic', 'persuasive'];

  const loadHistory = async () => {
    setLoadingHistory(true);

    try {
      const res = await api.get('/email/history');
      const bulkHistory = (res.data || []).filter((item) => item.batch_id);
      setHistory(bulkHistory);
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

  const uploadAndGenerate = async (e) => {
    e.preventDefault();

    if (!file) {
      alert('Please upload Excel file.');
      return;
    }

    setLoading(true);
    setEmails([]);
    setSelectedEmail(null);
    setEditMode(false);

    try {
      const fd = new FormData();
      fd.append('subject', form.subject);
      fd.append('tone', form.tone);
      fd.append('context', form.context);
      fd.append('file', file);

      const res = await api.post('/email/bulk/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const generatedEmails = (res.data.emails || []).map((email) => ({
        ...email,
        subject: email.subject || form.subject,
        generated_email: cleanEmailBody(email.generated_email || '', email.subject || form.subject),
      }));

      setEmails(generatedEmails);
      setSelectedEmail(generatedEmails[0] || null);

      alert(`Generated ${res.data.total} personalized emails.`);
      loadHistory();
    } catch (err) {
      alert(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateSelectedEmail = (field, value) => {
    if (!selectedEmail) return;

    const updated = {
      ...selectedEmail,
      [field]: value,
    };

    setSelectedEmail(updated);
    setEmails((prev) => prev.map((email) => (email.id === updated.id ? updated : email)));
  };

  const openHistoryItem = (email) => {
    const preparedEmail = {
      ...email,
      generated_email: cleanEmailBody(email.generated_email || '', email.subject),
    };

    setEmails([preparedEmail]);
    setSelectedEmail(preparedEmail);
    setEditMode(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectEmail = (email) => {
    setSelectedEmail(email);
    setEditMode(false);
  };

  const sendAll = async () => {
    if (!smtpConnected) {
      alert('Please connect your email account first from Email Settings.');
      return;
    }

    const draftEmails = emails.filter((email) => email.status !== 'sent');

    if (draftEmails.length === 0) {
      alert('No draft emails available to send.');
      return;
    }

    if (!window.confirm(`Send ${draftEmails.length} edited emails now?`)) return;

    setSending(true);

    try {
      const payload = draftEmails.map((email) => ({
        id: email.id,
        subject: email.subject,
        generated_email: cleanEmailBody(email.generated_email, email.subject),
      }));

      const res = await api.post('/email/bulk/send', payload);

      alert(`Bulk sending completed. Sent: ${res.data.sent}, Failed: ${res.data.failed}`);

      const resultMap = {};
      (res.data.results || []).forEach((result) => {
        resultMap[result.id] = result;
      });

      const updatedEmails = emails.map((email) => {
        const result = resultMap[email.id];
        if (!result) return email;

        return {
          ...email,
          status: result.status,
          error_message: result.status === 'failed' ? result.message : null,
        };
      });

      setEmails(updatedEmails);
      loadHistory();

      if (selectedEmail) {
        const updatedSelected = updatedEmails.find((email) => email.id === selectedEmail.id);
        setSelectedEmail(updatedSelected || null);
      }
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
        className="bulk-page"
        style={{
          minHeight: '100vh',
          background: C.pageBg,
          fontFamily: FONT,
          padding: '32px 36px 64px',
        }}
      >
        <div
          className="bulk-card"
          style={{
            padding: 28,
            marginBottom: 24,
            background:
              'linear-gradient(135deg, #FFFFFF 0%, #F8FAFF 45%, #EEF2FF 100%)',
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
                Bulk Email Sender
              </h1>

              <p style={{ fontSize: 14, color: C.textMuted, margin: '8px 0 0', maxWidth: 680 }}>
                Upload recipient data, generate personalized emails, review every message, and send
                professionally from your connected email account.
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
              <div className="bulk-card" style={{ padding: 16 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: C.textH }}>{emails.length}</div>
                <div style={{ fontSize: 12, color: C.textMuted, fontWeight: 700 }}>Generated</div>
              </div>

              <div className="bulk-card" style={{ padding: 16 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: C.successText }}>
                  {emails.filter((e) => e.status === 'sent').length}
                </div>
                <div style={{ fontSize: 12, color: C.textMuted, fontWeight: 700 }}>Sent</div>
              </div>

              <div className="bulk-card" style={{ padding: 16 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: C.primary }}>
                  {history.length}
                </div>
                <div style={{ fontSize: 12, color: C.textMuted, fontWeight: 700 }}>History</div>
              </div>
            </div>
          </div>
        </div>

        {!smtpConnected && (
          <div className="bulk-alert-error">
            Email sender is not connected. Please connect your email account from Email Settings.
          </div>
        )}

        {smtpConnected && (
          <div className="bulk-alert-success">
            Connected email account: <b>{smtpConnected.smtp_email}</b>
          </div>
        )}

        <div
          className="bulk-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '360px minmax(520px, 1fr) 380px',
            gap: 22,
            alignItems: 'start',
            width: '100%',
          }}
        >
          <div>
            <SectionLabel>Create Bulk Email</SectionLabel>

            <div className="bulk-card" style={{ padding: 22, marginBottom: 22 }}>
              <h2 style={{ fontSize: 17, fontWeight: 800, margin: '0 0 4px', color: C.textH }}>
                Upload & Generate
              </h2>

              <p style={{ fontSize: 12, color: C.textMuted, margin: '0 0 18px' }}>
                Use Excel data to generate personalized emails.
              </p>

              <form onSubmit={uploadAndGenerate}>
                <div style={{ marginBottom: 15 }}>
                  <label className="bulk-label">Subject</label>
                  <input
                    className="bulk-input"
                    name="subject"
                    value={form.subject}
                    onChange={handle}
                    required
                    placeholder="Example: Project Status Update"
                  />
                </div>

                <div style={{ marginBottom: 15 }}>
                  <label className="bulk-label">Tone</label>
                  <select className="bulk-select" name="tone" value={form.tone} onChange={handle}>
                    {tones.map((tone) => (
                      <option key={tone} value={tone}>
                        {tone.charAt(0).toUpperCase() + tone.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: 15 }}>
                  <label className="bulk-label">Email Context</label>
                  <textarea
                    className="bulk-textarea"
                    name="context"
                    value={form.context}
                    onChange={handle}
                    required
                    placeholder="Write the common email context. AI will personalize it using each recipient name and designation."
                    style={{ minHeight: 140, resize: 'vertical' }}
                  />
                </div>

                <div style={{ marginBottom: 18 }}>
                  <label className="bulk-label">Upload Excel File</label>
                  <input
                    className="bulk-input"
                    type="file"
                    accept=".xlsx,.xls,.xlsm"
                    onChange={(e) => setFile(e.target.files[0])}
                    required
                  />

                  <p style={{ fontSize: 12, color: C.textMuted, marginTop: 7 }}>
                    Required columns: name, email, designation
                  </p>
                </div>

                <button className="bulk-btn bulk-btn-primary" disabled={loading} style={{ width: '100%' }}>
                  {loading ? 'Generating Emails...' : 'Upload & Generate Preview'}
                </button>
              </form>
            </div>

            {emails.length > 0 && (
              <>
                <SectionLabel>Recipients</SectionLabel>

                <div className="bulk-card" style={{ padding: 22 }}>
                  <div className="bulk-scroll" style={{ maxHeight: 430, overflowY: 'auto', paddingRight: 4 }}>
                    {emails.map((email) => (
                      <button
                        key={email.id}
                        type="button"
                        className="bulk-recipient-item"
                        onClick={() => selectEmail(email)}
                        style={{
                          background: selectedEmail?.id === email.id ? C.primarySoft : '#FFFFFF',
                          border:
                            selectedEmail?.id === email.id
                              ? `1px solid ${C.primary}`
                              : `1px solid ${C.border}`,
                        }}
                      >
                        <div style={{ fontWeight: 800, color: C.textH, fontSize: 13 }}>
                          {email.recipient}
                        </div>

                        <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>
                          {email.recipient_email}
                        </div>

                        <div style={{ marginTop: 8 }}>
                          <StatusBadge status={email.status} />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <div>
            <SectionLabel>Email Preview</SectionLabel>

            <div className="bulk-card" style={{ minHeight: 640, padding: 22 }}>
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
                    Review content before sending.
                  </p>
                </div>

                {emails.length > 0 && (
                  <button
                    className="bulk-btn bulk-btn-primary"
                    onClick={sendAll}
                    disabled={sending || !smtpConnected}
                  >
                    {sending ? 'Sending...' : 'Send All Edited Emails'}
                  </button>
                )}
              </div>

              {!selectedEmail && (
                <div
                  style={{
                    padding: '80px 20px',
                    textAlign: 'center',
                    color: C.textLight,
                    fontSize: 13,
                    background: '#F9FAFB',
                    borderRadius: 18,
                    border: `1px dashed ${C.border}`,
                  }}
                >
                  Upload an Excel file and generate emails. Preview will appear here.
                </div>
              )}

              {selectedEmail && (
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
                      <b>To:</b> {selectedEmail.recipient} — {selectedEmail.recipient_email}
                    </p>

                    <p style={{ margin: '0 0 10px', fontSize: 13, color: C.textB }}>
                      <b>Designation:</b> {selectedEmail.designation || 'N/A'}
                    </p>

                    <StatusBadge status={selectedEmail.status} />

                    {selectedEmail.error_message && (
                      <div className="bulk-alert-error" style={{ marginTop: 12, marginBottom: 0 }}>
                        {selectedEmail.error_message}
                      </div>
                    )}
                  </div>

                  {!editMode ? (
                    <>
                      <div
                        style={{
                          border: `1px solid ${C.border}`,
                          borderRadius: 18,
                          background: '#fff',
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
                            {selectedEmail.subject}
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
                            {cleanEmailBody(selectedEmail.generated_email, selectedEmail.subject)}
                          </pre>
                        </div>
                      </div>

                      <button
                        className="bulk-btn bulk-btn-secondary"
                        onClick={() => setEditMode(true)}
                        disabled={selectedEmail.status === 'sent'}
                      >
                        Edit This Email
                      </button>
                    </>
                  ) : (
                    <>
                      <div style={{ marginBottom: 15 }}>
                        <label className="bulk-label">Edit Subject</label>
                        <input
                          className="bulk-input"
                          value={selectedEmail.subject || ''}
                          onChange={(e) => updateSelectedEmail('subject', e.target.value)}
                        />
                      </div>

                      <div style={{ marginBottom: 15 }}>
                        <label className="bulk-label">Edit Email Body</label>
                        <textarea
                          className="bulk-textarea"
                          value={selectedEmail.generated_email || ''}
                          onChange={(e) => updateSelectedEmail('generated_email', e.target.value)}
                          style={{ minHeight: 420, fontFamily: FONT, resize: 'vertical' }}
                        />
                      </div>

                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <button
                          className="bulk-btn bulk-btn-primary"
                          onClick={() => {
                            updateSelectedEmail(
                              'generated_email',
                              cleanEmailBody(selectedEmail.generated_email, selectedEmail.subject)
                            );

                            setEditMode(false);
                            alert('Edit saved in preview. Now click Send All Edited Emails.');
                          }}
                        >
                          Save Edit
                        </button>

                        <button className="bulk-btn bulk-btn-light" onClick={() => setEditMode(false)}>
                          Cancel
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          <BulkHistoryPanel
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