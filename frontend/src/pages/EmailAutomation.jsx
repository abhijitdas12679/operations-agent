import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import api from '../api';
import StatusBadge from '../components/email/StatusBadge';

const C = {
  pageBg: 'var(--oa-page-bg)',
  card: 'var(--oa-card)',
  border: 'var(--oa-border)',
  textH: 'var(--oa-text-h)',
  textB: 'var(--oa-text-b)',
  textMuted: 'var(--oa-text-muted)',
  textLight: 'var(--oa-text-light)',
  primary: 'var(--oa-primary)',
  primaryDark: 'var(--oa-primary-dark)',
  primarySoft: 'var(--oa-primary-soft)',
};

const FONT = "'Inter', 'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif";

const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: 46,
    borderRadius: 12,
    borderColor: state.isFocused ? C.primary : C.border,
    backgroundColor: 'var(--oa-card-inner)',
    boxShadow: state.isFocused ? '0 0 0 4px rgba(var(--oa-focus-rgb), 0.12)' : 'none',
    fontSize: 13,
    fontFamily: FONT,
    cursor: 'pointer',
    transition: 'border-color 0.18s ease, background 0.3s ease',
    '&:hover': {
      borderColor: C.primary,
    },
  }),
  menu: (base) => ({
    ...base,
    zIndex: 9999,
    borderRadius: 12,
    overflow: 'hidden',
    background: 'var(--oa-card)',
    border: '1px solid var(--oa-border)',
    boxShadow: '0 16px 40px rgba(var(--oa-shadow-rgb), 0.16)',
  }),
  menuList: (base) => ({
    ...base,
    maxHeight: 190,
    overflowY: 'auto',
    paddingTop: 4,
    paddingBottom: 4,
    background: 'var(--oa-card)',
  }),
  option: (base, state) => ({
    ...base,
    fontSize: 13,
    fontFamily: FONT,
    padding: '9px 14px',
    cursor: 'pointer',
    backgroundColor: state.isSelected
      ? C.primary
      : state.isFocused
      ? C.primarySoft
      : 'var(--oa-card)',
    color: state.isSelected ? '#FFFFFF' : C.textH,
  }),
  placeholder: (base) => ({
    ...base,
    color: C.textMuted,
  }),
  singleValue: (base) => ({
    ...base,
    color: C.textH,
  }),
  input: (base) => ({
    ...base,
    color: C.textH,
  }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (base) => ({
    ...base,
    color: C.textMuted,
  }),
};

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; background: ${C.pageBg}; }

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
    box-shadow: 0 16px 40px rgba(var(--oa-shadow-rgb), 0.06);
    animation: fadeUp 0.3s ease both;
  }

  .email-auto-input,
  .email-auto-textarea,
  .email-auto-select {
    width: 100%;
    border: 1px solid ${C.border};
    background: var(--oa-card);
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
    box-shadow: 0 0 0 4px rgba(var(--oa-focus-rgb), 0.12);
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
    box-shadow: 0 10px 24px rgba(var(--oa-focus-rgb), 0.26);
  }

  .email-auto-btn-secondary {
    background: ${C.primarySoft};
    color: ${C.primaryDark};
  }

  .email-auto-btn-light {
    background: var(--oa-subtle-bg);
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
    background: var(--oa-bar-grad);
  }

  .email-auto-section-label span:last-child {
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${C.textMuted};
  }

  .email-recipient-box {
    background: var(--oa-subtle-bg);
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
    background: var(--oa-subtle-bg);
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

  .formatted-email-preview {
    min-height: 390px;
    padding: 18px;
    border: 1px solid ${C.border};
    border-radius: 12px;
    background: var(--oa-card);
    overflow: auto;
    line-height: 1.8;
    font-size: 14px;
    color: ${C.textB};
  }

  .formatted-email-preview p { margin: 0 0 12px; }

  .formatted-email-preview ul,
  .formatted-email-preview ol {
    margin: 10px 0 14px 22px;
    padding: 0;
  }

  .formatted-email-preview li { margin-bottom: 6px; }

  .formatted-email-preview strong,
  .formatted-email-preview b {
    color: ${C.textH};
    font-weight: 800;
  }

  .email-history-item {
    width: 100%;
    text-align: left;
    border: 1px solid ${C.border};
    border-radius: 16px;
    padding: 14px;
    margin-bottom: 10px;
    cursor: pointer;
    background: var(--oa-card);
    transition: 0.18s ease;
    font-family: ${FONT};
  }

  .email-history-item:hover {
    background: var(--oa-subtle-bg);
    transform: translateY(-1px);
    box-shadow: 0 10px 22px var(--oa-hover-shadow);
  }

  .email-scroll::-webkit-scrollbar { width: 6px; }

  .email-scroll::-webkit-scrollbar-thumb {
    background: var(--oa-thumb);
    border-radius: 999px;
  }

  @media (max-width: 1200px) {
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

function formatDate(dateValue) {
  if (!dateValue) return 'N/A';
  return new Date(dateValue).toLocaleString();
}

function EmailHistoryPanel({ history, loadingHistory, onSelectHistory, onRefreshHistory }) {
  return (
    <div>
      <SectionLabel>Email History</SectionLabel>

      <div className="email-auto-card" style={{ padding: 22 }}>
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
              Recent Emails
            </h2>

            <p style={{ fontSize: 12, color: C.textMuted, margin: '4px 0 0' }}>
              Open previous generated emails
            </p>
          </div>

          <button
            type="button"
            className="email-auto-btn email-auto-btn-light"
            onClick={onRefreshHistory}
            disabled={loadingHistory}
          >
            {loadingHistory ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {history.length === 0 && !loadingHistory && (
          <div className="email-empty-state" style={{ padding: '42px 16px' }}>
            No email history found yet
          </div>
        )}

        <div className="email-scroll" style={{ maxHeight: 620, overflowY: 'auto', paddingRight: 4 }}>
          {history.map((item) => (
            <button
              key={item.id}
              type="button"
              className="email-history-item"
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

                  {item.template_name && (
                    <div
                      style={{
                        fontSize: 11,
                        color: C.primaryDark,
                        fontWeight: 700,
                        marginTop: 5,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      Template: {item.template_name}
                    </div>
                  )}

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

export default function EmailAutomation() {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const [categoryLoading, setCategoryLoading] = useState(false);
  const [subCategoryLoading, setSubCategoryLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [email, setEmail] = useState(null);
  const [history, setHistory] = useState([]);
  const [editMode, setEditMode] = useState(false);

  const [form, setForm] = useState({
    category: '',
    sub_category: '',
    subject: '',
    recipient: '',
    recipient_email: '',
    tone: 'professional',
    context: '',
  });

  useEffect(() => {
    loadCategories();
    loadHistory();
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
    } finally {
      setCategoryLoading(false);
    }
  };

  const loadSubCategories = async (category) => {
    if (!category) {
      setSubCategories([]);
      return;
    }

    setSubCategoryLoading(true);

    try {
      const res = await api.get('/email-template-files/subcategories', {
        params: { category },
      });

      setSubCategories(res.data?.templates || []);
    } catch (err) {
      console.error(err);
      setSubCategories([]);
      alert('Sub categories could not be loaded for this category.');
    } finally {
      setSubCategoryLoading(false);
    }
  };

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

  const change = async (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'category' ? { sub_category: '' } : {}),
    }));

    if (name === 'category') {
      setSelectedTemplate(null);
      await loadSubCategories(value);
    }

    if (name === 'sub_category') {
      const matched = subCategories.find((item) => item.filename === value);
      setSelectedTemplate(matched || null);
    }
  };

  const handleCategoryChange = async (selected) => {
    const value = selected?.value || '';

    setForm((prev) => ({
      ...prev,
      category: value,
      sub_category: '',
    }));

    setSelectedTemplate(null);
    setSubCategories([]);

    if (value) {
      await loadSubCategories(value);
    }
  };

  const handleSubCategoryChange = (selected) => {
    const value = selected?.value || '';
    const matched = subCategories.find((item) => item.filename === value);

    setForm((prev) => ({
      ...prev,
      sub_category: value,
    }));

    setSelectedTemplate(matched || null);
  };

  const getSelectedTemplateContent = async () => {
    const res = await api.get('/email-template-files/content', {
      params: {
        category: form.category,
        filename: form.sub_category,
      },
    });

    return res.data;
  };

  const generate = async (e) => {
    e.preventDefault();

    if (!form.category) {
      alert('Please select a category.');
      return;
    }

    if (!form.sub_category) {
      alert('Please select a sub category template.');
      return;
    }

    setLoading(true);
    setEditMode(false);

    try {
      const templateData = await getSelectedTemplateContent();

      const res = await api.post('/email/generate', {
        subject: form.subject || templateData.template_name || '',
        recipient: form.recipient,
        recipient_email: form.recipient_email,
        tone: form.tone,
        context: form.context,
        template_name: templateData.template_name,
        template_category: form.category,
        template_file: form.sub_category,
        template_content: templateData.content,
        dynamic_fields: {},
      });

      const exactTemplate = {
        name: templateData.template_name,
        template_name: templateData.template_name,
        filename: templateData.filename,
        category: templateData.category,
        content: templateData.content,
      };

      setSelectedTemplate(exactTemplate);

      setEmail({
        ...res.data,
        template_name: templateData.template_name,
        template_category: form.category,
        template_file: form.sub_category,
      });

      await loadHistory();
    } catch (err) {
      alert(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  const openHistoryItem = (item) => {
    setEmail(item);
    setSelectedTemplate(
      item.template_name
        ? {
            template_name: item.template_name,
            filename: item.template_file || null,
            category: item.template_category || null,
          }
        : null
    );

    setEditMode(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const saveEdit = async () => {
    if (!email) return;

    try {
      const res = await api.put(`/email/history/${email.id}/content`, {
        subject: email.subject || '',
        generated_email: email.generated_email || '',
      });

      setEmail({
        ...res.data,
        template_name: email.template_name || selectedTemplate?.template_name || null,
        template_category: email.template_category || selectedTemplate?.category || null,
        template_file: email.template_file || selectedTemplate?.filename || null,
      });

      setEditMode(false);
      await loadHistory();
      alert('Saved successfully');
    } catch (err) {
      alert(err.response?.data?.detail || err.message);
    }
  };

  const send = async () => {
    if (!email) return;

    try {
      const res = await api.post(`/email/history/${email.id}/send`, {
        subject: email.subject || '',
        generated_email: email.generated_email || '',
      });

      setEmail({
        ...email,
        status: res.data.status,
        sent_time: res.data.sent_time,
        error_message: res.data.error_message,
      });

      await loadHistory();
      alert(res.data.status === 'sent' ? 'Email sent successfully' : res.data.error_message);
    } catch (err) {
      alert(err.response?.data?.detail || err.message);
    }
  };

  const downloadTemplate = async () => {
    const category = email?.template_category || selectedTemplate?.category || form.category;
    const filename = email?.template_file || selectedTemplate?.filename || form.sub_category;

    if (!category || !filename) {
      alert('Please select a category and sub category first.');
      return;
    }

    try {
      const res = await api.get('/email-template-files/download', {
        params: {
          category,
          filename,
        },
        responseType: 'blob',
      });

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

  const categoryOptions = categories.map((cat) => ({
    value: cat.name,
    label: cat.name,
  }));

  const subCategoryOptions = subCategories.map((item) => ({
    value: item.filename,
    label: item.name,
  }));

  const selectedCategoryOption = form.category
    ? {
        value: form.category,
        label: form.category,
      }
    : null;

  const selectedSubCategoryOption = form.sub_category
    ? {
        value: form.sub_category,
        label:
          subCategories.find((item) => item.filename === form.sub_category)?.name ||
          form.sub_category,
      }
    : null;

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
            background: 'var(--oa-hero-grad)',
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
              Exact DOCX Template Selection
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
                maxWidth: 760,
                lineHeight: 1.7,
              }}
            >
              Select a folder category, choose the exact DOCX template from sub category,
              generate the email, and download the same selected template.
            </p>
          </div>
        </div>

        <div
          className="email-auto-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(320px, 380px) minmax(0, 1fr) minmax(320px, 380px)',
            gap: 22,
            alignItems: 'start',
          }}
        >
          <div>
            <SectionLabel>Create Email</SectionLabel>

            <div className="email-auto-card" style={{ padding: 22 }}>
              <form onSubmit={generate}>
                <div style={{ marginBottom: 15 }}>
                  <label className="email-auto-label">Category</label>

                  <Select
                    name="category"
                    styles={selectStyles}
                    options={categoryOptions}
                    value={selectedCategoryOption}
                    onChange={handleCategoryChange}
                    isLoading={categoryLoading}
                    isDisabled={categoryLoading}
                    placeholder={categoryLoading ? 'Loading Categories...' : 'Select Category'}
                    noOptionsMessage={() => 'No category found'}
                  />
                </div>

                <div style={{ marginBottom: 15 }}>
                  <label className="email-auto-label">Sub Category</label>

                  <Select
                    name="sub_category"
                    styles={selectStyles}
                    options={subCategoryOptions}
                    value={selectedSubCategoryOption}
                    onChange={handleSubCategoryChange}
                    isLoading={subCategoryLoading}
                    isDisabled={!form.category || subCategoryLoading}
                    placeholder={subCategoryLoading ? 'Loading Templates...' : 'Select Sub Category'}
                    noOptionsMessage={() =>
                      form.category ? 'No sub category found' : 'Select category first'
                    }
                  />
                </div>

                <div style={{ marginBottom: 15 }}>
                  <label className="email-auto-label">Subject</label>
                  <input
                    className="email-auto-input"
                    name="subject"
                    value={form.subject}
                    onChange={change}
                    placeholder="Subject or short title"
                  />
                </div>

                <div style={{ marginBottom: 15 }}>
                  <label className="email-auto-label">Recipient Name</label>
                  <input
                    className="email-auto-input"
                    name="recipient"
                    value={form.recipient}
                    onChange={change}
                    required
                    placeholder="e.g. Prodatri Banerjee"
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
                    <option value="urgent">Urgent</option>
                    <option value="apologetic">Apologetic</option>
                    <option value="persuasive">Persuasive</option>
                  </select>
                </div>

                <div style={{ marginBottom: 18 }}>
                  <label className="email-auto-label">Prompt / Context</label>
                  <textarea
                    className="email-auto-textarea"
                    name="context"
                    value={form.context}
                    onChange={change}
                    required
                    style={{ minHeight: 160, resize: 'vertical' }}
                    placeholder="Write all email details here. The selected DOCX template will be used exactly."
                  />
                </div>

                <button
                  className="email-auto-btn email-auto-btn-primary"
                  disabled={loading || categoryLoading || subCategoryLoading}
                  style={{ width: '100%' }}
                >
                  {loading ? (
                    <>
                      <span className="email-spinner" /> Generating...
                    </>
                  ) : (
                    'Generate Email'
                  )}
                </button>
              </form>
            </div>
          </div>

          <div>
            <SectionLabel>Email Preview</SectionLabel>

            <div className="email-auto-card" style={{ padding: 22, minHeight: 640 }}>
              {!email ? (
                <div className="email-empty-state">
                  Select category, sub category, write prompt, and generate an email to preview here.
                </div>
              ) : (
                <>
                  <div className="email-recipient-box">
                    <div style={{ fontSize: 13, color: C.textB, marginBottom: 5 }}>
                      <b>{email.recipient}</b> — {email.recipient_email}
                    </div>

                    <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 7 }}>
                      Selected template:{' '}
                      <b>{email.template_name || selectedTemplate?.template_name || 'N/A'}</b>
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

                  <div style={{ marginBottom: 15 }}>
                    <label className="email-auto-label">Subject</label>
                    <input
                      className="email-auto-input"
                      value={email.subject || ''}
                      onChange={(e) => setEmail({ ...email, subject: e.target.value })}
                    />
                  </div>

                  <div style={{ marginBottom: 15 }}>
                    <label className="email-auto-label">
                      {editMode ? 'Edit Email Content' : 'Formatted Email Preview'}
                    </label>

                    {editMode ? (
                      <textarea
                        className="email-auto-textarea"
                        style={{ minHeight: 390, resize: 'vertical', lineHeight: 1.75 }}
                        value={email.generated_email || ''}
                        onChange={(e) =>
                          setEmail({ ...email, generated_email: e.target.value })
                        }
                      />
                    ) : (
                      <div
                        className="formatted-email-preview"
                        dangerouslySetInnerHTML={{ __html: email.generated_email || '' }}
                      />
                    )}
                  </div>

                  <div className="email-actions">
                    {editMode ? (
                      <>
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
                          onClick={() => setEditMode(false)}
                        >
                          Cancel Edit
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="email-auto-btn email-auto-btn-secondary"
                        onClick={() => setEditMode(true)}
                      >
                        Edit Email
                      </button>
                    )}

                    <button
                      type="button"
                      className="email-auto-btn email-auto-btn-light"
                      onClick={downloadTemplate}
                    >
                      Download Template
                    </button>

                    <button
                      type="button"
                      className="email-auto-btn email-auto-btn-primary"
                      onClick={send}
                      disabled={email?.status === 'sent'}
                    >
                      Send Email
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <EmailHistoryPanel
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