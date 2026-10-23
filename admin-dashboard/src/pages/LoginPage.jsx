import React, { useState } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function LoginPage() {
  const { login } = useAdminAuth();
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoArea}>
          <div style={styles.logo}>🧭</div>
          <h1 style={styles.appName}>LakbayLocal</h1>
          <p style={styles.tagline}>Admin Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <h2 style={styles.formTitle}>Sign In</h2>
          {error && <div style={styles.error}>{error}</div>}
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              placeholder="admin@lakbaylocal.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button style={{...styles.btn, opacity: loading ? 0.7 : 1}} type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page:      { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' },
  card:      { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '48px', width: '100%', maxWidth: '400px' },
  logoArea:  { textAlign: 'center', marginBottom: '32px' },
  logo:      { fontSize: '48px', marginBottom: '8px' },
  appName:   { fontSize: '24px', fontWeight: '800', color: 'var(--text)' },
  tagline:   { color: 'var(--muted)', fontSize: '14px' },
  form:      { display: 'flex', flexDirection: 'column', gap: '16px' },
  formTitle: { fontSize: '18px', fontWeight: '700', color: 'var(--text)', marginBottom: '4px' },
  error:     { background: 'rgba(239,71,111,0.15)', border: '1px solid var(--error)', borderRadius: '8px', padding: '10px 14px', color: 'var(--error)', fontSize: '14px' },
  field:     { display: 'flex', flexDirection: 'column', gap: '6px' },
  label:     { color: 'var(--muted)', fontSize: '13px', fontWeight: '600' },
  input:     { background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px 14px', color: 'var(--text)', fontSize: '15px', outline: 'none' },
  btn:       { background: 'var(--secondary)', color: '#fff', border: 'none', borderRadius: '8px', padding: '14px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', marginTop: '8px' },
};
