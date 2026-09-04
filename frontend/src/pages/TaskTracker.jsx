import React, { useEffect, useMemo, useState } from "react";
import api from "../api";
import { forceDownload } from "../utils/download";

const FONT = "'DM Sans', system-ui, -apple-system, sans-serif";

const T = {
  canvas: "var(--tp-canvas)",
  card: "var(--tp-card)",
  cardBorder: "var(--tp-card-border)",
  shadow: "0 1px 4px rgba(var(--oa-shadow-rgb),0.07)",
  shadowMd: "0 4px 20px rgba(var(--oa-shadow-rgb),0.09)",
  shadowLg: "0 16px 48px rgba(var(--oa-shadow-rgb),0.13)",

  brand: "var(--tp-brand)",
  brandDark: "var(--tp-brand-dark)",
  brandLight: "var(--tp-brand-light)",
  brandBorder: "var(--tp-brand-border)",

  low: { ink: "var(--tp-low-ink)", bg: "var(--tp-low-bg)", border: "var(--tp-low-ink)", bar: "var(--tp-low-bar)" },
  medium: { ink: "var(--tp-med-ink)", bg: "var(--tp-med-bg)", border: "var(--tp-med-ink)", bar: "var(--tp-med-bar)" },
  high: { ink: "var(--tp-high-ink)", bg: "var(--tp-high-bg)", border: "var(--tp-high-ink)", bar: "var(--tp-high-bar)" },
  critical: { ink: "var(--tp-crit-ink)", bg: "var(--tp-crit-bg)", border: "var(--tp-crit-ink)", bar: "var(--tp-crit-bar)" },

  pending: { ink: "var(--tp-st-pending-ink)", bg: "var(--tp-st-pending-bg)" },
  in_progress: { ink: "var(--tp-st-prog-ink)", bg: "var(--tp-st-prog-bg)" },
  waiting_approval: { ink: "var(--tp-st-wait-ink)", bg: "var(--tp-st-wait-bg)" },
  blocked: { ink: "var(--tp-st-block-ink)", bg: "var(--tp-st-block-bg)" },
  completed: { ink: "var(--tp-st-done-ink)", bg: "var(--tp-st-done-bg)" },
  cancelled: { ink: "var(--oa-text-muted)", bg: "var(--oa-subtle-bg)" },

  ink: "var(--tp-ink)",
  inkMid: "var(--tp-ink-mid)",
  inkMute: "var(--tp-ink-mute)",
  inkFaint: "var(--tp-ink-faint)",
  divider: "var(--tp-divider)",
};

const progressGradient = (pct) => {
  if (pct >= 80) return "linear-gradient(90deg,#10B981,#34D399)";
  if (pct >= 50) return "linear-gradient(90deg,#3B82F6,#60A5FA)";
  if (pct >= 25) return "linear-gradient(90deg,#F59E0B,#FCD34D)";
  return "linear-gradient(90deg,#EF4444,#F87171)";
};

