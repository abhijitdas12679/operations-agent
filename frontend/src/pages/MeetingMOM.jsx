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

  .mom-card {
    background: ${C.card};
    border: 1px solid ${C.border};
    border-radius: 18px;
    box-shadow: 0 14px 42px rgba(124, 58, 237, 0.06);
    animation: fadeUp 0.35s ease both;
  }

  .mom-input,
  .mom-textarea {
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

  .mom-input:focus,
  .mom-textarea:focus {
    border-color: ${C.primary};
    box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.10);
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

  .mom-btn:hover {
    transform: translateY(-1px);
  }

  .mom-btn-primary {
    background: linear-gradient(135deg, #7C3AED, #4F46E5);
    color: #fff;
    box-shadow: 0 8px 22px rgba(124, 58, 237, 0.25);
  }

  .mom-btn-secondary {
    background: ${C.primarySoft};
    color: ${C.primaryDark};
  }

  .mom-btn-danger {
    background: #FEE2E2;
    color: #B91C1C;
  }

  .mom-btn:disabled {
    opacity: 0.65;
    cursor: not-allowed;
    transform: none;
  }

  .mom-section-label {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 14px;
  }

  .mom-section-label span:first-child {
    width: 3px;
    height: 16px;
    border-radius: 2px;
    background: linear-gradient(180deg,#7C3AED,#4F46E5);
  }

  .mom-section-label span:last-child {
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: ${C.textLight};
  }

  .mom-report {
    background: #FFFFFF;
    border: 1px solid ${C.border};
    border-radius: 16px;
    overflow: hidden;
  }

  .mom-report-top {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 18px;
    background: linear-gradient(135deg, #F5F3FF, #EEF2FF);
    border-bottom: 1px solid ${C.border};
  }

  .mom-report-icon {
    width: 44px;
    height: 44px;
    border-radius: 13px;
    background: #D1FAE5;
    display: grid;
    place-items: center;
    font-size: 21px;
  }

  .mom-report-body {
    padding: 18px;
  }

  .mom-report-body h3 {
    color: ${C.textH};
    font-size: 15px;
    margin: 14px 0 8px;
  }

  .mom-report-body p {
    color: ${C.textB};
    font-size: 13px;
    line-height: 1.7;
    margin: 8px 0;
  }

  .mom-report-body li {
    color: ${C.textB};
    font-size: 13px;
    line-height: 1.7;
    margin-left: 18px;
  }

  .mom-history-item {
    padding: 13px 14px;
    border-radius: 14px;
    cursor: pointer;
    margin-bottom: 10px;
    border: 1px solid ${C.border};
    background: #FBFAFF;
    transition: background 0.15s ease, transform 0.15s ease;
  }

  .mom-history-item:hover {
    background: #F3F0FF;
    transform: translateY(-1px);
  }

  .mom-alert {
    background: #FEE2E2;
    color: #991B1B;
    padding: 11px 13px;
    border-radius: 12px;
    margin-bottom: 14px;
    font-size: 13px;
    font-weight: 700;
  }

  .mom-spinner {
    width: 15px;
    height: 15px;
    border: 2px solid rgba(255,255,255,0.45);
    border-top-color: #fff;
    border-radius: 50%;
    animation: momSpin 0.75s linear infinite;
  }

  @keyframes momSpin {
    to { transform: rotate(360deg); }
  }
`;

function cleanMomText(text = '') {
  return text.replaceAll('**', '').replaceAll('---', '').trim();
}

function renderMomContent(text = '') {
  const lines = cleanMomText(text)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.map((line, index) => {
    if (line.startsWith('# ')) return null;

    if (line.startsWith('## ')) {
      return <h3 key={index}>{line.replace('## ', '')}</h3>;
    }

    if (line.startsWith('- ') || line.startsWith('* ')) {
      return <li key={index}>{line.slice(2)}</li>;
    }

    return <p key={index}>{line}</p>;
  });
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
  return (
    <div className="mom-report">
      <div className="mom-report-top">
        <div className="mom-report-icon">📝</div>
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: 17,
              fontWeight: 800,
              color: C.textH,
            }}
          >
            Minutes of Meeting
          </h2>
          <p
            style={{
              margin: '3px 0 0',
              fontSize: 12,
              color: C.textMuted,
            }}
          >
            {title || 'Generated by Operations Agent'}
          </p>
        </div>
      </div>

      <div className="mom-report-body">{renderMomContent(mom)}</div>
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
        className="mom-btn mom-btn-secondary"
        onClick={(e) => {
          e.stopPropagation();
          exportDoc('docx');
        }}
        disabled={!!exporting}
      >
        {exporting === 'docx' ? 'Exporting...' : '📄 Export DOCX'}
      </button>

      <button
        className="mom-btn mom-btn-secondary"
        onClick={(e) => {
          e.stopPropagation();
          exportDoc('pdf');
        }}
        disabled={!!exporting}
      >
        {exporting === 'pdf' ? 'Exporting...' : '📕 Export PDF'}
      </button>

      <button
        className="mom-btn mom-btn-primary"
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/send-mom?meetingId=${id}`);
        }}
        disabled={!id}
      >
        📤 Send MOM
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

  const submit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await api.post('/meeting/generate-mom', form);
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
            Meeting MOM Generator 📝
          </h1>
          <p style={{ fontSize: 13, color: C.textMuted, marginTop: 4 }}>
            Convert rough meeting notes into clean, professional minutes of meeting
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(320px, 420px) minmax(0, 1fr)',
            gap: 20,
            alignItems: 'start',
          }}
        >
          <div>
            <SectionLabel>Create MOM</SectionLabel>

            <div className="mom-card" style={{ padding: 22 }}>
              <h2
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  marginBottom: 18,
                  color: C.textH,
                }}
              >
                Generate Minutes of Meeting
              </h2>

              {error && <div className="mom-alert">{error}</div>}

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
                    style={{ minHeight: 175, resize: 'vertical' }}
                    placeholder={
                      'Paste your raw notes here...\n' +
                      '- Discussed Q4 roadmap\n' +
                      '- John to deliver feature X by Friday\n' +
                      '- Budget approved for $5k tools'
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
                    '🤖 Generate MOM'
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
              <h2
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  marginBottom: 14,
                  color: C.textH,
                }}
              >
                Recent MOMs
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
                  No MOMs generated yet
                </div>
              ) : (
                <div style={{ maxHeight: 520, overflowY: 'auto', paddingRight: 4 }}>
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
                            {h.meeting_title}
                          </div>

                          <div style={{ fontSize: 11, color: C.textLight, marginTop: 3 }}>
                            {h.created_at ? new Date(h.created_at).toLocaleString() : ''}
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