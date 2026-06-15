import React, { useEffect, useState } from 'react';
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

  @keyframes reportSpin {
    to { transform: rotate(360deg); }
  }

  .report-card {
    background: ${C.card};
    border: 1px solid ${C.border};
    border-radius: 20px;
    box-shadow: 0 16px 40px rgba(17, 24, 39, 0.06);
    animation: fadeUp 0.3s ease both;
  }

  .report-input,
  .report-textarea {
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

  .report-input:focus,
  .report-textarea:focus {
    border-color: ${C.primary};
    box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.12);
  }

  .report-label {
    display: block;
    font-size: 12px;
    color: ${C.textMuted};
    font-weight: 700;
    margin-bottom: 7px;
  }

  .report-btn {
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

  .report-btn:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  .report-btn-primary {
    background: linear-gradient(135deg, #4F46E5, #2563EB);
    color: #fff;
    box-shadow: 0 10px 24px rgba(79, 70, 229, 0.26);
  }

  .report-btn-secondary {
    background: ${C.primarySoft};
    color: ${C.primaryDark};
  }

  .report-btn-light {
    background: #F9FAFB;
    color: ${C.textB};
    border: 1px solid ${C.border};
  }

  .report-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .report-section-label {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 14px;
  }

  .report-section-label span:first-child {
    width: 34px;
    height: 3px;
    border-radius: 999px;
    background: linear-gradient(90deg, #4F46E5, #2563EB);
  }

  .report-section-label span:last-child {
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${C.textMuted};
  }

  .professional-report {
    background: #FFFFFF;
    border: 1px solid ${C.border};
    border-radius: 18px;
    overflow: hidden;
  }

  .report-top {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 20px;
    background: linear-gradient(135deg, #F8FAFC, #EEF2FF);
    border-bottom: 1px solid ${C.border};
  }

  .report-icon {
    width: 46px;
    height: 46px;
    border-radius: 14px;
    background: linear-gradient(135deg, #4F46E5, #2563EB);
    display: grid;
    place-items: center;
    color: #FFFFFF;
    font-size: 18px;
    font-weight: 800;
    flex-shrink: 0;
  }

  .report-meta-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    padding: 18px 18px 0;
  }

  .report-meta-card {
    background: #F9FAFB;
    border: 1px solid ${C.border};
    border-radius: 14px;
    padding: 13px;
  }

  .report-meta-card span {
    display: block;
    font-size: 11px;
    color: ${C.textMuted};
    font-weight: 800;
    margin-bottom: 6px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .report-meta-card strong {
    color: ${C.textH};
    font-size: 13px;
  }

  .report-body {
    padding: 20px;
  }

  .report-body h3 {
    color: ${C.textH};
    font-size: 15px;
    margin: 16px 0 8px;
  }

  .report-body p {
    color: ${C.textB};
    font-size: 13px;
    line-height: 1.75;
    margin: 8px 0;
  }

  .report-body li {
    color: ${C.textB};
    font-size: 13px;
    line-height: 1.75;
    margin-left: 18px;
  }

  .report-history-item {
    padding: 14px;
    border-radius: 16px;
    cursor: pointer;
    margin-bottom: 10px;
    border: 1px solid ${C.border};
    background: #FFFFFF;
    transition: 0.18s ease;
  }

  .report-history-item:hover {
    background: #F8FAFC;
    transform: translateY(-1px);
    box-shadow: 0 10px 22px rgba(17, 24, 39, 0.05);
  }

  .report-alert {
    background: ${C.dangerBg};
    color: ${C.dangerText};
    padding: 13px 15px;
    border-radius: 14px;
    margin-bottom: 16px;
    font-size: 13px;
    font-weight: 700;
    border: 1px solid #FECACA;
  }

  .report-spinner {
    width: 15px;
    height: 15px;
    border: 2px solid rgba(255,255,255,0.45);
    border-top-color: #fff;
    border-radius: 50%;
    animation: reportSpin 0.75s linear infinite;
  }

  .report-scroll::-webkit-scrollbar {
    width: 6px;
  }

  .report-scroll::-webkit-scrollbar-thumb {
    background: #CBD5E1;
    border-radius: 999px;
  }

  @media (max-width: 950px) {
    .daily-report-grid {
      grid-template-columns: 1fr !important;
    }

    .daily-report-page {
      padding: 24px 18px 48px !important;
    }

    .report-meta-grid {
      grid-template-columns: 1fr;
    }
  }
`;

function cleanReportText(text = '') {
  return text
    .replaceAll('**', '')
    .replaceAll('###', '')
    .replaceAll('##', '')
    .replaceAll('#', '')
    .replaceAll('---', '')
    .trim();
}

function renderReportContent(text = '') {
  const lines = cleanReportText(text)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.map((line, index) => {
    const cleanLine = line.replace(/^\d+\.\s*/, '').trim();

    const headings = [
      'DAILY PROGRESS REPORT',
      'Executive Summary:',
      'Tasks Completed:',
      'Challenges Faced:',
      'Next Action Plan:',
      'Overall Status:',
    ];

    const isHeading = headings.some(
      (heading) => line.toLowerCase() === heading.toLowerCase()
    );

    if (line.toUpperCase() === 'DAILY PROGRESS REPORT') return null;

    if (isHeading) {
      return <h3 key={index}>{line.replace(':', '')}</h3>;
    }

    if (/^\d+\./.test(line) || line.startsWith('- ') || line.startsWith('* ')) {
      return (
        <li key={index}>
          {line.startsWith('- ') || line.startsWith('* ') ? line.slice(2) : cleanLine}
        </li>
      );
    }

    return <p key={index}>{line}</p>;
  });
}

function SectionLabel({ children }) {
  return (
    <div className="report-section-label">
      <span />
      <span>{children}</span>
    </div>
  );
}

function ProfessionalReportView({ report, date, teamName }) {
  return (
    <div className="professional-report">
      <div className="report-top">
        <div className="report-icon">DR</div>

        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: C.textH }}>
            Daily Progress Report
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: C.textMuted }}>
            Generated by Operations Agent
          </p>
        </div>
      </div>

      <div className="report-meta-grid">
        <div className="report-meta-card">
          <span>Date</span>
          <strong>{date || 'N/A'}</strong>
        </div>

        <div className="report-meta-card">
          <span>Team / Project</span>
          <strong>{teamName || 'N/A'}</strong>
        </div>
      </div>

      <div className="report-body">{renderReportContent(report)}</div>
    </div>
  );
}

function ExportButtons({ id, docType }) {
  const [exporting, setExporting] = useState('');
  const navigate = useNavigate();

  const exportDoc = async (fmt) => {
    setExporting(fmt);

    try {
      const res = await api.post(`/documents/export-${fmt}`, {
        content_id: id,
        doc_type: docType,
        export_format: fmt,
      });

      await forceDownload(res.data.download_url);
    } catch (e) {
      alert('Export failed: ' + (e.response?.data?.detail || e.message));
    } finally {
      setExporting('');
    }
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
        className="report-btn report-btn-secondary"
        onClick={(e) => {
          e.stopPropagation();
          exportDoc('docx');
        }}
        disabled={!!exporting}
      >
        {exporting === 'docx' ? 'Exporting...' : 'Export DOCX'}
      </button>

      <button
        className="report-btn report-btn-secondary"
        onClick={(e) => {
          e.stopPropagation();
          exportDoc('pdf');
        }}
        disabled={!!exporting}
      >
        {exporting === 'pdf' ? 'Exporting...' : 'Export PDF'}
      </button>

      <button
        className="report-btn report-btn-primary"
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/send-report?reportId=${id}`);
        }}
        disabled={!id}
      >
        Send Report
      </button>
    </div>
  );
}