const STATUSES = ["pending", "in_progress", "waiting_approval", "blocked", "completed", "cancelled"];
const PRIORITIES = ["low", "medium", "high", "critical"];

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }

  body { background:${T.canvas}; }

  @keyframes tFadeUp {
    from { opacity:0; transform:translateY(10px); }
    to { opacity:1; transform:translateY(0); }
  }

  @keyframes tExpandIn {
    from { opacity:0; transform:translateY(-6px); }
    to { opacity:1; transform:translateY(0); }
  }

  .tp-page {
    min-height:100vh;
    background:${T.canvas};
    font-family:${FONT};
    padding:28px 32px 80px;
    transition: background .25s ease, color .25s ease;
  }

  .tp-card {
    background:${T.card};
    border:1.5px solid ${T.cardBorder};
    border-radius:16px;
    box-shadow:${T.shadow};
    transition: background .25s ease, border-color .25s ease, color .25s ease;
  }

  .tp-hero-card {
    padding:26px 28px;
    margin-bottom:24px;
    background:
      radial-gradient(circle at top right, rgba(var(--oa-focus-rgb), 0.16), transparent 34%),
      linear-gradient(135deg, var(--tp-card) 0%, var(--tp-card) 58%, var(--oa-subtle-bg) 100%);
    animation:tFadeUp .4s ease both;
  }

  .tp-input, .tp-select, .tp-textarea {
    width:100%;
    border:1.5px solid ${T.cardBorder};
    background:var(--tp-input-bg);
    border-radius:10px;
    padding:10px 13px;
    font-size:13px;
    color:${T.ink};
    outline:none;
    font-family:${FONT};
    transition:border-color .15s, box-shadow .15s, background .25s ease;
    -webkit-appearance:none;
  }

  .tp-select option {
    background:var(--tp-input-bg);
    color:${T.ink};
  }

  .tp-input::placeholder,
  .tp-textarea::placeholder {
    color:${T.inkMute};
  }

  .tp-input:focus, .tp-select:focus, .tp-textarea:focus {
    border-color:${T.brand};
    box-shadow:0 0 0 3px rgba(var(--oa-focus-rgb),.12);
    background:var(--tp-input-focus-bg);
  }

  .tp-textarea { resize:vertical; }

  .tp-label {
    display:block;
    font-size:11px;
    font-weight:700;
    letter-spacing:.05em;
    text-transform:uppercase;
    color:${T.inkMute};
    margin-bottom:6px;
  }

  .tp-btn {
    border:none;
    border-radius:9px;
    font-size:12.5px;
    font-weight:700;
    cursor:pointer;
    font-family:${FONT};
    display:inline-flex;
    align-items:center;
    justify-content:center;
    gap:6px;
    transition:transform .15s ease, box-shadow .15s ease, opacity .15s;
    white-space:nowrap;
    padding:9px 16px;
    line-height:1;
  }

  .tp-btn:hover:not(:disabled) { transform:translateY(-1px); }
  .tp-btn:active:not(:disabled) { transform:translateY(0); }
  .tp-btn:disabled { opacity:.55; cursor:not-allowed; transform:none !important; }

  .tp-btn-primary {
    background:var(--tp-btn-grad);
    color:#fff;
    box-shadow:0 4px 14px rgba(var(--oa-focus-rgb),.3);
  }

  .tp-btn-primary:hover:not(:disabled) {
    box-shadow:0 8px 24px rgba(var(--oa-focus-rgb),.4);
  }

  .tp-btn-secondary {
    background:${T.brandLight};
    color:${T.brandDark};
    border:1.5px solid ${T.brandBorder};
  }

  .tp-btn-ghost {
    background:var(--tp-input-bg);
    color:${T.inkMid};
    border:1.5px solid ${T.cardBorder};
  }

  .tp-btn-ghost:hover:not(:disabled) {
    background:${T.canvas};
    border-color:var(--tp-ghost-hover-border);
  }

  .tp-btn-danger {
    background:var(--oa-danger-bg);
    color:var(--oa-danger-text);
    border:1.5px solid var(--oa-danger-bg);
  }

  .tp-btn-danger:hover:not(:disabled) {
    background:var(--oa-danger-bg);
    filter:brightness(1.08);
  }

  .tp-btn-success {
    background:var(--oa-success-bg);
    color:var(--oa-success-text);
    border:1.5px solid var(--tp-low-ink);
  }

  .tp-pill {
    border:1.5px solid ${T.cardBorder};
    background:var(--tp-input-bg);
    color:${T.inkMid};
    border-radius:999px;
    padding:7px 14px;
    font-size:12px;
    font-weight:600;
    cursor:pointer;
    font-family:${FONT};
    transition:all .15s ease;
    white-space:nowrap;
  }

  .tp-pill:hover {
    background:${T.brandLight};
    border-color:${T.brandBorder};
    color:${T.brand};
  }

  .tp-pill.active {
    background:var(--tp-btn-grad);
    color:#fff;
    border-color:transparent;
    box-shadow:0 3px 10px rgba(var(--oa-focus-rgb),.28);
  }

  .tp-badge {
    display:inline-flex;
    align-items:center;
    padding:4px 10px;
    border-radius:999px;
    font-size:11px;
    font-weight:700;
    letter-spacing:.02em;
    flex-shrink:0;
  }

  .tp-chip {
    display:inline-flex;
    align-items:center;
    gap:5px;
    padding:5px 10px;
    border-radius:999px;
    font-size:11.5px;
    font-weight:600;
    background:${T.brandLight};
    color:${T.brandDark};
    border:1px solid ${T.brandBorder};
  }

  .tp-chip-email {
    background:var(--tp-chip-email-bg);
    color:var(--tp-chip-email-ink);
    border-color:var(--tp-chip-email-ink);
  }

  .tp-chip-remove {
    border:none;
    background:transparent;
    cursor:pointer;
    color:inherit;
    font-weight:800;
    font-size:13px;
    line-height:1;
    padding:0;
    opacity:.7;
    display:inline-flex;
    align-items:center;
    justify-content:center;
  }

  .tp-chip-remove:hover { opacity:1; }

  .tp-section {
    display:flex;
    align-items:center;
    gap:10px;
    margin-bottom:16px;
  }

  .tp-section-bar {
    width:3px;
    height:16px;
    border-radius:2px;
    background:var(--tp-btn-grad);
    flex-shrink:0;
  }

  .tp-section-text {
    font-size:11px;
    font-weight:700;
    letter-spacing:.09em;
    text-transform:uppercase;
    color:${T.inkMute};
  }

  .tp-section-line {
    flex:1;
    height:1px;
    background:${T.divider};
  }

  .tp-task-bar {
    position:absolute;
    left:0;
    top:0;
    bottom:0;
    width:4px;
    border-radius:16px 0 0 16px;
  }

  .tp-filter-strip {
    display:flex;
    gap:6px;
    flex-wrap:wrap;
    align-items:center;
    margin-bottom:18px;
    padding-bottom:16px;
    border-bottom:1px solid ${T.divider};
  }

  .tp-filter-count {
    margin-left:auto;
    font-size:12px;
    font-weight:600;
    color:${T.inkMute};
    flex-shrink:0;
  }

  .tp-form-2col {
    display:grid;
    grid-template-columns:1fr 1fr;
    gap:12px;
  }

  .tp-progress-track {
    height:7px;
    background:var(--tp-track);
    border-radius:999px;
    overflow:hidden;
  }

  .tp-progress-fill {
    height:100%;
    border-radius:999px;
    transition:width .4s cubic-bezier(.22,1,.36,1);
  }

  .tp-scroll::-webkit-scrollbar { width:4px; }
  .tp-scroll::-webkit-scrollbar-thumb { background:${T.inkFaint}; border-radius:4px; }

  .tp-expanded {
    animation:tExpandIn .22s ease both;
    border-top:1px solid ${T.divider};
    padding-top:20px;
    margin-top:20px;
  }

  .tp-checklist-item {
    display:flex;
    gap:10px;
    align-items:flex-start;
    padding:8px 0;
    border-bottom:1px solid ${T.divider};
  }

  .tp-checklist-item:last-child { border-bottom:none; }

  .tp-summary-box {
    background:var(--tp-summary-bg);
    border:1.5px solid ${T.cardBorder};
    border-radius:12px;
    padding:14px 16px;
  }

  .tp-link-box {
    background:${T.brandLight};
    border:1.5px solid ${T.brandBorder};
    border-radius:10px;
    padding:12px 14px;
    font-size:12.5px;
    word-break:break-all;
  }

  .tp-comment {
    background:var(--tp-summary-bg);
    border:1.5px solid ${T.cardBorder};
    border-radius:10px;
    padding:11px 14px;
    font-size:13px;
    color:${T.inkMid};
    line-height:1.6;
    margin-top:8px;
    animation:tFadeUp .2s ease;
  }

  .tp-error {
    background:var(--oa-danger-bg);
    border:1.5px solid var(--oa-danger-bg);
    color:var(--oa-danger-text);
    padding:12px 14px;
    border-radius:10px;
    font-size:13px;
    font-weight:600;
    margin-bottom:14px;
  }

  .tp-main-grid {
    display:grid;
    grid-template-columns:minmax(310px,380px) minmax(0,1fr);
    gap:24px;
    align-items:start;
  }

  .tp-card-inner {
    display:grid;
    grid-template-columns:minmax(0,1fr) 280px;
    gap:20px;
    align-items:start;
  }

  .tp-action-row {
    display:grid;
    grid-template-columns:1fr auto auto auto;
    gap:6px;
    align-items:center;
    margin-bottom:14px;
  }

  .tp-exp-actions {
    display:grid;
    grid-template-columns:repeat(4, 1fr);
    gap:8px;
    margin-bottom:16px;
  }

  .tp-hero-stats {
    display:grid;
    grid-template-columns:repeat(3, minmax(80px,1fr));
    gap:12px;
  }

  .tp-daily-grid {
    display:grid;
    grid-template-columns:repeat(3,minmax(160px,1fr));
    gap:16px;
  }

  @media (max-width:1280px) {
    .tp-card-inner { grid-template-columns:1fr; }
    .tp-exp-actions { grid-template-columns:repeat(2,1fr); }
  }

  @media (max-width:1100px) {
    .tp-main-grid { grid-template-columns:1fr; }
    .tp-page { padding:20px 20px 64px; }
  }

  @media (max-width:768px) {
    .tp-page { padding:16px 14px 56px; }
    .tp-action-row {
      grid-template-columns:1fr 1fr;
      grid-template-rows:auto auto;
    }
    .tp-action-row .tp-status-cell { grid-column:1 / -1; }
    .tp-exp-actions { grid-template-columns:1fr 1fr; }
    .tp-daily-grid { grid-template-columns:1fr; }
    .tp-hero-stats { grid-template-columns:repeat(3,1fr); }
    .tp-form-2col { grid-template-columns:1fr; }
  }

  @media (max-width:480px) {
    .tp-action-row { grid-template-columns:1fr 1fr; }
    .tp-exp-actions { grid-template-columns:1fr; }
    .tp-hero-stats { grid-template-columns:1fr; }
    .tp-filter-strip { gap:5px; }
    .tp-pill { padding:6px 11px; font-size:11px; }
    .tp-btn { padding:9px 13px; font-size:12px; }
  }
