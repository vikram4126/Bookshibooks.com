import { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import { db } from '../utils/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      // Fetch Orders
      const q = query(collection(db, 'orders'), where('userId', '==', user.uid));
      const orderSnap = await getDocs(q);
      const userOrders = orderSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setOrders(userOrders.sort((a, b) => b.createdAt - a.createdAt));

      // Fetch Wishlist
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const likedIds = userDoc.data().wishlist || [];
        
        // Fetch book details for each liked ID (naively for now)
        // In a real app, you might want to query `in` or fetch individually
        const booksRef = collection(db, 'books');
        const booksSnap = await getDocs(booksRef); // caching all books is simpler if collection is small
        const allBooks = booksSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        
        const likedBooks = allBooks.filter(b => likedIds.includes(b.id));
        setWishlist(likedBooks);
      }
    } catch (err) {
      console.error('Failed to fetch user data', err);
    }
    setLoading(false);
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
      <div className="profile-header">
        <div className="profile-info">
          <h2>Hello, {user.displayName || 'User'}! 👋</h2>
          <p>{user.email}</p>
        </div>
        <button className="btn btn-outline" onClick={logout}>Sign Out</button>
      </div>

      <div className="profile-tabs">
        <button 
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          📦 My Orders
        </button>
        <button 
          className={`tab-btn ${activeTab === 'wishlist' ? 'active' : ''}`}
          onClick={() => setActiveTab('wishlist')}
        >
          ❤️ My Wishlist
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
                  orders.map(order => (
                    <div key={order.id} className="order-card">
                      <div className="order-header">
                        <span className="order-id">Order #{order.id.slice(-6).toUpperCase()}</span>
                        <span className="order-date">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="order-items">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="order-item">
                            <span className="item-title">{item.title}</span>
                            <span className="item-qty">x{item.qty}</span>
                            <span className="item-price">₹{item.price * item.qty}</span>
                          </div>
                        ))}
                      </div>
                      <div className="order-footer">
                        <span className="order-status">Status: <strong>{order.status || 'Processing'}</strong></span>
                        <span className="order-total">Total: <strong>₹{order.total}</strong></span>
                      </div>
                    </div>
                  ))
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
