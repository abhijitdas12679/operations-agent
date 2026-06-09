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

function formatDate(dateValue) {
  if (!dateValue) return 'N/A';
  return new Date(dateValue).toLocaleString();
}

function EmailHistoryPanel({ history, loadingHistory, onSelectHistory, onRefreshHistory }) {
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
        <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
          📜 Email History
        </h2>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={onRefreshHistory}
          disabled={loadingHistory}
          style={{ padding: '8px 14px', fontSize: '13px', whiteSpace: 'nowrap' }}
        >
          {loadingHistory ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {history.length === 0 && !loadingHistory && (
        <p style={{ color: '#64748b', margin: 0 }}>No email history found yet.</p>
      )}

      <div style={{ maxHeight: '620px', overflowY: 'auto', paddingRight: '4px' }}>
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

              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
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
    <div className="page" style={{ maxWidth: 'none', width: '100%' }}>
      <h1 className="page-title">✉️ Single Email Generator</h1>

      {!smtpConnected && (
        <div className="alert alert-error">Please connect email sender from Email Settings.</div>
      )}

      {smtpConnected && (
        <div className="alert alert-success">
          Connected Email: <b>{smtpConnected.smtp_email}</b>
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
        <div className="card">
          <h2
            style={{
              fontSize: '18px',
              fontWeight: 800,
              marginBottom: '16px',
              color: '#0f172a',
            }}
          >
            Generate Email
          </h2>

          <form onSubmit={generate}>
            <div className="form-group">
              <label>Subject</label>
              <input
                name="subject"
                value={form.subject}
                onChange={handle}
                required
                placeholder="Example: Project Update"
              />
            </div>

            <div className="form-group">
              <label>Recipient Name / Role</label>
              <input
                name="recipient"
                value={form.recipient}
                onChange={handle}
                required
                placeholder="Example: Rahul Sharma"
              />
            </div>

            <div className="form-group">
              <label>Recipient Email</label>
              <input
                type="email"
                name="recipient_email"
                value={form.recipient_email}
                onChange={handle}
                required
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
              <label>Context / Purpose</label>
              <textarea
                name="context"
                value={form.context}
                onChange={handle}
                required
                placeholder="Describe the email purpose..."
                style={{ minHeight: '140px' }}
              />
            </div>

            <button className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Generating...' : '🤖 Generate Email'}
            </button>
          </form>
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
            <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
              Email Preview & Edit
            </h2>
          </div>

          {!result && <p style={{ color: '#64748b' }}>Generated email preview will appear here.</p>}

          {result && (
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
                  <b>To:</b> {result.recipient || 'N/A'} — {result.recipient_email || 'N/A'}
                </p>

                <p style={{ marginBottom: '8px', fontSize: '13px' }}>
                  <b>Created:</b> {formatDate(result.created_at)}
                </p>

                <StatusBadge status={result.status} />
              </div>

              {!editing ? (
                <>
                  <div
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '14px',
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
                        {result.subject}
                      </div>
                    </div>

                    <div style={{ padding: '20px', background: '#fff' }}>
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
                        {result.generated_email}
                      </pre>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setEditing(true)}
                      disabled={result.status === 'sent'}
                    >
                      ✏️ Edit Email
                    </button>

                    <button
                      className="btn btn-primary"
                      onClick={sendEmail}
                      disabled={sending || result.status === 'sent'}
                    >
                      {sending ? 'Sending...' : 'Send Email'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label>Edit Subject</label>
                    <input
                      value={result.subject || ''}
                      onChange={(e) => setResult({ ...result, subject: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Edit Email Body</label>
                    <textarea
                      value={result.generated_email || ''}
                      onChange={(e) => setResult({ ...result, generated_email: e.target.value })}
                      style={{ minHeight: '420px', fontFamily: 'inherit' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-primary" onClick={saveEdit} disabled={savingEdit}>
                      {savingEdit ? 'Saving...' : 'Save Edit'}
                    </button>

                    <button className="btn btn-secondary" onClick={() => setEditing(false)}>
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        <EmailHistoryPanel
          history={history}
          loadingHistory={loadingHistory}
          onSelectHistory={openHistoryItem}
          onRefreshHistory={loadHistory}
        />
      </div>
    </div>
  );
}