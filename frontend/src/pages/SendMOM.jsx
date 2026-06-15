import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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

  .send-mom-card {
    background: ${C.card};
    border: 1px solid ${C.border};
    border-radius: 20px;
    box-shadow: 0 16px 40px rgba(17, 24, 39, 0.06);
    animation: fadeUp 0.3s ease both;
  }

  .send-mom-input,
  .send-mom-select {
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

  .send-mom-input:focus,
  .send-mom-select:focus {
    border-color: ${C.primary};
    box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.12);
  }

  .send-mom-label {
    display: block;
    font-size: 12px;
    color: ${C.textMuted};
    font-weight: 700;
    margin-bottom: 7px;
  }

  .send-mom-btn {
    border: none;
    border-radius: 12px;
    padding: 11px 16px;
    font-size: 13px;
    font-weight: 800;
    cursor: pointer;
    font-family: ${FONT};
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: 0.18s ease;
  }

  .send-mom-btn:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  .send-mom-btn-primary {
    background: linear-gradient(135deg, #4F46E5, #2563EB);
    color: #fff;
    box-shadow: 0 10px 24px rgba(79, 70, 229, 0.26);
  }

  .send-mom-btn-secondary {
    background: ${C.primarySoft};
    color: ${C.primaryDark};
  }

  .send-mom-btn-danger {
    background: ${C.dangerBg};
    color: ${C.dangerText};
  }

  .send-mom-btn-light {
    background: #F9FAFB;
    color: ${C.textB};
    border: 1px solid ${C.border};
  }

  .send-mom-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .send-mom-section-label {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 14px;
  }

  .send-mom-section-label span:first-child {
    width: 34px;
    height: 3px;
    border-radius: 999px;
    background: linear-gradient(90deg, #4F46E5, #2563EB);
  }

  .send-mom-section-label span:last-child {
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${C.textMuted};
  }

  .mom-recipient-row {
    display: grid;
    grid-template-columns: 42px 1fr 1fr 1.2fr 42px;
    gap: 12px;
    align-items: end;
    background: #FFFFFF;
    border: 1px solid ${C.border};
    border-radius: 16px;
    padding: 14px;
    margin-bottom: 12px;
    transition: 0.18s ease;
  }

  .mom-recipient-row:hover {
    background: #F8FAFC;
    box-shadow: 0 10px 22px rgba(17, 24, 39, 0.04);
  }

  .mom-recipient-number {
    width: 32px;
    height: 32px;
    border-radius: 10px;
    background: ${C.primarySoft};
    color: ${C.primaryDark};
    display: grid;
    place-items: center;
    font-size: 13px;
    font-weight: 800;
    margin-bottom: 2px;
  }

  .selected-mom-excel-box {
    background: #F9FAFB;
    border: 1px solid ${C.border};
    border-radius: 16px;
    padding: 16px;
    margin: 18px 0;
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: center;
    flex-wrap: wrap;
  }

  .send-mom-alert-success,
  .send-mom-alert-error {
    padding: 13px 15px;
    border-radius: 14px;
    margin-bottom: 16px;
    font-size: 13px;
    font-weight: 700;
    border: 1px solid transparent;
    line-height: 1.6;
  }

  .send-mom-alert-success {
    background: ${C.successBg};
    color: ${C.successText};
    border-color: #A7F3D0;
  }

  .send-mom-alert-error {
    background: ${C.dangerBg};
    color: ${C.dangerText};
    border-color: #FECACA;
  }

  @media (max-width: 900px) {
    .mom-recipient-row {
      grid-template-columns: 1fr;
    }

    .send-mom-page {
      padding: 24px 18px 48px !important;
    }

    .send-mom-stats {
      grid-template-columns: 1fr !important;
      min-width: 100% !important;
    }
  }
`;

function SectionLabel({ children }) {
  return (
    <div className="send-mom-section-label">
      <span />
      <span>{children}</span>
    </div>
  );
}

export default function SendMOM() {
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef(null);

  const queryMeetingId = searchParams.get('meetingId') || '';

  const [history, setHistory] = useState([]);
  const [meetingId, setMeetingId] = useState(queryMeetingId);

  const [recipients, setRecipients] = useState([{ name: '', position: '', email: '' }]);

  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sendingManual, setSendingManual] = useState(false);
  const [sendingExcel, setSendingExcel] = useState(false);

  useEffect(() => {
    api
      .get('/meeting/history')
      .then((res) => setHistory(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        setError(err.response?.data?.detail || 'Failed to load MOM history');
      });
  }, []);

  const addRecipient = () => {
    setRecipients([...recipients, { name: '', position: '', email: '' }]);
  };

  const removeRecipient = (index) => {
    if (recipients.length === 1) {
      setRecipients([{ name: '', position: '', email: '' }]);
      return;
    }

    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const updateRecipient = (index, field, value) => {
    const updated = [...recipients];
    updated[index][field] = value;
    setRecipients(updated);
  };

  const handleEnterToAddRow = (e, index) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      const current = recipients[index];

      if ((current.name || current.position || current.email) && index === recipients.length - 1) {
        addRecipient();
      }
    }
  };

  const removeExcelFile = () => {
    setFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateRecipients = () => {
    const cleaned = recipients
      .map((r) => ({
        name: r.name.trim(),
        position: r.position.trim(),
        email: r.email.trim(),
      }))
      .filter((r) => r.email);

    if (!meetingId) {
      setError('Please select a MOM first.');
      return null;
    }

    if (cleaned.length === 0) {
      setError('Please add at least one recipient email.');
      return null;
    }

    return cleaned;
  };

  const sendManual = async () => {
    setMessage('');
    setError('');

    const cleanedRecipients = validateRecipients();
    if (!cleanedRecipients) return;

    setSendingManual(true);

    try {
      const fd = new FormData();
      fd.append('meeting_id', meetingId);
      fd.append('recipients', JSON.stringify(cleanedRecipients));

      const res = await api.post('/meeting/send', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessage(`MOM sending completed. Sent: ${res.data.sent}, Failed: ${res.data.failed.length}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send MOM.');
    } finally {
      setSendingManual(false);
    }
  };

  const sendExcel = async () => {
    setMessage('');
    setError('');

    if (!meetingId) {
      setError('Please select a MOM first.');
      return;
    }

    if (!file) {
      setError('Please choose an Excel file first.');
      return;
    }

    setSendingExcel(true);

    try {
      const fd = new FormData();
      fd.append('meeting_id', meetingId);
      fd.append('file', file);

      const res = await api.post('/meeting/send-excel', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessage(`Excel MOM sending completed. Sent: ${res.data.sent}, Failed: ${res.data.failed.length}`);
      removeExcelFile();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send Excel MOMs.');
    } finally {
      setSendingExcel(false);
    }
  };

  const resetForm = () => {
    setRecipients([{ name: '', position: '', email: '' }]);
    removeExcelFile();
    setMessage('');
    setError('');
  };

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      <div
        className="send-mom-page"
        style={{
          minHeight: '100vh',
          background: C.pageBg,
          fontFamily: FONT,
          padding: '32px 36px 64px',
        }}
      >
        <div
          className="send-mom-card"
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
                MOM Delivery
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
                Send Minutes of Meeting
              </h1>

              <p
                style={{
                  fontSize: 14,
                  color: C.textMuted,
                  margin: '8px 0 0',
                  maxWidth: 720,
                  lineHeight: 1.7,
                }}
              >
                Select a generated MOM and send it to one recipient, multiple recipients, or an
                imported Excel recipient list.
              </p>
            </div>

            <div
              className="send-mom-stats"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(90px, 1fr))',
                gap: 12,
                minWidth: 340,
              }}
            >
              <div className="send-mom-card" style={{ padding: 16 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: C.textH }}>
                  {history.length}
                </div>
                <div style={{ fontSize: 12, color: C.textMuted, fontWeight: 700 }}>
                  MOMs
                </div>
              </div>

              <div className="send-mom-card" style={{ padding: 16 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: C.primary }}>
                  {recipients.filter((r) => r.email.trim()).length}
                </div>
                <div style={{ fontSize: 12, color: C.textMuted, fontWeight: 700 }}>
                  Recipients
                </div>
              </div>

              <div className="send-mom-card" style={{ padding: 16 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: file ? C.successText : C.textH }}>
                  {file ? 'Excel' : 'Manual'}
                </div>
                <div style={{ fontSize: 12, color: C.textMuted, fontWeight: 700 }}>
                  Mode
                </div>
              </div>
            </div>
          </div>
        </div>

        {message && <div className="send-mom-alert-success">{message}</div>}
        {error && <div className="send-mom-alert-error">{error}</div>}

        <SectionLabel>MOM Delivery</SectionLabel>

        <div className="send-mom-card" style={{ maxWidth: 1120, padding: 24 }}>
          <div style={{ marginBottom: 22 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: C.textH, margin: 0 }}>
              Send MOM to Single / Multiple Emails
            </h2>

            <p style={{ fontSize: 13, color: C.textMuted, marginTop: 6, lineHeight: 1.7 }}>
              Add recipients manually or import an Excel file. A PDF version of the selected MOM
              will be attached automatically.
            </p>
          </div>

          <div style={{ marginBottom: 18 }}>
            <label className="send-mom-label">Select MOM</label>
            <select
              className="send-mom-select"
              value={meetingId}
              onChange={(e) => setMeetingId(e.target.value)}
            >
              <option value="">Choose MOM</option>
              {history.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.meeting_title} - {h.created_at ? new Date(h.created_at).toLocaleDateString() : ''}
                </option>
              ))}
            </select>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 14,
              alignItems: 'center',
              marginTop: 22,
              marginBottom: 16,
              flexWrap: 'wrap',
            }}
          >
            <div>
              <strong style={{ fontSize: 16, color: C.textH }}>Recipients</strong>
              <p style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>
                Name, position, and email stay aligned in the same row.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                type="button"
                className="send-mom-btn send-mom-btn-secondary"
                onClick={() => fileInputRef.current?.click()}
              >
                Import Excel
              </button>

              <button
                type="button"
                className="send-mom-btn send-mom-btn-secondary"
                onClick={addRecipient}
              >
                Add Recipient
              </button>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xlsm,.xltx,.xltm"
            onChange={(e) => setFile(e.target.files[0] || null)}
            style={{ display: 'none' }}
          />

          {file && (
            <div className="selected-mom-excel-box">
              <div>
                <strong style={{ color: C.textH }}>Selected Excel:</strong>{' '}
                <span style={{ color: C.textB }}>{file.name}</span>

                <p style={{ color: C.textMuted, fontSize: 12, margin: '5px 0 0' }}>
                  Required columns: <b>name</b>, <b>email</b>, <b>position</b> or <b>designation</b>.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="send-mom-btn send-mom-btn-primary"
                  onClick={sendExcel}
                  disabled={sendingExcel || !meetingId}
                >
                  {sendingExcel ? 'Sending...' : 'Send Excel MOMs'}
                </button>

                <button
                  type="button"
                  className="send-mom-btn send-mom-btn-danger"
                  onClick={removeExcelFile}
                  disabled={sendingExcel}
                >
                  Remove File
                </button>
              </div>
            </div>
          )}

          <div>
            {recipients.map((recipient, index) => (
              <div className="mom-recipient-row" key={index}>
                <div className="mom-recipient-number">{index + 1}</div>

                <div>
                  <label className="send-mom-label">Name</label>
                  <input
                    className="send-mom-input"
                    value={recipient.name}
                    onChange={(e) => updateRecipient(index, 'name', e.target.value)}
                    onKeyDown={(e) => handleEnterToAddRow(e, index)}
                    placeholder="e.g. Abhijit Das"
                  />
                </div>

                <div>
                  <label className="send-mom-label">Position</label>
                  <input
                    className="send-mom-input"
                    value={recipient.position}
                    onChange={(e) => updateRecipient(index, 'position', e.target.value)}
                    onKeyDown={(e) => handleEnterToAddRow(e, index)}
                    placeholder="e.g. Trainee"
                  />
                </div>

                <div>
                  <label className="send-mom-label">Email</label>
                  <input
                    className="send-mom-input"
                    type="email"
                    value={recipient.email}
                    onChange={(e) => updateRecipient(index, 'email', e.target.value)}
                    onKeyDown={(e) => handleEnterToAddRow(e, index)}
                    placeholder="name@example.com"
                  />
                </div>

                <button
                  type="button"
                  className="send-mom-btn send-mom-btn-danger"
                  onClick={() => removeRecipient(index)}
                  title="Remove recipient"
                  style={{ width: 38, height: 38, padding: 0 }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 18 }}>
            <button
              type="button"
              className="send-mom-btn send-mom-btn-primary"
              onClick={sendManual}
              disabled={sendingManual || !meetingId}
            >
              {sendingManual ? 'Sending...' : 'Send MOM'}
            </button>

            <button
              type="button"
              className="send-mom-btn send-mom-btn-light"
              onClick={resetForm}
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </>
  );
}