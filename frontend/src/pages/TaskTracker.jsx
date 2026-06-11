import React, { useEffect, useMemo, useState } from "react";
import api from "../api";
import { forceDownload } from "../utils/download";

const C = {
  pageBg: "#F8F7FF",
  card: "#FFFFFF",
  border: "#F0ECFF",
  textH: "#1A1035",
  textB: "#4B4569",
  textMuted: "#8B7EC8",
  textLight: "#B0A8D4",
  primary: "#7C3AED",
  primaryDark: "#5B21B6",
  primarySoft: "#EDE9FE",
  success: "#047857",
  successBg: "#ECFDF5",
  warning: "#B45309",
  warningBg: "#FFFBEB",
  danger: "#B91C1C",
  dangerBg: "#FEE2E2",
};

const FONT = "'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif";

const STATUSES = ["pending", "in_progress", "waiting_approval", "blocked", "completed", "cancelled"];
const PRIORITIES = ["low", "medium", "high", "critical"];

const label = (value) =>
  value ? value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "";

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
    const completed = items.filter((item) => item.is_completed).length;

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
      setCommentText((prev) => ({ ...prev, [taskId]: "" }));
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

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => filter === "all" || task.status === filter);
  }, [tasks, filter]);

  const summaryList = (items, emptyText) => {
    const list = items?.length ? items : [emptyText];

    return (
      <ul style={summaryListStyle}>
        {list.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    );
  };

  const renderChecklist = (task) => {
    const parents = parentChecklistItems(task.checklist_items || []);

    if (!parents.length) {
      return <p style={mutedSmallStyle}>No checklist items found.</p>;
    }

    return (
      <ul style={checklistStyle}>
        {parents.map((item) => (
          <li key={item.id} style={checklistItemStyle}>
            <span style={readOnlyTickStyle}>{item.is_completed ? "✅" : "⬜"}</span>
            <span>{item.title}</span>

            {item.children?.length > 0 && (
              <ul style={subChecklistStyle}>
                {item.children.map((child) => (
                  <li key={child.id} style={subChecklistItemStyle}>
                    <span style={readOnlyTickStyle}>{child.is_completed ? "✅" : "⬜"}</span>
                    <span>{child.title}</span>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <div>
          <h1 style={pageTitleStyle}>Admin Task Assignment Dashboard ✅</h1>
          <p style={pageSubtitleStyle}>Create, assign, monitor, summarize, and export team tasks.</p>
        </div>
      </div>

      {analytics && (
        <div style={analyticsGridStyle}>
          <AnalyticsCard label="Total Tasks" value={analytics.total_tasks} icon="📋" />
          <AnalyticsCard label="Completed" value={analytics.completed_tasks} icon="✅" />
          <AnalyticsCard label="In Progress" value={analytics.in_progress_tasks} icon="⏳" />
          <AnalyticsCard label="Blocked" value={analytics.blocked_tasks} icon="🚧" />
          <AnalyticsCard label="Overdue" value={analytics.overdue_tasks} icon="⚠️" />
        </div>
      )}

      <div style={mainGridStyle}>
        <div style={cardStyle}>
          <h2 style={cardTitleStyle}>Create Task</h2>

          {error && <div style={errorBoxStyle}>{error}</div>}

          <form onSubmit={createTask}>
            <FormGroup label="Task Title *">
              <input
                style={inputStyle}
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                placeholder="e.g. Deploy AWS Backend"
              />
            </FormGroup>

            <FormGroup label="Raw Task Prompt / Description">
              <textarea
                style={{ ...inputStyle, minHeight: 95, resize: "vertical" }}
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Write rough task requirement. AI will convert it into professional task details."
              />
            </FormGroup>

            <FormGroup label="Assign To - Press Enter to Add Multiple Names">
              <input
                style={inputStyle}
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

              <div style={chipWrapStyle}>
                {assignees.map((item) => (
                  <span key={item} style={chipStyle}>
                    {item}
                    <button
                      type="button"
                      onClick={() => setAssignees((prev) => prev.filter((x) => x !== item))}
                      style={removeButtonStyle}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </FormGroup>

            <FormGroup label="Email Address - Press Enter to Add Multiple Emails">
              <input
                style={inputStyle}
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

              <div style={chipWrapStyle}>
                {emails.map((item) => (
                  <span key={item} style={{ ...chipStyle, background: "#DBEAFE", color: "#1D4ED8" }}>
                    {item}
                    <button
                      type="button"
                      onClick={() => setEmails((prev) => prev.filter((x) => x !== item))}
                      style={removeButtonStyle}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </FormGroup>

            <div style={twoColumnFormStyle}>
              <FormGroup label="Priority">
                <select style={inputStyle} name="priority" value={form.priority} onChange={handleChange}>
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {label(p)}
                    </option>
                  ))}
                </select>
              </FormGroup>

              <FormGroup label="Status">
                <select style={inputStyle} name="status" value={form.status} onChange={handleChange}>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {label(s)}
                    </option>
                  ))}
                </select>
              </FormGroup>
            </div>

            <div style={twoColumnFormStyle}>
              <FormGroup label="Deadline">
                <input
                  style={inputStyle}
                  type="date"
                  name="due_date"
                  value={form.due_date}
                  onChange={handleChange}
                />
              </FormGroup>

              <FormGroup label="Recurring">
                <select style={inputStyle} name="recurrence" value={form.recurrence} onChange={handleChange}>
                  <option value="none">None</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </FormGroup>
            </div>

            <button type="submit" style={primaryBtnStyle} disabled={creating}>
              {creating ? "Creating..." : "🤖 Create Task With AI"}
            </button>
          </form>
        </div>

        <div style={{ minWidth: 0 }}>
          <div style={filterRowStyle}>
            {["all", ...STATUSES].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={filter === f ? primarySmallBtnStyle : secondarySmallBtnStyle}
              >
                {f === "all" ? "All" : label(f)}
              </button>
            ))}

            <span style={taskCountStyle}>
              {filteredTasks.length} task{filteredTasks.length !== 1 ? "s" : ""}
            </span>
          </div>

          {loading ? (
            <div style={cardStyle}>Loading tasks...</div>
          ) : filteredTasks.length === 0 ? (
            <div style={{ ...cardStyle, textAlign: "center", padding: 40, color: C.textMuted }}>
              No tasks found.
            </div>
          ) : (
            filteredTasks.map((task) => {
              const taskAssignees = parseJsonList(task.assignees);
              const taskEmails = parseJsonList(task.assignee_emails);
              const taskSummary = getTaskSummary(task);
              const updateLink = task.public_update_token
                ? `${window.location.origin}/task-update/${task.public_update_token}`
                : "";

              return (
                <div key={task.id} style={{ ...cardStyle, marginBottom: 16, overflow: "hidden" }}>
                  <div style={taskCardGridStyle}>
                    <div style={{ minWidth: 0 }}>
                      <div style={taskTitleRowStyle}>
                        <b style={{ fontSize: 16, color: C.textH }}>{task.title}</b>
                        <span style={priorityBadgeStyle(task.priority)}>{label(task.priority)}</span>
                        <span style={statusBadgeStyle(task.status)}>{label(task.status)}</span>
                      </div>

                      <p style={taskDescriptionStyle}>
                        {task.professional_description || task.description || ""}
                      </p>

                      <div style={taskMetaStyle}>
                        {taskAssignees.length > 0 && <span>👤 {taskAssignees.join(", ")}</span>}
                        {taskEmails.length > 0 && <span>📧 {taskEmails.join(", ")}</span>}
                        {task.due_date && <span>📅 {task.due_date}</span>}
                        {task.estimated_effort && <span>⏱ {task.estimated_effort}</span>}
                        {task.email_sent_at && <span>✅ Email Sent</span>}
                      </div>
                    </div>

                    <div style={taskSummaryBoxStyle}>
                      <div style={actionRowStyle}>
                        <select
                          value={task.status}
                          onChange={(e) => updateTask(task.id, { status: e.target.value })}
                          style={miniSelectStyle}
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {label(s)}
                            </option>
                          ))}
                        </select>

                        <button
                          style={primarySmallBtnStyle}
                          onClick={() => sendTask(task.id)}
                          disabled={sendingTaskId === task.id}
                        >
                          {sendingTaskId === task.id ? "Sending..." : "📧 Send"}
                        </button>

                        <button
                          style={secondarySmallBtnStyle}
                          onClick={() => setExpanded(expanded === task.id ? null : task.id)}
                        >
                          {expanded === task.id ? "▲" : "▼"}
                        </button>

                        <button style={dangerSmallBtnStyle} onClick={() => deleteTask(task.id)}>
                          🗑
                        </button>
                      </div>

                      <b style={{ fontSize: 13, color: C.textH }}>Task Summary</b>

                      <div style={summaryStatsStyle}>
                        <span>✅ Completed: {taskSummary.completed}</span>
                        <span>⏳ Pending: {taskSummary.pending}</span>
                        <span>📋 Total: {taskSummary.total}</span>
                      </div>

                      <div style={{ marginTop: 12 }}>
                        <div style={progressHeaderStyle}>
                          <span>Progress</span>
                          <b>{taskSummary.progress}%</b>
                        </div>

                        <div style={progressTrackStyle}>
                          <div
                            style={{
                              width: `${taskSummary.progress}%`,
                              height: "100%",
                              background: "linear-gradient(90deg,#7C3AED,#4F46E5)",
                              transition: "width .3s ease",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {expanded === task.id && (
                    <div style={expandedBoxStyle}>
                      {task.email_subject && (
                        <div style={{ marginBottom: 12, fontSize: 13, color: C.textB }}>
                          <b>Email Subject:</b> {task.email_subject}
                        </div>
                      )}

                      {updateLink && (
                        <div style={linkBoxStyle}>
                          <b>Task Update Link:</b>
                          <br />
                          <a href={updateLink} target="_blank" rel="noreferrer" style={{ color: C.primaryDark }}>
                            {updateLink}
                          </a>
                        </div>
                      )}

                      {task.reminder_message && (
                        <div style={reminderBoxStyle}>
                          <b>🔔 AI Reminder</b>
                          <div style={{ fontSize: 13, marginTop: 5, lineHeight: 1.5 }}>
                            {task.reminder_message}
                          </div>
                        </div>
                      )}

                      <div style={expandedActionGridStyle}>
                        <button style={secondaryBtnStyle} onClick={() => generateSubtasks(task.id)}>
                          🤖 Generate Subtasks
                        </button>
                        <button style={secondaryBtnStyle} onClick={() => exportTask(task.id, "docx")}>
                          📄 Export DOCX
                        </button>
                        <button style={secondaryBtnStyle} onClick={() => exportTask(task.id, "pdf")}>
                          📕 Export PDF
                        </button>
                        <button
                          style={secondaryBtnStyle}
                          onClick={() => generateDailySummary(task.id)}
                          disabled={summaryLoadingTaskId === task.id}
                        >
                          {summaryLoadingTaskId === task.id ? "Generating..." : "📊 Daily Summary"}
                        </button>
                      </div>

                      {dailySummary && dailySummaryTaskId === task.id && (
                        <div style={summaryBoxStyle}>
                          <h3 style={{ margin: "0 0 14px", fontSize: 16, color: C.textH }}>
                            📊 Daily Update Summary
                          </h3>

                          <div style={dailySummaryGridStyle}>
                            <div>
                              <b style={{ color: C.success }}>
                                ✅ Completed Tasks ({dailySummary.completed?.length || 0})
                              </b>
                              {summaryList(dailySummary.completed, "No completed tasks yet.")}
                            </div>

                            <div>
                              <b style={{ color: C.warning }}>
                                ⏳ Pending Tasks ({dailySummary.pending?.length || 0})
                              </b>
                              {summaryList(dailySummary.pending, "No pending tasks.")}
                            </div>

                            <div>
                              <b style={{ color: C.danger }}>
                                ⚠️ Overdue Tasks ({dailySummary.overdue?.length || 0})
                              </b>
                              {summaryList(dailySummary.overdue, "No overdue tasks.")}
                            </div>
                          </div>

                          <div style={todayUpdateBoxStyle}>
                            <b style={{ color: C.primaryDark }}>🔄 Today’s Update Description</b>
                            {summaryList(dailySummary.updates_today, "No new updates submitted today.")}
                          </div>
                        </div>
                      )}

                      <div style={{ marginBottom: 14 }}>
                        <b style={{ fontSize: 15, color: C.textH }}>Assignee Checklist</b>
                        {renderChecklist(task)}
                      </div>

                      {task.external_updates?.length > 0 && (
                        <div style={{ marginBottom: 14 }}>
                          <b style={{ color: C.textH }}>Assignee Progress Updates</b>

                          {task.external_updates.map((u) => (
                            <div key={u.id} style={updateBoxStyle}>
                              <b>{u.updater_name || u.updater_email || "Assignee"}</b> updated progress to{" "}
                              <b>{u.progress}%</b>
                              {u.comment && <div>Comment: {u.comment}</div>}
                              {u.proof_file_path && (
                                <div>Proof: {u.proof_filename || u.proof_file_path}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      <div style={{ marginBottom: 12 }}>
                        <b style={{ color: C.textH }}>Admin Comments</b>

                        {task.comments?.length > 0 ? (
                          task.comments.map((c) => (
                            <div key={c.id} style={commentBoxStyle}>
                              <b>{c.author_name || "Admin"}</b>: {c.comment}
                            </div>
                          ))
                        ) : (
                          <p style={mutedSmallStyle}>No comments yet.</p>
                        )}
                      </div>

                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <input
                          value={commentText[task.id] || ""}
                          onChange={(e) =>
                            setCommentText((prev) => ({ ...prev, [task.id]: e.target.value }))
                          }
                          placeholder="Write admin comment..."
                          style={{ ...inputStyle, minWidth: 240, flex: 1 }}
                        />

                        <button style={primarySmallBtnStyle} onClick={() => addComment(task.id)}>
                          Add
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function FormGroup({ label, children }) {
  return (
    <div style={{ marginBottom: 15 }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

function AnalyticsCard({ label, value, icon }) {
  return (
    <div style={analyticsCardStyle}>
      <div style={analyticsIconStyle}>{icon}</div>
      <div style={{ color: C.textMuted, fontSize: 12, fontWeight: 800 }}>{label}</div>
      <h2 style={{ margin: "8px 0 0", color: C.textH, fontSize: 30, fontWeight: 800 }}>
        {Number(value || 0).toLocaleString()}
      </h2>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: C.pageBg,
  fontFamily: FONT,
  padding: "36px 40px 64px",
};

const headerStyle = {
  marginBottom: 28,
};

const pageTitleStyle = {
  fontSize: 26,
  fontWeight: 800,
  color: C.textH,
  letterSpacing: "-0.6px",
  margin: 0,
};

const pageSubtitleStyle = {
  fontSize: 13,
  color: C.textMuted,
  marginTop: 4,
};

const cardStyle = {
  background: C.card,
  border: `1px solid ${C.border}`,
  borderRadius: 18,
  padding: 22,
  boxShadow: "0 14px 42px rgba(124,58,237,0.06)",
};

const cardTitleStyle = {
  fontSize: 16,
  fontWeight: 800,
  marginBottom: 18,
  color: C.textH,
};

const analyticsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: 14,
  marginBottom: 20,
};

const analyticsCardStyle = {
  ...cardStyle,
  position: "relative",
  overflow: "hidden",
};

const analyticsIconStyle = {
  width: 42,
  height: 42,
  borderRadius: 12,
  background: C.primarySoft,
  display: "grid",
  placeItems: "center",
  fontSize: 20,
  marginBottom: 12,
};

const mainGridStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(330px, 390px) minmax(0, 1fr)",
  gap: 24,
  alignItems: "start",
};

const taskCardGridStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.2fr) minmax(280px, 0.8fr)",
  gap: 24,
  alignItems: "start",
};

const taskSummaryBoxStyle = {
  background: "#FBFAFF",
  border: `1px solid ${C.border}`,
  borderRadius: 16,
  padding: 16,
};

const actionRowStyle = {
  display: "flex",
  gap: 8,
  justifyContent: "flex-end",
  flexWrap: "wrap",
  marginBottom: 14,
};

const summaryStatsStyle = {
  fontSize: 12,
  color: C.textMuted,
  marginTop: 8,
  lineHeight: 1.8,
  display: "grid",
  gap: 2,
};

const progressHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  fontSize: 12,
  color: C.textMuted,
  marginBottom: 6,
};

const progressTrackStyle = {
  height: 10,
  background: C.primarySoft,
  borderRadius: 999,
  overflow: "hidden",
  width: "100%",
};

const checklistStyle = {
  margin: "10px 0 0 20px",
  paddingLeft: 12,
  lineHeight: 1.7,
  fontSize: 14,
  color: C.textB,
};

const subChecklistStyle = {
  margin: "8px 0 0 28px",
  paddingLeft: 14,
  lineHeight: 1.7,
  fontSize: 14,
  color: C.textB,
};

const checklistItemStyle = {
  paddingLeft: 4,
  marginBottom: 10,
};

const subChecklistItemStyle = {
  paddingLeft: 4,
  marginBottom: 5,
};

const readOnlyTickStyle = {
  marginRight: 6,
  fontSize: 14,
  cursor: "default",
};

const removeButtonStyle = {
  marginLeft: 6,
  border: "none",
  background: "transparent",
  cursor: "pointer",
  color: C.primaryDark,
  fontWeight: 800,
};

const linkBoxStyle = {
  background: C.primarySoft,
  border: "1px solid #DDD6FE",
  borderRadius: 12,
  padding: 12,
  marginBottom: 12,
  fontSize: 13,
  overflowWrap: "anywhere",
  color: C.textB,
};

const reminderBoxStyle = {
  background: "#F5F3FF",
  border: "1px solid #DDD6FE",
  borderRadius: 12,
  padding: 14,
  marginBottom: 14,
  color: C.textB,
};

const summaryBoxStyle = {
  marginBottom: 16,
  padding: 18,
  background: "#FBFAFF",
  border: `1px solid ${C.border}`,
  borderRadius: 18,
  fontSize: 13,
  color: C.textB,
};

const todayUpdateBoxStyle = {
  marginTop: 16,
  paddingTop: 12,
  borderTop: `1px dashed ${C.border}`,
};

const updateBoxStyle = {
  background: "#FBFAFF",
  border: `1px solid ${C.border}`,
  borderRadius: 14,
  padding: 12,
  marginTop: 10,
  fontSize: 13,
  color: C.textB,
};

const commentBoxStyle = {
  background: "#FBFAFF",
  border: `1px solid ${C.border}`,
  padding: 10,
  borderRadius: 12,
  marginTop: 8,
  fontSize: 13,
  color: C.textB,
};

const chipWrapStyle = {
  display: "flex",
  gap: 6,
  flexWrap: "wrap",
  marginTop: 8,
};

const chipStyle = {
  background: C.primarySoft,
  color: C.primaryDark,
  padding: "5px 9px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 800,
};

const twoColumnFormStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
};

const filterRowStyle = {
  display: "flex",
  gap: 8,
  marginBottom: 16,
  flexWrap: "wrap",
};

const taskCountStyle = {
  marginLeft: "auto",
  color: C.textMuted,
  fontSize: 13,
  alignSelf: "center",
  fontWeight: 700,
};

const taskTitleRowStyle = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  marginBottom: 8,
  alignItems: "center",
};

const taskDescriptionStyle = {
  fontSize: 13,
  color: C.textB,
  whiteSpace: "pre-wrap",
  lineHeight: 1.6,
  marginBottom: 10,
};

const taskMetaStyle = {
  fontSize: 12,
  color: C.textMuted,
  display: "flex",
  gap: 14,
  flexWrap: "wrap",
};

const expandedActionGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: 10,
  marginBottom: 16,
};

const dailySummaryGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 16,
};

const summaryListStyle = {
  margin: "8px 0 0 18px",
  padding: 0,
  lineHeight: 1.6,
  color: C.textB,
};

const expandedBoxStyle = {
  marginTop: 16,
  borderTop: `1px solid ${C.border}`,
  paddingTop: 16,
};

const labelStyle = {
  display: "block",
  fontSize: 12,
  color: C.textMuted,
  fontWeight: 700,
  marginBottom: 7,
};

const inputStyle = {
  width: "100%",
  border: "1px solid #E5DEFF",
  background: "#FFFFFF",
  borderRadius: 12,
  padding: "11px 13px",
  fontSize: 13,
  color: C.textH,
  outline: "none",
  fontFamily: FONT,
};

const miniSelectStyle = {
  border: "1px solid #E5DEFF",
  background: "#FFFFFF",
  borderRadius: 10,
  padding: "7px 10px",
  fontSize: 12,
  color: C.textH,
  outline: "none",
};

const primaryBtnStyle = {
  width: "100%",
  border: "none",
  borderRadius: 12,
  padding: "11px 15px",
  fontSize: 13,
  fontWeight: 800,
  cursor: "pointer",
  fontFamily: FONT,
  background: "linear-gradient(135deg, #7C3AED, #4F46E5)",
  color: "#fff",
  boxShadow: "0 8px 22px rgba(124, 58, 237, 0.25)",
};

const primarySmallBtnStyle = {
  border: "none",
  borderRadius: 10,
  padding: "7px 12px",
  fontSize: 12,
  fontWeight: 800,
  cursor: "pointer",
  background: "linear-gradient(135deg, #7C3AED, #4F46E5)",
  color: "#fff",
};

const secondarySmallBtnStyle = {
  border: "none",
  borderRadius: 10,
  padding: "7px 12px",
  fontSize: 12,
  fontWeight: 800,
  cursor: "pointer",
  background: C.primarySoft,
  color: C.primaryDark,
};

const secondaryBtnStyle = {
  border: "none",
  borderRadius: 12,
  padding: "10px 14px",
  fontSize: 13,
  fontWeight: 800,
  cursor: "pointer",
  background: C.primarySoft,
  color: C.primaryDark,
};

const dangerSmallBtnStyle = {
  border: "none",
  borderRadius: 10,
  padding: "7px 12px",
  fontSize: 12,
  fontWeight: 800,
  cursor: "pointer",
  background: C.dangerBg,
  color: C.danger,
};

const errorBoxStyle = {
  background: C.dangerBg,
  color: C.danger,
  padding: 12,
  borderRadius: 12,
  marginBottom: 14,
  fontSize: 13,
  fontWeight: 700,
};

const mutedSmallStyle = {
  fontSize: 13,
  color: C.textMuted,
};

const priorityBadgeStyle = (priority) => {
  const map = {
    low: { background: "#ECFDF5", color: "#047857" },
    medium: { background: "#EDE9FE", color: "#5B21B6" },
    high: { background: "#FFFBEB", color: "#B45309" },
    critical: { background: "#FEE2E2", color: "#B91C1C" },
  };

  return {
    ...(map[priority] || map.medium),
    padding: "5px 9px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 800,
  };
};

const statusBadgeStyle = (status) => {
  const map = {
    pending: { background: "#EDE9FE", color: "#5B21B6" },
    in_progress: { background: "#DBEAFE", color: "#1D4ED8" },
    waiting_approval: { background: "#FFFBEB", color: "#B45309" },
    blocked: { background: "#FEE2E2", color: "#B91C1C" },
    completed: { background: "#ECFDF5", color: "#047857" },
    cancelled: { background: "#F3F4F6", color: "#4B5563" },
  };

  return {
    ...(map[status] || map.pending),
    padding: "5px 9px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 800,
  };
};