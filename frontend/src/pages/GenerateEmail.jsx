import React from 'react';
import { Link } from 'react-router-dom';

const emailOptions = [
  {
    path: '/email',
    icon: '✉️',
    title: 'Single Email',
    desc: 'Generate one professional AI email with recipient details, tone and context.',
    color: '#3a7bd5',
    button: 'Create Single Email',
  },
  {
    path: '/bulk-email',
    icon: '📨',
    title: 'Bulk Email',
    desc: 'Upload Excel and generate personalized emails for multiple recipients.',
    color: '#00c9a7',
    button: 'Start Bulk Email',
  },
  {
    path: '/email-settings',
    icon: '⚙️',
    title: 'Email Settings',
    desc: 'Connect Gmail, Outlook or SMTP account for sending emails.',
    color: '#f59e0b',
    button: 'Configure Settings',
  },
];

export default function GenerateEmail() {
  return (
    <div className="page generate-email-page">
      <div className="generate-hero">
        <div>
          <p className="eyebrow">Email Automation</p>
          <h1>Generate Email</h1>
          <p>
            Choose how you want to generate and send emails using your AI Operations Agent.
          </p>
        </div>
        <div className="hero-icon">✉️</div>
      </div>

      <div className="generate-email-grid">
        {emailOptions.map((item) => (
          <Link key={item.path} to={item.path} className="email-feature-card">
            <div className="feature-card-top" style={{ background: item.color }} />
            <div className="feature-icon">{item.icon}</div>
            <h2>{item.title}</h2>
            <p>{item.desc}</p>
            <span className="feature-btn">{item.button} →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}