import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";

const C = {
  pageBg: "#F6F7FB",
  card: "#FFFFFF",
  border: "#E6E8F0",
  textH: "#111827",
  textB: "#4B5563",
  textMuted: "#6B7280",
  textLight: "#9CA3AF",
  primary: "#4F46E5",
  primaryDark: "#3730A3",
  primarySoft: "#EEF2FF",
  success: "#047857",
  successBg: "#ECFDF5",
  error: "#B91C1C",
  errorBg: "#FEF2F2",
};

const FONT = "'Inter', 'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif";

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
      <div style={styles.checklistBox}>
        {parents.map((item) => (
          <div key={item.id} style={styles.mainChecklistItem}>
            <label style={styles.checkLine}>
              <input
                type="checkbox"
                checked={isDone(item.is_completed)}
                onChange={() => toggleChecklist(item.id)}
                style={styles.checkbox}
              />
              <span style={styles.checkText}>{item.title}</span>
            </label>

            {item.children?.length > 0 && (
              <div style={styles.subChecklist}>
                {item.children.map((child) => (
                  <label key={child.id} style={styles.subCheckLine}>
                    <input
                      type="checkbox"
                      checked={isDone(child.is_completed)}
                      onChange={() => toggleChecklist(child.id)}
                      style={styles.checkbox}
                    />
                    <span style={styles.checkText}>{child.title}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
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
            <p style={styles.subtitle}>
              Review your assigned task, update checklist progress, and upload proof of work.
            </p>
          </div>

          <div style={styles.statusBox}>
            <b>{progress}%</b>
            <span>Progress</span>
          </div>
        </div>

        {message && <div style={styles.success}>{message}</div>}
        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.taskTitle}>{task.title}</h2>
              <p style={styles.cardSubText}>Assigned task progress workspace</p>
            </div>
          </div>

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
            <span>Total Checklist: {allChecklistItems.length}</span>
          </div>

          <h3 style={styles.sectionTitle}>Task Details</h3>
          <p style={styles.description}>
            {task.professional_description || task.description || "No task details available."}
          </p>

          <h3 style={styles.sectionTitle}>Assignee Checklist</h3>
          {renderChecklist()}

          <form onSubmit={submitUpdate} style={{ marginTop: 22 }}>
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
          <h3 style={styles.sectionTitleNoTop}>Upload Proof of Work</h3>
          <p style={styles.muted}>
            Upload screenshot, PDF, DOCX, Excel, TXT, or image as proof of task completion.
          </p>

          <input
            type="file"
            onChange={(e) => setProofFile(e.target.files?.[0] || null)}
            style={styles.fileInput}
          />

          {proofFile && <div style={styles.fileName}>{proofFile.name}</div>}

          <button style={styles.secondaryBtn} onClick={uploadProof} disabled={uploading}>
            {uploading ? "Uploading..." : "Upload Proof"}
          </button>
        </div>

        {task.external_updates?.length > 0 && (
          <div style={styles.card}>
            <h3 style={styles.sectionTitleNoTop}>Previous Updates</h3>

            {task.external_updates.map((update) => (
              <div key={update.id} style={styles.updateBox}>
                <div style={styles.updateTop}>
                  <b>{update.updater_name || update.updater_email || "Assignee"}</b>
                  <span>{update.progress}%</span>
                </div>

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
    padding: "32px 36px 64px",
    fontFamily: FONT,
  },
  wrapper: {
    maxWidth: 980,
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: 22,
    alignItems: "center",
    marginBottom: 24,
    background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFF 45%, #EEF2FF 100%)",
    border: `1px solid ${C.border}`,
    borderRadius: 24,
    padding: 28,
    boxShadow: "0 16px 40px rgba(17, 24, 39, 0.06)",
    flexWrap: "wrap",
  },
  eyebrow: {
    display: "inline-flex",
    padding: "7px 11px",
    borderRadius: 999,
    background: C.primarySoft,
    color: C.primaryDark,
    fontSize: 12,
    fontWeight: 800,
    marginBottom: 12,
  },
  title: {
    fontSize: 30,
    fontWeight: 800,
    margin: 0,
    color: C.textH,
    letterSpacing: "-0.8px",
  },
  subtitle: {
    margin: "8px 0 0",
    color: C.textMuted,
    fontSize: 14,
    lineHeight: 1.7,
    maxWidth: 640,
  },
  statusBox: {
    background: "linear-gradient(135deg,#4F46E5,#2563EB)",
    color: "#fff",
    borderRadius: 20,
    padding: "18px 26px",
    minWidth: 130,
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    gap: 4,
    boxShadow: "0 12px 28px rgba(79,70,229,0.28)",
  },
  card: {
    background: C.card,
    borderRadius: 20,
    padding: 24,
    border: `1px solid ${C.border}`,
    boxShadow: "0 16px 40px rgba(17, 24, 39, 0.06)",
    marginBottom: 18,
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "flex-start",
    marginBottom: 14,
  },
  cardSubText: {
    margin: "4px 0 0",
    color: C.textMuted,
    fontSize: 13,
  },
  taskTitle: {
    margin: 0,
    color: C.textH,
    fontSize: 22,
    fontWeight: 800,
    letterSpacing: "-0.4px",
  },
  badges: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 18,
  },
  badge: {
    background: C.primarySoft,
    color: C.primaryDark,
    padding: "7px 11px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 800,
  },
  progressTrack: {
    width: "100%",
    height: 12,
    borderRadius: 999,
    background: "#E5E7EB",
    overflow: "hidden",
    marginBottom: 12,
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg,#4F46E5,#2563EB)",
    transition: "width .3s ease",
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 20,
    color: C.textMuted,
    fontSize: 13,
    fontWeight: 700,
  },
  sectionTitle: {
    fontSize: 16,
    margin: "20px 0 10px",
    color: C.textH,
    fontWeight: 800,
  },
  sectionTitleNoTop: {
    fontSize: 16,
    margin: "0 0 10px",
    color: C.textH,
    fontWeight: 800,
  },
  description: {
    color: C.textB,
    whiteSpace: "pre-wrap",
    lineHeight: 1.75,
    fontSize: 14,
    background: "#F9FAFB",
    border: `1px solid ${C.border}`,
    borderRadius: 16,
    padding: 16,
  },
  checklistBox: {
    background: "#F9FAFB",
    border: `1px solid ${C.border}`,
    borderRadius: 16,
    padding: 16,
  },
  mainChecklistItem: {
    marginBottom: 12,
  },
  subChecklist: {
    margin: "10px 0 0 28px",
    display: "grid",
    gap: 8,
  },
  checkLine: {
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
    cursor: "pointer",
  },
  subCheckLine: {
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
    marginTop: 2,
    flexShrink: 0,
  },
  checkText: {
    color: C.textB,
    fontSize: 14,
    lineHeight: 1.6,
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
    border: `1px solid ${C.border}`,
    borderRadius: 12,
    outline: "none",
    color: C.textH,
    fontFamily: FONT,
  },
  textarea: {
    width: "100%",
    minHeight: 100,
    padding: "12px 14px",
    border: `1px solid ${C.border}`,
    borderRadius: 12,
    outline: "none",
    color: C.textH,
    fontFamily: FONT,
    resize: "vertical",
  },
  primaryBtn: {
    marginTop: 16,
    background: "linear-gradient(135deg,#4F46E5,#2563EB)",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    padding: "12px 20px",
    cursor: "pointer",
    fontWeight: 800,
    boxShadow: "0 10px 24px rgba(79,70,229,.26)",
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
    padding: 12,
    background: C.primarySoft,
    borderRadius: 12,
    color: C.primaryDark,
    fontSize: 13,
    fontWeight: 700,
  },
  updateBox: {
    background: "#F9FAFB",
    borderRadius: 16,
    padding: 16,
    marginTop: 10,
    border: `1px solid ${C.border}`,
  },
  updateTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    color: C.textH,
    fontSize: 14,
  },
  updateText: {
    margin: "6px 0",
    color: C.textB,
    fontSize: 13,
    lineHeight: 1.6,
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
    padding: 13,
    borderRadius: 14,
    marginBottom: 14,
    fontSize: 13,
    fontWeight: 700,
    border: "1px solid #A7F3D0",
  },
  error: {
    background: C.errorBg,
    color: C.error,
    padding: 13,
    borderRadius: 14,
    marginBottom: 14,
    fontSize: 13,
    fontWeight: 700,
    border: "1px solid #FECACA",
  },
  errorText: {
    color: C.error,
  },
};