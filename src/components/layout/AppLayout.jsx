import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser, selectUser } from '../../context/authSlice';
import { useIdleTimer } from '../../hooks/useIdleTimer';
import SessionTimeoutModal from '../common/SessionTimeoutModal';
import { toast } from 'react-toastify';

export default function AppLayout() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const user      = useSelector(selectUser);
  const { showWarning, countdown, stayLoggedIn } = useIdleTimer();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    toast.info('You have been logged out.');
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/tasks',     label: 'My Tasks',  icon: '📋' },
  ];

  return (
    <div style={styles.shell}>
      {/* ── Sidebar ── */}
      <aside style={styles.sidebar}>
        <div style={styles.logoArea}>
          <span style={styles.logoIcon}>📋</span>
          <span style={styles.logoText}>TaskFlow</span>
        </div>

        <nav style={styles.nav}>
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              style={({ isActive }) => ({
                ...styles.navLink,
                ...(isActive ? styles.navLinkActive : {}),
              })}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div style={styles.userArea}>
          <div style={styles.avatar}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div style={styles.userInfo}>
            <div style={styles.userName}>{user?.name}</div>
            <div style={styles.userRole}>{user?.role}</div>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn} title="Logout">
            ⏻
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main style={styles.main}>
        <Outlet />
      </main>

      {/* ── Session Warning Modal ── */}
      {showWarning && (
        <SessionTimeoutModal
          countdown={countdown}
          onStayLoggedIn={stayLoggedIn}
        />
      )}
    </div>
  );
}

const styles = {
  shell: {
    display: 'flex', minHeight: '100vh', background: '#f8fafc',
  },
  sidebar: {
    width: 240, background: '#1a1a2e',
    display: 'flex', flexDirection: 'column',
    position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100,
  },
  logoArea: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  logoIcon: { fontSize: 24 },
  logoText: { color: '#fff', fontWeight: 700, fontSize: 20 },
  nav: {
    flex: 1, padding: '1rem 0.75rem',
    display: 'flex', flexDirection: 'column', gap: 4,
  },
  navLink: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 14px', borderRadius: 8,
    color: 'rgba(255,255,255,0.65)',
    textDecoration: 'none', fontSize: 15, fontWeight: 500,
  },
  navLinkActive: {
    background: 'rgba(79,70,229,0.8)', color: '#fff',
  },
  userArea: {
    padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)',
    display: 'flex', alignItems: 'center', gap: 10,
  },
  avatar: {
    width: 36, height: 36, borderRadius: '50%',
    background: '#4f46e5', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, flexShrink: 0,
  },
  userInfo: { flex: 1, overflow: 'hidden' },
  userName: {
    color: '#fff', fontWeight: 600, fontSize: 14,
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  },
  userRole:  { color: 'rgba(255,255,255,0.45)', fontSize: 11 },
  logoutBtn: {
    background: 'none', border: 'none',
    color: 'rgba(255,255,255,0.5)',
    cursor: 'pointer', fontSize: 20, padding: 4, flexShrink: 0,
  },
  main: { flex: 1, marginLeft: 240, minHeight: '100vh' },
};