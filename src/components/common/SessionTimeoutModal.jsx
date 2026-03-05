import React from 'react';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../../context/authSlice';
import { useNavigate } from 'react-router-dom';

export default function SessionTimeoutModal({ countdown, onStayLoggedIn }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.icon}>⏰</div>
        <h2 style={styles.title}>Session Expiring Soon</h2>
        <p style={styles.message}>
          Your session will expire in{' '}
          <strong style={styles.countdown}>{countdown}</strong> seconds
          due to inactivity.
        </p>
        <p style={styles.sub}>Do you want to stay logged in?</p>
        <div style={styles.buttons}>
          <button style={styles.stayBtn} onClick={onStayLoggedIn}>
            ✅ Yes, Stay Logged In
          </button>
          <button style={styles.logoutBtn} onClick={handleLogout}>
            🚪 Logout Now
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 9999,
  },
  modal: {
    background: '#fff', borderRadius: 12,
    padding: '2.5rem 2rem', maxWidth: 420,
    width: '90%', textAlign: 'center',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  icon:      { fontSize: 48, marginBottom: 16 },
  title:     { margin: '0 0 12px', color: '#1a1a2e', fontSize: 22 },
  message:   { color: '#555', marginBottom: 8, lineHeight: 1.6 },
  countdown: { color: '#e74c3c', fontSize: 22, fontWeight: 700 },
  sub:       { color: '#888', fontSize: 14, marginBottom: 24 },
  buttons:   { display: 'flex', gap: 12, justifyContent: 'center' },
  stayBtn: {
    background: '#4f46e5', color: '#fff', border: 'none',
    padding: '10px 20px', borderRadius: 8,
    cursor: 'pointer', fontWeight: 600, fontSize: 15,
  },
  logoutBtn: {
    background: '#f1f5f9', color: '#555',
    border: '1px solid #e2e8f0',
    padding: '10px 20px', borderRadius: 8,
    cursor: 'pointer', fontWeight: 600, fontSize: 15,
  },
};