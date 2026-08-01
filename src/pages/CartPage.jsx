import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../App';
import { useAuth } from '../utils/AuthContext';
import { db } from '../utils/firebase';
import { collection, addDoc, getDoc, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { ShoppingCart, Tag } from 'lucide-react';
import './CartPage.css';

const CartPage = () => {
  const { cartItems, updateQty, removeFromCart, totalCount, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [shipping, setShipping] = useState({ name: '', phone: '', address: '', pincode: '' });
  const [usedCoupons, setUsedCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [txnId, setTxnId] = useState('');

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
    // ensure discount doesn't exceed total
    if (discountAmount > totalAmount) discountAmount = totalAmount;
  }

  const subtotalAfterDiscount = totalAmount - discountAmount;
  const isFreeDelivery = subtotalAfterDiscount >= 999;
  const deliveryCharge = isFreeDelivery ? 0 : 50;
  const finalAmount = subtotalAfterDiscount + deliveryCharge;

  // Generate UPI payment link (Google Pay / PhonePe format)
  // Format: upi://pay?pa=UPI_ID&pn=PAYEE_NAME&am=AMOUNT&cu=CURRENCY&tn=NOTE
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

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please login first to place an order.");
      return;
    }
    if (paymentMethod === 'qr' && !txnId) {
      alert("Please enter the Transaction ID / Ref No. after making the payment.");
      return;
    }
    setLoading(true);
    try {
      // Save address to user's profile and mark coupon as used
      const userRef = doc(db, 'users', user.uid);
      const updates = { shipping };
      if (appliedCoupon && appliedCoupon.id) {
        updates.usedCoupons = arrayUnion(appliedCoupon.id);
      }
      await updateDoc(userRef, updates);

      // Update stock for each book in the cart
      for (const item of cartItems) {
        const bookRef = doc(db, 'books', item.id);
        const bookSnap = await getDoc(bookRef);
        if (bookSnap.exists()) {
          const currentQty = Number(bookSnap.data().quantity || 0);
          const newQty = Math.max(0, currentQty - item.qty);
          await updateDoc(bookRef, { quantity: newQty });
        }
      }

      const order = {
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
        transactionId: paymentMethod === 'qr' ? txnId : null,
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
            
            <h3 style={{ marginTop: '24px', marginBottom: '12px' }}>Payment Method</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.95rem' }}>
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="cod" 
                  checked={paymentMethod === 'cod'} 
                  onChange={() => setPaymentMethod('cod')} 
                />
                <span>Cash on Delivery (COD)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.95rem' }}>
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="qr" 
                  checked={paymentMethod === 'qr'} 
                  onChange={() => setPaymentMethod('qr')} 
                />
                <span>Scan & Pay (UPI QR Code)</span>
              </label>
            </div>

            {paymentMethod === 'qr' && (
              <div className="qr-payment-box" style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px dashed var(--border)', textAlign: 'center', marginBottom: '20px' }}>
                <h4 style={{ marginBottom: '12px', fontSize: '0.95rem' }}>Scan with GPay, PhonePe, Paytm, etc.</h4>
                <div style={{ background: 'white', display: 'inline-block', padding: '10px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                  <img src={qrCodeUrl} alt="UPI QR Code" style={{ display: 'block', maxWidth: '100%', height: 'auto' }} />
                </div>
                <div style={{ marginTop: '12px', fontSize: '0.88rem', color: 'var(--text-2)' }}>
                  <p>Payee: <strong>Anmol Tradings</strong></p>
                  <p>Amount: <strong>₹{finalAmount}</strong></p>
                </div>
                <div style={{ marginTop: '16px', textAlign: 'left' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', fontWeight: '600' }}>Transaction ID / Ref No. *</label>
                  <input 
                    type="text" 
                    placeholder="Enter UPI Ref No. (12 digits)" 
                    value={txnId} 
                    onChange={(e) => setTxnId(e.target.value)} 
                    required={paymentMethod === 'qr'}
                    style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: '4px' }}
                  />
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary checkout-btn" disabled={loading || !user}>
              {loading ? 'Processing...' : paymentMethod === 'cod' ? 'Place Order (Cash on Delivery)' : 'I Have Paid - Place Order'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
};

export default CartPage;