export default function DailyReport() {
  const today = new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState({
    date: today,
    team_name: '',
    tasks_completed: '',
    blockers: '',
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState(null);

  const fetchHistory = () => {
    api
      .get('/report/history')
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

  const submit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await api.post('/report/generate', form);
      setResult(res.data);
      fetchHistory();
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
        className="daily-report-page"
        style={{
          minHeight: '100vh',
          background: C.pageBg,
          fontFamily: FONT,
          padding: '32px 36px 64px',
        }}
      >
        <div
          className="report-card"
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
                Report Automation
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
                Daily Progress Report
              </h1>

              <p
                style={{
                  fontSize: 14,
                  color: C.textMuted,
                  margin: '8px 0 0',
                  maxWidth: 680,
                }}
              >
                Generate structured daily updates, export them as PDF or DOCX, and send polished
                reports directly to recipients.
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
              <div className="report-card" style={{ padding: 16 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: C.textH }}>
                  {history.length}
                </div>
                <div style={{ fontSize: 12, color: C.textMuted, fontWeight: 700 }}>
                  Reports
                </div>
              </div>

              <div className="report-card" style={{ padding: 16 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: C.primary }}>
                  {result ? 1 : 0}
                </div>
                <div style={{ fontSize: 12, color: C.textMuted, fontWeight: 700 }}>
                  Generated
                </div>
              </div>

              <div className="report-card" style={{ padding: 16 }}>
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

        <div
          className="daily-report-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(320px, 420px) minmax(0, 1fr)',
            gap: 22,
            alignItems: 'start',
          }}
        >
          <div>
            <SectionLabel>Create Report</SectionLabel>

            <div className="report-card" style={{ padding: 22 }}>
              <h2 style={{ fontSize: 17, fontWeight: 800, margin: '0 0 4px', color: C.textH }}>
                Generate Daily Report
              </h2>

              <p style={{ fontSize: 12, color: C.textMuted, margin: '0 0 18px' }}>
                Enter daily work details and generate a professional report.
              </p>

              {error && <div className="report-alert">{error}</div>}

              <form onSubmit={submit}>
                <div style={{ marginBottom: 15 }}>
                  <label className="report-label">Date</label>
                  <input
                    className="report-input"
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handle}
                    required
                  />
                </div>

                <div style={{ marginBottom: 15 }}>
                  <label className="report-label">Team / Project Name</label>
                  <input
                    className="report-input"
                    name="team_name"
                    value={form.team_name}
                    onChange={handle}
                    required
                    placeholder="e.g. Operations Automation Agent"
                  />
                </div>

                <div style={{ marginBottom: 15 }}>
                  <label className="report-label">Tasks Completed Today</label>
                  <textarea
                    className="report-textarea"
                    name="tasks_completed"
                    value={form.tasks_completed}
                    onChange={handle}
                    required
                    style={{ minHeight: 145, resize: 'vertical' }}
                    placeholder={
                      '- Implemented user authentication\n' +
                      '- Fixed report export issue\n' +
                      '- Reviewed dashboard UI'
                    }
                  />
                </div>

                <div style={{ marginBottom: 18 }}>
                  <label className="report-label">Blockers / Challenges</label>
                  <textarea
                    className="report-textarea"
                    name="blockers"
                    value={form.blockers}
                    onChange={handle}
                    style={{ minHeight: 105, resize: 'vertical' }}
                    placeholder={'- Waiting for API credentials\n- No blockers'}
                  />
                </div>

                <button
                  type="submit"
                  className="report-btn report-btn-primary"
                  disabled={loading}
                  style={{ width: '100%' }}
                >
                  {loading ? (
                    <>
                      <span className="report-spinner" /> Generating...
                    </>
                  ) : (
                    'Generate Report'
                  )}
                </button>
              </form>
            </div>
          </div>

          <div>
            {result && (
              <div style={{ marginBottom: 22 }}>
                <SectionLabel>Generated Report</SectionLabel>

                <div className="report-card" style={{ padding: 22 }}>
                  <ProfessionalReportView
                    report={result.generated_report}
                    date={result.date || form.date}
                    teamName={result.team_name || form.team_name}
                  />

                  <ExportButtons id={result.id} docType="report" />
                </div>
              </div>
            )}

            <SectionLabel>History</SectionLabel>

            <div className="report-card" style={{ padding: 22 }}>
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
                    Recent Reports
                  </h2>

                  <p style={{ fontSize: 12, color: C.textMuted, margin: '4px 0 0' }}>
                    View, export, or send previously generated reports.
                  </p>
                </div>

                <button className="report-btn report-btn-light" type="button" onClick={fetchHistory}>
                  Refresh
                </button>
              </div>

              {history.length === 0 ? (
                <div
                  style={{
                    padding: '46px 16px',
                    textAlign: 'center',
                    color: C.textLight,
                    fontSize: 13,
                    background: '#F9FAFB',
                    borderRadius: 18,
                    border: `1px dashed ${C.border}`,
                  }}
                >
                  No reports generated yet
                </div>
              ) : (
                <div className="report-scroll" style={{ maxHeight: 560, overflowY: 'auto', paddingRight: 4 }}>
                  {history.map((h) => (
                    <div
                      key={h.id}
                      className="report-history-item"
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
                            {h.team_name || 'Daily Report'}
                          </div>

                          <div style={{ fontSize: 11, color: C.textLight, marginTop: 4 }}>
                            {h.date || ''}{' '}
                            {h.created_at ? `· ${new Date(h.created_at).toLocaleString()}` : ''}
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
                          <ProfessionalReportView
                            report={h.generated_report}
                            date={h.date}
                            teamName={h.team_name}
                          />

                          <ExportButtons id={h.id} docType="report" />
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