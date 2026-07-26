import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../App';
import { useAuth } from '../utils/AuthContext';
import { db } from '../utils/firebase';
import { collection, addDoc } from 'firebase/firestore';
import './CartPage.css';

const CartPage = () => {
  const { cartItems, updateQty, removeFromCart, totalCount, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [shipping, setShipping] = useState({ name: '', phone: '', address: '', pincode: '' });
  const [loading, setLoading] = useState(false);

  const totalAmount = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const isFreeDelivery = totalAmount >= 999;
  const deliveryCharge = isFreeDelivery ? 0 : 50;
  const finalAmount = totalAmount + deliveryCharge;

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please login first to place an order.");
      return;
    }
    setLoading(true);
    try {
      const order = {
        userId: user.uid,
        userEmail: user.email,
        items: cartItems.map(item => ({ id: item.id, title: item.title, price: item.price, qty: item.qty })),
        total: finalAmount,
        shipping,
        status: 'Processing',
        createdAt: Date.now()
      };
      await addDoc(collection(db, 'orders'), order);
      clearCart();
      alert("Order placed successfully!");
      navigate('/profile');
    } catch (err) {
      console.error(err);
      alert("Failed to place order.");
    }
    setLoading(false);
  };

  if (cartItems.length === 0) {
    return (
      <main className="cart-page container fade-up" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '3rem', margin: '0 0 16px 0' }}>🛒</div>
        <h1 className="cart-title" style={{ marginBottom: '8px' }}>Your cart is empty</h1>
        <p style={{ color: 'var(--text-3)', marginBottom: '24px' }}>Looks like you haven't added any books yet.</p>
        <Link to="/" className="btn btn-navy">Browse Books</Link>
      </main>
    );
  }

  return (
    <main className="cart-page container fade-up">
      <h1 className="cart-title">Your Cart ({totalCount} items)</h1>
      <div className="cart-layout">
        <div className="cart-items">
          {cartItems.map(item => (
            <div key={item.id} className="cart-item">
              <img src={item.image || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=200&auto=format&fit=crop'} alt={item.title} className="cart-item-img" />
              <div className="cart-item-details">
                <Link to={`/book/${item.id}`} className="cart-item-title">{item.title}</Link>
                <div className="cart-item-price">₹{item.price}</div>
                <div className="cart-item-actions">
                  <div className="qty-control">
                    <button onClick={() => updateQty(item.id, item.qty - 1)}>−</button>
                    <span>{item.qty}</span>
                    <button onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                  </div>
                  <button className="remove-btn" onClick={() => removeFromCart(item.id)}>Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{totalAmount}</span>
          </div>
          <div className="summary-row">
            <span>Delivery</span>
            <span>{isFreeDelivery ? <span style={{color: 'var(--success)'}}>Free</span> : `₹${deliveryCharge}`}</span>
          </div>
          <div className="summary-row summary-total">
            <span>Total</span>
            <span>₹{finalAmount}</span>
          </div>

          <form className="checkout-form" onSubmit={handleCheckout}>
            <h3>Shipping Details</h3>
            {!user && <p style={{color: '#ef4444', fontSize: '0.9rem', marginBottom: '12px'}}>You must be logged in to checkout.</p>}
            <input type="text" placeholder="Full Name" required value={shipping.name} onChange={e => setShipping({...shipping, name: e.target.value})} />
            <input type="tel" placeholder="Phone Number" required value={shipping.phone} onChange={e => setShipping({...shipping, phone: e.target.value})} />
            <textarea placeholder="Full Delivery Address" required rows={3} value={shipping.address} onChange={e => setShipping({...shipping, address: e.target.value})} />
            <input type="text" placeholder="Pincode" required value={shipping.pincode} onChange={e => setShipping({...shipping, pincode: e.target.value})} />
            <button type="submit" className="btn btn-primary checkout-btn" disabled={loading || !user}>
              {loading ? 'Processing...' : 'Place Order (Cash on Delivery)'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
};

export default CartPage;
