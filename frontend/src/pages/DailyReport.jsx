import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { forceDownload } from '../utils/download';

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

  @keyframes reportSpin {
    to { transform: rotate(360deg); }
  }

  .report-card {
    background: ${C.card};
    border: 1px solid ${C.border};
    border-radius: 18px;
    box-shadow: 0 14px 42px rgba(124, 58, 237, 0.06);
    animation: fadeUp 0.35s ease both;
  }

  .report-input,
  .report-textarea {
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

  .report-input:focus,
  .report-textarea:focus {
    border-color: ${C.primary};
    box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.10);
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

  .report-btn:hover {
    transform: translateY(-1px);
  }

  .report-btn-primary {
    background: linear-gradient(135deg, #7C3AED, #4F46E5);
    color: #fff;
    box-shadow: 0 8px 22px rgba(124, 58, 237, 0.25);
  }

  .report-btn-secondary {
    background: ${C.primarySoft};
    color: ${C.primaryDark};
  }

  .report-btn:disabled {
    opacity: 0.65;
    cursor: not-allowed;
    transform: none;
  }

  .report-section-label {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 14px;
  }

  .report-section-label span:first-child {
    width: 3px;
    height: 16px;
    border-radius: 2px;
    background: linear-gradient(180deg,#7C3AED,#4F46E5);
  }

  .report-section-label span:last-child {
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: ${C.textLight};
  }

  .professional-report {
    background: #FFFFFF;
    border: 1px solid ${C.border};
    border-radius: 16px;
    overflow: hidden;
  }

  .report-top {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 18px;
    background: linear-gradient(135deg, #F5F3FF, #EEF2FF);
    border-bottom: 1px solid ${C.border};
  }

  .report-icon {
    width: 44px;
    height: 44px;
    border-radius: 13px;
    background: #DBEAFE;
    display: grid;
    place-items: center;
    font-size: 21px;
  }

  .report-meta-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    padding: 18px 18px 0;
  }

  .report-meta-card {
    background: #FBFAFF;
    border: 1px solid ${C.border};
    border-radius: 13px;
    padding: 12px;
  }

  .report-meta-card span {
    display: block;
    font-size: 11px;
    color: ${C.textMuted};
    font-weight: 700;
    margin-bottom: 5px;
  }

  .report-meta-card strong {
    color: ${C.textH};
    font-size: 13px;
  }

  .report-body {
    padding: 18px;
  }

  .report-body h3 {
    color: ${C.textH};
    font-size: 15px;
    margin: 14px 0 8px;
  }

  .report-body p {
    color: ${C.textB};
    font-size: 13px;
    line-height: 1.7;
    margin: 8px 0;
  }

  .report-body li {
    color: ${C.textB};
    font-size: 13px;
    line-height: 1.7;
    margin-left: 18px;
  }

  .report-history-item {
    padding: 13px 14px;
    border-radius: 14px;
    cursor: pointer;
    margin-bottom: 10px;
    border: 1px solid ${C.border};
    background: #FBFAFF;
    transition: background 0.15s ease, transform 0.15s ease;
  }

  .report-history-item:hover {
    background: #F3F0FF;
    transform: translateY(-1px);
  }

  .report-alert {
    background: #FEE2E2;
    color: #991B1B;
    padding: 11px 13px;
    border-radius: 12px;
    margin-bottom: 14px;
    font-size: 13px;
    font-weight: 700;
  }

  .report-spinner {
    width: 15px;
    height: 15px;
    border: 2px solid rgba(255,255,255,0.45);
    border-top-color: #fff;
    border-radius: 50%;
    animation: reportSpin 0.75s linear infinite;
  }

  @media (max-width: 950px) {
    .daily-report-grid {
      grid-template-columns: 1fr !important;
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
        <div className="report-icon">📋</div>

        <div>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: C.textH }}>
            Daily Progress Report
          </h2>
          <p style={{ margin: '3px 0 0', fontSize: 12, color: C.textMuted }}>
            Generated by Operations Agent
          </p>
        </div>
      </div>

      <div className="report-meta-grid">
        <div className="report-meta-card">
          <span>📅 Date</span>
          <strong>{date || 'N/A'}</strong>
        </div>

        <div className="report-meta-card">
          <span>👥 Team / Project</span>
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
        marginTop: 14,
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
        {exporting === 'docx' ? 'Exporting...' : '📄 Export DOCX'}
      </button>

      <button
        className="report-btn report-btn-secondary"
        onClick={(e) => {
          e.stopPropagation();
          exportDoc('pdf');
        }}
        disabled={!!exporting}
      >
        {exporting === 'pdf' ? 'Exporting...' : '📕 Export PDF'}
      </button>

      <button
        className="report-btn report-btn-primary"
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/send-report?reportId=${id}`);
        }}
        disabled={!id}
      >
        📤 Send Report
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
            Daily Progress Report 📋
          </h1>

          <p style={{ fontSize: 13, color: C.textMuted, marginTop: 4 }}>
            Generate, export, and send professional daily reports
          </p>
        </div>

        <div
          className="daily-report-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(320px, 420px) minmax(0, 1fr)',
            gap: 20,
            alignItems: 'start',
          }}
        >
          <div>
            <SectionLabel>Create Report</SectionLabel>

            <div className="report-card" style={{ padding: 22 }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 18, color: C.textH }}>
                Generate Daily Report
              </h2>

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
                    placeholder="e.g. Backend Engineering Team"
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
                    style={{ minHeight: 130, resize: 'vertical' }}
                    placeholder={
                      '- Implemented user authentication\n' +
                      '- Fixed bug in payment module\n' +
                      '- Reviewed 3 PRs'
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
                    style={{ minHeight: 95, resize: 'vertical' }}
                    placeholder={'- Waiting for API credentials from DevOps\n- None'}
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
                    '🤖 Generate Report'
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
              <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 14, color: C.textH }}>
                Recent Reports
              </h2>

              {history.length === 0 ? (
                <div
                  style={{
                    padding: '30px 0',
                    textAlign: 'center',
                    color: C.textLight,
                    fontSize: 13,
                  }}
                >
                  No reports generated yet
                </div>
              ) : (
                <div style={{ maxHeight: 520, overflowY: 'auto', paddingRight: 4 }}>
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

                          <div style={{ fontSize: 11, color: C.textLight, marginTop: 3 }}>
                            {h.date || ''} {h.created_at ? `· ${new Date(h.created_at).toLocaleString()}` : ''}
                          </div>
                        </div>

                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 800,
                            color: C.primaryDark,
                            background: C.primarySoft,
                            padding: '5px 9px',
                            borderRadius: 999,
                            flexShrink: 0,
                          }}
                        >
                          {selected?.id === h.id ? 'Hide' : 'View'}
                        </span>
                      </div>

                      {selected?.id === h.id && (
                        <div style={{ marginTop: 14 }}>
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