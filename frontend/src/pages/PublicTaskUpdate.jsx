import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";

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
  error: "#991B1B",
  errorBg: "#FEE2E2",
};

const FONT = "'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif";

const label = (value) =>
  value ? value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "";

const isDone = (value) => value === 1 || value === true;

const parentItems = (items = []) => items.filter((x) => !x.parent_checklist_id);

export default function PublicTaskUpdate() {
  const { token } = useParams();

  const [task, setTask] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [form, setForm] = useState({
    updater_name: "",
    updater_email: "",
    comment: "",
  });

  const [proofFile, setProofFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchTask = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get(`/public-task/${token}`);
      setTask(res.data);
      setChecklist(res.data.checklist_items || []);
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid task update link.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
  }, [token]);

  const allChecklistItems = useMemo(() => {
    const flat = [];

    checklist.forEach((item) => {
      flat.push(item);
      (item.children || []).forEach((child) => flat.push(child));
    });

    return flat;
  }, [checklist]);

  const completedCount = useMemo(() => {
    return allChecklistItems.filter((item) => isDone(item.is_completed)).length;
  }, [allChecklistItems]);

  const progress = useMemo(() => {
    if (!allChecklistItems.length) return task?.progress || 0;
    return Math.round((completedCount / allChecklistItems.length) * 100);
  }, [allChecklistItems, completedCount, task]);

  const toggleChecklist = (id) => {
    setChecklist((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            is_completed: isDone(item.is_completed) ? 0 : 1,
          };
        }

        return {
          ...item,
          children: (item.children || []).map((child) =>
            child.id === id
              ? {
                  ...child,
                  is_completed: isDone(child.is_completed) ? 0 : 1,
                }
              : child
          ),
        };
      })
    );
  };

  const handleInput = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const submitUpdate = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const payload = {
        updater_name: form.updater_name,
        updater_email: form.updater_email || null,
        comment: form.comment,
        checklist: allChecklistItems.map((item) => ({
          item_id: item.id,
          is_completed: isDone(item.is_completed) ? 1 : 0,
        })),
      };

      const res = await api.post(`/public-task/${token}/update`, payload);

      setTask(res.data);
      setChecklist(res.data.checklist_items || []);
      setForm((prev) => ({ ...prev, comment: "" }));
      setMessage("Progress updated successfully.");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update progress.");
    } finally {
      setSaving(false);
    }
  };

  const uploadProof = async () => {
    if (!proofFile) {
      setError("Please choose a proof file first.");
      return;
    }

    try {
      setUploading(true);
      setMessage("");
      setError("");

      const data = new FormData();
      data.append("updater_name", form.updater_name || "");
      data.append("updater_email", form.updater_email || "");
      data.append("comment", form.comment || "");
      data.append("file", proofFile);

      const res = await api.post(`/public-task/${token}/proof`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setTask(res.data);
      setChecklist(res.data.checklist_items || []);
      setProofFile(null);
      setMessage("Proof uploaded successfully.");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to upload proof.");
    } finally {
      setUploading(false);
    }
  };

  const renderChecklist = () => {
    const parents = parentItems(checklist);

    if (!parents.length) {
      return <p style={styles.muted}>No checklist items available.</p>;
    }

    return (
      <ul style={styles.mainChecklist}>
        {parents.map((item) => (
          <li key={item.id} style={styles.mainChecklistItem}>
            <label style={styles.checkLine}>
              <input
                type="checkbox"
                checked={isDone(item.is_completed)}
                onChange={() => toggleChecklist(item.id)}
                style={styles.checkbox}
              />
              <span>{item.title}</span>
            </label>

            {item.children?.length > 0 && (
              <ul style={styles.subChecklist}>
                {item.children.map((child) => (
                  <li key={child.id} style={styles.subChecklistItem}>
                    <label style={styles.checkLine}>
                      <input
                        type="checkbox"
                        checked={isDone(child.is_completed)}
                        onChange={() => toggleChecklist(child.id)}
                        style={styles.checkbox}
                      />
                      <span>{child.title}</span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    );
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.wrapper}>
          <div style={styles.card}>Loading task...</div>
        </div>
      </div>
    );
  }

  if (error && !task) {
    return (
      <div style={styles.page}>
        <div style={styles.wrapper}>
          <div style={styles.card}>
            <h2 style={styles.taskTitle}>Task Link Error</h2>
            <p style={styles.errorText}>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.wrapper}>
        <div style={styles.header}>
          <div>
            <div style={styles.eyebrow}>Operations Agent</div>
            <h1 style={styles.title}>Task Progress Update</h1>
            <p style={styles.subtitle}>Update your assigned task progress below.</p>
          </div>

          <div style={styles.statusBox}>
            <b>{progress}%</b>
            <span>Progress</span>
          </div>
        </div>

        {message && <div style={styles.success}>{message}</div>}
        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.card}>
          <h2 style={styles.taskTitle}>{task.title}</h2>

          <div style={styles.badges}>
            <span style={styles.badge}>Priority: {label(task.priority)}</span>
            <span style={styles.badge}>Status: {label(task.status)}</span>
            {task.due_date && <span style={styles.badge}>Deadline: {task.due_date}</span>}
          </div>

          <div style={styles.progressTrack}>
            <div style={{ ...styles.progressFill, width: `${progress}%` }} />
          </div>

          <div style={styles.summaryRow}>
            <span>Completed: {completedCount}</span>
            <span>Total: {allChecklistItems.length}</span>
          </div>

          <h3 style={styles.sectionTitle}>Task Details</h3>
          <p style={styles.description}>
            {task.professional_description || task.description || "No task details available."}
          </p>

          <h3 style={styles.sectionTitle}>Assignee Checklist</h3>
          {renderChecklist()}

          <form onSubmit={submitUpdate} style={{ marginTop: 20 }}>
            <div style={styles.grid}>
              <div>
                <label style={styles.label}>Your Name</label>
                <input
                  style={styles.input}
                  name="updater_name"
                  value={form.updater_name}
                  onChange={handleInput}
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label style={styles.label}>Your Email</label>
                <input
                  style={styles.input}
                  type="email"
                  name="updater_email"
                  value={form.updater_email}
                  onChange={handleInput}
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <label style={styles.label}>Comment / Progress Note</label>
              <textarea
                style={styles.textarea}
                name="comment"
                value={form.comment}
                onChange={handleInput}
                placeholder="Write optional progress comment..."
              />
            </div>

            <button style={styles.primaryBtn} type="submit" disabled={saving}>
              {saving ? "Updating..." : "Update Progress"}
            </button>
          </form>
        </div>

        <div style={styles.card}>
          <h3 style={styles.sectionTitle}>Upload Proof of Work</h3>
          <p style={styles.muted}>
            Upload screenshot, PDF, DOCX, Excel, TXT, or image as proof of task completion.
          </p>

          <input
            type="file"
            onChange={(e) => setProofFile(e.target.files?.[0] || null)}
            style={styles.fileInput}
          />

          {proofFile && <div style={styles.fileName}>📎 {proofFile.name}</div>}

          <button style={styles.secondaryBtn} onClick={uploadProof} disabled={uploading}>
            {uploading ? "Uploading..." : "Upload Proof"}
          </button>
        </div>

        {task.external_updates?.length > 0 && (
          <div style={styles.card}>
            <h3 style={styles.sectionTitle}>Previous Updates</h3>

            {task.external_updates.map((update) => (
              <div key={update.id} style={styles.updateBox}>
                <b>{update.updater_name || update.updater_email || "Assignee"}</b>
                <p style={styles.updateText}>Progress: {update.progress}%</p>
                {update.comment && <p style={styles.updateText}>{update.comment}</p>}
                {update.proof_filename && (
                  <p style={styles.updateText}>Proof uploaded: {update.proof_filename}</p>
                )}
                <small style={styles.smallText}>
                  {new Date(update.created_at).toLocaleString()}
                </small>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: C.pageBg,
    padding: "36px 40px 64px",
    fontFamily: FONT,
  },
  wrapper: {
    maxWidth: 960,
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: 20,
    alignItems: "center",
    marginBottom: 24,
    background: "linear-gradient(135deg,#FFFFFF,#F5F3FF)",
    border: `1px solid ${C.border}`,
    borderRadius: 22,
    padding: 24,
    boxShadow: "0 14px 42px rgba(124,58,237,0.06)",
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: C.textLight,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 800,
    margin: 0,
    color: C.textH,
    letterSpacing: "-0.8px",
  },
  subtitle: {
    margin: "6px 0 0",
    color: C.textMuted,
    fontSize: 13,
  },
  statusBox: {
    background: "linear-gradient(135deg,#7C3AED,#4F46E5)",
    color: "#fff",
    borderRadius: 18,
    padding: "16px 24px",
    minWidth: 120,
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    gap: 4,
    boxShadow: "0 10px 28px rgba(124,58,237,0.28)",
  },
  card: {
    background: C.card,
    borderRadius: 20,
    padding: 24,
    border: `1px solid ${C.border}`,
    boxShadow: "0 14px 42px rgba(124,58,237,0.08)",
    marginBottom: 18,
  },
  taskTitle: {
    margin: "0 0 12px",
    color: C.textH,
    fontSize: 22,
    fontWeight: 800,
  },
  badges: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 16,
  },
  badge: {
    background: C.primarySoft,
    color: C.primaryDark,
    padding: "6px 11px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 800,
  },
  progressTrack: {
    width: "100%",
    height: 12,
    borderRadius: 999,
    background: "#EDE9FE",
    overflow: "hidden",
    marginBottom: 12,
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg,#7C3AED,#4F46E5)",
    transition: "width .3s ease",
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 18,
    color: C.textMuted,
    fontSize: 13,
    fontWeight: 700,
  },
  sectionTitle: {
    fontSize: 16,
    margin: "18px 0 10px",
    color: C.textH,
    fontWeight: 800,
  },
  description: {
    color: C.textB,
    whiteSpace: "pre-wrap",
    lineHeight: 1.7,
    fontSize: 14,
  },
  mainChecklist: {
    margin: "10px 0 0 20px",
    paddingLeft: 12,
    lineHeight: 1.7,
    fontSize: 14,
    color: C.textB,
  },
  mainChecklistItem: {
    marginBottom: 10,
    paddingLeft: 4,
  },
  subChecklist: {
    margin: "8px 0 0 28px",
    paddingLeft: 14,
    lineHeight: 1.7,
    fontSize: 14,
  },
  subChecklistItem: {
    marginBottom: 6,
    paddingLeft: 4,
  },
  checkLine: {
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
    cursor: "pointer",
  },
  checkbox: {
    width: 18,
    height: 18,
    cursor: "pointer",
    accentColor: C.primary,
    marginTop: 3,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 14,
  },
  label: {
    display: "block",
    fontSize: 12,
    fontWeight: 700,
    color: C.textMuted,
    marginBottom: 7,
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    border: "1px solid #E5DEFF",
    borderRadius: 12,
    outline: "none",
    color: C.textH,
    fontFamily: FONT,
  },
  textarea: {
    width: "100%",
    minHeight: 95,
    padding: "12px 14px",
    border: "1px solid #E5DEFF",
    borderRadius: 12,
    outline: "none",
    color: C.textH,
    fontFamily: FONT,
    resize: "vertical",
  },
  primaryBtn: {
    marginTop: 16,
    background: "linear-gradient(135deg,#7C3AED,#4F46E5)",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    padding: "12px 20px",
    cursor: "pointer",
    fontWeight: 800,
    boxShadow: "0 8px 20px rgba(124,58,237,.25)",
  },
  secondaryBtn: {
    marginTop: 14,
    background: C.primarySoft,
    color: C.primaryDark,
    border: "none",
    borderRadius: 12,
    padding: "12px 20px",
    cursor: "pointer",
    fontWeight: 800,
  },
  fileInput: {
    display: "block",
    marginTop: 12,
    cursor: "pointer",
    color: C.textB,
  },
  fileName: {
    marginTop: 10,
    padding: 10,
    background: "#F5F3FF",
    borderRadius: 10,
    color: C.primaryDark,
    fontSize: 13,
    fontWeight: 700,
  },
  updateBox: {
    background: "#FBFAFF",
    borderRadius: 14,
    padding: 14,
    marginTop: 10,
    border: `1px solid ${C.border}`,
  },
  updateText: {
    margin: "4px 0",
    color: C.textB,
    fontSize: 13,
  },
  smallText: {
    color: C.textLight,
  },
  muted: {
    color: C.textMuted,
    fontSize: 13,
    lineHeight: 1.6,
  },
  success: {
    background: C.successBg,
    color: C.success,
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
    fontSize: 13,
    fontWeight: 700,
  },
  error: {
    background: C.errorBg,
    color: C.error,
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
    fontSize: 13,
    fontWeight: 700,
  },
  errorText: {
    color: C.error,
  },
};