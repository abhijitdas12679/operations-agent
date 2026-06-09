import React, { useEffect, useState } from 'react';
import api from '../api';
import StatusBadge from '../components/email/StatusBadge';

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
    api.get('/email-automation/templates').then((res) => setTemplates(res.data));
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
    const fd = new FormData();
    fd.append('subject', email.subject);
    fd.append('generated_email', email.generated_email);

    const res = await api.put(`/email-automation/single/${email.id}`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    setEmail(res.data);
    alert('Saved');
  };

  const regenerate = async () => {
    const res = await api.post(`/email-automation/single/${email.id}/regenerate`);
    setEmail(res.data);
  };

  const uploadAttachment = async () => {
    if (!attachment) return alert('Select attachment first');

    const fd = new FormData();
    fd.append('file', attachment);

    await api.post(`/email-automation/single/${email.id}/attachments`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    alert('Attachment uploaded');
  };

  const send = async () => {
    await saveEdit();
    const res = await api.post(`/email-automation/single/${email.id}/send`);
    alert(res.data.message);
    setEmail({ ...email, status: res.data.status });
  };

  return (
    <div className="page">
      <h1 className="page-title">AI Email Automation</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 20 }}>
        <div className="card">
          <h2>Generate Single Email</h2>

          <form onSubmit={generate}>
            <div className="form-group">
              <label>Subject</label>
              <input name="subject" value={form.subject} onChange={change} required />
            </div>

            <div className="form-group">
              <label>Recipient Name</label>
              <input name="recipient_name" value={form.recipient_name} onChange={change} required />
            </div>

            <div className="form-group">
              <label>Recipient Email</label>
              <input type="email" name="recipient_email" value={form.recipient_email} onChange={change} required />
            </div>

            <div className="form-group">
              <label>Template</label>
              <select name="template_type" value={form.template_type} onChange={change}>
                <option value="">Custom</option>
                {templates.map((t) => (
                  <option key={t.key} value={t.key}>{t.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Tone</label>
              <select name="tone" value={form.tone} onChange={change}>
                <option>professional</option>
                <option>friendly</option>
                <option>formal</option>
                <option>assertive</option>
                <option>apologetic</option>
                <option>persuasive</option>
              </select>
            </div>

            <div className="form-group">
              <label>Context</label>
              <textarea name="context" value={form.context} onChange={change} required />
            </div>

            <div className="form-group">
              <label>Schedule Later</label>
              <input type="datetime-local" name="scheduled_at" value={form.scheduled_at} onChange={change} />
            </div>

            <button className="btn btn-primary" disabled={loading}>
              {loading ? 'Generating...' : 'Generate Preview'}
            </button>
          </form>
        </div>

        <div className="card">
          <h2>Email Preview</h2>

          {!email ? (
            <p>Generate an email to preview, edit, regenerate and send.</p>
          ) : (
            <>
              <p>
                <b>{email.recipient_name}</b> — {email.recipient_email}{' '}
                <StatusBadge status={email.status} />
              </p>

              <div className="form-group">
                <label>Subject</label>
                <input
                  value={email.subject}
                  onChange={(e) => setEmail({ ...email, subject: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Generated Content</label>
                <textarea
                  style={{ minHeight: 320 }}
                  value={email.generated_email}
                  onChange={(e) => setEmail({ ...email, generated_email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Attachment</label>
                <input
                  type="file"
                  accept=".pdf,.docx,.xlsx,.pptx"
                  onChange={(e) => setAttachment(e.target.files[0])}
                />
                <button type="button" className="btn btn-secondary" onClick={uploadAttachment}>
                  Upload Attachment
                </button>
              </div>

              <button className="btn btn-secondary" onClick={saveEdit}>Save Edit</button>
              <button className="btn btn-secondary" onClick={regenerate}>Regenerate</button>
              <button className="btn btn-primary" onClick={send}>Generate & Send</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}