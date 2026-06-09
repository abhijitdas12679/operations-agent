import React, { useEffect, useState } from 'react';
import api from '../api';

function StatusBadge({ status }) {
  const color =
    status === 'sent' ? '#16a34a' : status === 'failed' ? '#dc2626' : '#64748b';

  return (
    <span
      style={{
        background: color,
        color: '#fff',
        padding: '4px 9px',
        borderRadius: '999px',
        fontSize: '12px',
        fontWeight: 700,
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
    <div className="card" style={{ height: 'fit-content' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        <h2
          style={{
            fontSize: '18px',
            fontWeight: 800,
            margin: 0,
            color: '#0f172a',
          }}
        >
          📜 Email History
        </h2>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={onRefreshHistory}
          disabled={loadingHistory}
          style={{
            padding: '8px 14px',
            fontSize: '13px',
            whiteSpace: 'nowrap',
          }}
        >
          {loadingHistory ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {history.length === 0 && !loadingHistory && (
        <p style={{ color: '#64748b', margin: 0 }}>No bulk email history found yet.</p>
      )}

      <div
        style={{
          maxHeight: '620px',
          overflowY: 'auto',
          paddingRight: '4px',
        }}
      >
        {history.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectHistory(item)}
            style={{
              width: '100%',
              textAlign: 'left',
              background: '#fff',
              border: '1px solid #dbe4f0',
              borderRadius: '14px',
              padding: '14px',
              marginBottom: '12px',
              cursor: 'pointer',
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: '12px',
              alignItems: 'start',
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 800,
                  color: '#1f538a',
                  fontSize: '14px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginBottom: '5px',
                }}
              >
                {item.subject || 'No Subject'}
              </div>

              <div
                style={{
                  fontSize: '12px',
                  color: '#475569',
                  lineHeight: 1.4,
                  wordBreak: 'break-word',
                }}
              >
                {item.recipient || 'N/A'} • {item.recipient_email || 'N/A'}
              </div>

              <div
                style={{
                  fontSize: '12px',
                  color: '#94a3b8',
                  marginTop: '4px',
                }}
              >
                {formatDate(item.created_at)}
              </div>
            </div>

            <StatusBadge status={item.status} />
          </button>
        ))}
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

    if (!window.confirm(`Send ${draftEmails.length} edited emails now?`)) {
      return;
    }

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
    <div
      className="page"
      style={{
        maxWidth: 'none',
        width: '100%',
      }}
    >
      <h1 className="page-title">📨 Bulk AI Email Sender</h1>

      {!smtpConnected && (
        <div className="alert alert-error">
          Email sender is not connected. Go to Email Settings first.
        </div>
      )}

      {smtpConnected && (
        <div className="alert alert-success">
          Sending emails from: <b>{smtpConnected.smtp_email}</b>
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '340px minmax(520px, 1fr) 380px',
          gap: '24px',
          alignItems: 'start',
          width: '100%',
        }}
      >
        <div>
          <div className="card" style={{ marginBottom: '22px' }}>
            <h2
              style={{
                fontSize: '18px',
                fontWeight: 800,
                marginBottom: '16px',
                color: '#0f172a',
              }}
            >
              Upload Excel & Generate Emails
            </h2>

            <form onSubmit={uploadAndGenerate}>
              <div className="form-group">
                <label>Subject</label>
                <input
                  name="subject"
                  value={form.subject}
                  onChange={handle}
                  required
                  placeholder="Example: Project Status Update"
                />
              </div>

              <div className="form-group">
                <label>Tone</label>
                <select name="tone" value={form.tone} onChange={handle}>
                  {tones.map((tone) => (
                    <option key={tone} value={tone}>
                      {tone.charAt(0).toUpperCase() + tone.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Email Context</label>
                <textarea
                  name="context"
                  value={form.context}
                  onChange={handle}
                  required
                  placeholder="Write the common email context. AI will personalize it using each recipient name and designation."
                  style={{ minHeight: '120px' }}
                />
              </div>

              <div className="form-group">
                <label>Upload Excel File</label>
                <input
                  type="file"
                  accept=".xlsx,.xls,.xlsm"
                  onChange={(e) => setFile(e.target.files[0])}
                  required
                />
                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
                  Required columns: name, email, designation
                </p>
              </div>

              <button className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
                {loading ? 'Generating...' : 'Upload & Generate Preview'}
              </button>
            </form>
          </div>

          {emails.length > 0 && (
            <div className="card">
              <h2 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '14px' }}>
                Recipients
              </h2>

              <div style={{ maxHeight: '430px', overflowY: 'auto', paddingRight: '4px' }}>
                {emails.map((email) => (
                  <button
                    key={email.id}
                    type="button"
                    onClick={() => selectEmail(email)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      background: selectedEmail?.id === email.id ? '#eef5ff' : '#fff',
                      border:
                        selectedEmail?.id === email.id
                          ? '1px solid #1f538a'
                          : '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '12px',
                      marginBottom: '10px',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontWeight: 800, color: '#1f538a' }}>{email.recipient}</div>

                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                      {email.recipient_email}
                    </div>

                    <div style={{ marginTop: '8px' }}>
                      <StatusBadge status={email.status} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="card" style={{ minHeight: '620px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <h2
              style={{
                fontSize: '18px',
                fontWeight: 800,
                margin: 0,
                color: '#0f172a',
              }}
            >
              Email Preview & Edit
            </h2>

            {emails.length > 0 && (
              <button
                className="btn btn-primary"
                onClick={sendAll}
                disabled={sending || !smtpConnected}
                style={{ whiteSpace: 'nowrap' }}
              >
                {sending ? 'Sending...' : 'Send All Edited Emails'}
              </button>
            )}
          </div>

          {!selectedEmail && (
            <p style={{ color: '#64748b' }}>
              Upload Excel file and generate emails. Preview will appear here.
            </p>
          )}

          {selectedEmail && (
            <>
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '14px',
                  marginBottom: '16px',
                }}
              >
                <p style={{ marginBottom: '6px', fontSize: '13px' }}>
                  <b>To:</b> {selectedEmail.recipient} — {selectedEmail.recipient_email}
                </p>

                <p style={{ marginBottom: '8px', fontSize: '13px' }}>
                  <b>Designation:</b> {selectedEmail.designation || 'N/A'}
                </p>

                <StatusBadge status={selectedEmail.status} />

                {selectedEmail.error_message && (
                  <div className="alert alert-error" style={{ marginTop: '10px' }}>
                    {selectedEmail.error_message}
                  </div>
                )}
              </div>

              {!editMode ? (
                <>
                  <div
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '14px',
                      background: '#fff',
                      overflow: 'hidden',
                      marginBottom: '16px',
                    }}
                  >
                    <div
                      style={{
                        background: '#eef5ff',
                        borderBottom: '1px solid #dbeafe',
                        padding: '16px 20px',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          color: '#64748b',
                          marginBottom: '6px',
                        }}
                      >
                        SUBJECT
                      </div>

                      <div style={{ fontSize: '22px', fontWeight: 800, color: '#1f538a' }}>
                        {selectedEmail.subject}
                      </div>
                    </div>

                    <div style={{ padding: '20px' }}>
                      <div
                        style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          color: '#64748b',
                          marginBottom: '14px',
                        }}
                      >
                        EMAIL BODY
                      </div>

                      <pre
                        style={{
                          whiteSpace: 'pre-wrap',
                          fontFamily: 'inherit',
                          fontSize: '14px',
                          lineHeight: 1.8,
                          color: '#1e293b',
                          margin: 0,
                        }}
                      >
                        {cleanEmailBody(selectedEmail.generated_email, selectedEmail.subject)}
                      </pre>
                    </div>
                  </div>

                  <button
                    className="btn btn-secondary"
                    onClick={() => setEditMode(true)}
                    disabled={selectedEmail.status === 'sent'}
                  >
                    ✏️ Edit This Email
                  </button>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label>Edit Subject</label>
                    <input
                      value={selectedEmail.subject || ''}
                      onChange={(e) => updateSelectedEmail('subject', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Edit Email Body</label>
                    <textarea
                      value={selectedEmail.generated_email || ''}
                      onChange={(e) => updateSelectedEmail('generated_email', e.target.value)}
                      style={{ minHeight: '420px', fontFamily: 'inherit' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      className="btn btn-primary"
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

                    <button className="btn btn-secondary" onClick={() => setEditMode(false)}>
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        <BulkHistoryPanel
          history={history}
          loadingHistory={loadingHistory}
          onSelectHistory={openHistoryItem}
          onRefreshHistory={loadHistory}
        />
      </div>
    </div>
  );
}