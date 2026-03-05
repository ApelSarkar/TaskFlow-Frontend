import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { taskApi, userApi } from '../api/taskApi';
import { selectUser } from '../context/authSlice';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const STATUS_COLORS = { NEW: '#f59e0b', IN_PROGRESS: '#3b82f6', COMPLETED: '#10b981' };
const PRIORITY_COLORS = { LOW: '#6b7280', MEDIUM: '#f59e0b', HIGH: '#ef4444' };
const NEXT_STATUS = { NEW: 'IN_PROGRESS', IN_PROGRESS: 'COMPLETED' };

// ── Task Form Modal ───────────────────────────────────────────────
function TaskFormModal({ task, users, onSave, onClose }) {
    const currentUser = useSelector(selectUser);
    const isManager = currentUser?.role === 'MANAGER' || currentUser?.role === 'ADMIN';

    const [form, setForm] = useState({
        title: task?.title || '',
        description: task?.description || '',
        startDate: task?.startDate || '',
        dueDate: task?.dueDate || '',
        priority: task?.priority || 'MEDIUM',
        assignedToId: task?.assignedTo?.id || '',
    });

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...form, assignedToId: form.assignedToId || undefined });
    };

    return (
        <div style={modal.overlay}>
            <div style={modal.box}>
                <h2 style={modal.title}>
                    {task ? '✏️ Edit Task' : '➕ Create New Task'}
                </h2>
                <form onSubmit={handleSubmit} style={modal.form}>
                    <div style={modal.field}>
                        <label style={modal.label}>Title *</label>
                        <input
                            type="text" name="title" value={form.title}
                            onChange={handleChange} required style={modal.input}
                            placeholder="Task title"
                        />
                    </div>

                    <div style={modal.field}>
                        <label style={modal.label}>Description</label>
                        <textarea
                            name="description" value={form.description}
                            onChange={handleChange} rows={3}
                            style={{ ...modal.input, resize: 'vertical' }}
                            placeholder="Task description"
                        />
                    </div>

                    <div style={modal.row}>
                        <div style={{ ...modal.field, flex: 1 }}>
                            <label style={modal.label}>Start Date *</label>
                            <input
                                type="date" name="startDate" value={form.startDate}
                                onChange={handleChange} required style={modal.input}
                            />
                        </div>
                        <div style={{ ...modal.field, flex: 1 }}>
                            <label style={modal.label}>Due Date *</label>
                            <input
                                type="date" name="dueDate" value={form.dueDate}
                                onChange={handleChange} required style={modal.input}
                            />
                        </div>
                    </div>

                    <div style={modal.row}>
                        <div style={{ ...modal.field, flex: 1 }}>
                            <label style={modal.label}>Priority</label>
                            <select
                                name="priority" value={form.priority}
                                onChange={handleChange} style={modal.input}
                            >
                                {['LOW', 'MEDIUM', 'HIGH'].map((p) => (
                                    <option key={p}>{p}</option>
                                ))}
                            </select>
                        </div>
                        {isManager && (
                            <div style={{ ...modal.field, flex: 1 }}>
                                <label style={modal.label}>Assign To</label>
                                <select
                                    name="assignedToId" value={form.assignedToId}
                                    onChange={handleChange} style={modal.input}
                                >
                                    <option value="">-- Select User --</option>
                                    {users.map((u) => (
                                        <option key={u.id} value={u.id}>{u.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    <div style={modal.buttons}>
                        <button type="button" onClick={onClose} style={modal.cancelBtn}>
                            Cancel
                        </button>
                        <button type="submit" style={modal.saveBtn}>
                            {task ? '💾 Update Task' : '✅ Create Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}


// ── Delete Confirm Modal ──────────────────────────────────────────
function DeleteConfirmModal({ task, onConfirm, onCancel }) {
    return (
        <div style={deleteModal.overlay}>
            <div style={deleteModal.box}>
                <div style={deleteModal.icon}>🗑️</div>
                <h2 style={deleteModal.title}>Delete Task</h2>
                <p style={deleteModal.message}>
                    Are you sure you want to delete:
                </p>
                <p style={deleteModal.taskName}>"{task?.title}"</p>
                <p style={deleteModal.warning}>
                    ⚠️ This action cannot be undone.
                </p>
                <div style={deleteModal.buttons}>
                    <button onClick={onCancel} style={deleteModal.cancelBtn}>
                        Cancel
                    </button>
                    <button onClick={onConfirm} style={deleteModal.deleteBtn}>
                        🗑️ Yes, Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

const deleteModal = {
    overlay: {
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', zIndex: 1000,
    },
    box: {
        background: '#fff', borderRadius: 16,
        padding: '2.5rem 2rem', maxWidth: 400,
        width: '90%', textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    },
    icon: { fontSize: 52, marginBottom: 12 },
    title: { margin: '0 0 12px', fontSize: 22, color: '#1a1a2e', fontWeight: 700 },
    message: { margin: '0 0 6px', color: '#6b7280', fontSize: 15 },
    taskName: {
        margin: '0 0 12px', color: '#1a1a2e',
        fontWeight: 600, fontSize: 16,
        background: '#f8fafc', padding: '8px 12px',
        borderRadius: 8, border: '1px solid #e2e8f0',
    },
    warning: {
        margin: '0 0 24px', color: '#ef4444',
        fontSize: 13, fontWeight: 500,
    },
    buttons: {
        display: 'flex', gap: 12, justifyContent: 'center',
    },
    cancelBtn: {
        background: '#f1f5f9', color: '#374151',
        border: '1px solid #e2e8f0', padding: '10px 24px',
        borderRadius: 8, cursor: 'pointer',
        fontWeight: 600, fontSize: 15, flex: 1,
    },
    deleteBtn: {
        background: '#ef4444', color: '#fff',
        border: 'none', padding: '10px 24px',
        borderRadius: 8, cursor: 'pointer',
        fontWeight: 600, fontSize: 15, flex: 1,
    },
};


// ── Main Page ─────────────────────────────────────────────────────
export default function TasksPage() {
    //   const currentUser = useSelector(selectUser);

    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [editTask, setEditTask] = useState(null);
    const [deleteTask, setDeleteTask] = useState(null);  // task to delete
    // const [isDeleting, setIsDeleting] = useState(false); // loading state

    const [filters, setFilters] = useState({
        status: '', priority: '', keyword: '', page: 0, size: 8,
    });

    // Load tasks
    const loadTasks = useCallback(() => {
        setLoading(true);
        const params = {
            page: filters.page,
            size: filters.size,
            ...(filters.status && { status: filters.status }),
            ...(filters.priority && { priority: filters.priority }),
            ...(filters.keyword && { keyword: filters.keyword }),
        };
        taskApi.getMyTasks(params)
            .then((res) => {
                setTasks(res.data.data.content || []);
                setTotalPages(res.data.data.totalPages || 0);
            })
            .catch(() => toast.error('Failed to load tasks'))
            .finally(() => setLoading(false));
    }, [filters]);

    useEffect(() => { loadTasks(); }, [loadTasks]);

    // Load users for assignment dropdown
    useEffect(() => {
        userApi.getAll()
            .then((res) => setUsers(res.data.data))
            .catch(() => { });
    }, []);

    const handleFilterChange = (e) =>
        setFilters({ ...filters, [e.target.name]: e.target.value, page: 0 });

    const handleSave = async (formData) => {
        try {
            if (editTask) {
                await taskApi.update(editTask.id, formData);
                toast.success('Task updated!');
            } else {
                await taskApi.create(formData);
                toast.success('Task created!');
            }
            setShowModal(false);
            setEditTask(null);
            loadTasks();
        } catch (e) {
            toast.error(e.response?.data?.message || 'Operation failed');
        }
    };

    const handleStatusChange = async (task, newStatus) => {
        try {
            await taskApi.updateStatus(task.id, newStatus);
            toast.success('Status updated!');
            loadTasks();
        } catch (e) {
            toast.error(e.response?.data?.message || 'Failed to update status');
        }
    };

    //   const handleDelete = async (id) => {
    //     if (!window.confirm('Are you sure you want to delete this task?')) return;
    //     try {
    //       await taskApi.delete(id);
    //       toast.success('Task deleted');
    //       loadTasks();
    //     } catch (e) {
    //       toast.error('Failed to delete task');
    //     }
    //   };

    const openDeleteModal = (task) => {
        setDeleteTask(task);
    };

    const handleDelete = async () => {
        if (!deleteTask) return;
        // setIsDeleting(true);
        try {
            await taskApi.delete(deleteTask.id);
            toast.success('Task deleted successfully!');
            setDeleteTask(null);
            loadTasks();
        } catch (e) {
            const errorMessage = e.response?.data?.message || 'Failed to delete task';
            toast.error(errorMessage);
        }
    };

    return (
        <div style={styles.page}>
            {/* Header */}
            <div style={styles.header}>
                <h1 style={styles.title}>My Tasks</h1>
                <button
                    onClick={() => { setEditTask(null); setShowModal(true); }}
                    style={styles.addBtn}
                >
                    + New Task
                </button>
            </div>

            {/* Filters */}
            <div style={styles.filterBar}>
                <input
                    name="keyword" placeholder="🔍 Search tasks..."
                    value={filters.keyword} onChange={handleFilterChange}
                    style={styles.searchInput}
                />
                <select
                    name="status" value={filters.status}
                    onChange={handleFilterChange} style={styles.select}
                >
                    <option value="">All Status</option>
                    {['NEW', 'IN_PROGRESS', 'COMPLETED'].map((s) => (
                        <option key={s} value={s}>{s.replace('_', ' ')}</option>
                    ))}
                </select>
                <select
                    name="priority" value={filters.priority}
                    onChange={handleFilterChange} style={styles.select}
                >
                    <option value="">All Priority</option>
                    {['LOW', 'MEDIUM', 'HIGH'].map((p) => (
                        <option key={p} value={p}>{p}</option>
                    ))}
                </select>
            </div>

            {/* Task Cards */}
            {loading ? (
                <div style={styles.loading}>Loading tasks...</div>
            ) : tasks.length === 0 ? (
                <div style={styles.empty}>
                    <div style={{ fontSize: 48 }}>📭</div>
                    <p>No tasks found. Create your first task!</p>
                </div>
            ) : (
                <div style={styles.taskGrid}>
                    {tasks.map((task) => (
                        <div key={task.id} style={styles.taskCard}>
                            {/* Top badges */}
                            <div style={styles.cardTop}>
                                <span style={{
                                    ...styles.badge,
                                    color: PRIORITY_COLORS[task.priority],
                                    background: PRIORITY_COLORS[task.priority] + '18',
                                }}>
                                    ⚑ {task.priority}
                                </span>
                                <span style={{
                                    ...styles.badge,
                                    color: STATUS_COLORS[task.status],
                                    background: STATUS_COLORS[task.status] + '18',
                                }}>
                                    {task.status.replace('_', ' ')}
                                </span>
                            </div>

                            {/* Title & Description */}
                            <h3 style={styles.taskTitle}>{task.title}</h3>
                            {task.description && (
                                <p style={styles.taskDesc}>{task.description}</p>
                            )}

                            {/* Meta info */}
                            <div style={styles.taskMeta}>
                                <span>
                                    📅 Due: {task.dueDate
                                        ? format(new Date(task.dueDate), 'MMM d, yyyy')
                                        : 'N/A'}
                                </span>
                                {task.assignedTo && (
                                    <span>👤 {task.assignedTo.name}</span>
                                )}
                            </div>

                            {/* Actions */}
                            <div style={styles.cardActions}>
                                {NEXT_STATUS[task.status] && (
                                    <button
                                        onClick={() => handleStatusChange(task, NEXT_STATUS[task.status])}
                                        style={styles.progressBtn}
                                    >
                                        → {NEXT_STATUS[task.status].replace('_', ' ')}
                                    </button>
                                )}
                                <div style={styles.iconBtns}>
                                    <button
                                        onClick={() => { setEditTask(task); setShowModal(true); }}
                                        style={styles.iconBtn} title="Edit"
                                    >✏️</button>
                                    <button
                                        onClick={() => openDeleteModal(task)}
                                        style={styles.iconBtnDanger} title="Delete"
                                    >🗑️</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div style={styles.pagination}>
                    <button
                        onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
                        disabled={filters.page === 0}
                        style={styles.pageBtn}
                    >← Prev</button>
                    <span style={styles.pageInfo}>
                        Page {filters.page + 1} of {totalPages}
                    </span>
                    <button
                        onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
                        disabled={filters.page >= totalPages - 1}
                        style={styles.pageBtn}
                    >Next →</button>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <TaskFormModal
                    task={editTask}
                    users={users}
                    onSave={handleSave}
                    onClose={() => { setShowModal(false); setEditTask(null); }}
                />
            )}

            {deleteTask && (
                <DeleteConfirmModal
                    task={deleteTask}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTask(null)}
                />
            )}
        </div>
    );
}

const styles = {
    page: { padding: '2rem' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    title: { margin: 0, fontSize: 26, fontWeight: 700, color: '#1a1a2e' },
    addBtn: {
        background: '#4f46e5', color: '#fff', border: 'none',
        padding: '10px 20px', borderRadius: 8, fontSize: 15,
        fontWeight: 600, cursor: 'pointer',
    },
    filterBar: { display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' },
    searchInput: {
        flex: 2, padding: '10px 14px', border: '1px solid #d1d5db',
        borderRadius: 8, fontSize: 14, minWidth: 200, outline: 'none',
    },
    select: {
        flex: 1, padding: '10px 14px', border: '1px solid #d1d5db',
        borderRadius: 8, fontSize: 14, minWidth: 130,
    },
    taskGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: 16,
    },
    taskCard: {
        background: '#fff', borderRadius: 12, padding: '1.25rem',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        display: 'flex', flexDirection: 'column', gap: 10,
    },
    cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    badge: { fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20 },
    taskTitle: { margin: 0, fontSize: 16, fontWeight: 600, color: '#1a1a2e' },
    taskDesc: {
        margin: 0, color: '#6b7280', fontSize: 13, lineHeight: 1.5,
        overflow: 'hidden', textOverflow: 'ellipsis',
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
    },
    taskMeta: { display: 'flex', gap: 14, fontSize: 12, color: '#9ca3af', flexWrap: 'wrap' },
    cardActions: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
    progressBtn: {
        background: '#ede9fe', color: '#4f46e5', border: 'none',
        padding: '6px 12px', borderRadius: 6, fontSize: 12,
        fontWeight: 600, cursor: 'pointer',
    },
    iconBtns: { display: 'flex', gap: 6 },
    iconBtn: { background: '#f1f5f9', border: 'none', borderRadius: 6, width: 32, height: 32, cursor: 'pointer', fontSize: 15 },
    iconBtnDanger: { background: '#fee2e2', border: 'none', borderRadius: 6, width: 32, height: 32, cursor: 'pointer', fontSize: 15 },
    loading: { padding: '3rem', textAlign: 'center', color: '#888' },
    empty: { textAlign: 'center', padding: '4rem', color: '#9ca3af' },
    pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 24 },
    pageBtn: {
        background: '#fff', border: '1px solid #d1d5db',
        padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 600,
    },
    pageInfo: { color: '#6b7280' },
};

const modal = {
    overlay: {
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '1rem',
    },
    box: {
        background: '#fff', borderRadius: 12, padding: '2rem',
        width: '100%', maxWidth: 560,
        maxHeight: '90vh', overflowY: 'auto',
    },
    title: { margin: '0 0 20px', fontSize: 20, color: '#1a1a2e' },
    form: { display: 'flex', flexDirection: 'column', gap: 14 },
    row: { display: 'flex', gap: 12 },
    field: { display: 'flex', flexDirection: 'column', gap: 5 },
    label: { fontWeight: 600, color: '#374151', fontSize: 13 },
    input: {
        padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 8,
        fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box',
    },
    buttons: { display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 },
    cancelBtn: {
        background: '#f1f5f9', color: '#555', border: '1px solid #e2e8f0',
        padding: '9px 18px', borderRadius: 8, cursor: 'pointer', fontWeight: 600,
    },
    saveBtn: {
        background: '#4f46e5', color: '#fff', border: 'none',
        padding: '9px 18px', borderRadius: 8, cursor: 'pointer', fontWeight: 600,
    },
};