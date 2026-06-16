import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { forceDownload } from '../utils/download';

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

const TEMPLATE_FILE_URL = '/templates/Minutes_of_Meeting_Template.docx';

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
    box-shadow: 0 16px 40px rgba(17, 24, 39, 0.06);
    animation: fadeUp 0.3s ease both;
  }

  .mom-input,
  .mom-textarea {
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

  .mom-input:focus,
  .mom-textarea:focus {
    border-color: ${C.primary};
    box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.12);
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
    box-shadow: 0 10px 24px rgba(79, 70, 229, 0.26);
  }

  .mom-btn-secondary {
    background: ${C.primarySoft};
    color: ${C.primaryDark};
  }

  .mom-btn-light {
    background: #F9FAFB;
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

  .mom-report {
    background: #FFFFFF;
    border: 1px solid ${C.border};
    border-radius: 18px;
    overflow: hidden;
  }

  .mom-report-top {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 20px;
    background: linear-gradient(135deg, #F8FAFC, #EEF2FF);
    border-bottom: 1px solid ${C.border};
  }

  .mom-report-icon {
    width: 46px;
    height: 46px;
    border-radius: 14px;
    background: linear-gradient(135deg, #4F46E5, #2563EB);
    color: #FFFFFF;
    display: grid;
    place-items: center;
    font-size: 13px;
    font-weight: 900;
    flex-shrink: 0;
    letter-spacing: 0.02em;
  }

  .mom-report-body {
    padding: 22px;
  }

  .mom-report-body section {
    padding: 16px 0;
    border-bottom: 1px solid #EEF2F7;
  }

  .mom-report-body section:first-child {
    padding-top: 0;
  }

  .mom-report-body section:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  .mom-report-body h2 {
    color: ${C.textH};
    font-size: 21px;
    line-height: 1.35;
    margin: 0 0 14px;
    letter-spacing: -0.4px;
  }

  .mom-report-body h3 {
    color: ${C.primaryDark};
    font-size: 15px;
    line-height: 1.4;
    margin: 0 0 10px;
    font-weight: 800;
  }

  .mom-report-body p {
    color: ${C.textB};
    font-size: 13.5px;
    line-height: 1.8;
    margin: 8px 0;
  }

  .mom-report-body ol,
  .mom-report-body ul {
    padding-left: 22px;
    margin: 8px 0 0;
  }

  .mom-report-body li {
    color: ${C.textB};
    font-size: 13.5px;
    line-height: 1.8;
    margin: 8px 0;
    padding-left: 4px;
  }

  .mom-report-body strong {
    color: ${C.textH};
    font-weight: 800;
  }

  .mom-report-body em {
    color: ${C.textMuted};
  }

  .priority-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 800;
    line-height: 1.2;
    border: 1px solid transparent;
    vertical-align: middle;
  }

  .priority-high {
    background: #FEF2F2;
    color: #B91C1C;
    border-color: #FECACA;
  }

  .priority-high::before {
    content: "●";
    font-size: 9px;
  }

  .priority-medium {
    background: #FFFBEB;
    color: #B45309;
    border-color: #FDE68A;
  }

  .priority-medium::before {
    content: "●";
    font-size: 9px;
  }

  .priority-low {
    background: #ECFDF5;
    color: #047857;
    border-color: #A7F3D0;
  }

  .priority-low::before {
    content: "●";
    font-size: 9px;
  }

  .mom-history-item {
    padding: 14px;
    border-radius: 16px;
    cursor: pointer;
    margin-bottom: 10px;
    border: 1px solid ${C.border};
    background: #FFFFFF;
    transition: 0.18s ease;
  }

  .mom-history-item:hover {
    background: #F8FAFC;
    transform: translateY(-1px);
    box-shadow: 0 10px 22px rgba(17, 24, 39, 0.05);
  }

  .mom-alert {
    background: ${C.dangerBg};
    color: ${C.dangerText};
    padding: 13px 15px;
    border-radius: 14px;
    margin-bottom: 16px;
    font-size: 13px;
    font-weight: 700;
    border: 1px solid #FECACA;
  }

  .mom-success {
    background: ${C.successBg};
    color: ${C.successText};
    padding: 13px 15px;
    border-radius: 14px;
    margin-bottom: 16px;
    font-size: 13px;
    font-weight: 700;
    border: 1px solid #A7F3D0;
  }

  .mom-empty-state {
    padding: 46px 16px;
    text-align: center;
    color: ${C.textLight};
    font-size: 13px;
    background: #F9FAFB;
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
    .mom-report-top {
      align-items: flex-start;
    }

    .mom-report-body {
      padding: 16px;
    }

    .mom-title {
      font-size: 24px !important;
    }
  }
`;

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function normalizePriorityBadges(html = '') {
  return html
    .replace(/High Priority/gi, '<span class="priority-badge priority-high">High Priority</span>')
    .replace(/Medium Priority/gi, '<span class="priority-badge priority-medium">Medium Priority</span>')
    .replace(/Low Priority/gi, '<span class="priority-badge priority-low">Low Priority</span>');
}

function convertLegacyMomToHtml(text = '') {
  const cleaned = String(text || '')
    .replaceAll('**', '')
    .replaceAll('---', '')
    .trim();

  if (!cleaned) return '<p>No MOM content available.</p>';

  if (/<(section|h2|h3|p|ol|ul|li|strong|span)\b/i.test(cleaned)) {
    return normalizePriorityBadges(cleaned);
  }

  const lines = cleaned
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  let html = '';
  let listOpen = false;

  lines.forEach((line) => {
    const safeLine = escapeHtml(line);

    if (line.startsWith('# ')) {
      if (listOpen) {
        html += '</ol>';
        listOpen = false;
      }
      html += `<section><h2>${escapeHtml(line.replace('# ', ''))}</h2>`;
      return;
    }

    if (line.startsWith('## ')) {
      if (listOpen) {
        html += '</ol>';
        listOpen = false;
      }
      html += `</section><section><h3>${escapeHtml(line.replace('## ', ''))}</h3>`;
      return;
    }

    if (/^\d+\./.test(line)) {
      if (!listOpen) {
        html += '<ol>';
        listOpen = true;
      }
      html += `<li>${safeLine.replace(/^\d+\.\s*/, '')}</li>`;
      return;
    }

    if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!listOpen) {
        html += '<ul>';
        listOpen = true;
      }
      html += `<li>${escapeHtml(line.slice(2))}</li>`;
      return;
    }

    if (listOpen) {
      html += '</ol>';
      listOpen = false;
    }

    html += `<p>${safeLine}</p>`;
  });

  if (listOpen) html += '</ol>';
  if (!html.includes('<section')) html = `<section>${html}</section>`;
  if (!html.endsWith('</section>')) html += '</section>';

  return normalizePriorityBadges(html);
}

function SectionLabel({ children }) {
  return (
    <div className="mom-section-label">
      <span />
      <span>{children}</span>
    </div>
  );
}

function ProfessionalMOMView({ mom, title }) {
  const html = useMemo(() => convertLegacyMomToHtml(mom), [mom]);

  return (
    <div className="mom-report">
      <div className="mom-report-top">
        <div className="mom-report-icon">MOM</div>

        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: C.textH }}>
            Minutes of Meeting
          </h2>

          <p style={{ margin: '4px 0 0', fontSize: 12, color: C.textMuted }}>
            {title || 'Generated by Operations Agent'}
          </p>
        </div>
      </div>

      <div className="mom-report-body" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

function ExportButtons({ id }) {
  const [exporting, setExporting] = useState('');
  const navigate = useNavigate();

  const exportDoc = async (fmt) => {
    setExporting(fmt);

    try {
      const res = await api.post(`/documents/export-${fmt}`, {
        content_id: id,
        doc_type: 'meeting',
        export_format: fmt,
      });

      await forceDownload(res.data.download_url);
    } catch (e) {
      alert('Export failed: ' + (e.response?.data?.detail || e.message));
    } finally {
      setExporting('');
    }
  };

  const downloadTemplate = () => {
    const link = document.createElement('a');
    link.href = TEMPLATE_FILE_URL;
    link.download = 'Minutes_of_Meeting_Template.docx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        display: 'flex',
        gap: 10,
        marginTop: 16,
        flexWrap: 'wrap',
      }}
    >
      <button
        className="mom-btn mom-btn-secondary"
        onClick={(e) => {
          e.stopPropagation();
          exportDoc('docx');
        }}
        disabled={!!exporting}
      >
        {exporting === 'docx' ? 'Exporting...' : 'Export DOCX'}
      </button>

      <button
        className="mom-btn mom-btn-secondary"
        onClick={(e) => {
          e.stopPropagation();
          exportDoc('pdf');
        }}
        disabled={!!exporting}
      >
        {exporting === 'pdf' ? 'Exporting...' : 'Export PDF'}
      </button>

      <button
        className="mom-btn mom-btn-light"
        onClick={(e) => {
          e.stopPropagation();
          downloadTemplate();
        }}
      >
        Download Template
      </button>

      <button
        className="mom-btn mom-btn-primary"
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/send-mom?meetingId=${id}`);
        }}
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
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState(null);

  const fetchHistory = () => {
    api
      .get('/meeting/history')
      .then((r) => setHistory(Array.isArray(r.data) ? r.data : []))
      .catch(console.error);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handle = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const downloadTemplate = () => {
    const link = document.createElement('a');
    link.href = TEMPLATE_FILE_URL;
    link.download = 'Minutes_of_Meeting_Template.docx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const submit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError('');
    setSuccess('');
    setResult(null);

    try {
      const res = await api.post('/meeting/generate-mom', form);
      setResult(res.data);
      fetchHistory();
      setSuccess('MOM generated successfully.');
    } catch (err) {
      setError(err.response?.data?.detail || 'Generation failed');
    } finally {
      setLoading(false);
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
                Meeting Documentation
              </div>

              <h1
                className="mom-title"
                style={{
                  fontSize: 30,
                  fontWeight: 800,
                  color: C.textH,
                  letterSpacing: '-0.8px',
                  margin: 0,
                }}
              >
                Meeting MOM Generator
              </h1>

              <p
                style={{
                  fontSize: 14,
                  color: C.textMuted,
                  margin: '8px 0 0',
                  maxWidth: 680,
                  lineHeight: 1.7,
                }}
              >
                Generate structured MOMs using the standard template format with highlighted
                decisions, deadlines, owners, action items, and priorities.
              </p>
            </div>

            <div
              className="mom-stat-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(90px, 1fr))',
                gap: 12,
                minWidth: 320,
              }}
            >
              <div className="mom-card" style={{ padding: 16 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: C.textH }}>
                  {history.length}
                </div>
                <div style={{ fontSize: 12, color: C.textMuted, fontWeight: 700 }}>
                  MOMs
                </div>
              </div>

              <div className="mom-card" style={{ padding: 16 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: C.primary }}>
                  {result ? 1 : 0}
                </div>
                <div style={{ fontSize: 12, color: C.textMuted, fontWeight: 700 }}>
                  Generated
                </div>
              </div>

              <div className="mom-card" style={{ padding: 16 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: C.successText }}>
                  Ready
                </div>
                <div style={{ fontSize: 12, color: C.textMuted, fontWeight: 700 }}>
                  Export
                </div>
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

        <div
          className="mom-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(320px, 420px) minmax(0, 1fr)',
            gap: 22,
            alignItems: 'start',
          }}
        >
          <div>
            <SectionLabel>Create MOM</SectionLabel>

            <div className="mom-card" style={{ padding: 22 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 12,
                  alignItems: 'flex-start',
                  marginBottom: 18,
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <h2 style={{ fontSize: 17, fontWeight: 800, margin: '0 0 4px', color: C.textH }}>
                    Generate Minutes of Meeting
                  </h2>

                  <p style={{ fontSize: 12, color: C.textMuted, margin: 0, lineHeight: 1.6 }}>
                    Add meeting details and raw notes to generate a professional MOM.
                  </p>
                </div>

                <button
                  type="button"
                  className="mom-btn mom-btn-light"
                  onClick={downloadTemplate}
                >
                  Download Template
                </button>
              </div>

              <form onSubmit={submit}>
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

                <button
                  type="submit"
                  className="mom-btn mom-btn-primary"
                  disabled={loading}
                  style={{ width: '100%' }}
                >
                  {loading ? (
                    <>
                      <span className="mom-spinner" /> Generating MOM...
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
                  <ProfessionalMOMView mom={result.generated_mom} title={result.meeting_title} />
                  <ExportButtons id={result.id} />
                </div>
              </div>
            )}

            <SectionLabel>History</SectionLabel>

            <div className="mom-card" style={{ padding: 22 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 16,
                  gap: 12,
                }}
              >
                <div>
                  <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, color: C.textH }}>
                    Recent MOMs
                  </h2>

                  <p style={{ fontSize: 12, color: C.textMuted, margin: '4px 0 0' }}>
                    View, export, or send previously generated MOMs.
                  </p>
                </div>

                <button className="mom-btn mom-btn-light" type="button" onClick={fetchHistory}>
                  Refresh
                </button>
              </div>

              {history.length === 0 ? (
                <div className="mom-empty-state">No MOMs generated yet</div>
              ) : (
                <div
                  className="mom-scroll"
                  style={{ maxHeight: 560, overflowY: 'auto', paddingRight: 4 }}
                >
                  {history.map((h) => (
                    <div
                      key={h.id}
                      className="mom-history-item"
                      onClick={() => setSelected(selected?.id === h.id ? null : h)}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: 12,
                          alignItems: 'center',
                        }}
                      >
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
                        <div style={{ marginTop: 16 }}>
                          <ProfessionalMOMView mom={h.generated_mom} title={h.meeting_title} />
                          <ExportButtons id={h.id} />
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