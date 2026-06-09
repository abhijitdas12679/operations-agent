import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';

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
      .then((res) => setHistory(res.data))
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

      if (
        (current.name || current.position || current.email) &&
        index === recipients.length - 1
      ) {
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

      setMessage(
        `Report sending completed. Sent: ${res.data.sent}, Failed: ${res.data.failed.length}`
      );
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

      setMessage(
        `Excel sending completed. Sent: ${res.data.sent}, Failed: ${res.data.failed.length}`
      );

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
    <div className="page">
      <h1 className="page-title">📤 Send Report</h1>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="card" style={{ maxWidth: '1120px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '6px' }}>
            Send to Single / Multiple Emails
          </h2>

          <p style={{ fontSize: '13px', color: '#6b7c93' }}>
            Add recipients manually or import an Excel file. A PDF version of the selected
            report will be attached automatically.
          </p>
        </div>

        <div className="form-group">
          <label>Select Report</label>
          <select value={reportId} onChange={(e) => setReportId(e.target.value)}>
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
            gap: '14px',
            alignItems: 'center',
            marginTop: '22px',
            marginBottom: '16px',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <strong style={{ fontSize: '17px' }}>Recipients</strong>
            <p style={{ fontSize: '12px', color: '#6b7c93', marginTop: '4px' }}>
              Name, position and email stay aligned in the same row.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => fileInputRef.current?.click()}
            >
              📥 Import Excel
            </button>

            <button type="button" className="btn btn-secondary" onClick={addRecipient}>
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
              <strong>📊 Selected Excel:</strong> {file.name}
              <p>
                Required columns: <b>name</b>, <b>email</b>, <b>position</b> or{' '}
                <b>designation</b>.
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '10px',
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              <button
                type="button"
                className="btn btn-primary"
                onClick={sendExcel}
                disabled={sendingExcel || !reportId}
              >
                {sendingExcel ? 'Sending...' : '📤 Send Excel Reports'}
              </button>

              <button
                type="button"
                className="btn btn-danger"
                onClick={removeExcelFile}
                disabled={sendingExcel}
              >
                🗑 Remove File
              </button>
            </div>
          </div>
        )}

        <div className="recipient-list">
          {recipients.map((recipient, index) => (
            <div className="recipient-row" key={index}>
              <div className="recipient-number">{index + 1}</div>

              <div className="recipient-field">
                <label>Name</label>
                <input
                  value={recipient.name}
                  onChange={(e) => updateRecipient(index, 'name', e.target.value)}
                  onKeyDown={(e) => handleEnterToAddRow(e, index)}
                  placeholder="e.g. Abhijit Das"
                />
              </div>

              <div className="recipient-field">
                <label>Position</label>
                <input
                  value={recipient.position}
                  onChange={(e) => updateRecipient(index, 'position', e.target.value)}
                  onKeyDown={(e) => handleEnterToAddRow(e, index)}
                  placeholder="e.g. Trainee"
                />
              </div>

              <div className="recipient-field">
                <label>Email</label>
                <input
                  type="email"
                  value={recipient.email}
                  onChange={(e) => updateRecipient(index, 'email', e.target.value)}
                  onKeyDown={(e) => handleEnterToAddRow(e, index)}
                  placeholder="name@example.com"
                />
              </div>

              <button
                type="button"
                className="recipient-remove-btn"
                onClick={() => removeRecipient(index)}
                title="Remove recipient"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={sendManual}
            disabled={sendingManual || !reportId}
          >
            {sendingManual ? 'Sending...' : '📤 Send Report'}
          </button>

          <button type="button" className="btn btn-secondary" onClick={resetForm}>
            🔄 Reset
          </button>
        </div>
      </div>
    </div>
  );
}