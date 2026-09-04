import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { forceDownload } from '../utils/download';

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
  successBg: 'var(--oa-success-bg)',
  successText: 'var(--oa-success-text)',
  dangerBg: 'var(--oa-danger-bg)',
  dangerText: 'var(--oa-danger-text)',
};

const FONT = "'Inter', 'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif";

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  body {
    margin: 0;
    background: ${C.pageBg};
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes momSpin {
    to { transform: rotate(360deg); }
  }

  .mom-card {
    background: ${C.card};
    border: 1px solid ${C.border};
    border-radius: 20px;
    box-shadow: 0 16px 40px rgba(var(--oa-shadow-rgb), 0.06);
    animation: fadeUp 0.3s ease both;
  }

  .mom-input,
  .mom-select,
  .mom-textarea {
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

  .mom-input:focus,
  .mom-select:focus,
  .mom-textarea:focus {
    border-color: ${C.primary};
    box-shadow: 0 0 0 4px rgba(var(--oa-focus-rgb), 0.12);
  }

  .mom-label {
    display: block;
    font-size: 12px;
    color: ${C.textMuted};
    font-weight: 700;
    margin-bottom: 7px;
  }

  .mom-btn {
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
    white-space: nowrap;
    text-decoration: none;
  }

  .mom-btn:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  .mom-btn-primary {
    background: linear-gradient(135deg, #4F46E5, #2563EB);
    color: #fff;
    box-shadow: 0 10px 24px rgba(var(--oa-focus-rgb), 0.26);
  }

  .mom-btn-secondary {
    background: ${C.primarySoft};
    color: ${C.primaryDark};
  }

  .mom-btn-light {
    background: var(--oa-subtle-bg);
    color: ${C.textB};
    border: 1px solid ${C.border};
  }

  .mom-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .mom-section-label {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 14px;
  }

  .mom-section-label span:first-child {
    width: 34px;
    height: 3px;
    border-radius: 999px;
    background: linear-gradient(90deg, #4F46E5, #2563EB);
  }

  .mom-section-label span:last-child {
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${C.textMuted};
  }

  .mom-alert {
    background: ${C.dangerBg};
    color: ${C.dangerText};
    padding: 13px 15px;
    border-radius: 14px;
    margin-bottom: 16px;
    font-size: 13px;
    font-weight: 700;
    border: 1px solid var(--oa-danger-bg);
  }

  .mom-success {
    background: ${C.successBg};
    color: ${C.successText};
    padding: 13px 15px;
    border-radius: 14px;
    margin-bottom: 16px;
    font-size: 13px;
    font-weight: 700;
    border: 1px solid var(--oa-success-bg);
  }

  .mom-empty-state {
    padding: 46px 16px;
    text-align: center;
    color: ${C.textLight};
    font-size: 13px;
    background: var(--oa-subtle-bg);
    border-radius: 18px;
    border: 1px dashed ${C.border};
  }

  .mom-spinner {
    width: 15px;
    height: 15px;
    border: 2px solid rgba(255,255,255,0.45);
    border-top-color: #fff;
    border-radius: 50%;
    animation: momSpin 0.75s linear infinite;
  }

  .mom-preview-frame {
    width: 100%;
    height: 820px;
    border: 1px solid ${C.border};
    border-radius: 18px;
    background: var(--oa-card);
  }

  .mom-history-item {
    padding: 14px;
    border-radius: 16px;
    cursor: pointer;
    margin-bottom: 10px;
    border: 1px solid ${C.border};
    background: var(--oa-card);
    transition: 0.18s ease;
  }

  .mom-history-item:hover {
    background: var(--oa-subtle-bg);
    transform: translateY(-1px);
    box-shadow: 0 10px 22px rgba(17, 24, 39, 0.05);
  }

  .mom-scroll::-webkit-scrollbar {
    width: 6px;
  }

  .mom-scroll::-webkit-scrollbar-thumb {
    background: #CBD5E1;
    border-radius: 999px;
  }

  @media (max-width: 950px) {
    .mom-grid {
      grid-template-columns: 1fr !important;
    }

    .mom-page {
      padding: 24px 18px 48px !important;
    }

    .mom-stat-grid {
      grid-template-columns: 1fr !important;
      min-width: 100% !important;
    }
  }

  @media (max-width: 560px) {
    .mom-title {
      font-size: 24px !important;
    }

    .mom-preview-frame {
      height: 640px;
    }
  }
`;

function displayTemplateName(file = '') {
  return String(file || '').replace(/\.docx$/i, '');
}

function toAbsoluteUrl(url = '') {
  if (!url) return '';
  if (url.startsWith('blob:')) return url;
  if (url.startsWith('http')) return url;
  return `${api.defaults.baseURL}${url}`;
}

async function getAuthenticatedPreviewUrl(downloadUrl = '') {
  if (!downloadUrl) return '';

  const absoluteUrl = toAbsoluteUrl(downloadUrl);

  const res = await api.get(absoluteUrl, {
    responseType: 'blob',
  });

  return URL.createObjectURL(
    new Blob([res.data], { type: 'application/pdf' })
  );
}

function SectionLabel({ children }) {
  return (
    <div className="mom-section-label">
      <span />
      <span>{children}</span>
    </div>
  );
}

function ExactPreview({ pdfUrl, title, loading }) {
  if (loading) {
    return (
      <div className="mom-empty-state">
        Creating exact DOCX-based PDF preview...
      </div>
    );
  }

  if (!pdfUrl) {
    return (
      <div className="mom-empty-state">
        Exact preview will appear here after generating PDF from the selected DOCX template.
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          padding: '16px 18px',
          border: `1px solid ${C.border}`,
          borderBottom: 'none',
          borderRadius: '18px 18px 0 0',
          background: 'linear-gradient(135deg, var(--oa-subtle-bg), #EEF2FF)',
        }}
      >
        <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: C.textH }}>
          Exact MOM Preview
        </h2>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: C.textMuted }}>
          {title || 'Generated from selected DOCX template'}
        </p>
      </div>

      <iframe
        title="Exact MOM PDF Preview"
        src={toAbsoluteUrl(pdfUrl)}
        className="mom-preview-frame"
        style={{ borderRadius: '0 0 18px 18px' }}
      />
    </div>
  );
}

function ExportButtons({ id, templateFilename, docxUrl, pdfUrl, onPdfReady }) {
  const [exporting, setExporting] = useState('');
  const navigate = useNavigate();

  const exportDoc = async (fmt) => {
    if (!id) return;

    setExporting(fmt);

    try {
      const res = await api.post(`/documents/export-${fmt}`, {
        content_id: id,
        doc_type: 'meeting',
        export_format: fmt,
      });

      if (fmt === 'pdf' && res.data?.download_url) {
        onPdfReady?.(res.data.download_url);
      }

      await forceDownload(res.data.download_url);
    } catch (e) {
      alert('Export failed: ' + (e.response?.data?.detail || e.message));
    } finally {
      setExporting('');
    }
  };

  const downloadSelectedTemplate = () => {
    if (!templateFilename) {
      alert('No template file selected for this MOM.');
      return;
    }

    const url = `/meeting-template-files/download?filename=${encodeURIComponent(templateFilename)}`;
    window.open(api.defaults.baseURL + url, '_blank');
  };

  const downloadGeneratedDocx = async () => {
    if (!docxUrl) {
      await exportDoc('docx');
      return;
    }

    await forceDownload(docxUrl);
  };

  const downloadGeneratedPdf = async () => {
    if (!pdfUrl) {
      await exportDoc('pdf');
      return;
    }

    await forceDownload(pdfUrl);
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}
    >
      <button className="mom-btn mom-btn-secondary" onClick={downloadGeneratedDocx} disabled={!!exporting}>
        {exporting === 'docx' ? 'Exporting...' : 'Download DOCX'}
      </button>

      <button className="mom-btn mom-btn-secondary" onClick={downloadGeneratedPdf} disabled={!!exporting}>
        {exporting === 'pdf' ? 'Exporting...' : 'Download PDF'}
      </button>

      <button className="mom-btn mom-btn-light" onClick={downloadSelectedTemplate} disabled={!templateFilename}>
        Download Template
      </button>

      <button
        className="mom-btn mom-btn-primary"
        onClick={() => navigate(`/send-mom?meetingId=${id}`)}
        disabled={!id}
      >
        Send MOM
      </button>
    </div>
  );
}

export default function MeetingMOM() {
  const [form, setForm] = useState({
    meeting_title: '',
    attendees: '',
    raw_notes: '',
    template_category: '',
    template_filename: '',
    template_file: '',
    template_name: '',
  });

  const [categories, setCategories] = useState([]);
  const [result, setResult] = useState(null);

  const [previewPdfUrl, setPreviewPdfUrl] = useState('');
  const [previewBlobUrl, setPreviewBlobUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState(null);
  const [historyPreviewLoadingId, setHistoryPreviewLoadingId] = useState(null);
  const [historyPreviewBlobUrl, setHistoryPreviewBlobUrl] = useState('');

  useEffect(() => {
    return () => {
      if (previewBlobUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewBlobUrl);
      }

      if (historyPreviewBlobUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(historyPreviewBlobUrl);
      }
    };
  }, [previewBlobUrl, historyPreviewBlobUrl]);

  const fetchHistory = () => {
    api
      .get('/meeting/history')
      .then((r) => setHistory(Array.isArray(r.data) ? r.data : []))
      .catch(console.error);
  };

  const fetchCategories = () => {
    api
      .get('/meeting-template-files/categories')
      .then((r) => {
        const files = Array.isArray(r.data?.categories) ? r.data.categories : [];
        setCategories(files);
      })
      .catch((err) => {
        console.error(err);
        setCategories([]);
      });
  };

  useEffect(() => {
    fetchHistory();
    fetchCategories();
  }, []);

  const handle = (e) => {
    const { name, value } = e.target;

    if (name === 'template_category') {
      setForm((prev) => ({
        ...prev,
        template_category: value,
        template_filename: value,
        template_file: value,
        template_name: value,
      }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const generatePreviewPdf = async (meetingId) => {
    if (!meetingId) return '';

    setPreviewLoading(true);

    try {
      const res = await api.post('/documents/export-pdf', {
        content_id: meetingId,
        doc_type: 'meeting',
        export_format: 'pdf',
      });

      const downloadUrl = res.data?.download_url || '';

      if (downloadUrl) {
        setPreviewPdfUrl(downloadUrl);

        if (previewBlobUrl?.startsWith('blob:')) {
          URL.revokeObjectURL(previewBlobUrl);
        }

        const blobUrl = await getAuthenticatedPreviewUrl(downloadUrl);
        setPreviewBlobUrl(blobUrl);

        return downloadUrl;
      }

      return '';
    } catch (err) {
      setError(err.response?.data?.detail || 'PDF preview generation failed');
      return '';
    } finally {
      setPreviewLoading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError('');
    setSuccess('');
    setResult(null);
    setPreviewPdfUrl('');

    if (previewBlobUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(previewBlobUrl);
    }

    setPreviewBlobUrl('');

    try {
      const selectedFile = form.template_filename || form.template_category;

      const payload = {
        meeting_title: form.meeting_title,
        attendees: form.attendees,
        raw_notes: form.raw_notes,
        template_category: selectedFile || null,
        template_filename: selectedFile || null,
        template_file: selectedFile || null,
        template_name: selectedFile || null,
      };

      const res = await api.post('/meeting/generate-mom', payload);

      setResult(res.data);
      setSuccess('MOM generated successfully using the selected template.');
      fetchHistory();

      await generatePreviewPdf(res.data.id);
    } catch (err) {
      setError(err.response?.data?.detail || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const openHistoryItem = async (h) => {
    if (selected?.id === h.id) {
      setSelected(null);

      if (historyPreviewBlobUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(historyPreviewBlobUrl);
      }

      setHistoryPreviewBlobUrl('');
      return;
    }

    setSelected({
      ...h,
      previewPdf: h.previewPdf || '',
    });

    setHistoryPreviewLoadingId(h.id);

    if (historyPreviewBlobUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(historyPreviewBlobUrl);
    }

    setHistoryPreviewBlobUrl('');

    try {
      const res = await api.post('/documents/export-pdf', {
        content_id: h.id,
        doc_type: 'meeting',
        export_format: 'pdf',
      });

      const pdfUrl = res.data?.download_url || '';
      const blobUrl = pdfUrl ? await getAuthenticatedPreviewUrl(pdfUrl) : '';

      const updated = {
        ...h,
        previewPdf: pdfUrl,
      };

      setSelected(updated);
      setHistoryPreviewBlobUrl(blobUrl);

      setHistory((prev) =>
        prev.map((item) =>
          item.id === h.id ? { ...item, previewPdf: pdfUrl } : item
        )
      );
    } catch (err) {
      setError(err.response?.data?.detail || 'History preview generation failed');
    } finally {
      setHistoryPreviewLoadingId(null);
    }
  };

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      <div
        className="mom-page"
        style={{
          minHeight: '100vh',
          background: C.pageBg,
          fontFamily: FONT,
          padding: '32px 36px 64px',
        }}
      >
        <div
          className="mom-card"
          style={{
            padding: 28,
            marginBottom: 24,
            background: 'var(--oa-hero-grad)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
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
                Meeting Documentation
              </div>

              <h1 className="mom-title" style={{ fontSize: 30, fontWeight: 800, color: C.textH, letterSpacing: '-0.8px', margin: 0 }}>
                Meeting MOM Generator
              </h1>

              <p style={{ fontSize: 14, color: C.textMuted, margin: '8px 0 0', maxWidth: 680, lineHeight: 1.7 }}>
                Select a DOCX template, generate MOM, and preview the exact authenticated PDF output.
              </p>
            </div>

            <div className="mom-stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(90px, 1fr))', gap: 12, minWidth: 320 }}>
              <div className="mom-card" style={{ padding: 16 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: C.textH }}>{history.length}</div>
                <div style={{ fontSize: 12, color: C.textMuted, fontWeight: 700 }}>MOMs</div>
              </div>

              <div className="mom-card" style={{ padding: 16 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: C.primary }}>{categories.length}</div>
                <div style={{ fontSize: 12, color: C.textMuted, fontWeight: 700 }}>Templates</div>
              </div>

              <div className="mom-card" style={{ padding: 16 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: C.successText }}>Exact</div>
                <div style={{ fontSize: 12, color: C.textMuted, fontWeight: 700 }}>Preview</div>
              </div>
            </div>
          </div>
        </div>

        {(error || success) && (
          <div style={{ marginBottom: 18 }}>
            {error && <div className="mom-alert">{error}</div>}
            {success && <div className="mom-success">{success}</div>}
          </div>
        )}

        <div className="mom-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 420px) minmax(0, 1fr)', gap: 22, alignItems: 'start' }}>
          <div>
            <SectionLabel>Create MOM</SectionLabel>

            <div className="mom-card" style={{ padding: 22 }}>
              <div style={{ marginBottom: 18 }}>
                <h2 style={{ fontSize: 17, fontWeight: 800, margin: '0 0 4px', color: C.textH }}>
                  Generate Minutes of Meeting
                </h2>

                <p style={{ fontSize: 12, color: C.textMuted, margin: 0, lineHeight: 1.6 }}>
                  Choose a MOM template file before generating.
                </p>
              </div>

              <form onSubmit={submit}>
                <div style={{ marginBottom: 15 }}>
                  <label className="mom-label">MOM Template</label>
                  <select className="mom-select" name="template_category" value={form.template_category} onChange={handle} required>
                    <option value="">Select MOM template</option>
                    {categories.map((file) => (
                      <option key={file} value={file}>
                        {displayTemplateName(file)}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: 15 }}>
                  <label className="mom-label">Meeting Title</label>
                  <input
                    className="mom-input"
                    name="meeting_title"
                    value={form.meeting_title}
                    onChange={handle}
                    required
                    placeholder="e.g. Q4 Planning Meeting"
                  />
                </div>

                <div style={{ marginBottom: 15 }}>
                  <label className="mom-label">Attendees</label>
                  <input
                    className="mom-input"
                    name="attendees"
                    value={form.attendees}
                    onChange={handle}
                    required
                    placeholder="John, Sarah, Mike"
                  />
                </div>

                <div style={{ marginBottom: 18 }}>
                  <label className="mom-label">Raw Meeting Notes</label>
                  <textarea
                    className="mom-textarea"
                    name="raw_notes"
                    value={form.raw_notes}
                    onChange={handle}
                    required
                    style={{ minHeight: 185, resize: 'vertical' }}
                    placeholder={
                      'Paste your raw notes here...\n' +
                      '- Discussed roadmap and deadlines\n' +
                      '- Assigned responsibilities\n' +
                      '- Finalized next action points'
                    }
                  />
                </div>

                <button type="submit" className="mom-btn mom-btn-primary" disabled={loading || previewLoading || !form.template_category} style={{ width: '100%' }}>
                  {loading || previewLoading ? (
                    <>
                      <span className="mom-spinner" /> {previewLoading ? 'Creating exact preview...' : 'Generating MOM...'}
                    </>
                  ) : (
                    'Generate MOM'
                  )}
                </button>
              </form>
            </div>
          </div>

          <div>
            {result && (
              <div style={{ marginBottom: 22 }}>
                <SectionLabel>Generated MOM</SectionLabel>

                <div className="mom-card" style={{ padding: 22 }}>
                  <ExactPreview pdfUrl={previewBlobUrl} title={result.meeting_title} loading={previewLoading} />

                  <ExportButtons
                    id={result.id}
                    templateFilename={result.template_filename || result.template_file || result.template_name}
                    docxUrl={result.docx_download_url}
                    pdfUrl={previewPdfUrl}
                    onPdfReady={setPreviewPdfUrl}
                  />
                </div>
              </div>
            )}

            <SectionLabel>History</SectionLabel>

            <div className="mom-card" style={{ padding: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12 }}>
                <div>
                  <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, color: C.textH }}>Recent MOMs</h2>
                  <p style={{ fontSize: 12, color: C.textMuted, margin: '4px 0 0' }}>
                    View exact preview, export, or send previously generated MOMs.
                  </p>
                </div>

                <button className="mom-btn mom-btn-light" type="button" onClick={fetchHistory}>
                  Refresh
                </button>
              </div>

              {history.length === 0 ? (
                <div className="mom-empty-state">No MOMs generated yet</div>
              ) : (
                <div className="mom-scroll" style={{ maxHeight: 760, overflowY: 'auto', paddingRight: 4 }}>
                  {history.map((h) => (
                    <div key={h.id} className="mom-history-item" onClick={() => openHistoryItem(h)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontWeight: 800,
                              fontSize: 13,
                              color: C.textH,
                              overflow: 'hidden',
                              whiteSpace: 'nowrap',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {h.meeting_title || 'Minutes of Meeting'}
                          </div>

                          <div style={{ fontSize: 11, color: C.textLight, marginTop: 4 }}>
                            {h.created_at ? new Date(h.created_at).toLocaleString() : ''}
                          </div>
                        </div>

                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 800,
                            color: selected?.id === h.id ? C.successText : C.primaryDark,
                            background: selected?.id === h.id ? C.successBg : C.primarySoft,
                            padding: '6px 10px',
                            borderRadius: 999,
                            flexShrink: 0,
                          }}
                        >
                          {selected?.id === h.id ? 'Hide' : 'View'}
                        </span>
                      </div>

                      {selected?.id === h.id && (
                        <div style={{ marginTop: 16 }} onClick={(e) => e.stopPropagation()}>
                          <ExactPreview
                            pdfUrl={historyPreviewBlobUrl}
                            title={selected.meeting_title}
                            loading={historyPreviewLoadingId === h.id}
                          />

                          <ExportButtons
                            id={h.id}
                            templateFilename={h.template_filename || h.template_file || h.template_name}
                            pdfUrl={selected.previewPdf}
                            onPdfReady={(url) => setSelected((prev) => ({ ...prev, previewPdf: url }))}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}