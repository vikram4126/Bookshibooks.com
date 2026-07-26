import { Link } from 'react-router-dom';
import './CartPage.css';

const CartPage = () => {
  return (
    <main className="cart-page container fade-up" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: '3rem', margin: '0 0 16px 0' }}>🚧</div>
      <h1 className="cart-title" style={{ marginBottom: '8px' }}>Cart is Coming Soon!</h1>
      <p style={{ color: 'var(--text-3)', marginBottom: '24px' }}>We are currently upgrading our checkout experience.</p>
      <Link to="/" className="btn btn-navy">← Back to Books</Link>
    </main>
  );
};

export default CartPage;
