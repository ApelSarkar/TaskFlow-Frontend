import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, selectAuthLoading, selectAuthError } from '../context/authSlice';
import { toast } from 'react-toastify';

export default function RegisterPage() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const isLoading = useSelector(selectAuthLoading);
  const error     = useSelector(selectAuthError);

  const [form, setForm] = useState({
    name: '', email: '', mobile: '',
    password: '', confirmPassword: '', role: 'USER',
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }
    const { confirmPassword, ...data } = form;
    const result = await dispatch(registerUser(data));
    if (!result.error) {
      toast.success('Account created successfully!');
      navigate('/dashboard');
    }
  };

  const fields = [
    { label: 'Full Name',        name: 'name',            type: 'text',     placeholder: 'John Doe' },
    { label: 'Email',            name: 'email',           type: 'email',    placeholder: 'john@example.com' },
    { label: 'Mobile Number',    name: 'mobile',          type: 'tel',      placeholder: '01712345678' },
    { label: 'Password',         name: 'password',        type: 'password', placeholder: 'Min 6 characters' },
    { label: 'Confirm Password', name: 'confirmPassword', type: 'password', placeholder: 'Repeat password' },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}>📋</div>
          <h1 style={styles.title}>Create Account</h1>
          <p style={styles.subtitle}>Join TaskFlow today</p>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {fields.map(({ label, name, type, placeholder }) => (
            <div key={name} style={styles.field}>
              <label style={styles.label}>{label}</label>
              <input
                type={type} name={name} value={form[name]}
                onChange={handleChange} required
                placeholder={placeholder} style={styles.input}
              />
            </div>
          ))}

          <div style={styles.field}>
            <label style={styles.label}>Role</label>
            <select
              name="role" value={form.role}
              onChange={handleChange} style={styles.input}
            >
              <option value="USER">User</option>
              <option value="MANAGER">Manager</option>
            </select>
          </div>

          <button type="submit" style={styles.btn} disabled={isLoading}>
            {isLoading ? '⏳ Creating Account...' : '✓ Create Account'}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>Sign in</Link>
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
    padding: '2rem 1rem',
  },
  card: {
    background: '#fff', borderRadius: 16,
    padding: '2.5rem', width: '100%', maxWidth: 440,
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  },
  header:   { textAlign: 'center', marginBottom: 28 },
  logo:     { fontSize: 40, marginBottom: 8 },
  title:    { margin: 0, color: '#1a1a2e', fontSize: 26, fontWeight: 700 },
  subtitle: { margin: '4px 0 0', color: '#888' },
  errorBox: {
    background: '#fee2e2', border: '1px solid #fecaca',
    color: '#dc2626', borderRadius: 8,
    padding: '10px 14px', marginBottom: 20, fontSize: 14,
  },
  form:  { display: 'flex', flexDirection: 'column', gap: 14 },
  field: { display: 'flex', flexDirection: 'column', gap: 5 },
  label: { fontWeight: 600, color: '#374151', fontSize: 13 },
  input: {
    padding: '10px 14px', border: '1px solid #d1d5db',
    borderRadius: 8, fontSize: 14, outline: 'none',
  },
  btn: {
    background: '#4f46e5', color: '#fff', border: 'none',
    padding: '12px', borderRadius: 8,
    fontSize: 16, fontWeight: 600, cursor: 'pointer', marginTop: 4,
  },
  footer: { textAlign: 'center', marginTop: 20, color: '#6b7280', fontSize: 14 },
  link:   { color: '#4f46e5', fontWeight: 600, textDecoration: 'none' },
};