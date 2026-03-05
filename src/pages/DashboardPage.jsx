import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { dashboardApi } from '../api/taskApi';
import { selectUser } from '../context/authSlice';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const STATUS_COLORS   = { NEW: '#f59e0b', IN_PROGRESS: '#3b82f6', COMPLETED: '#10b981' };
const PRIORITY_COLORS = { LOW: '#6b7280', MEDIUM: '#f59e0b', HIGH: '#ef4444' };

export default function DashboardPage() {
  const user = useSelector(selectUser);
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getData()
      .then((res) => setData(res.data.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={styles.loading}>Loading dashboard...</div>;
  if (!data)   return null;

  const chartData = Object.entries(data.statusDistribution).map(([name, value]) => ({
    name, value: Number(value),
  }));

  const summaryCards = [
    { label: 'Total Tasks',  value: data.totalTasks,     icon: '📋', color: '#4f46e5' },
    { label: 'Completed',    value: data.completedTasks,  icon: '✅', color: '#10b981' },
    { label: 'In Progress',  value: data.ongoingTasks,    icon: '⚡', color: '#3b82f6' },
    { label: 'Pending',      value: data.pendingTasks,    icon: '⏳', color: '#f59e0b' },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.welcome}>
        <h1 style={styles.welcomeTitle}>Welcome back, {user?.name} 👋</h1>
        <p style={styles.welcomeSub}>Here's your task overview</p>
      </div>

      {/* Summary Cards */}
      <div style={styles.summaryGrid}>
        {summaryCards.map((card) => (
          <div
            key={card.label}
            style={{ ...styles.summaryCard, borderLeft: `4px solid ${card.color}` }}
          >
            <div style={styles.cardIcon}>{card.icon}</div>
            <div>
              <div style={{ ...styles.cardValue, color: card.color }}>{card.value}</div>
              <div style={styles.cardLabel}>{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart + Recent Tasks */}
      <div style={styles.mainGrid}>
        {/* Pie Chart */}
        <div style={styles.chartCard}>
          <h3 style={styles.sectionTitle}>Status Distribution</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={chartData} dataKey="value" nameKey="name"
                cx="50%" cy="50%" outerRadius={90} label
              >
                {chartData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={STATUS_COLORS[entry.name] || '#8884d8'}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Tasks Table */}
        <div style={styles.recentCard}>
          <h3 style={styles.sectionTitle}>Recently Updated Tasks</h3>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHead}>
                  <th style={styles.th}>Title</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Priority</th>
                  <th style={styles.th}>Updated</th>
                </tr>
              </thead>
              <tbody>
                {data.recentTasks.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={styles.empty}>No tasks yet</td>
                  </tr>
                ) : (
                  data.recentTasks.map((task) => (
                    <tr key={task.id} style={styles.tableRow}>
                      <td style={styles.td}>{task.title}</td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.badge,
                          color:      STATUS_COLORS[task.status],
                          background: STATUS_COLORS[task.status] + '22',
                        }}>
                          {task.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.badge,
                          color:      PRIORITY_COLORS[task.priority],
                          background: PRIORITY_COLORS[task.priority] + '22',
                        }}>
                          {task.priority}
                        </span>
                      </td>
                      <td style={styles.td}>
                        {task.updatedAt
                          ? format(new Date(task.updatedAt), 'MMM d, HH:mm')
                          : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page:         { padding: '2rem' },
  loading:      { padding: '3rem', textAlign: 'center', color: '#888' },
  welcome:      { marginBottom: 28 },
  welcomeTitle: { margin: 0, fontSize: 26, fontWeight: 700, color: '#1a1a2e' },
  welcomeSub:   { margin: '4px 0 0', color: '#888' },
  summaryGrid:  {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 16, marginBottom: 24,
  },
  summaryCard: {
    background: '#fff', borderRadius: 12, padding: '1.25rem',
    display: 'flex', alignItems: 'center', gap: 16,
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  },
  cardIcon:  { fontSize: 32 },
  cardValue: { fontSize: 32, fontWeight: 700, lineHeight: 1 },
  cardLabel: { color: '#6b7280', fontSize: 13, marginTop: 4 },
  mainGrid:  {
    display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20,
  },
  chartCard: {
    background: '#fff', borderRadius: 12, padding: '1.5rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  },
  recentCard: {
    background: '#fff', borderRadius: 12, padding: '1.5rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  },
  sectionTitle: { margin: '0 0 16px', color: '#1a1a2e', fontSize: 16, fontWeight: 600 },
  tableWrapper: { overflowX: 'auto' },
  table:        { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  tableHead:    { background: '#f8fafc' },
  th: {
    padding: '10px 12px', textAlign: 'left',
    color: '#6b7280', fontWeight: 600,
    borderBottom: '1px solid #e2e8f0',
  },
  tableRow: { borderBottom: '1px solid #f1f5f9' },
  td:       { padding: '10px 12px', color: '#374151' },
  badge:    { padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  empty:    { textAlign: 'center', padding: 24, color: '#9ca3af' },
};