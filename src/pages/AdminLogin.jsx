import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import './AdminLogin.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await loginAdmin(email, password);
    if (result.success) {
      navigate('/manage');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <main className="admin-login-page">
      <div className="admin-login-box">
        <div className="admin-login-icon">🔐</div>
        <h1>Admin Login</h1>
        <p>BookshiBooks Management Panel</p>
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
