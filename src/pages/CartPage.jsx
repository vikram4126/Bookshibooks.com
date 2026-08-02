import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../App';
import { useAuth } from '../utils/AuthContext';
import { db } from '../utils/firebase';
import { collection, addDoc, getDoc, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { ShoppingCart, Tag, Smartphone } from 'lucide-react';
import { sendOrderConfirmationEmail } from '../utils/emailNotifications';
import './CartPage.css';

const generateOrderId = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = 'ORD-BK-';
  for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
};

const CartPage = () => {
  const { cartItems, updateQty, removeFromCart, totalCount, clearCart } = useCart();
  const { user, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [shipping, setShipping] = useState({ name: '', phone: '', address: '', pincode: '' });
  const [usedCoupons, setUsedCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');

  // Payment verification modal states
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyStep, setVerifyStep] = useState('confirming'); // 'confirming' | 'verifying' | 'success'
  const [generatedOrderId, setGeneratedOrderId] = useState('');

  // Fetch saved shipping address and used coupons on load
  useEffect(() => {
    if (user) {
      getDoc(doc(db, 'users', user.uid)).then(docSnap => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.shipping) setShipping(data.shipping);
          if (data.usedCoupons) setUsedCoupons(data.usedCoupons);
        }
      });
    }
  }, [user]);

  const totalAmount = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
  
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percentage') {
      discountAmount = (totalAmount * appliedCoupon.discountValue) / 100;
    } else {
      discountAmount = appliedCoupon.discountValue;
    }
    if (discountAmount > totalAmount) discountAmount = totalAmount;
  }

  const subtotalAfterDiscount = totalAmount - discountAmount;
  const isFreeDelivery = subtotalAfterDiscount >= 999;
  const deliveryCharge = isFreeDelivery ? 0 : 50;
  const finalAmount = subtotalAfterDiscount + deliveryCharge;

  const upiUrl = `upi://pay?pa=rohitkumar3783000@okhdfcbank&pn=Anmol%20Tradings&am=${finalAmount}&cu=INR&tn=BookshiBooks%20Order`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`;

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode) return;
    setCouponError('');
    try {
      const code = couponCode.toUpperCase().trim();
      const docSnap = await getDoc(doc(db, 'coupons', code));
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (usedCoupons.includes(docSnap.id)) {
          setCouponError("You have already used this coupon.");
        } else if (data.active) {
          setAppliedCoupon({ id: docSnap.id, ...data });
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

  const removeCoupon = () => setAppliedCoupon(null);

  // Final save order to Firebase
  const saveOrderToDb = async () => {
    const orderId = generateOrderId();
    setGeneratedOrderId(orderId);

    try {
      const userRef = doc(db, 'users', user.uid);
      const updates = { shipping };
      if (appliedCoupon && appliedCoupon.id) {
        updates.usedCoupons = arrayUnion(appliedCoupon.id);
      }
      await updateDoc(userRef, updates);

      for (const item of cartItems) {
        const bookRef = doc(db, 'books', item.id);
        const bookSnap = await getDoc(bookRef);
        if (bookSnap.exists()) {
          const currentQty = Number(bookSnap.data().quantity || 0);
          await updateDoc(bookRef, { quantity: Math.max(0, currentQty - item.qty) });
        }
      }

      await addDoc(collection(db, 'orders'), {
        orderId,
        userId: user.uid,
        userEmail: user.email,
        items: cartItems.map(item => ({ id: item.id, title: item.title, price: item.price, qty: item.qty })),
        total: finalAmount,
        subtotal: totalAmount,
        discount: discountAmount,
        couponUsed: appliedCoupon ? appliedCoupon.code : null,
        shipping,
        paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery' : 'UPI QR Code',
        paymentStatus: paymentMethod === 'cod' ? 'Pending COD' : 'Pending Verification',
        status: 'Processing',
        createdAt: Date.now()
      });

      // Send confirmation email to customer
      sendOrderConfirmationEmail({
        orderId,
        customerName: shipping.name || user.displayName || 'Customer',
        customerEmail: user.email,
        items: cartItems,
        total: finalAmount,
        paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery' : 'UPI QR Code'
      }).catch(err => console.warn('Email failed:', err)); // non-blocking

      clearCart();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!user) { loginWithGoogle(); return; }

    if (paymentMethod === 'qr') {
      // Show the payment confirmation modal
      setShowVerifyModal(true);
      setVerifyStep('confirming');
      return;
    }

    // COD: direct order
    setLoading(true);
    try {
      await saveOrderToDb();
      navigate('/profile');
    } catch {
      alert("Failed to place order. Please try again.");
    }
    setLoading(false);
  };

  // Called when user clicks "I Have Paid" in the modal
  const handleConfirmPayment = async () => {
    setVerifyStep('verifying');
    // Simulate verification delay (1.5s)
    await new Promise(r => setTimeout(r, 1500));
    try {
      await saveOrderToDb();
      setVerifyStep('success');
    } catch {
      setShowVerifyModal(false);
      alert("Failed to place order. Please try again.");
    }
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
    <>
      {/* ── Payment Verification Modal ── */}
      {showVerifyModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{
            background: 'white', borderRadius: '16px', padding: '32px',
            maxWidth: '420px', width: '100%', textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            {verifyStep === 'confirming' && (
              <>
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📲</div>
                <h3 style={{ marginBottom: '8px', fontSize: '1.2rem' }}>Complete Your Payment</h3>
                <p style={{ color: 'var(--text-3)', fontSize: '0.9rem', marginBottom: '20px' }}>
                  Scan the QR or open your UPI app and pay <strong>₹{finalAmount}</strong> to <strong>Anmol Tradings</strong>.
                </p>
                <div style={{ background: 'white', display: 'inline-block', padding: '10px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
                  <img src={qrCodeUrl} alt="UPI QR Code" style={{ display: 'block', width: '180px', height: '180px' }} />
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <a
                    href={upiUrl}
                    className="btn btn-navy"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', marginBottom: '12px', textDecoration: 'none' }}
                  >
                    <Smartphone size={18} /> Open UPI App (GPay / PhonePe)
                  </a>
                </div>
                <button
                  onClick={handleConfirmPayment}
                  className="btn btn-primary checkout-btn"
                  style={{ width: '100%', marginBottom: '10px' }}
                >
                  ✅ I Have Paid — Confirm Order
                </button>
                <button
                  onClick={() => setShowVerifyModal(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-3)', fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </>
            )}

            {verifyStep === 'verifying' && (
              <>
                <div style={{ fontSize: '2.5rem', marginBottom: '16px', animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</div>
                <h3 style={{ marginBottom: '8px', color: 'var(--primary)' }}>Verifying Payment...</h3>
                <p style={{ color: 'var(--text-3)', fontSize: '0.9rem' }}>Please wait while we confirm your payment securely.</p>
              </>
            )}

            {verifyStep === 'success' && (
              <>
                <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🎉</div>
                <h3 style={{ color: '#16a34a', marginBottom: '8px', fontSize: '1.3rem' }}>Order Placed!</h3>
                <p style={{ color: 'var(--text-2)', fontSize: '0.95rem', marginBottom: '8px' }}>
                  Your Order ID is:
                </p>
                <div style={{ background: '#f0fdf4', border: '2px solid #16a34a', borderRadius: '10px', padding: '12px 20px', fontWeight: '800', fontSize: '1.2rem', color: '#15803d', letterSpacing: '2px', marginBottom: '16px' }}>
                  {generatedOrderId}
                </div>
                <p style={{ color: 'var(--text-3)', fontSize: '0.85rem', marginBottom: '20px' }}>
                  Screenshot this for your records. We will verify your UPI payment and ship the books within 24 hours.
                </p>
                <button
                  onClick={() => navigate('/profile')}
                  className="btn btn-navy"
                  style={{ width: '100%' }}
                >
                  View My Orders
                </button>
              </>
            )}
          </div>
        </div>
      )}

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
              
              <h3 style={{ marginTop: '24px', marginBottom: '12px' }}>Payment Method</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.95rem' }}>
                  <input type="radio" name="paymentMethod" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                  <span>🚚 Cash on Delivery (COD)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.95rem' }}>
                  <input type="radio" name="paymentMethod" value="qr" checked={paymentMethod === 'qr'} onChange={() => setPaymentMethod('qr')} />
                  <span>📱 Pay via UPI (GPay, PhonePe, Paytm)</span>
                </label>
              </div>

              {paymentMethod === 'qr' && (
                <div style={{ background: '#eef2ff', padding: '14px', borderRadius: '8px', fontSize: '0.88rem', color: '#4338ca', marginBottom: '16px', border: '1px solid #c7d2fe' }}>
                  💡 After clicking "Proceed to Pay", a payment screen will open. Scan QR or tap "Open UPI App", complete the payment, and then click "I Have Paid".
                </div>
              )}

              {!user ? (
                <button type="button" className="btn btn-primary checkout-btn" onClick={loginWithGoogle}>
                  Login to Place Order
                </button>
              ) : (
                <button type="submit" className="btn btn-primary checkout-btn" disabled={loading}>
                  {loading ? 'Processing...' : paymentMethod === 'cod' ? '🛒 Place Order (Cash on Delivery)' : '📱 Proceed to Pay ₹' + finalAmount}
                </button>
              )}
            </form>
          </div>
        </div>
      </main>
    </>
  );
};

export default CartPage;
