import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import api from '../api';

const FONT = "'Inter', 'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif";

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  /* ── Light tokens ── */
  :root {
    --be-bg:            #F8FAFC;
    --be-card:          #FFFFFF;
    --be-border:        #E2E8F0;
    --be-border-strong: rgba(15,23,42,0.12);

    --be-text-h:        #0F172A;
    --be-text-b:        #334155;
    --be-text-muted:    #64748B;
    --be-text-light:    #94A3B8;

    --be-primary:       #4F46E5;
    --be-primary-dark:  #3730A3;
    --be-primary-soft:  #EEF2FF;

    --be-success-bg:    #ECFDF5;
    --be-success-text:  #065F46;
    --be-success-bdr:   rgba(6,95,70,0.16);

    --be-danger-bg:     #FEF2F2;
    --be-danger-text:   #991B1B;
    --be-danger-bdr:    rgba(153,27,27,0.16);

    --be-subtle:        #F8FAFC;
    --be-input-bg:      #FFFFFF;
    --be-select-opt-bg: #FFFFFF;
    --be-select-opt-fg: #0F172A;
    --be-select-foc:    #EEF2FF;

    --be-hero-grad:     linear-gradient(135deg,#FFFFFF 0%,#F8FAFF 45%,#EEF2FF 100%);
    --be-hero-pill-bg:  #EEF2FF;
    --be-hero-pill-txt: #3730A3;

    --be-recip-sel-bg:  #EEF2FF;
    --be-recip-sel-bdr: #4F46E5;

    --be-shadow:        rgba(15,23,42,0.06);
    --be-shadow-hover:  rgba(17,24,39,0.05);
    --be-focus-ring:    rgba(79,70,229,0.12);

    --be-scroll-thumb:  #CBD5E1;

    --be-stat-sent-txt: #065F46;
    --be-stat-hist-txt: #4F46E5;
  }

  /* ── Dark tokens ── */
  [data-theme="dark"] {
    --be-bg:            #0A0F1A;
    --be-card:          #111827;
    --be-border:        rgba(255,255,255,0.08);
    --be-border-strong: rgba(255,255,255,0.14);

    --be-text-h:        #F1F5F9;
    --be-text-b:        #CBD5E1;
    --be-text-muted:    #94A3B8;
    --be-text-light:    #475569;

    --be-primary:       #818CF8;
    --be-primary-dark:  #A5B4FC;
    --be-primary-soft:  rgba(129,140,248,0.15);

    --be-success-bg:    rgba(20,184,166,0.12);
    --be-success-text:  #5EEAD4;
    --be-success-bdr:   rgba(20,184,166,0.2);

    --be-danger-bg:     rgba(248,113,113,0.1);
    --be-danger-text:   #F87171;
    --be-danger-bdr:    rgba(248,113,113,0.2);

    --be-subtle:        #1E2433;
    --be-input-bg:      #1E2433;
    --be-select-opt-bg: #1E2433;
    --be-select-opt-fg: #F1F5F9;
    --be-select-foc:    rgba(129,140,248,0.15);

    --be-hero-grad:     linear-gradient(135deg,#111827 0%,#161f30 45%,#1a1f35 100%);
    --be-hero-pill-bg:  rgba(129,140,248,0.15);
    --be-hero-pill-txt: #A5B4FC;

    --be-recip-sel-bg:  rgba(129,140,248,0.15);
    --be-recip-sel-bdr: #818CF8;

    --be-shadow:        rgba(0,0,0,0.3);
    --be-shadow-hover:  rgba(0,0,0,0.4);
    --be-focus-ring:    rgba(129,140,248,0.15);

    --be-scroll-thumb:  #334155;

    --be-stat-sent-txt: #5EEAD4;
    --be-stat-hist-txt: #818CF8;
  }

  body { margin: 0; background: var(--be-bg); transition: background 0.3s ease; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .bulk-card {
    background: var(--be-card);
    border: 1px solid var(--be-border);
    border-radius: 20px;
    box-shadow: 0 16px 40px var(--be-shadow);
    animation: fadeUp 0.3s ease both;
    transition: background 0.3s ease, border-color 0.3s ease;
  }

  .bulk-input,
  .bulk-textarea,
  .bulk-select {
    width: 100%;
    border: 1px solid var(--be-border);
    background: var(--be-input-bg);
    border-radius: 12px;
    padding: 12px 14px;
    font-size: 13px;
    color: var(--be-text-h);
    outline: none;
    font-family: ${FONT};
    transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.3s ease, color 0.3s ease;
  }

  .bulk-input:focus,
  .bulk-textarea:focus,
  .bulk-select:focus {
    border-color: var(--be-primary);
    box-shadow: 0 0 0 4px var(--be-focus-ring);
  }

  .bulk-input::placeholder,
  .bulk-textarea::placeholder { color: var(--be-text-muted); }

  .bulk-label {
    display: block;
    font-size: 12px;
    color: var(--be-text-muted);
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

  .bulk-btn:hover:not(:disabled) { transform: translateY(-1px); }

  .bulk-btn-primary {
    background: linear-gradient(135deg,#4F46E5,#2563EB);
    color: #fff;
    box-shadow: 0 10px 24px rgba(79,70,229,0.26);
  }

  .bulk-btn-secondary {
    background: var(--be-primary-soft);
    color: var(--be-primary-dark);
  }

  .bulk-btn-light {
    background: var(--be-subtle);
    color: var(--be-text-b);
    border: 1px solid var(--be-border);
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
    background: linear-gradient(90deg,#4F46E5,#2563EB);
  }

  .bulk-section-label span:last-child {
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--be-text-muted);
  }

  .bulk-history-item,
  .bulk-recipient-item {
    width: 100%;
    text-align: left;
    border: 1px solid var(--be-border);
    border-radius: 16px;
    padding: 14px;
    margin-bottom: 10px;
    cursor: pointer;
    background: var(--be-card);
    transition: background 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease;
    font-family: ${FONT};
    color: var(--be-text-h);
  }

  .bulk-history-item:hover,
  .bulk-recipient-item:hover {
    background: var(--be-subtle);
    transform: translateY(-1px);
    box-shadow: 0 10px 22px var(--be-shadow-hover);
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
    background: var(--be-danger-bg);
    color: var(--be-danger-text);
    border-color: var(--be-danger-bdr);
  }

  .bulk-alert-success {
    background: var(--be-success-bg);
    color: var(--be-success-text);
    border-color: var(--be-success-bdr);
  }

  .formatted-bulk-preview {
    min-height: 420px;
    padding: 18px;
    border: 1px solid var(--be-border);
    border-radius: 14px;
    background: var(--be-subtle);
    overflow: auto;
    line-height: 1.8;
    font-size: 14px;
    color: var(--be-text-b);
    transition: background 0.3s ease, border-color 0.3s ease, color 0.3s ease;
  }

  .formatted-bulk-preview p { margin: 0 0 12px; }

  .formatted-bulk-preview ul,
  .formatted-bulk-preview ol { margin: 10px 0 14px 22px; padding: 0; }

  .formatted-bulk-preview li { margin-bottom: 6px; }

  .formatted-bulk-preview strong,
  .formatted-bulk-preview b { color: var(--be-text-h); font-weight: 800; }

  .bulk-scroll::-webkit-scrollbar { width: 6px; }

  .bulk-scroll::-webkit-scrollbar-thumb {
    background: var(--be-scroll-thumb);
    border-radius: 999px;
  }

  .bulk-info-block {
    background: var(--be-subtle);
    border: 1px solid var(--be-border);
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 16px;
    transition: background 0.3s ease, border-color 0.3s ease;
  }

  .bulk-empty-state {
    padding: 80px 20px;
    text-align: center;
    color: var(--be-text-light);
    font-size: 13px;
    background: var(--be-subtle);
    border-radius: 18px;
    border: 1px dashed var(--be-border);
  }

  @media (max-width: 1180px) {
    .bulk-grid { grid-template-columns: 1fr !important; }
    .bulk-page { padding: 24px 18px 48px !important; }
  }
`;

/* ── react-select styles built from CSS vars ── */
const makeSelectStyles = () => ({
  control: (base, state) => ({
    ...base,
    minHeight: 46,
    borderRadius: 12,
    borderColor: state.isFocused
      ? 'var(--be-primary)'
      : 'var(--be-border)',
    backgroundColor: 'var(--be-input-bg)',
    boxShadow: state.isFocused
      ? '0 0 0 4px var(--be-focus-ring)'
      : 'none',
    fontSize: 13,
    fontFamily: FONT,
    cursor: 'pointer',
    transition: 'border-color 0.18s ease, background 0.3s ease',
    '&:hover': { borderColor: 'var(--be-primary)' },
  }),
  menu: (base) => ({
    ...base,
    zIndex: 9999,
    borderRadius: 12,
    overflow: 'hidden',
    background: 'var(--be-card)',
    border: '1px solid var(--be-border)',
    boxShadow: '0 16px 40px var(--be-shadow)',
  }),
  menuList: (base) => ({
    ...base,
    maxHeight: 190,
    overflowY: 'auto',
    paddingTop: 4,
    paddingBottom: 4,
    background: 'var(--be-card)',
  }),
  option: (base, state) => ({
    ...base,
    fontSize: 13,
    fontFamily: FONT,
    padding: '9px 14px',
    cursor: 'pointer',
    backgroundColor: state.isSelected
      ? 'var(--be-primary)'
      : state.isFocused
      ? 'var(--be-select-foc)'
      : 'var(--be-select-opt-bg)',
    color: state.isSelected ? '#FFFFFF' : 'var(--be-select-opt-fg)',
  }),
  placeholder: (base) => ({ ...base, color: 'var(--be-text-muted)' }),
  singleValue: (base) => ({ ...base, color: 'var(--be-text-h)' }),
  input: (base) => ({ ...base, color: 'var(--be-text-h)' }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (base) => ({ ...base, color: 'var(--be-text-muted)' }),
});

function SectionLabel({ children }) {
  return (
    <div className="bulk-section-label">
      <span /><span>{children}</span>
    </div>
  );
}

function StatusBadge({ status }) {
  const isSent   = status === 'sent';
  const isFailed = status === 'failed';
  return (
    <span style={{
      background: isSent ? 'var(--be-success-bg)' : isFailed ? 'var(--be-danger-bg)' : 'var(--be-primary-soft)',
      color:      isSent ? 'var(--be-success-text)' : isFailed ? 'var(--be-danger-text)' : 'var(--be-primary-dark)',
      padding: '6px 10px',
      borderRadius: 999,
      fontSize: 11,
      fontWeight: 800,
      textTransform: 'capitalize',
      display: 'inline-block',
    }}>
      {status || 'draft'}
    </span>
  );
}

function cleanEmailBody(body, subject) {
  if (!body) return '';
  let cleaned = body.trim();
  cleaned = cleaned.replace(/^subject\s*:\s*.*$/im, '').trim();
  if (subject) {
    const esc = subject.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    cleaned = cleaned.replace(new RegExp(`^${esc}\\s*`, 'i'), '').trim();
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, color: 'var(--be-text-h)' }}>Recent Bulk Emails</h2>
            <p style={{ fontSize: 12, color: 'var(--be-text-muted)', margin: '4px 0 0' }}>Track generated and sent email batches</p>
          </div>
          <button type="button" className="bulk-btn bulk-btn-light" onClick={onRefreshHistory} disabled={loadingHistory}>
            {loadingHistory ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {history.length === 0 && !loadingHistory && (
          <div style={{ padding: '42px 16px', textAlign: 'center', color: 'var(--be-text-light)', fontSize: 13, background: 'var(--be-subtle)', borderRadius: 16, border: '1px dashed var(--be-border)' }}>
            No bulk email history found yet
          </div>
        )}

        <div className="bulk-scroll" style={{ maxHeight: 620, overflowY: 'auto', paddingRight: 4 }}>
          {history.map((item) => (
            <button key={item.id} type="button" className="bulk-history-item" onClick={() => onSelectHistory(item)}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 800, color: 'var(--be-text-h)', fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 5 }}>
                    {item.subject || 'No Subject'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--be-text-muted)', lineHeight: 1.4 }}>
                    {item.recipient || 'N/A'} • {item.recipient_email || 'N/A'}
                  </div>
                  {item.template_name && (
                    <div style={{ fontSize: 11, color: 'var(--be-primary-dark)', fontWeight: 700, marginTop: 5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      Template: {item.template_name}
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: 'var(--be-text-light)', marginTop: 5 }}>{formatDate(item.created_at)}</div>
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
  const selectStyles = makeSelectStyles();

  const [form, setForm] = useState({ category: '', sub_category: '', subject: '', tone: 'professional', context: '' });
  const [categories, setCategories]       = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const [categoryLoading, setCategoryLoading]       = useState(false);
  const [subCategoryLoading, setSubCategoryLoading] = useState(false);

  const [file, setFile]               = useState(null);
  const [emails, setEmails]           = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [history, setHistory]         = useState([]);
  const [smtpConnected, setSmtpConnected] = useState(null);

  const [loading, setLoading]         = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [sending, setSending]         = useState(false);
  const [editMode, setEditMode]       = useState(false);

  const tones = ['professional','friendly','formal','assertive','apologetic','persuasive'];

  useEffect(() => {
    loadCategories();
    loadHistory();
    api.get('/smtp/me').then((res) => setSmtpConnected(res.data)).catch(() => setSmtpConnected(null));
  }, []);

  const loadCategories = async () => {
    setCategoryLoading(true);
    try {
      const res = await api.get('/email-template-files/categories');
      setCategories(res.data?.categories || []);
    } catch (err) {
      console.error(err);
      setCategories([]);
      alert('Email template categories could not be loaded.');
    } finally { setCategoryLoading(false); }
  };

  const loadSubCategories = async (category) => {
    if (!category) { setSubCategories([]); return; }
    setSubCategoryLoading(true);
    try {
      const res = await api.get('/email-template-files/subcategories', { params: { category } });
      setSubCategories(res.data?.templates || []);
    } catch (err) {
      console.error(err);
      setSubCategories([]);
      alert('Sub categories could not be loaded.');
    } finally { setSubCategoryLoading(false); }
  };

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await api.get('/email/history');
      setHistory((res.data || []).filter((item) => item.batch_id));
    } catch (err) {
      console.error(err);
      setHistory([]);
    } finally { setLoadingHistory(false); }
  };

  const handle = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = async (selected) => {
    const value = selected?.value || '';
    setForm((prev) => ({ ...prev, category: value, sub_category: '' }));
    setSelectedTemplate(null);
    setSubCategories([]);
    if (value) await loadSubCategories(value);
  };

  const handleSubCategoryChange = (selected) => {
    const value = selected?.value || '';
    const matched = subCategories.find((item) => item.filename === value);
    setForm((prev) => ({ ...prev, sub_category: value }));
    setSelectedTemplate(matched || null);
  };

  const getSelectedTemplateContent = async () => {
    const res = await api.get('/email-template-files/content', { params: { category: form.category, filename: form.sub_category } });
    return res.data;
  };

  const uploadAndGenerate = async (e) => {
    e.preventDefault();
    if (!form.category)     { alert('Please select a category.'); return; }
    if (!form.sub_category) { alert('Please select a sub category template.'); return; }
    if (!file)              { alert('Please upload Excel file.'); return; }

    setLoading(true);
    setEmails([]);
    setSelectedEmail(null);
    setEditMode(false);

    try {
      const templateData = await getSelectedTemplateContent();
      const fd = new FormData();
      fd.append('subject', form.subject || templateData.template_name || '');
      fd.append('tone', form.tone);
      fd.append('context', form.context);
      fd.append('template_name', templateData.template_name);
      fd.append('template_category', form.category);
      fd.append('template_file', form.sub_category);
      fd.append('template_content', templateData.content);
      fd.append('file', file);

      const res = await api.post('/email/bulk/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });

      const generatedEmails = (res.data.emails || []).map((email) => ({
        ...email,
        subject: email.subject || form.subject || templateData.template_name,
        template_name: email.template_name || templateData.template_name,
        template_category: form.category,
        template_file: form.sub_category,
        generated_email: cleanEmailBody(email.generated_email || '', email.subject || form.subject || templateData.template_name),
      }));

      setSelectedTemplate({ template_name: templateData.template_name, filename: templateData.filename, category: templateData.category });
      setEmails(generatedEmails);
      setSelectedEmail(generatedEmails[0] || null);
      alert(`Generated ${res.data.total} personalized emails.`);
      loadHistory();
    } catch (err) {
      alert(err.response?.data?.detail || err.message);
    } finally { setLoading(false); }
  };

  const updateSelectedEmail = (field, value) => {
    if (!selectedEmail) return;
    const updated = { ...selectedEmail, [field]: value };
    setSelectedEmail(updated);
    setEmails((prev) => prev.map((email) => (email.id === updated.id ? updated : email)));
  };

  const openHistoryItem = (email) => {
    const preparedEmail = { ...email, generated_email: cleanEmailBody(email.generated_email || '', email.subject) };
    setEmails([preparedEmail]);
    setSelectedEmail(preparedEmail);
    setEditMode(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectEmail = (email) => { setSelectedEmail(email); setEditMode(false); };

  const sendAll = async () => {
    if (!smtpConnected) { alert('Please connect your email account first from Email Settings.'); return; }
    const draftEmails = emails.filter((email) => email.status !== 'sent');
    if (draftEmails.length === 0) { alert('No draft emails available to send.'); return; }
    if (!window.confirm(`Send ${draftEmails.length} edited emails now?`)) return;

    setSending(true);
    try {
      const payload = draftEmails.map((email) => ({ id: email.id, subject: email.subject, generated_email: cleanEmailBody(email.generated_email, email.subject) }));
      const res = await api.post('/email/bulk/send', payload);
      alert(`Bulk sending completed. Sent: ${res.data.sent}, Failed: ${res.data.failed}`);

      const resultMap = {};
      (res.data.results || []).forEach((result) => { resultMap[result.id] = result; });

      const updatedEmails = emails.map((email) => {
        const result = resultMap[email.id];
        if (!result) return email;
        return { ...email, status: result.status, error_message: result.status === 'failed' ? result.message : null };
      });

      setEmails(updatedEmails);
      loadHistory();
      if (selectedEmail) setSelectedEmail(updatedEmails.find((e) => e.id === selectedEmail.id) || null);
    } catch (err) {
      alert(err.response?.data?.detail || err.message);
    } finally { setSending(false); }
  };

  const downloadTemplate = async () => {
    const category = selectedEmail?.template_category || selectedTemplate?.category || form.category;
    const filename  = selectedEmail?.template_file    || selectedTemplate?.filename  || form.sub_category;
    if (!category || !filename) { alert('Please select and generate emails from a template first.'); return; }
    try {
      const res = await api.get('/email-template-files/download', { params: { category, filename }, responseType: 'blob' });
      const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      alert(err.response?.data?.detail || 'Template download failed');
    }
  };

  const categoryOptions        = categories.map((cat) => ({ value: cat.name, label: cat.name }));
  const subCategoryOptions     = subCategories.map((item) => ({ value: item.filename, label: item.name }));
  const selectedCategoryOption = form.category    ? { value: form.category, label: form.category } : null;
  const selectedSubCatOption   = form.sub_category ? { value: form.sub_category, label: subCategories.find((i) => i.filename === form.sub_category)?.name || form.sub_category } : null;

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      <div className="bulk-page" style={{ minHeight: '100vh', background: 'var(--be-bg)', fontFamily: FONT, padding: '32px 36px 64px', transition: 'background 0.3s ease' }}>

        {/* ── Hero ── */}
        <div className="bulk-card" style={{ padding: 28, marginBottom: 24, background: 'var(--be-hero-grad)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'inline-flex', padding: '7px 11px', borderRadius: 999, background: 'var(--be-hero-pill-bg)', color: 'var(--be-hero-pill-txt)', fontSize: 12, fontWeight: 800, marginBottom: 12 }}>
                Exact DOCX Template Selection
              </div>
              <h1 style={{ fontSize: 30, fontWeight: 800, color: 'var(--be-text-h)', letterSpacing: '-0.8px', margin: 0 }}>Bulk Email Sender</h1>
              <p style={{ fontSize: 14, color: 'var(--be-text-muted)', margin: '8px 0 0', maxWidth: 680 }}>
                Select a folder category, choose the exact DOCX template, upload Excel data, generate personalized emails, review every message, and send professionally.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(90px, 1fr))', gap: 12, minWidth: 320 }}>
              <div className="bulk-card" style={{ padding: 16 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--be-text-h)' }}>{emails.length}</div>
                <div style={{ fontSize: 12, color: 'var(--be-text-muted)', fontWeight: 700 }}>Generated</div>
              </div>
              <div className="bulk-card" style={{ padding: 16 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--be-stat-sent-txt)' }}>{emails.filter((e) => e.status === 'sent').length}</div>
                <div style={{ fontSize: 12, color: 'var(--be-text-muted)', fontWeight: 700 }}>Sent</div>
              </div>
              <div className="bulk-card" style={{ padding: 16 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--be-stat-hist-txt)' }}>{history.length}</div>
                <div style={{ fontSize: 12, color: 'var(--be-text-muted)', fontWeight: 700 }}>History</div>
              </div>
            </div>
          </div>
        </div>

        {!smtpConnected && <div className="bulk-alert-error">Email sender is not connected. Please connect your email account from Email Settings.</div>}
        {smtpConnected  && <div className="bulk-alert-success">Connected email account: <b>{smtpConnected.smtp_email}</b></div>}

        {/* ── Main grid ── */}
        <div className="bulk-grid" style={{ display: 'grid', gridTemplateColumns: '360px minmax(520px,1fr) 380px', gap: 22, alignItems: 'start', width: '100%' }}>

          {/* ── Left col: form + recipients ── */}
          <div>
            <SectionLabel>Create Bulk Email</SectionLabel>
            <div className="bulk-card" style={{ padding: 22, marginBottom: 22 }}>
              <h2 style={{ fontSize: 17, fontWeight: 800, margin: '0 0 4px', color: 'var(--be-text-h)' }}>Upload & Generate</h2>
              <p style={{ fontSize: 12, color: 'var(--be-text-muted)', margin: '0 0 18px' }}>Use Excel data and the selected DOCX template to generate personalized emails.</p>

              <form onSubmit={uploadAndGenerate}>
                <div style={{ marginBottom: 15 }}>
                  <label className="bulk-label">Category</label>
                  <Select name="category" styles={selectStyles} options={categoryOptions} value={selectedCategoryOption} onChange={handleCategoryChange} isLoading={categoryLoading} isDisabled={categoryLoading} placeholder={categoryLoading ? 'Loading Categories...' : 'Select Category'} noOptionsMessage={() => 'No category found'} />
                </div>

                <div style={{ marginBottom: 15 }}>
                  <label className="bulk-label">Sub Category</label>
                  <Select name="sub_category" styles={selectStyles} options={subCategoryOptions} value={selectedSubCatOption} onChange={handleSubCategoryChange} isLoading={subCategoryLoading} isDisabled={!form.category || subCategoryLoading} placeholder={subCategoryLoading ? 'Loading Templates...' : 'Select Sub Category'} noOptionsMessage={() => (form.category ? 'No sub category found' : 'Select category first')} />
                </div>

                <div style={{ marginBottom: 15 }}>
                  <label className="bulk-label">Subject</label>
                  <input className="bulk-input" name="subject" value={form.subject} onChange={handle} placeholder="Example: Project Status Update" />
                </div>

                <div style={{ marginBottom: 15 }}>
                  <label className="bulk-label">Tone</label>
                  <select className="bulk-select" name="tone" value={form.tone} onChange={handle}>
                    {tones.map((tone) => <option key={tone} value={tone}>{tone.charAt(0).toUpperCase() + tone.slice(1)}</option>)}
                  </select>
                </div>

                <div style={{ marginBottom: 15 }}>
                  <label className="bulk-label">Email Context</label>
                  <textarea className="bulk-textarea" name="context" value={form.context} onChange={handle} required placeholder="Write the common email context. AI will personalize it using each recipient name and designation." style={{ minHeight: 140, resize: 'vertical' }} />
                </div>

                <div style={{ marginBottom: 18 }}>
                  <label className="bulk-label">Upload Excel File</label>
                  <input className="bulk-input" type="file" accept=".xlsx,.xls,.xlsm" onChange={(e) => setFile(e.target.files[0] || null)} required />
                  <p style={{ fontSize: 12, color: 'var(--be-text-muted)', marginTop: 7 }}>Required columns: name, email, designation</p>
                </div>

                <button className="bulk-btn bulk-btn-primary" disabled={loading || categoryLoading || subCategoryLoading} style={{ width: '100%' }}>
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
                      <button key={email.id} type="button" className="bulk-recipient-item" onClick={() => selectEmail(email)}
                        style={{
                          background: selectedEmail?.id === email.id ? 'var(--be-recip-sel-bg)' : 'var(--be-card)',
                          border: selectedEmail?.id === email.id ? '1px solid var(--be-recip-sel-bdr)' : '1px solid var(--be-border)',
                        }}
                      >
                        <div style={{ fontWeight: 800, color: 'var(--be-text-h)', fontSize: 13 }}>{email.recipient}</div>
                        <div style={{ fontSize: 12, color: 'var(--be-text-muted)', marginTop: 4 }}>{email.recipient_email}</div>
                        <div style={{ marginTop: 8 }}><StatusBadge status={email.status} /></div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ── Middle col: preview ── */}
          <div>
            <SectionLabel>Email Preview</SectionLabel>
            <div className="bulk-card" style={{ minHeight: 640, padding: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, color: 'var(--be-text-h)' }}>Preview & Edit</h2>
                  <p style={{ fontSize: 12, color: 'var(--be-text-muted)', margin: '4px 0 0' }}>Review content before sending.</p>
                </div>
                {emails.length > 0 && (
                  <button className="bulk-btn bulk-btn-primary" onClick={sendAll} disabled={sending || !smtpConnected}>
                    {sending ? 'Sending...' : 'Send All Edited Emails'}
                  </button>
                )}
              </div>

              {!selectedEmail && <div className="bulk-empty-state">Select template, upload Excel file, and generate emails. Preview will appear here.</div>}

              {selectedEmail && (
                <>
                  <div className="bulk-info-block">
                    <p style={{ margin: '0 0 7px', fontSize: 13, color: 'var(--be-text-b)' }}><b>To:</b> {selectedEmail.recipient} — {selectedEmail.recipient_email}</p>
                    <p style={{ margin: '0 0 7px', fontSize: 13, color: 'var(--be-text-b)' }}><b>Designation:</b> {selectedEmail.designation || 'N/A'}</p>
                    <p style={{ margin: '0 0 10px', fontSize: 13, color: 'var(--be-text-b)' }}><b>Template:</b> {selectedEmail.template_name || selectedTemplate?.template_name || 'N/A'}</p>
                    <StatusBadge status={selectedEmail.status} />
                    {selectedEmail.error_message && <div className="bulk-alert-error" style={{ marginTop: 12, marginBottom: 0 }}>{selectedEmail.error_message}</div>}
                  </div>

                  {!editMode ? (
                    <>
                      <div style={{ marginBottom: 15 }}>
                        <label className="bulk-label">Subject</label>
                        <input className="bulk-input" value={selectedEmail.subject || ''} onChange={(e) => updateSelectedEmail('subject', e.target.value)} disabled={selectedEmail.status === 'sent'} />
                      </div>
                      <label className="bulk-label">Formatted Email Preview</label>
                      <div className="formatted-bulk-preview" dangerouslySetInnerHTML={{ __html: cleanEmailBody(selectedEmail.generated_email, selectedEmail.subject) }} />
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
                        <button className="bulk-btn bulk-btn-secondary" onClick={() => setEditMode(true)} disabled={selectedEmail.status === 'sent'}>Edit This Email</button>
                        <button className="bulk-btn bulk-btn-light" type="button" onClick={downloadTemplate}>Download Template</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ marginBottom: 15 }}>
                        <label className="bulk-label">Edit Subject</label>
                        <input className="bulk-input" value={selectedEmail.subject || ''} onChange={(e) => updateSelectedEmail('subject', e.target.value)} />
                      </div>
                      <div style={{ marginBottom: 15 }}>
                        <label className="bulk-label">Edit Email Body</label>
                        <textarea className="bulk-textarea" value={selectedEmail.generated_email || ''} onChange={(e) => updateSelectedEmail('generated_email', e.target.value)} style={{ minHeight: 420, fontFamily: FONT, resize: 'vertical', lineHeight: 1.75 }} />
                      </div>
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <button className="bulk-btn bulk-btn-primary" onClick={() => {
                          updateSelectedEmail('generated_email', cleanEmailBody(selectedEmail.generated_email, selectedEmail.subject));
                          setEditMode(false);
                          alert('Edit saved in preview. Now click Send All Edited Emails.');
                        }}>Save Edit</button>
                        <button className="bulk-btn bulk-btn-light" onClick={() => setEditMode(false)}>Cancel</button>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {/* ── Right col: history ── */}
          <BulkHistoryPanel history={history} loadingHistory={loadingHistory} onSelectHistory={openHistoryItem} onRefreshHistory={loadHistory} />
        </div>
      </div>
    </>
  );
}
