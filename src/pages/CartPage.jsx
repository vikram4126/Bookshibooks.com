import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../App';
import { useAuth } from '../utils/AuthContext';
import { db } from '../utils/firebase';
import { collection, addDoc, getDoc, doc } from 'firebase/firestore';
import { ShoppingCart, Tag } from 'lucide-react';
import './CartPage.css';

const CartPage = () => {
  const { cartItems, updateQty, removeFromCart, totalCount, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [shipping, setShipping] = useState({ name: '', phone: '', address: '', pincode: '' });
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  const totalAmount = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
  
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percentage') {
      discountAmount = (totalAmount * appliedCoupon.discountValue) / 100;
    } else {
      discountAmount = appliedCoupon.discountValue;
    }
    // ensure discount doesn't exceed total
    if (discountAmount > totalAmount) discountAmount = totalAmount;
  }

  const subtotalAfterDiscount = totalAmount - discountAmount;
  const isFreeDelivery = subtotalAfterDiscount >= 999;
  const deliveryCharge = isFreeDelivery ? 0 : 50;
  const finalAmount = subtotalAfterDiscount + deliveryCharge;

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode) return;
    setCouponError('');
    try {
      const code = couponCode.toUpperCase().trim();
      const docSnap = await getDoc(doc(db, 'coupons', code));
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.active) {
          setAppliedCoupon(data);
          setCouponCode('');
        } else {
          setCouponError("This coupon is no longer active.");
        }
      } else {
        setCouponError("Invalid coupon code.");
      }
    } catch (err) {
      console.error(err);
      setCouponError("Failed to apply coupon.");
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

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
        subtotal: totalAmount,
        discount: discountAmount,
        couponUsed: appliedCoupon ? appliedCoupon.code : null,
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
        <div style={{ color: 'var(--text-3)', marginBottom: '16px' }}>
          <ShoppingCart size={48} />
        </div>
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
          
          {appliedCoupon && (
            <div className="summary-row" style={{ color: 'var(--success)' }}>
              <span>Discount ({appliedCoupon.code}) <button onClick={removeCoupon} style={{background: 'none', border: 'none', color: '#e53935', cursor: 'pointer', fontSize: '0.8rem', marginLeft: '8px'}}>[Remove]</button></span>
              <span>-₹{discountAmount}</span>
            </div>
          )}

          <div className="summary-row">
            <span>Delivery</span>
            <span>{isFreeDelivery ? <span style={{color: 'var(--success)'}}>Free</span> : `₹${deliveryCharge}`}</span>
          </div>
          <div className="summary-row summary-total">
            <span>Total</span>
            <span>₹{finalAmount}</span>
          </div>

          {!appliedCoupon && (
            <div className="coupon-section" style={{marginTop: '20px', padding: '16px', background: '#f8fafc', borderRadius: '8px'}}>
              <h4 style={{marginBottom: '10px', fontSize: '0.95rem', display: 'flex', alignItems: 'center'}}><Tag size={16} style={{marginRight: '6px'}}/> Have a coupon?</h4>
              <div style={{display: 'flex', gap: '8px'}}>
                <input 
                  type="text" 
                  placeholder="Enter code" 
                  value={couponCode} 
                  onChange={(e) => setCouponCode(e.target.value)}
                  style={{flex: 1, padding: '8px', border: '1px solid var(--border)', borderRadius: '4px'}}
                />
                <button className="btn btn-outline" onClick={handleApplyCoupon} style={{padding: '8px 12px'}}>Apply</button>
              </div>
              {couponError && <p style={{color: '#e53935', fontSize: '0.85rem', marginTop: '8px'}}>{couponError}</p>}
            </div>
          )}

          <form className="checkout-form" onSubmit={handleCheckout} style={{marginTop: '24px'}}>
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
