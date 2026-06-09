import React, { useState, useEffect } from 'react';
import api from '../api';
import { forceDownload } from '../utils/download';

const STATUS_ORDER = { pending: 0, in_progress: 1, done: 2 };

export default function TaskTracker() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', assigned_to: '', priority: 'medium', due_date: '' });
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState('all');

  const fetchTasks = () => api.get('/tasks/list').then(r => setTasks(r.data)).catch(console.error);
  useEffect(() => { fetchTasks(); }, []);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const createTask = async (e) => {
    e.preventDefault();
    setCreating(true); setError('');
    try {
      await api.post('/tasks/create', form);
      setForm({ title: '', description: '', assigned_to: '', priority: 'medium', due_date: '' });
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create task');
    } finally { setCreating(false); }
  };

  const updateStatus = async (id, status) => {
    await api.put(`/tasks/update/${id}`, { status });
    fetchTasks();
  };

  const deleteTask = async (id) => {
    if (!confirm('Delete this task?')) return;
    await api.delete(`/tasks/delete/${id}`);
    fetchTasks();
  };

  const exportTask = async (id, fmt) => {
    try {
      const res = await api.post(`/documents/export-${fmt}`, { content_id: id, doc_type: 'task', export_format: fmt });
      await forceDownload(res.data.download_url);
    } catch (e) { alert('Export failed'); }
  };

  const filtered = tasks.filter(t => filter === 'all' || t.status === filter);

  return (
    <div className="page">
      <h1 className="page-title">✅ Task Tracker</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '24px', alignItems: 'start' }}>

        {/* Create Task */}
        <div className="card">
          <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '18px' }}>+ New Task</h2>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={createTask}>
            <div className="form-group">
              <label>Task Title *</label>
              <input name="title" value={form.title} onChange={handle} required placeholder="e.g. Deploy staging server" />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea name="description" value={form.description} onChange={handle} style={{ minHeight: '70px' }} placeholder="Optional details..." />
            </div>
            <div className="form-group">
              <label>Assigned To</label>
              <input name="assigned_to" value={form.assigned_to} onChange={handle} placeholder="e.g. Alice Chen" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label>Priority</label>
                <select name="priority" value={form.priority} onChange={handle}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input type="date" name="due_date" value={form.due_date} onChange={handle} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={creating} style={{ width: '100%', justifyContent: 'center' }}>
              {creating ? <><span className="spinner" /> Creating…</> : '🤖 Create + AI Reminder'}
            </button>
          </form>
        </div>

        {/* Task List */}
        <div>
          {/* Filter */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            {['all', 'pending', 'in_progress', 'done'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`btn ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '13px', padding: '6px 14px' }}>
                {f === 'all' ? 'All' : f.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </button>
            ))}
            <span style={{ marginLeft: 'auto', color: '#6b7c93', fontSize: '13px', alignSelf: 'center' }}>
              {filtered.length} task{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px', color: '#6b7c93' }}>
              No tasks found. Create your first task!
            </div>
          ) : filtered.map(task => (
            <div key={task.id} className="card" style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '700', fontSize: '15px' }}>{task.title}</span>
                    <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                    <span className={`badge badge-${task.status}`}>{task.status.replace('_', ' ')}</span>
                  </div>
                  {task.description && <p style={{ fontSize: '13px', color: '#6b7c93', marginBottom: '4px' }}>{task.description}</p>}
                  <div style={{ fontSize: '12px', color: '#6b7c93', display: 'flex', gap: '12px' }}>
                    {task.assigned_to && <span>👤 {task.assigned_to}</span>}
                    {task.due_date && <span>📅 {task.due_date}</span>}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  {task.status !== 'done' && (
                    <button className="btn btn-success"
                      onClick={() => updateStatus(task.id, task.status === 'pending' ? 'in_progress' : 'done')}
                      style={{ fontSize: '12px', padding: '5px 10px' }}>
                      {task.status === 'pending' ? '▶ Start' : '✓ Done'}
                    </button>
                  )}
                  <button className="btn btn-secondary" onClick={() => setExpanded(expanded === task.id ? null : task.id)}
                    style={{ fontSize: '12px', padding: '5px 10px' }}>
                    {expanded === task.id ? '▲' : '▼'}
                  </button>
                  <button className="btn btn-danger" onClick={() => deleteTask(task.id)}
                    style={{ fontSize: '12px', padding: '5px 10px' }}>🗑</button>
                </div>
              </div>

              {expanded === task.id && task.reminder_message && (
                <div style={{ marginTop: '12px', background: '#fffbeb', border: '1px solid #f6e05e', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#92400e', marginBottom: '4px' }}>🔔 AI Reminder</div>
                  <div style={{ fontSize: '13px', color: '#78350f' }}>{task.reminder_message}</div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button className="btn btn-secondary" onClick={() => exportTask(task.id, 'docx')} style={{ fontSize: '12px', padding: '5px 10px' }}>📄 Export DOCX</button>
                    <button className="btn btn-secondary" onClick={() => exportTask(task.id, 'pdf')} style={{ fontSize: '12px', padding: '5px 10px' }}>📕 Export PDF</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
