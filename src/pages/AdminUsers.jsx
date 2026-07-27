import { useState, useEffect } from 'react';
import { db } from '../utils/firebase';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { useAuth } from '../utils/AuthContext';
import { Shield, User, ShieldOff } from 'lucide-react';
import './AdminUsers.css';

const AdminUsers = () => {
  const { isAdmin, user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) fetchUsers();
  }, [isAdmin]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'users'));
      const usersList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Sort in memory so we don't exclude users without a createdAt field
      usersList.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setUsers(usersList);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const toggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    const label = newRole === 'admin' ? 'Admin' : 'Normal User';
    if (!window.confirm(`Are you sure? This will make them ${label}.`)) return;
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      console.error(err);
      alert('Failed to update role.');
    }
  };

  if (!isAdmin) return <div className="container mt-5"><h3>Access Denied</h3></div>;

  return (
    <main className="admin-users container fade-up">
      <h1 className="page-title">User Management</h1>
      <p style={{ color: 'var(--text-3)', marginBottom: '24px' }}>
        Here you can see all registered users and assign/remove admin privileges.
      </p>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center' }}>Loading users...</div>
      ) : (
        <div className="users-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Joined</th>
                <th>Role</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className={u.role === 'admin' ? 'admin-row' : ''}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {u.role === 'admin'
                        ? <Shield size={18} color="#2563eb" />
                        : <User size={18} color="var(--text-3)" />
                      }
                      <div>
                        <div style={{ fontWeight: '600' }}>{u.displayName || 'Unknown'}</div>
                        {u.id === currentUser?.uid && (
                          <div style={{ fontSize: '0.75rem', color: '#2563eb' }}>← You</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.88rem', color: 'var(--text-2)' }}>{u.email}</td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-3)' }}>
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td>
                    <span className={`role-badge ${u.role === 'admin' ? 'admin' : 'user'}`}>
                      {u.role === 'admin' ? '🛡️ Admin' : '👤 User'}
                    </span>
                  </td>
                  <td>
                    {u.id === currentUser?.uid ? (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>Cannot change own role</span>
                    ) : (
                      <button
                        className={`role-toggle-btn ${u.role === 'admin' ? 'demote' : 'promote'}`}
                        onClick={() => toggleRole(u.id, u.role)}
                      >
                        {u.role === 'admin'
                          ? <><ShieldOff size={14} /> Remove Admin</>
                          : <><Shield size={14} /> Make Admin</>
                        }
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
};

export default AdminUsers;
