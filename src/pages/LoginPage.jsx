import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  loginUser, clearError,
  selectAuthLoading, selectAuthError, selectIsAuthenticated,
} from '../context/authSlice';
import { toast } from 'react-toastify';

export default function LoginPage() {
  const dispatch        = useDispatch();
  const navigate        = useNavigate();
  const [searchParams]  = useSearchParams();
  const isLoading       = useSelector(selectAuthLoading);
  const error           = useSelector(selectAuthError);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [form, setForm] = useState({ email: '', password: '' });

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const reason = searchParams.get('reason');
    if (reason === 'session_expired') toast.warn('Session expired. Please login again.');
    if (reason === 'idle')            toast.warn('Logged out due to inactivity.');
    dispatch(clearError());
  }, [dispatch, searchParams]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser(form));
    if (!result.error) {
      toast.success('Welcome back!');
      navigate('/dashboard');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}>📋</div>
          <h1 style={styles.title}>Task Management System</h1>
          <p style={styles.subtitle}>Sign in to your account</p>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email" name="email" value={form.email}
              onChange={handleChange} required
              placeholder="your@email.com" style={styles.input}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password" name="password" value={form.password}
              onChange={handleChange} required
              placeholder="••••••••" style={styles.input}
            />
          </div>
          <button type="submit" style={styles.btn} disabled={isLoading}>
            {isLoading ? '⏳ Signing in...' : '→ Sign In'}
          </button>
        </form>

        <p style={styles.footer}>
          Don't have an account?{' '}
          <Link to="/register" style={styles.link}>Register here</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  card: {
    background: '#fff', borderRadius: 16,
    padding: '2.5rem', width: '100%', maxWidth: 400,
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  },
  header:   { textAlign: 'center', marginBottom: 32 },
  logo:     { fontSize: 48, marginBottom: 8 },
  title:    { margin: 0, color: '#1a1a2e', fontSize: 28, fontWeight: 700 },
  subtitle: { margin: '4px 0 0', color: '#888' },
  errorBox: {
    background: '#fee2e2', border: '1px solid #fecaca',
    color: '#dc2626', borderRadius: 8,
    padding: '10px 14px', marginBottom: 20, fontSize: 14,
  },
  form:  { display: 'flex', flexDirection: 'column', gap: 18 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontWeight: 600, color: '#374151', fontSize: 14 },
  input: {
    padding: '10px 14px', border: '1px solid #d1d5db',
    borderRadius: 8, fontSize: 15, outline: 'none',
  },
  btn: {
    background: '#4f46e5', color: '#fff', border: 'none',
    padding: '12px', borderRadius: 8,
    fontSize: 16, fontWeight: 600, cursor: 'pointer', marginTop: 4,
  },
  footer: { textAlign: 'center', marginTop: 24, color: '#6b7280', fontSize: 14 },
  link:   { color: '#4f46e5', fontWeight: 600, textDecoration: 'none' },
};