`;

const label = (v) =>
  v ? v.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "";

const parseJsonList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const parentChecklistItems = (items = []) =>
  items.filter((item) => !item.parent_checklist_id);

const flattenChecklist = (items = []) => {
  const result = [];

  items.forEach((item) => {
    result.push(item);
    (item.children || []).forEach((child) => result.push(child));
  });

  return result;
};

const priorityColor = (p) => T[p] || T.medium;
const statusColor = (s) => T[s] || T.pending;

function SectionLabel({ children }) {
  return (
    <div className="tp-section">
      <div className="tp-section-bar" />
      <span className="tp-section-text">{children}</span>
      <div className="tp-section-line" />
    </div>
  );
}

function FormGroup({ label: lbl, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label className="tp-label">{lbl}</label>
      {children}
    </div>
  );
}

function Badge({ children, color }) {
  return (
    <span className="tp-badge" style={{ background: color.bg, color: color.ink }}>
      {children}
    </span>
  );
}

function AnalyticsCard({ label: cardLabel, value, gradient }) {
  return (
    <div
      style={{
        borderRadius: 14,
        padding: "16px 18px 14px",
        background: gradient,
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 6px 20px rgba(0,0,0,.12)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -16,
          right: -16,
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: "rgba(255,255,255,.14)",
        }}
      />

      <div
        style={{
          fontSize: 30,
          fontWeight: 800,
          color: "#fff",
          lineHeight: 1,
          letterSpacing: "-0.03em",
        }}
      >
        {Number(value || 0).toLocaleString()}
      </div>

      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "rgba(255,255,255,.75)",
          marginTop: 5,
        }}
      >
        {cardLabel}
      </div>
    </div>
  );
}

export default function TaskTracker() {
  const [tasks, setTasks] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [dailySummary, setDailySummary] = useState(null);
  const [dailySummaryTaskId, setDailySummaryTaskId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    status: "pending",
    progress: 0,
    due_date: "",
    recurrence: "none",
  });

  const [assignees, setAssignees] = useState([]);
  const [assigneeInput, setAssigneeInput] = useState("");
  const [emails, setEmails] = useState([]);
  const [emailInput, setEmailInput] = useState("");
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);
  const [commentText, setCommentText] = useState({});
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [sendingTaskId, setSendingTaskId] = useState(null);
  const [summaryLoadingTaskId, setSummaryLoadingTaskId] = useState(null);
  const [error, setError] = useState("");

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/tasks/list");
      setTasks(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await api.get("/tasks/analytics/summary");
      setAnalytics(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const refreshAll = async () => {
    await fetchTasks();
    await fetchAnalytics();
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const getTaskSummary = (task) => {
    const items = flattenChecklist(task.checklist_items || []);
    const total = items.length;
    const completed = items.filter((i) => i.is_completed).length;

    return {
      total,
      completed,
      pending: Math.max(total - completed, 0),
      progress: task.progress || 0,
    };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "progress" ? Number(value) : value,
    }));
  };

  const addAssignee = () => {
    const value = assigneeInput.trim();
    if (!value) return;

    if (!assignees.includes(value)) {
      setAssignees((prev) => [...prev, value]);
    }

    setAssigneeInput("");
  };

  const addEmail = () => {
    const value = emailInput.trim();
    if (!value) return;

    if (!emails.includes(value)) {
      setEmails((prev) => [...prev, value]);
    }

    setEmailInput("");
  };

  const createTask = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError("");

    try {
      await api.post("/tasks/create", {
        ...form,
        assigned_to: assignees.join(", "),
        assignees,
        assignee_emails: emails,
      });

      setForm({
        title: "",
        description: "",
        priority: "medium",
        status: "pending",
        progress: 0,
        due_date: "",
        recurrence: "none",
      });

      setAssignees([]);
      setEmails([]);
      await refreshAll();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create task");
    } finally {
      setCreating(false);
    }
  };

  const updateTask = async (id, payload) => {
    try {
      await api.put(`/tasks/update/${id}`, payload);
      await refreshAll();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to update task");
    }
  };

  const sendTask = async (taskId) => {
    try {
      setSendingTaskId(taskId);

      const res = await api.post(`/tasks/${taskId}/send`);

      alert(`${res.data.message}\n\nTask Update Link:\n${res.data.public_update_link || ""}`);
      await refreshAll();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to send task email");
    } finally {
      setSendingTaskId(null);
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Delete this task?")) return;

    try {
      await api.delete(`/tasks/delete/${id}`);
      await refreshAll();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to delete task");
    }
  };

  const generateSubtasks = async (id) => {
    try {
      await api.post(`/tasks/${id}/generate-subtasks`);
      await refreshAll();
      setExpanded(id);
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to generate subtasks");
    }
  };

  const addComment = async (taskId) => {
    const comment = commentText[taskId]?.trim();
    if (!comment) return;

    try {
      await api.post(`/tasks/${taskId}/comments`, { comment });

      setCommentText((prev) => ({
        ...prev,
        [taskId]: "",
      }));

      await refreshAll();
      setExpanded(taskId);
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to add comment");
    }
  };

  const generateDailySummary = async (taskId) => {
    try {
      setSummaryLoadingTaskId(taskId);

      const res = await api.get(`/tasks/${taskId}/summary`);

      setDailySummary(res.data);
      setDailySummaryTaskId(taskId);
      setExpanded(taskId);
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to generate daily summary");
    } finally {
      setSummaryLoadingTaskId(null);
    }
  };

  const exportTask = async (id, fmt) => {
    try {
      const res = await api.post(`/documents/export-${fmt}`, {
        content_id: id,
        doc_type: "task",
        export_format: fmt,
      });

      await forceDownload(res.data.download_url);
    } catch {
      alert("Export failed");
    }
  };

  const filteredTasks = useMemo(
    () => tasks.filter((t) => filter === "all" || t.status === filter),
    [tasks, filter]
  );

  const summaryList = (items, emptyText) => {
    const list = items?.length ? items : [emptyText];

    return (
      <ul
        style={{
          margin: "8px 0 0 16px",
          padding: 0,
          lineHeight: 1.7,
          color: T.inkMid,
          fontSize: 13,
        }}
      >
        {list.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    );
  };

  const renderChecklist = (task) => {
    const parents = parentChecklistItems(task.checklist_items || []);

    if (!parents.length) {
      return (
        <p style={{ fontSize: 13, color: T.inkMute, marginTop: 8 }}>
          No checklist items found.
        </p>
      );
    }

    return (
      <div className="tp-summary-box" style={{ marginTop: 10 }}>
        {parents.map((item) => (
          <div key={item.id}>
            <div className="tp-checklist-item">
              <span
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 5,
                  flexShrink: 0,
                  border: `2px solid ${item.is_completed ? "#10B981" : T.inkFaint}`,
                  background: item.is_completed ? "#10B981" : "transparent",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 2,
                }}
              >
                {item.is_completed && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path
                      d="M2 5l2.5 2.5L8 3"
                      stroke="#fff"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>

              <span style={{ color: T.inkMid, fontSize: 13.5, lineHeight: 1.6 }}>
                {item.title}
              </span>
            </div>

            {item.children?.length > 0 && (
              <div style={{ paddingLeft: 28 }}>
                {item.children.map((child) => (
                  <div key={child.id} className="tp-checklist-item">
                    <span
                      style={{
                        width: 15,
                        height: 15,
                        borderRadius: 4,
                        flexShrink: 0,
                        border: `2px solid ${child.is_completed ? "#10B981" : T.inkFaint}`,
                        background: child.is_completed ? "#10B981" : "transparent",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginTop: 3,
                      }}
                    >
                      {child.is_completed && (
                        <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                          <path
                            d="M2 5l2.5 2.5L8 3"
                            stroke="#fff"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </span>

                    <span style={{ color: T.inkMute, fontSize: 13, lineHeight: 1.6 }}>
                      {child.title}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <style>{CSS}</style>

      <div className="tp-page">
        <div className="tp-card tp-hero-card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 20,
              flexWrap: "wrap",
              alignItems: "flex-start",
            }}
          >
            <div style={{ flex: 1, minWidth: 220 }}>
              <div
                style={{
                  display: "inline-flex",
                  padding: "5px 12px",
                  borderRadius: 999,
                  background: T.brandLight,
                  color: T.brand,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: ".06em",
                  textTransform: "uppercase",
                  marginBottom: 12,
                  border: `1px solid ${T.brandBorder}`,
                }}
              >
                Task Operations
              </div>

              <h1
                style={{
                  fontSize: 26,
                  fontWeight: 800,
                  color: T.ink,
                  lineHeight: 1.2,
                  letterSpacing: "-0.02em",
                }}
              >
                Task Assignment Dashboard
              </h1>

              <p
                style={{
                  fontSize: 13.5,
                  color: T.inkMid,
                  marginTop: 8,
                  maxWidth: 600,
                  lineHeight: 1.7,
                }}
              >
                Create, assign, send, monitor, summarise, and export team tasks from one workspace.
              </p>
            </div>

            {analytics && (
              <div
                className="tp-hero-stats"
                style={{
                  flexShrink: 0,
                  minWidth: 260,
                  maxWidth: 360,
                  width: "100%",
                }}
              >
                <AnalyticsCard
                  label="Total Tasks"
                  value={analytics.total_tasks}
                  gradient="linear-gradient(135deg,#2563EB,#1D4ED8)"
                />

                <AnalyticsCard
                  label="Completed"
                  value={analytics.completed_tasks}
                  gradient="linear-gradient(135deg,#059669,#10B981)"
                />

                <AnalyticsCard
                  label="Blocked"
                  value={analytics.blocked_tasks}
                  gradient="linear-gradient(135deg,#DC2626,#EF4444)"
                />
              </div>
            )}
          </div>
        </div>

        <div className="tp-main-grid">
          <div>
            <SectionLabel>Create Task</SectionLabel>

            <div
              className="tp-card"
              style={{
                padding: 22,
                animation: "tFadeUp .45s ease both",
                animationDelay: "60ms",
              }}
            >
              <h2 style={{ fontSize: 16, fontWeight: 800, color: T.ink, marginBottom: 4 }}>
                New Task
              </h2>

              <p style={{ fontSize: 12, color: T.inkMute, marginBottom: 18, lineHeight: 1.5 }}>
                Add details and assign to team members. AI will refine the description.
              </p>

              {error && <div className="tp-error">{error}</div>}

              <form onSubmit={createTask}>
                <FormGroup label="Task Title *">
                  <input
                    className="tp-input"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Deploy backend service"
                  />
                </FormGroup>

                <FormGroup label="Description / Raw Prompt">
                  <textarea
                    className="tp-textarea"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    style={{ minHeight: 96 }}
                    placeholder="Write rough requirement — AI converts it to professional task details."
                  />
                </FormGroup>

                <FormGroup label="Assign To · Press Enter to add">
                  <input
                    className="tp-input"
                    value={assigneeInput}
                    onChange={(e) => setAssigneeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addAssignee();
                      }
                    }}
                    onBlur={addAssignee}
                    placeholder="e.g. Abhijit Das"
                  />

                  {assignees.length > 0 && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                      {assignees.map((item) => (
                        <span key={item} className="tp-chip">
                          {item}
                          <button
                            type="button"
                            className="tp-chip-remove"
                            onClick={() => setAssignees((prev) => prev.filter((x) => x !== item))}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </FormGroup>

                <FormGroup label="Email Addresses · Press Enter to add">
                  <input
                    className="tp-input"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addEmail();
                      }
                    }}
                    onBlur={addEmail}
                    placeholder="e.g. user@example.com"
                  />

                  {emails.length > 0 && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                      {emails.map((item) => (
                        <span key={item} className="tp-chip tp-chip-email">
                          {item}
                          <button
                            type="button"
                            className="tp-chip-remove"
                            onClick={() => setEmails((prev) => prev.filter((x) => x !== item))}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </FormGroup>

                <div className="tp-form-2col">
                  <FormGroup label="Priority">
                    <select
                      className="tp-select"
                      name="priority"
                      value={form.priority}
                      onChange={handleChange}
                    >
                      {PRIORITIES.map((p) => (
                        <option key={p} value={p}>
                          {label(p)}
                        </option>
                      ))}
                    </select>
                  </FormGroup>

                  <FormGroup label="Status">
                    <select
                      className="tp-select"
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {label(s)}
                        </option>
                      ))}
                    </select>
                  </FormGroup>
                </div>

                <div className="tp-form-2col">
                  <FormGroup label="Deadline">
                    <input
                      className="tp-input"
                      type="date"
                      name="due_date"
                      value={form.due_date}
                      onChange={handleChange}
                    />
                  </FormGroup>

                  <FormGroup label="Recurring">
                    <select
                      className="tp-select"
                      name="recurrence"
                      value={form.recurrence}
                      onChange={handleChange}
                    >
                      <option value="none">None</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </FormGroup>
                </div>

                <button
                  type="submit"
                  className="tp-btn tp-btn-primary"
                  disabled={creating}
                  style={{ width: "100%", padding: "12px 16px", fontSize: 13.5 }}
                >
                  {creating ? "Creating…" : "Create Task with AI"}
                </button>
              </form>
            </div>
          </div>

          <div style={{ minWidth: 0 }}>
            <SectionLabel>Task List</SectionLabel>

            <div className="tp-filter-strip">
              {["all", ...STATUSES].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`tp-pill${filter === f ? " active" : ""}`}
                >
                  {f === "all" ? "All" : label(f)}
                </button>
              ))}

              <span className="tp-filter-count">
                {filteredTasks.length} task{filteredTasks.length !== 1 ? "s" : ""}
              </span>
            </div>

            {loading ? (
              <div
                className="tp-card"
                style={{
                  padding: 28,
                  color: T.inkMute,
                  fontSize: 13,
                  textAlign: "center",
                }}
              >
                Loading tasks…
              </div>
            ) : filteredTasks.length === 0 ? (
              <div
                className="tp-card"
                style={{
                  padding: 48,
                  textAlign: "center",
                  color: T.inkMute,
                  fontSize: 13,
                }}
              >
                No tasks found for this filter.
              </div>
            ) : (
              <div
                className="tp-scroll"
                style={{
                  maxHeight: "calc(100vh - 200px)",
                  overflowY: "auto",
                  paddingRight: 2,
                }}
              >
                {filteredTasks.map((task, idx) => {
                  const taskAssignees = parseJsonList(task.assignees);
                  const taskEmails = parseJsonList(task.assignee_emails);
                  const taskSummary = getTaskSummary(task);
                  const priority = priorityColor(task.priority);
                  const status = statusColor(task.status);
                  const updateLink = task.public_update_token
                    ? `${window.location.origin}/task-update/${task.public_update_token}`
                    : "";
                  const isExpanded = expanded === task.id;

                  return (
                    <div
                      key={task.id}
                      className="tp-card"
                      style={{
                        position: "relative",
                        padding: "20px 20px 20px 24px",
                        marginBottom: 14,
                        animation: "tFadeUp .35s ease both",
                        animationDelay: `${idx * 40}ms`,
                        overflow: "hidden",
                      }}
                    >
                      <div className="tp-task-bar" style={{ background: priority.bar }} />

                      <div className="tp-card-inner">
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              display: "flex",
                              gap: 8,
                              flexWrap: "wrap",
                              alignItems: "center",
                              marginBottom: 10,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 16,
                                fontWeight: 800,
                                color: T.ink,
                                lineHeight: 1.3,
                              }}
                            >
                              {task.title}
                            </span>

                            <Badge color={priority}>{label(task.priority)}</Badge>
                            <Badge color={status}>{label(task.status)}</Badge>
                          </div>

                          {(task.professional_description || task.description) && (
                            <p
                              style={{
                                fontSize: 13,
                                color: T.inkMid,
                                lineHeight: 1.7,
                                whiteSpace: "pre-wrap",
                                marginBottom: 10,
                                display: "-webkit-box",
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {task.professional_description || task.description}
                            </p>
                          )}

                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "4px 14px",
                              fontSize: 12,
                              color: T.inkMute,
                              lineHeight: 1.8,
                            }}
                          >
                            {taskAssignees.length > 0 && <span>👤 {taskAssignees.join(", ")}</span>}
                            {taskEmails.length > 0 && <span>✉ {taskEmails.join(", ")}</span>}

                            {task.due_date && (
                              <span style={{ color: T.high.ink, fontWeight: 600 }}>
                                📅 Due {task.due_date}
                              </span>
                            )}

                            {task.estimated_effort && <span>⏱ {task.estimated_effort}</span>}

                            {task.email_sent_at && (
                              <span style={{ color: T.low.ink, fontWeight: 600 }}>✓ Email Sent</span>
                            )}
                          </div>
                        </div>

                        <div className="tp-summary-box">
                          <div className="tp-action-row">
                            <div className="tp-status-cell">
                              <select
                                value={task.status}
                                onChange={(e) => updateTask(task.id, { status: e.target.value })}
                                className="tp-select"
                                style={{ padding: "8px 10px", fontSize: 12 }}
                              >
                                {STATUSES.map((s) => (
                                  <option key={s} value={s}>
                                    {label(s)}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <button
                              className="tp-btn tp-btn-primary"
                              onClick={() => sendTask(task.id)}
                              disabled={sendingTaskId === task.id}
                              style={{ padding: "8px 12px" }}
                              title="Send task email"
                            >
                              {sendingTaskId === task.id ? "…" : "Send"}
                            </button>

                            <button
                              className="tp-btn tp-btn-ghost"
                              onClick={() => setExpanded(isExpanded ? null : task.id)}
                              style={{ padding: "8px 12px" }}
                              title={isExpanded ? "Collapse" : "View details"}
                            >
                              {isExpanded ? "Hide" : "View"}
                            </button>

                            <button
                              className="tp-btn tp-btn-danger"
                              onClick={() => deleteTask(task.id)}
                              style={{ padding: "8px 12px" }}
                              title="Delete task"
                            >
                              Del
                            </button>
                          </div>

                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(3,1fr)",
                              gap: 8,
                              marginBottom: 14,
                            }}
                          >
                            {[
                              { label: "Done", value: taskSummary.completed, color: T.low.ink },
                              { label: "Pending", value: taskSummary.pending, color: T.high.ink },
                              { label: "Total", value: taskSummary.total, color: T.inkMid },
                            ].map((item) => (
                              <div
                                key={item.label}
                                style={{
                                  background: T.canvas,
                                  borderRadius: 9,
                                  padding: "8px 10px",
                                  textAlign: "center",
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: 18,
                                    fontWeight: 800,
                                    color: item.color,
                                    lineHeight: 1,
                                  }}
                                >
                                  {item.value}
                                </div>

                                <div
                                  style={{
                                    fontSize: 10,
                                    color: T.inkMute,
                                    marginTop: 3,
                                    fontWeight: 600,
                                  }}
                                >
                                  {item.label}
                                </div>
                              </div>
                            ))}
                          </div>

                          <div>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginBottom: 6,
                              }}
                            >
                              <span
                                style={{
                                  fontSize: 11,
                                  fontWeight: 700,
                                  color: T.inkMute,
                                  textTransform: "uppercase",
                                  letterSpacing: ".05em",
                                }}
                              >
                                Progress
                              </span>

                              <span style={{ fontSize: 12, fontWeight: 800, color: T.ink }}>
                                {taskSummary.progress}%
                              </span>
                            </div>

                            <div className="tp-progress-track">
                              <div
                                className="tp-progress-fill"
                                style={{
                                  width: `${taskSummary.progress}%`,
                                  background: progressGradient(taskSummary.progress),
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="tp-expanded">
                          {task.email_subject && (
                            <p style={{ fontSize: 13, color: T.inkMid, marginBottom: 12 }}>
                              <strong>Email Subject:</strong> {task.email_subject}
                            </p>
                          )}

                          {updateLink && (
                            <div className="tp-link-box" style={{ marginBottom: 14 }}>
                              <span
                                style={{
                                  fontSize: 11,
                                  fontWeight: 700,
                                  color: T.brand,
                                  textTransform: "uppercase",
                                  letterSpacing: ".06em",
                                }}
                              >
                                Task Update Link
                              </span>

                              <br />

                              <a
                                href={updateLink}
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: T.brandDark, fontWeight: 700, fontSize: 13 }}
                              >
                                {updateLink}
                              </a>
                            </div>
                          )}

                          <div className="tp-exp-actions">
                            <button
                              className="tp-btn tp-btn-secondary"
                              onClick={() => generateSubtasks(task.id)}
                            >
                              Generate Subtasks
                            </button>

                            <button
                              className="tp-btn tp-btn-secondary"
                              onClick={() => exportTask(task.id, "docx")}
                            >
                              Export DOCX
                            </button>

                            <button
                              className="tp-btn tp-btn-secondary"
                              onClick={() => exportTask(task.id, "pdf")}
                            >
                              Export PDF
                            </button>

                            <button
                              className="tp-btn tp-btn-secondary"
                              onClick={() => generateDailySummary(task.id)}
                              disabled={summaryLoadingTaskId === task.id}
                            >
                              {summaryLoadingTaskId === task.id ? "Generating…" : "Daily Summary"}
                            </button>
                          </div>

                          {dailySummary && dailySummaryTaskId === task.id && (
                            <div className="tp-summary-box" style={{ marginBottom: 16 }}>
                              <h3
                                style={{
                                  fontSize: 14,
                                  fontWeight: 800,
                                  color: T.ink,
                                  marginBottom: 14,
                                }}
                              >
                                Daily Update Summary
                              </h3>

                              <div className="tp-daily-grid">
                                <div>
                                  <span
                                    style={{
                                      fontSize: 12,
                                      fontWeight: 700,
                                      color: T.low.ink,
                                    }}
                                  >
                                    ✓ Completed ({dailySummary.completed?.length || 0})
                                  </span>

                                  {summaryList(dailySummary.completed, "No completed tasks yet.")}
                                </div>

                                <div>
                                  <span
                                    style={{
                                      fontSize: 12,
                                      fontWeight: 700,
                                      color: T.high.ink,
                                    }}
                                  >
                                    ⏳ Pending ({dailySummary.pending?.length || 0})
                                  </span>

                                  {summaryList(dailySummary.pending, "No pending tasks.")}
                                </div>

                                <div>
                                  <span
                                    style={{
                                      fontSize: 12,
                                      fontWeight: 700,
                                      color: T.critical.ink,
                                    }}
                                  >
                                    ⚠ Overdue ({dailySummary.overdue?.length || 0})
                                  </span>

                                  {summaryList(dailySummary.overdue, "No overdue tasks.")}
                                </div>
                              </div>

                              <div
                                style={{
                                  marginTop: 14,
                                  paddingTop: 12,
                                  borderTop: `1px dashed ${T.cardBorder}`,
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: 12,
                                    fontWeight: 700,
                                    color: T.brand,
                                  }}
                                >
                                  Today's Updates
                                </span>

                                {summaryList(
                                  dailySummary.updates_today,
                                  "No new updates submitted today."
                                )}
                              </div>
                            </div>
                          )}

                          <div style={{ marginBottom: 16 }}>
                            <h4
                              style={{
                                fontSize: 14,
                                fontWeight: 800,
                                color: T.ink,
                                marginBottom: 4,
                              }}
                            >
                              Assignee Checklist
                            </h4>

                            {renderChecklist(task)}
                          </div>

                          {task.external_updates?.length > 0 && (
                            <div style={{ marginBottom: 16 }}>
                              <h4
                                style={{
                                  fontSize: 14,
                                  fontWeight: 800,
                                  color: T.ink,
                                  marginBottom: 8,
                                }}
                              >
                                Assignee Progress Updates
                              </h4>

                              {task.external_updates.map((update) => (
                                <div key={update.id} className="tp-comment">
                                  <strong>
                                    {update.updater_name || update.updater_email || "Assignee"}
                                  </strong>{" "}
                                  updated progress to{" "}
                                  <strong style={{ color: T.brand }}>{update.progress}%</strong>

                                  {update.comment && (
                                    <div style={{ marginTop: 4 }}>Comment: {update.comment}</div>
                                  )}

                                  {update.proof_file_path && (
                                    <div style={{ marginTop: 4, color: T.inkMute }}>
                                      Proof: {update.proof_filename || update.proof_file_path}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          <div style={{ marginBottom: 12 }}>
                            <h4
                              style={{
                                fontSize: 14,
                                fontWeight: 800,
                                color: T.ink,
                                marginBottom: 8,
                              }}
                            >
                              Admin Comments
                            </h4>

                            {task.comments?.length > 0 ? (
                              task.comments.map((comment) => (
                                <div key={comment.id} className="tp-comment">
                                  <strong>{comment.author_name || "Admin"}:</strong>{" "}
                                  {comment.comment}
                                </div>
                              ))
                            ) : (
                              <p style={{ fontSize: 13, color: T.inkMute }}>No comments yet.</p>
                            )}
                          </div>

                          <div
                            style={{
                              display: "flex",
                              gap: 8,
                              flexWrap: "wrap",
                              alignItems: "stretch",
                            }}
                          >
                            <input
                              value={commentText[task.id] || ""}
                              onChange={(e) =>
                                setCommentText((prev) => ({
                                  ...prev,
                                  [task.id]: e.target.value,
                                }))
                              }
                              placeholder="Write an admin comment…"
                              className="tp-input"
                              style={{ flex: 1, minWidth: 200 }}
                            />

                            <button
                              className="tp-btn tp-btn-primary"
                              onClick={() => addComment(task.id)}
                              style={{ flexShrink: 0, padding: "10px 18px" }}
                            >
                              Add Comment
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}