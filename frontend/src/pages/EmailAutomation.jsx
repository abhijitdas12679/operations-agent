import React, { useEffect, useState } from 'react';
import api from '../api';
import StatusBadge from '../components/email/StatusBadge';

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

  .email-auto-card {
    background: ${C.card};
    border: 1px solid ${C.border};
    border-radius: 20px;
    box-shadow: 0 16px 40px rgba(17, 24, 39, 0.06);
    animation: fadeUp 0.3s ease both;
  }

  .email-auto-input,
  .email-auto-textarea,
  .email-auto-select {
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

  .email-auto-input:focus,
  .email-auto-textarea:focus,
  .email-auto-select:focus {
    border-color: ${C.primary};
    box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.12);
  }

  .email-auto-label {
    display: block;
    font-size: 12px;
    color: ${C.textMuted};
    font-weight: 700;
    margin-bottom: 7px;
  }

  .email-auto-btn {
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

  .email-auto-btn:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  .email-auto-btn-primary {
    background: linear-gradient(135deg, #4F46E5, #2563EB);
    color: #fff;
    box-shadow: 0 10px 24px rgba(79, 70, 229, 0.26);
  }

  .email-auto-btn-secondary {
    background: ${C.primarySoft};
    color: ${C.primaryDark};
  }

  .email-auto-btn-light {
    background: #F9FAFB;
    color: ${C.textB};
    border: 1px solid ${C.border};
  }

  .email-auto-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .email-auto-section-label {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 14px;
  }

  .email-auto-section-label span:first-child {
    width: 34px;
    height: 3px;
    border-radius: 999px;
    background: linear-gradient(90deg, #4F46E5, #2563EB);
  }

  .email-auto-section-label span:last-child {
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${C.textMuted};
  }

  .email-recipient-box {
    background: #F9FAFB;
    border: 1px solid ${C.border};
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 16px;
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

  .email-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 16px;
  }

  .email-spinner {
    width: 15px;
    height: 15px;
    border: 2px solid rgba(255,255,255,0.45);
    border-top-color: #fff;
    border-radius: 50%;
    animation: emailSpin 0.75s linear infinite;
  }

  @media (max-width: 950px) {
    .email-auto-grid {
      grid-template-columns: 1fr !important;
    }

    .email-auto-page {
      padding: 24px 18px 48px !important;
    }
  }
`;

function SectionLabel({ children }) {
  return (
    <div className="email-auto-section-label">
      <span />
      <span>{children}</span>
    </div>
  );
}

export default function EmailAutomation() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState(null);
  const [attachment, setAttachment] = useState(null);

  const [form, setForm] = useState({
    subject: '',
    recipient_name: '',
    recipient_email: '',
    tone: 'professional',
    template_type: '',
    context: '',
    scheduled_at: '',
  });

  useEffect(() => {
    api
      .get('/email-automation/templates')
      .then((res) => setTemplates(Array.isArray(res.data) ? res.data : []))
      .catch(() => setTemplates([]));
  }, []);

  const change = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const generate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fd = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (value) fd.append(key, value);
      });

      const res = await api.post('/email-automation/single/generate', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setEmail(res.data);
    } catch (err) {
      alert(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveEdit = async () => {
    if (!email) return;

    const fd = new FormData();
    fd.append('subject', email.subject || '');
    fd.append('generated_email', email.generated_email || '');

    const res = await api.put(`/email-automation/single/${email.id}`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    setEmail(res.data);
    alert('Saved successfully');
  };

  const regenerate = async () => {
    if (!email) return;

    const res = await api.post(`/email-automation/single/${email.id}/regenerate`);
    setEmail(res.data);
  };

  const uploadAttachment = async () => {
    if (!email) return alert('Generate email first');
    if (!attachment) return alert('Select attachment first');

    const fd = new FormData();
    fd.append('file', attachment);

    await api.post(`/email-automation/single/${email.id}/attachments`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    alert('Attachment uploaded successfully');
  };

  const send = async () => {
    if (!email) return;

    await saveEdit();

    const res = await api.post(`/email-automation/single/${email.id}/send`);
    alert(res.data.message);

    setEmail({
      ...email,
      status: res.data.status,
    });
  };

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      <div
        className="email-auto-page"
        style={{
          minHeight: '100vh',
          background: C.pageBg,
          fontFamily: FONT,
          padding: '32px 36px 64px',
        }}
      >
        <div
          className="email-auto-card"
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
                Generate professional emails, edit the content, upload attachments, schedule
                delivery, and send from one clean workspace.
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
              <div className="email-auto-card" style={{ padding: 16 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: C.textH }}>
                  {templates.length}
                </div>
                <div style={{ fontSize: 12, color: C.textMuted, fontWeight: 700 }}>
                  Templates
                </div>
              </div>

              <div className="email-auto-card" style={{ padding: 16 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: C.primary }}>
                  {email ? 1 : 0}
                </div>
                <div style={{ fontSize: 12, color: C.textMuted, fontWeight: 700 }}>
                  Generated
                </div>
              </div>

              <div className="email-auto-card" style={{ padding: 16 }}>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: email?.status === 'sent' ? C.successText : C.textH,
                  }}
                >
                  {email?.status === 'sent' ? 'Sent' : 'Draft'}
                </div>
                <div style={{ fontSize: 12, color: C.textMuted, fontWeight: 700 }}>
                  Status
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="email-auto-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(320px, 420px) minmax(0, 1fr)',
            gap: 22,
            alignItems: 'start',
          }}
        >
          <div>
            <SectionLabel>Create Email</SectionLabel>

            <div className="email-auto-card" style={{ padding: 22 }}>
              <h2 style={{ fontSize: 17, fontWeight: 800, margin: '0 0 4px', color: C.textH }}>
                Generate Single Email
              </h2>

              <p style={{ fontSize: 12, color: C.textMuted, margin: '0 0 18px' }}>
                Enter recipient details and context to create a polished email.
              </p>

              <form onSubmit={generate}>
                <div style={{ marginBottom: 15 }}>
                  <label className="email-auto-label">Subject</label>
                  <input
                    className="email-auto-input"
                    name="subject"
                    value={form.subject}
                    onChange={change}
                    required
                    placeholder="e.g. Project Status Update"
                  />
                </div>

                <div style={{ marginBottom: 15 }}>
                  <label className="email-auto-label">Recipient Name</label>
                  <input
                    className="email-auto-input"
                    name="recipient_name"
                    value={form.recipient_name}
                    onChange={change}
                    required
                    placeholder="e.g. Abhijit Das"
                  />
                </div>

                <div style={{ marginBottom: 15 }}>
                  <label className="email-auto-label">Recipient Email</label>
                  <input
                    className="email-auto-input"
                    type="email"
                    name="recipient_email"
                    value={form.recipient_email}
                    onChange={change}
                    required
                    placeholder="example@email.com"
                  />
                </div>

                <div style={{ marginBottom: 15 }}>
                  <label className="email-auto-label">Template</label>
                  <select
                    className="email-auto-select"
                    name="template_type"
                    value={form.template_type}
                    onChange={change}
                  >
                    <option value="">Custom</option>
                    {templates.map((t) => (
                      <option key={t.key} value={t.key}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: 15 }}>
                  <label className="email-auto-label">Tone</label>
                  <select
                    className="email-auto-select"
                    name="tone"
                    value={form.tone}
                    onChange={change}
                  >
                    <option value="professional">Professional</option>
                    <option value="friendly">Friendly</option>
                    <option value="formal">Formal</option>
                    <option value="assertive">Assertive</option>
                    <option value="apologetic">Apologetic</option>
                    <option value="persuasive">Persuasive</option>
                  </select>
                </div>

                <div style={{ marginBottom: 15 }}>
                  <label className="email-auto-label">Context</label>
                  <textarea
                    className="email-auto-textarea"
                    name="context"
                    value={form.context}
                    onChange={change}
                    required
                    style={{ minHeight: 145, resize: 'vertical' }}
                    placeholder="Write the email context. AI will convert it into a professional message."
                  />
                </div>

                <div style={{ marginBottom: 18 }}>
                  <label className="email-auto-label">Schedule Later</label>
                  <input
                    className="email-auto-input"
                    type="datetime-local"
                    name="scheduled_at"
                    value={form.scheduled_at}
                    onChange={change}
                  />
                </div>

                <button
                  className="email-auto-btn email-auto-btn-primary"
                  disabled={loading}
                  style={{ width: '100%' }}
                >
                  {loading ? (
                    <>
                      <span className="email-spinner" /> Generating...
                    </>
                  ) : (
                    'Generate Preview'
                  )}
                </button>
              </form>
            </div>
          </div>

          <div>
            <SectionLabel>Email Preview</SectionLabel>

            <div className="email-auto-card" style={{ padding: 22, minHeight: 640 }}>
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
                    Preview, Edit & Send
                  </h2>

                  <p style={{ fontSize: 12, color: C.textMuted, margin: '4px 0 0' }}>
                    Review and refine the generated email before sending.
                  </p>
                </div>
              </div>

              {!email ? (
                <div className="email-empty-state">
                  Generate an email to preview, edit, regenerate, upload attachments, and send.
                </div>
              ) : (
                <>
                  <div className="email-recipient-box">
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 12,
                        alignItems: 'center',
                        flexWrap: 'wrap',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 13, color: C.textB, marginBottom: 5 }}>
                          <b>{email.recipient_name}</b> — {email.recipient_email}
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            fontSize: 12,
                            color: C.textMuted,
                          }}
                        >
                          <span>Status:</span>
                          <StatusBadge status={email.status} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: 15 }}>
                    <label className="email-auto-label">Subject</label>
                    <input
                      className="email-auto-input"
                      value={email.subject || ''}
                      onChange={(e) =>
                        setEmail({
                          ...email,
                          subject: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div style={{ marginBottom: 15 }}>
                    <label className="email-auto-label">Generated Content</label>
                    <textarea
                      className="email-auto-textarea"
                      style={{ minHeight: 350, resize: 'vertical', lineHeight: 1.75 }}
                      value={email.generated_email || ''}
                      onChange={(e) =>
                        setEmail({
                          ...email,
                          generated_email: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div style={{ marginBottom: 15 }}>
                    <label className="email-auto-label">Attachment</label>
                    <input
                      className="email-auto-input"
                      type="file"
                      accept=".pdf,.docx,.xlsx,.pptx"
                      onChange={(e) => setAttachment(e.target.files[0])}
                    />

                    <p style={{ fontSize: 12, color: C.textMuted, margin: '7px 0 0' }}>
                      Supported files: PDF, DOCX, XLSX, PPTX
                    </p>
                  </div>

                  <div className="email-actions">
                    <button
                      type="button"
                      className="email-auto-btn email-auto-btn-secondary"
                      onClick={uploadAttachment}
                    >
                      Upload Attachment
                    </button>

                    <button
                      type="button"
                      className="email-auto-btn email-auto-btn-secondary"
                      onClick={saveEdit}
                    >
                      Save Edit
                    </button>

                    <button
                      type="button"
                      className="email-auto-btn email-auto-btn-light"
                      onClick={regenerate}
                    >
                      Regenerate
                    </button>

                    <button
                      type="button"
                      className="email-auto-btn email-auto-btn-primary"
                      onClick={send}
                    >
                      Send Email
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}