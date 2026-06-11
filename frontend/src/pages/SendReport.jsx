import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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

  .send-report-card {
    background: ${C.card};
    border: 1px solid ${C.border};
    border-radius: 18px;
    box-shadow: 0 14px 42px rgba(124, 58, 237, 0.06);
    animation: fadeUp 0.35s ease both;
  }

  .send-report-input,
  .send-report-select {
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

  .send-report-input:focus,
  .send-report-select:focus {
    border-color: ${C.primary};
    box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.10);
  }

  .send-report-label {
    display: block;
    font-size: 12px;
    color: ${C.textMuted};
    font-weight: 700;
    margin-bottom: 7px;
  }

  .send-report-btn {
    border: none;
    border-radius: 12px;
    padding: 10px 15px;
    font-size: 13px;
    font-weight: 800;
    cursor: pointer;
    font-family: ${FONT};
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
  }

  .send-report-btn-primary {
    background: linear-gradient(135deg, #7C3AED, #4F46E5);
    color: #fff;
    box-shadow: 0 8px 22px rgba(124, 58, 237, 0.25);
  }

  .send-report-btn-secondary {
    background: ${C.primarySoft};
    color: ${C.primaryDark};
  }

  .send-report-btn-danger {
    background: #FEE2E2;
    color: #B91C1C;
  }

  .send-report-btn:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  .send-report-section-label {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 14px;
  }

  .send-report-section-label span:first-child {
    width: 3px;
    height: 16px;
    border-radius: 2px;
    background: linear-gradient(180deg,#7C3AED,#4F46E5);
  }

  .send-report-section-label span:last-child {
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: ${C.textLight};
  }

  .recipient-row {
    display: grid;
    grid-template-columns: 42px 1fr 1fr 1.2fr 42px;
    gap: 12px;
    align-items: end;
    background: #FBFAFF;
    border: 1px solid ${C.border};
    border-radius: 16px;
    padding: 14px;
    margin-bottom: 12px;
  }

  .recipient-number {
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

  .selected-excel-box {
    background: #FBFAFF;
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

  @media (max-width: 900px) {
    .recipient-row {
      grid-template-columns: 1fr;
    }
  }
`;

function SectionLabel({ children }) {
  return (
    <div className="send-report-section-label">
      <span />
      <span>{children}</span>
    </div>
  );
}

export default function SendReport() {
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef(null);

  const queryReportId = searchParams.get('reportId') || '';

  const [history, setHistory] = useState([]);
  const [reportId, setReportId] = useState(queryReportId);

  const [recipients, setRecipients] = useState([
    { name: '', position: '', email: '' },
  ]);

  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sendingManual, setSendingManual] = useState(false);
  const [sendingExcel, setSendingExcel] = useState(false);

  useEffect(() => {
    api
      .get('/report/history')
      .then((res) => setHistory(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        setError(err.response?.data?.detail || 'Failed to load report history');
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

    if (!reportId) {
      setError('Please select a report first.');
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
      fd.append('report_id', reportId);
      fd.append('recipients', JSON.stringify(cleanedRecipients));

      const res = await api.post('/report/send', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessage(`Report sending completed. Sent: ${res.data.sent}, Failed: ${res.data.failed.length}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send report.');
    } finally {
      setSendingManual(false);
    }
  };

  const sendExcel = async () => {
    setMessage('');
    setError('');

    if (!reportId) {
      setError('Please select a report first.');
      return;
    }

    if (!file) {
      setError('Please choose an Excel file first.');
      return;
    }

    setSendingExcel(true);

    try {
      const fd = new FormData();
      fd.append('report_id', reportId);
      fd.append('file', file);

      const res = await api.post('/report/send-excel', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessage(`Excel sending completed. Sent: ${res.data.sent}, Failed: ${res.data.failed.length}`);
      removeExcelFile();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send Excel reports.');
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
            Send Report 📤
          </h1>

          <p style={{ fontSize: 13, color: C.textMuted, marginTop: 4 }}>
            Send generated reports manually or by importing recipient details from Excel.
          </p>
        </div>

        {message && (
          <div
            style={{
              background: '#ECFDF5',
              color: '#047857',
              padding: 12,
              borderRadius: 12,
              marginBottom: 14,
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {message}
          </div>
        )}

        {error && (
          <div
            style={{
              background: '#FEE2E2',
              color: '#991B1B',
              padding: 12,
              borderRadius: 12,
              marginBottom: 14,
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {error}
          </div>
        )}

        <SectionLabel>Report Delivery</SectionLabel>

        <div className="send-report-card" style={{ maxWidth: 1120, padding: 24 }}>
          <div style={{ marginBottom: 22 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: C.textH, margin: 0 }}>
              Send to Single / Multiple Emails
            </h2>

            <p style={{ fontSize: 13, color: C.textMuted, marginTop: 6, lineHeight: 1.6 }}>
              Add recipients manually or import an Excel file. A PDF version of the selected report will be attached automatically.
            </p>
          </div>

          <div style={{ marginBottom: 18 }}>
            <label className="send-report-label">Select Report</label>
            <select
              className="send-report-select"
              value={reportId}
              onChange={(e) => setReportId(e.target.value)}
            >
              <option value="">Choose report</option>
              {history.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.team_name} - {h.date}
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
                Name, position and email stay aligned in the same row.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                type="button"
                className="send-report-btn send-report-btn-secondary"
                onClick={() => fileInputRef.current?.click()}
              >
                📥 Import Excel
              </button>

              <button
                type="button"
                className="send-report-btn send-report-btn-secondary"
                onClick={addRecipient}
              >
                ➕ Add Recipient
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
            <div className="selected-excel-box">
              <div>
                <strong style={{ color: C.textH }}>📊 Selected Excel:</strong>{' '}
                <span style={{ color: C.textB }}>{file.name}</span>
                <p style={{ color: C.textMuted, fontSize: 12, margin: '5px 0 0' }}>
                  Required columns: <b>name</b>, <b>email</b>, <b>position</b> or <b>designation</b>.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="send-report-btn send-report-btn-primary"
                  onClick={sendExcel}
                  disabled={sendingExcel || !reportId}
                >
                  {sendingExcel ? 'Sending...' : '📤 Send Excel Reports'}
                </button>

                <button
                  type="button"
                  className="send-report-btn send-report-btn-danger"
                  onClick={removeExcelFile}
                  disabled={sendingExcel}
                >
                  🗑 Remove File
                </button>
              </div>
            </div>
          )}

          <div>
            {recipients.map((recipient, index) => (
              <div className="recipient-row" key={index}>
                <div className="recipient-number">{index + 1}</div>

                <div>
                  <label className="send-report-label">Name</label>
                  <input
                    className="send-report-input"
                    value={recipient.name}
                    onChange={(e) => updateRecipient(index, 'name', e.target.value)}
                    onKeyDown={(e) => handleEnterToAddRow(e, index)}
                    placeholder="e.g. Abhijit Das"
                  />
                </div>

                <div>
                  <label className="send-report-label">Position</label>
                  <input
                    className="send-report-input"
                    value={recipient.position}
                    onChange={(e) => updateRecipient(index, 'position', e.target.value)}
                    onKeyDown={(e) => handleEnterToAddRow(e, index)}
                    placeholder="e.g. Trainee"
                  />
                </div>

                <div>
                  <label className="send-report-label">Email</label>
                  <input
                    className="send-report-input"
                    type="email"
                    value={recipient.email}
                    onChange={(e) => updateRecipient(index, 'email', e.target.value)}
                    onKeyDown={(e) => handleEnterToAddRow(e, index)}
                    placeholder="name@example.com"
                  />
                </div>

                <button
                  type="button"
                  className="send-report-btn send-report-btn-danger"
                  onClick={() => removeRecipient(index)}
                  title="Remove recipient"
                  style={{ width: 38, height: 38, padding: 0 }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 18 }}>
            <button
              type="button"
              className="send-report-btn send-report-btn-primary"
              onClick={sendManual}
              disabled={sendingManual || !reportId}
            >
              {sendingManual ? 'Sending...' : '📤 Send Report'}
            </button>

            <button
              type="button"
              className="send-report-btn send-report-btn-secondary"
              onClick={resetForm}
            >
              🔄 Reset
            </button>
          </div>
        </div>
      </div>
    </>
  );
}