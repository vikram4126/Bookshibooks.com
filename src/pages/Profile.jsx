import { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import { db } from '../utils/firebase';
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { Package, Heart, LogOut, Truck, RotateCcw } from 'lucide-react';
import { sendReturnRequestEmail } from '../utils/emailNotifications';
import './Profile.css';

const statusColors = {
  Processing:  { bg: '#eff6ff', color: '#1d4ed8' },
  Shipped:     { bg: '#fefce8', color: '#a16207' },
  Delivered:   { bg: '#f0fdf4', color: '#16a34a' },
  Cancelled:   { bg: '#fef2f2', color: '#dc2626' },
};

const Profile = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [returnModal, setReturnModal] = useState(null); // { orderId, displayId, customerName }
  const [returnReason, setReturnReason] = useState('');
  const [returnLoading, setReturnLoading] = useState(false);

  useEffect(() => {
    if (user) fetchUserData();
  }, [user]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'orders'), where('userId', '==', user.uid));
      const orderSnap = await getDocs(q);
      const userOrders = orderSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setOrders(userOrders.sort((a, b) => b.createdAt - a.createdAt));

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const likedIds = userDoc.data().wishlist || [];
        const booksSnap = await getDocs(collection(db, 'books'));
        const allBooks = booksSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setWishlist(allBooks.filter(b => likedIds.includes(b.id)));
      }
    } catch (err) {
      console.error('Failed to fetch user data', err);
    }
    setLoading(false);
  };

  const handleReturnSubmit = async () => {
    if (!returnReason.trim()) return alert('Please enter a reason for return.');
    setReturnLoading(true);
    try {
      await updateDoc(doc(db, 'orders', returnModal.orderId), {
        returnStatus: 'Pending',
        returnReason: returnReason.trim(),
      });
      // Notify admin via email
      sendReturnRequestEmail({
        orderId: returnModal.displayId,
        customerName: user.displayName || returnModal.customerName || 'Customer',
        customerEmail: user.email,
        reason: returnReason.trim(),
      }).catch(() => {});

      setOrders(prev => prev.map(o =>
        o.id === returnModal.orderId ? { ...o, returnStatus: 'Pending', returnReason: returnReason.trim() } : o
      ));
      setReturnModal(null);
      setReturnReason('');
      alert('Return request submitted! We will contact you within 24 hours.');
    } catch {
      alert('Failed to submit return request. Please try again.');
    }
    setReturnLoading(false);
  };

  if (!user) {
    return (
      <main className="profile-page container fade-up">
        <div className="login-prompt">
          <h2>Please Login</h2>
          <p>You need to login to view your profile.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="profile-page container fade-up">

      {/* Return Request Modal */}
      {returnModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '28px', maxWidth: '420px', width: '100%' }}>
            <h3 style={{ marginBottom: '8px' }}>↩️ Request Return</h3>
            <p style={{ color: 'var(--text-3)', fontSize: '0.9rem', marginBottom: '16px' }}>
              Order: <strong>{returnModal.displayId}</strong> — Return is accepted within 7 days if the item is damaged or wrong.
            </p>
            <label style={{ display: 'block', fontWeight: '600', fontSize: '0.9rem', marginBottom: '6px' }}>Reason for Return *</label>
            <textarea
              rows={3}
              placeholder="e.g. Damaged cover, Wrong book received..."
              value={returnReason}
              onChange={e => setReturnReason(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.9rem', resize: 'none' }}
            />
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button
                onClick={handleReturnSubmit}
                disabled={returnLoading}
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                {returnLoading ? 'Submitting...' : 'Submit Return Request'}
              </button>
              <button
                onClick={() => { setReturnModal(null); setReturnReason(''); }}
                className="btn btn-outline"
              >Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="profile-header">
        <div className="profile-info">
          <h2>Hello, {user.displayName || 'User'}!</h2>
          <p>{user.email}</p>
        </div>
        <button className="btn btn-outline" onClick={logout}>
          <LogOut size={16} style={{marginRight: 6}} /> Sign Out
        </button>
      </div>

      <div className="profile-tabs">
        <button className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
          <Package size={18} style={{marginRight: 6}} /> My Orders
        </button>
        <button className={`tab-btn ${activeTab === 'wishlist' ? 'active' : ''}`} onClick={() => setActiveTab('wishlist')}>
          <Heart size={18} style={{marginRight: 6}} /> My Wishlist
        </button>
      </div>

      <div className="profile-content">
        {loading ? (
          <div className="loading">Loading your details...</div>
        ) : (
          <>
            {activeTab === 'orders' && (
              <div className="orders-list">
                {orders.length === 0 ? (
                  <div className="empty-state">
                    <p>You haven't placed any orders yet.</p>
                    <Link to="/" className="btn btn-primary mt-3">Browse Books</Link>
                  </div>
                ) : (
                  orders.map(order => {
                    const statusStyle = statusColors[order.status] || statusColors.Processing;
                    const displayOrderId = order.orderId || `#${order.id.slice(-6).toUpperCase()}`;
                    return (
                      <div key={order.id} className="order-card">
                        <div className="order-header">
                          <span className="order-id">{displayOrderId}</span>
                          <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>

                        {/* Order Status Track */}
                        <div style={{ display: 'flex', gap: '6px', margin: '10px 0', alignItems: 'center' }}>
                          {['Processing', 'Shipped', 'Delivered'].map((step, i) => {
                            const stepMap = { Processing: 0, Shipped: 1, Delivered: 2 };
                            const currentStep = stepMap[order.status] ?? 0;
                            const done = i <= currentStep;
                            return (
                              <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <div style={{
                                  width: '24px', height: '24px', borderRadius: '50%',
                                  background: done ? '#2563eb' : '#e2e8f0',
                                  color: done ? 'white' : '#94a3b8',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: '0.65rem', fontWeight: '700'
                                }}>{i + 1}</div>
                                <span style={{ fontSize: '0.7rem', color: done ? '#1d4ed8' : '#94a3b8', fontWeight: done ? '600' : '400' }}>{step}</span>
                                {i < 2 && <div style={{ width: '20px', height: '2px', background: i < currentStep ? '#2563eb' : '#e2e8f0', borderRadius: '2px' }} />}
                              </div>
                            );
                          })}
                          {order.status === 'Cancelled' && (
                            <span style={{ background: '#fef2f2', color: '#dc2626', padding: '2px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700' }}>❌ Cancelled</span>
                          )}
                        </div>

                        <div className="order-items">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="order-item">
                              <span className="item-title">{item.title}</span>
                              <span className="item-qty">×{item.qty}</span>
                              <span className="item-price">₹{item.price * item.qty}</span>
                            </div>
                          ))}
                        </div>

                        {/* Tracking Info */}
                        {order.trackingNumber && (
                          <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '6px', padding: '8px 12px', fontSize: '0.85rem', margin: '8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Truck size={16} style={{ color: '#2563eb' }} />
                            <span><strong>{order.courierName || 'Courier'}</strong> · Tracking: <strong>{order.trackingNumber}</strong></span>
                          </div>
                        )}

                        {/* Return Status */}
                        {order.returnStatus && (
                          <div style={{
                            background: order.returnStatus === 'Approved' ? '#f0fdf4' : order.returnStatus === 'Rejected' ? '#fef2f2' : '#fff7ed',
                            border: `1px solid ${order.returnStatus === 'Approved' ? '#86efac' : order.returnStatus === 'Rejected' ? '#fca5a5' : '#fed7aa'}`,
                            borderRadius: '6px', padding: '8px 12px', fontSize: '0.85rem', margin: '8px 0'
                          }}>
                            <RotateCcw size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                            Return {order.returnStatus}
                            {order.returnStatus === 'Approved' && ' — Please courier the book back to us. Refund will be processed within 3-5 days.'}
                            {order.returnStatus === 'Rejected' && ' — Unfortunately we cannot process this return.'}
                            {order.returnStatus === 'Pending' && ' — Under review. We will contact you soon.'}
                          </div>
                        )}

                        <div className="order-footer">
                          <span style={{ background: statusStyle.bg, color: statusStyle.color, padding: '3px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: '700' }}>
                            {order.status || 'Processing'}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span className="order-total">Total: <strong>₹{order.total}</strong></span>
                            {/* Return button — only for Delivered orders, within 7 days, no existing return */}
                            {order.status === 'Delivered' && !order.returnStatus &&
                              ((Date.now() - order.createdAt) < 7 * 24 * 60 * 60 * 1000) && (
                              <button
                                onClick={() => setReturnModal({ orderId: order.id, displayId: displayOrderId, customerName: order.shipping?.name })}
                                style={{ background: 'none', border: '1px solid #e53935', color: '#e53935', borderRadius: '6px', padding: '3px 10px', fontSize: '0.78rem', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}
                              >
                                <RotateCcw size={12} /> Return
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div className="wishlist-grid">
                {wishlist.length === 0 ? (
                  <div className="empty-state">
                    <p>Your wishlist is empty.</p>
                    <Link to="/" className="btn btn-primary mt-3">Explore Books</Link>
                  </div>
                ) : (
                  wishlist.map(book => (
                    <Link to={`/book/${book.id}`} key={book.id} className="wishlist-item">
                      <img src={book.image} alt={book.title} />
                      <div className="wish-info">
                        <h4>{book.title}</h4>
                        <p className="price">₹{book.price}</p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default Profile;
