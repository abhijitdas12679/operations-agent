import React, { useEffect, useState } from 'react';
import api from '../api';
import StatusBadge from '../components/email/StatusBadge';

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

  .email-auto-card {
    background: ${C.card};
    border: 1px solid ${C.border};
    border-radius: 18px;
    box-shadow: 0 14px 42px rgba(124, 58, 237, 0.06);
    animation: fadeUp 0.35s ease both;
  }

  .email-auto-input,
  .email-auto-textarea,
  .email-auto-select {
    width: 100%;
    border: 1px solid #E5DEFF;
    background: #FFFFFF;
    border-radius: 12px;
    padding: 11px 13px;
    font-size: 13px;
    color: ${C.textH};
    outline: none;
    font-family: ${FONT};
    transition: border 0.16s ease, box-shadow 0.16s ease;
  }

  .email-auto-input:focus,
  .email-auto-textarea:focus,
  .email-auto-select:focus {
    border-color: ${C.primary};
    box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.10);
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
    padding: 10px 15px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    font-family: ${FONT};
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }

  .email-auto-btn:hover {
    transform: translateY(-1px);
  }

  .email-auto-btn-primary {
    background: linear-gradient(135deg, #7C3AED, #4F46E5);
    color: #fff;
    box-shadow: 0 8px 22px rgba(124, 58, 237, 0.25);
  }

  .email-auto-btn-secondary {
    background: ${C.primarySoft};
    color: ${C.primaryDark};
  }

  .email-auto-btn:disabled {
    opacity: 0.65;
    cursor: not-allowed;
    transform: none;
  }

  .email-auto-section-label {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 14px;
  }

  .email-auto-section-label span:first-child {
    width: 3px;
    height: 16px;
    border-radius: 2px;
    background: linear-gradient(180deg,#7C3AED,#4F46E5);
  }

  .email-auto-section-label span:last-child {
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: ${C.textLight};
  }

  .email-preview-box {
    background: #FFFFFF;
    border: 1px solid ${C.border};
    border-radius: 16px;
    overflow: hidden;
  }

  .email-preview-top {
    background: linear-gradient(135deg, #F5F3FF, #EEF2FF);
    border-bottom: 1px solid ${C.border};
    padding: 18px 20px;
  }

  .email-recipient-box {
    background: #FBFAFF;
    border: 1px solid ${C.border};
    border-radius: 14px;
    padding: 14px;
    margin-bottom: 16px;
  }

  .email-empty-state {
    padding: 70px 20px;
    text-align: center;
    color: ${C.textLight};
    font-size: 13px;
  }

  .email-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 16px;
  }

  @media (max-width: 950px) {
    .email-auto-grid {
      grid-template-columns: 1fr !important;
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
    alert('Saved');
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

    alert('Attachment uploaded');
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
            AI Email Automation ✉️
          </h1>

          <p style={{ fontSize: 13, color: C.textMuted, marginTop: 4 }}>
            Generate, edit, attach files, schedule, and send professional emails
          </p>
        </div>

        <div
          className="email-auto-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(320px, 420px) minmax(0, 1fr)',
            gap: 20,
            alignItems: 'start',
          }}
        >
          <div>
            <SectionLabel>Create Email</SectionLabel>

            <div className="email-auto-card" style={{ padding: 22 }}>
              <h2
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  marginBottom: 18,
                  color: C.textH,
                }}
              >
                Generate Single Email
              </h2>

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
                    style={{ minHeight: 135, resize: 'vertical' }}
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
                  {loading ? 'Generating...' : '🤖 Generate Preview'}
                </button>
              </form>
            </div>
          </div>

          <div>
            <SectionLabel>Email Preview</SectionLabel>

            <div className="email-auto-card" style={{ padding: 22, minHeight: 620 }}>
              <h2
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  marginBottom: 18,
                  color: C.textH,
                }}
              >
                Preview, Edit & Send
              </h2>

              {!email ? (
                <div className="email-empty-state">
                  Generate an email to preview, edit, regenerate and send.
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
                        <div style={{ fontSize: 13, color: C.textB, marginBottom: 4 }}>
                          <b>{email.recipient_name}</b> — {email.recipient_email}
                        </div>
                        <div style={{ fontSize: 12, color: C.textMuted }}>
                          Status: <StatusBadge status={email.status} />
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
                      style={{ minHeight: 330, resize: 'vertical' }}
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
                  </div>

                  <div className="email-actions">
                    <button
                      type="button"
                      className="email-auto-btn email-auto-btn-secondary"
                      onClick={uploadAttachment}
                    >
                      📎 Upload Attachment
                    </button>

                    <button
                      type="button"
                      className="email-auto-btn email-auto-btn-secondary"
                      onClick={saveEdit}
                    >
                      💾 Save Edit
                    </button>

                    <button
                      type="button"
                      className="email-auto-btn email-auto-btn-secondary"
                      onClick={regenerate}
                    >
                      🔄 Regenerate
                    </button>

                    <button
                      type="button"
                      className="email-auto-btn email-auto-btn-primary"
                      onClick={send}
                    >
                      📤 Generate & Send
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