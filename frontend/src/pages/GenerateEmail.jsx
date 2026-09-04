import React from 'react';
import { Link } from 'react-router-dom';

const C = {
  pageBg: 'var(--oa-page-bg)',
  card: 'var(--oa-card)',
  border: 'var(--oa-border)',
  textH: 'var(--oa-text-h)',
  textB: 'var(--oa-text-b)',
  textMuted: 'var(--oa-text-muted)',
  primary: 'var(--oa-primary)',
  primaryDark: 'var(--oa-primary-dark)',
  primarySoft: 'var(--oa-primary-soft)',
  success: 'var(--oa-success-text)',
  warning: 'var(--oa-warning-text)',
  info: 'var(--oa-info-text)',
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

  .generate-card {
    background: ${C.card};
    border: 1px solid ${C.border};
    border-radius: 20px;
    padding: 22px;
    text-decoration: none;
    min-height: 240px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 16px 40px rgba(var(--oa-shadow-rgb), 0.06);
    animation: fadeUp 0.3s ease both;
    transition: 0.18s ease;
    display: flex;
    flex-direction: column;
  }

  .generate-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 50px rgba(var(--oa-shadow-rgb), 0.10);
    border-color: var(--oa-card-hover-border);
  }

  .generate-card::after {
    content: "";
    position: absolute;
    inset: auto -40px -55px auto;
    width: 150px;
    height: 150px;
    border-radius: 999px;
    background: var(--oa-deco-circle);
  }

  .generate-section-label {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 14px;
  }

  .generate-section-label span:first-child {
    width: 34px;
    height: 3px;
    border-radius: 999px;
    background: var(--oa-bar-grad);
  }

  .generate-section-label span:last-child {
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${C.textMuted};
  }

  .generate-card-btn {
    display: inline-flex;
    align-items: center;
    margin-top: auto;
    font-size: 13px;
    font-weight: 800;
    position: relative;
    z-index: 1;
  }

  .generate-card-btn span {
    margin-left: 6px;
    transition: 0.18s ease;
  }

  .generate-card:hover .generate-card-btn span {
    transform: translateX(4px);
  }

  @media (max-width: 1000px) {
    .generate-grid {
      grid-template-columns: 1fr !important;
    }

    .generate-page {
      padding: 24px 18px 48px !important;
    }

    .generate-hero-stats {
      grid-template-columns: 1fr !important;
      min-width: 100% !important;
    }
  }
`;

const emailOptions = [
  {
    path: '/email',
    label: 'TE',
    title: 'Single Email',
    desc: 'Search and select from saved DOCX email templates, fill details, generate, download the original template, and send.',
    accent: C.primary,
    softBg: 'var(--oa-accent-soft-blue)',
    button: 'Use Email Templates',
  },
  {
    path: '/bulk-email',
    label: 'BE',
    title: 'Bulk Email',
    desc: 'Upload Excel data and generate personalized emails for multiple recipients.',
    accent: C.success,
    softBg: 'var(--oa-accent-soft-green)',
    button: 'Start Bulk Email',
  },
  {
    path: '/email-settings',
    label: 'ES',
    title: 'Email Settings',
    desc: 'Connect Gmail, Outlook, or custom SMTP before sending emails from your account.',
    accent: C.warning,
    softBg: 'var(--oa-accent-soft-amber)',
    button: 'Configure Settings',
  },
];

function SectionLabel({ children }) {
  return (
    <div className="generate-section-label">
      <span />
      <span>{children}</span>
    </div>
  );
}

export default function GenerateEmail() {
  return (
    <>
      <style>{GLOBAL_CSS}</style>

      <div
        className="generate-page"
        style={{
          minHeight: '100vh',
          background: C.pageBg,
          fontFamily: FONT,
          padding: '32px 36px 64px',
        }}
      >
        <div
          style={{
            marginBottom: 24,
            background: 'var(--oa-hero-grad)',
            border: `1px solid ${C.border}`,
            borderRadius: 24,
            padding: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 22,
            boxShadow: '0 16px 40px rgba(var(--oa-shadow-rgb), 0.06)',
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
              Email Automation
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
              Generate Email
            </h1>

            <p
              style={{
                fontSize: 14,
                color: C.textMuted,
                margin: '8px 0 0',
                maxWidth: 720,
                lineHeight: 1.7,
              }}
            >
              Generate professional emails using saved templates, bulk Excel upload,
              and your connected SMTP account.
            </p>
          </div>

          <div
            className="generate-hero-stats"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(92px, 1fr))',
              gap: 12,
              minWidth: 340,
            }}
          >
            <div className="generate-card" style={{ minHeight: 'auto', padding: 16 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.primary }}>DOCX</div>
              <div style={{ fontSize: 12, color: C.textMuted, fontWeight: 700 }}>Templates</div>
            </div>

            <div className="generate-card" style={{ minHeight: 'auto', padding: 16 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.info }}>AI</div>
              <div style={{ fontSize: 12, color: C.textMuted, fontWeight: 700 }}>Powered</div>
            </div>

            <div className="generate-card" style={{ minHeight: 'auto', padding: 16 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.success }}>SMTP</div>
              <div style={{ fontSize: 12, color: C.textMuted, fontWeight: 700 }}>Ready</div>
            </div>
          </div>
        </div>

        <SectionLabel>Email Tools</SectionLabel>

        <div
          className="generate-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(220px, 1fr))',
            gap: 22,
          }}
        >
          {emailOptions.map((item, index) => (
            <Link
              key={item.path}
              to={item.path}
              className="generate-card"
              style={{
                animationDelay: `${index * 70}ms`,
                borderTop: `4px solid ${item.accent}`,
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  background: item.softBg,
                  color: item.accent,
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 15,
                  fontWeight: 900,
                  marginBottom: 18,
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                {item.label}
              </div>

              <h2
                style={{
                  fontSize: 17,
                  fontWeight: 800,
                  color: C.textH,
                  margin: '0 0 8px',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                {item.title}
              </h2>

              <p
                style={{
                  fontSize: 13,
                  color: C.textMuted,
                  lineHeight: 1.7,
                  margin: '0 0 24px',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                {item.desc}
              </p>

              <span
                className="generate-card-btn"
                style={{
                  color: item.accent,
                }}
              >
                {item.button}
                <span>→</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}