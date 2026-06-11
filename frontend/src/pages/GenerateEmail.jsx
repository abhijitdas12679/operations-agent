import React from 'react';
import { Link } from 'react-router-dom';

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

  .generate-card {
    background: ${C.card};
    border: 1px solid ${C.border};
    border-radius: 18px;
    padding: 22px;
    text-decoration: none;
    min-height: 230px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 14px 42px rgba(124, 58, 237, 0.06);
    animation: fadeUp 0.35s ease both;
    transition: transform 0.18s ease, box-shadow 0.18s ease;
  }

  .generate-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 18px 50px rgba(124, 58, 237, 0.12);
  }

  .generate-section-label {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 14px;
  }

  .generate-section-label span:first-child {
    width: 3px;
    height: 16px;
    border-radius: 2px;
    background: linear-gradient(180deg,#7C3AED,#4F46E5);
  }

  .generate-section-label span:last-child {
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: ${C.textLight};
  }

  .generate-card-btn {
    display: inline-flex;
    align-items: center;
    margin-top: auto;
    font-size: 13px;
    font-weight: 800;
  }

  @media (max-width: 900px) {
    .generate-grid {
      grid-template-columns: 1fr !important;
    }
  }
`;

const emailOptions = [
  {
    path: '/email',
    icon: '✉️',
    title: 'Single Email',
    desc: 'Generate one professional AI email with recipient details, tone and context.',
    iconBg: '#EDE9FE',
    accent: '#7C3AED',
    button: 'Create Single Email',
  },
  {
    path: '/bulk-email',
    icon: '📨',
    title: 'Bulk Email',
    desc: 'Upload Excel and generate personalized emails for multiple recipients.',
    iconBg: '#D1FAE5',
    accent: '#10B981',
    button: 'Start Bulk Email',
  },
  {
    path: '/email-settings',
    icon: '⚙️',
    title: 'Email Settings',
    desc: 'Connect Gmail, Outlook or SMTP account for sending emails.',
    iconBg: '#FEF3C7',
    accent: '#F59E0B',
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
        style={{
          minHeight: '100vh',
          background: C.pageBg,
          fontFamily: FONT,
          padding: '36px 40px 64px',
        }}
      >
        <div
          style={{
            marginBottom: 34,
            background: 'linear-gradient(135deg, #FFFFFF, #F5F3FF)',
            border: `1px solid ${C.border}`,
            borderRadius: 22,
            padding: 26,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 18,
            boxShadow: '0 14px 42px rgba(124, 58, 237, 0.06)',
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: C.textLight,
                marginBottom: 8,
              }}
            >
              Email Automation
            </div>

            <h1
              style={{
                fontSize: 28,
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
                fontSize: 13,
                color: C.textMuted,
                marginTop: 6,
                maxWidth: 560,
                lineHeight: 1.6,
              }}
            >
              Choose how you want to generate, personalize, and send emails using your AI Operations Agent.
            </p>
          </div>

          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: 'linear-gradient(135deg,#7C3AED,#4F46E5)',
              color: '#fff',
              display: 'grid',
              placeItems: 'center',
              fontSize: 30,
              boxShadow: '0 10px 28px rgba(124,58,237,0.28)',
              flexShrink: 0,
            }}
          >
            ✉️
          </div>
        </div>

        <SectionLabel>Email Tools</SectionLabel>

        <div
          className="generate-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(220px, 1fr))',
            gap: 18,
          }}
        >
          {emailOptions.map((item, index) => (
            <Link
              key={item.path}
              to={item.path}
              className="generate-card"
              style={{
                animationDelay: `${index * 70}ms`,
                borderTop: `3px solid ${item.accent}`,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: 90,
                  height: 90,
                  borderRadius: '0 18px 0 90px',
                  background: item.iconBg,
                  opacity: 0.7,
                }}
              />

              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 14,
                  background: item.iconBg,
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 23,
                  marginBottom: 18,
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                {item.icon}
              </div>

              <h2
                style={{
                  fontSize: 16,
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
                  lineHeight: 1.6,
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
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                {item.button} →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}