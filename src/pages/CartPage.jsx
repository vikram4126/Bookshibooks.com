import { useCart } from '../App';
import { Link } from 'react-router-dom';
import './CartPage.css';

const CartPage = () => {
  const { cartItems, removeFromCart, updateQty } = useCart();

  const subtotal = cartItems.reduce((s, i) => s + (Number(i.price) * i.qty), 0);
  const shipping = subtotal >= 25 ? 0 : 3.99;
  const total = subtotal + shipping;

  if (cartItems.length === 0) {
    return (
      <div className="container cart-empty fade-up">
        <div className="cart-empty-icon">🛒</div>
        <h2>Your cart is empty!</h2>
        <p>Looks like you haven't added any books yet.</p>
        <Link to="/" className="btn btn-navy" style={{marginTop:'16px'}}>Browse Books</Link>
      </div>
    );
  }

  return (
    <div className="container cart-page fade-up">
      <h1 className="cart-title">🛒 Your Cart ({cartItems.length} item{cartItems.length > 1 ? 's' : ''})</h1>
      <div className="cart-layout">
        {/* Items */}
        <div className="cart-items">
          {cartItems.map(item => (
            <div key={item.id} className="cart-item">
              <img
                src={item.coverUrl || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=80&h=120'}
                alt={item.title}
                className="cart-item-img"
              />
              <div className="cart-item-info">
                <p className="cart-item-cat">{item.category}</p>
                <h3 className="cart-item-title">{item.title}</h3>
                <p className="cart-item-author">by {item.author}</p>
                <div className="cart-item-actions">
                  <div className="qty-ctrl">
                    <button onClick={() => updateQty(item.id, item.qty - 1)}>−</button>
                    <span>{item.qty}</span>
                    <button onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                  </div>
                  <button className="remove-btn" onClick={() => removeFromCart(item.id)}>🗑 Remove</button>
                </div>
              </div>
              <div className="cart-item-price">£{(Number(item.price) * item.qty).toFixed(2)}</div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="summary-row"><span>Subtotal</span><span>£{subtotal.toFixed(2)}</span></div>
          <div className="summary-row"><span>Shipping</span><span>{shipping === 0 ? <span style={{color:'var(--green)'}}>FREE</span> : `£${shipping.toFixed(2)}`}</span></div>
          {shipping > 0 && <p className="shipping-note">Add £{(25 - subtotal).toFixed(2)} more for free shipping</p>}
          <div className="summary-divider" />
          <div className="summary-row total-row"><span>Total</span><span>£{total.toFixed(2)}</span></div>
          <button className="btn btn-red btn-full" style={{padding:'14px', fontSize:'1rem', marginTop:'8px'}}>
            Proceed to Checkout →
          </button>
          <Link to="/" className="continue-link">← Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
