import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import './AdminLogin.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [waitingForAuth, setWaitingForAuth] = useState(false);
  const { loginAdmin, isAdmin, isWorker } = useAuth();
  const navigate = useNavigate();

  // Once isAdmin/isWorker becomes true after login, redirect
  useEffect(() => {
    if (waitingForAuth) {
      if (isAdmin) navigate('/manage');
      else if (isWorker) navigate('/add-book');
    }
  }, [isAdmin, isWorker, waitingForAuth, navigate]);

  // If already logged in, redirect right away
  useEffect(() => {
    if (isAdmin) navigate('/manage');
    else if (isWorker) navigate('/add-book');
  }, [isAdmin, isWorker, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await loginAdmin(email, password);
    if (result.success) {
      // Start waiting — useEffect above will redirect once Firestore confirms admin role
      setWaitingForAuth(true);
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  if (waitingForAuth) {
    return (
      <main className="admin-login-page">
        <div className="admin-login-box" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '16px' }}>🔄</div>
          <h2>Verifying Admin Access...</h2>
          <p style={{ color: 'var(--text-3)', marginTop: '8px' }}>Please wait a moment</p>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-login-page">
      <div className="admin-login-box">
        <div className="admin-login-icon">🔐</div>
        <h1>Staff Login</h1>
        <p>BookshiBooks Management & Worker Panel</p>
        <form onSubmit={handleLogin}>
          <div className="al-field">
            <label htmlFor="admin-email">Email</label>
            <input
              id="admin-email"
              type="email"
              placeholder="admin@bookshibooks.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              required
              autoFocus
            />
          </div>
          <div className="al-field">
            <label htmlFor="admin-pass">Password</label>
            <input
              id="admin-pass"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              required
            />
          </div>
          {error && <p className="al-error">⚠️ {error}</p>}
          <button type="submit" className="al-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login to Admin Panel →'}
          </button>
        </form>
        <Link to="/" className="al-back">← Back to Store</Link>
      </div>
    </main>
  );
};

export default AdminLogin;

