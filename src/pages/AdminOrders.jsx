import { useState, useEffect } from 'react';
import { db } from '../utils/firebase';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { useAuth } from '../utils/AuthContext';
import { Check, TrendingUp, ShoppingBag, AlertCircle, Printer } from 'lucide-react';
import './AdminOrders.css';

const AdminOrders = () => {
  const { isAdmin } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalSales: 0, totalOrders: 0, pendingVerification: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    if (isAdmin) {
      fetchOrders();
    }
  }, [isAdmin]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const ordersList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setOrders(ordersList);
      calculateStats(ordersList);
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
    setLoading(false);
  };

  const calculateStats = (list) => {
    let sales = 0;
    let pendingVerify = 0;
    list.forEach(order => {
      // Sum completed/processing orders (exclude cancelled if you want, but sum all for now)
      if (order.status !== 'Cancelled') {
        sales += order.total || 0;
      }
      if (order.paymentStatus === 'Pending Verification') {
        pendingVerify++;
      }
    });
    setStats({
      totalSales: sales,
      totalOrders: list.length,
      pendingVerification: pendingVerify
    });
  };

  const printShippingLabels = (ordersToPrint) => {
    if (!ordersToPrint || ordersToPrint.length === 0) return alert("No orders selected for printing.");
    
    const labelsHtml = ordersToPrint.map(order => `
        <div class="label-box">
          <div class="section-title">FROM</div>
          <div class="store-name">📚 BookshiBooks</div>
          <div class="store-address">A unit of Anmol Tradings · S 363 A school block shakarpur, near water plant, Delhi · +91 8750777784</div>
          <div class="section-title">SHIP TO</div>
          <div class="to-name">${order.shipping?.name || ''}</div>
          <div class="to-detail">📞 Mobile: <strong>${order.shipping?.phone || ''}</strong></div>
          <div class="to-detail">📍 ${order.shipping?.address || ''}</div>
          <div class="to-detail">Pincode: ${order.shipping?.pincode || ''}</div>
          <div class="order-info">
            <div><strong>Order ID:</strong> #${order.id.slice(-6).toUpperCase()}</div>
            <div><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</div>
            <div class="order-items">
              ${(order.items || []).map(item => `<div class="order-item">• ${item.title} (₹${item.price}) × ${item.qty}</div>`).join('')}
            </div>
            <div class="total-row">Total: ₹${order.total}</div>
            <div class="payment-badge">${order.paymentMethod || 'COD'} · ${order.paymentStatus || 'Pending'}</div>
          </div>
        </div>
    `).join('');

    const pageHtml = `
      <html><head><title>Shipping Labels</title><style>
        body { font-family: Arial, sans-serif; padding: 0; margin: 0; }
        .page-grid { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          grid-auto-rows: 135mm; /* ~Half A4 height */
          gap: 5mm;
          padding: 5mm;
          box-sizing: border-box;
        }
        .label-box { 
          border: 2px dashed #333; 
          padding: 15px; 
          border-radius: 8px; 
          page-break-inside: avoid;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .store-name { font-size: 16px; font-weight: bold; margin-bottom: 2px; }
        .store-address { font-size: 10px; color: #555; margin-bottom: 12px; border-bottom: 1px solid #ddd; padding-bottom: 8px; }
        .section-title { font-size: 10px; text-transform: uppercase; color: #888; margin-bottom: 2px; }
        .to-name { font-size: 16px; font-weight: bold; margin-bottom: 2px; }
        .to-detail { font-size: 12px; margin-bottom: 2px; }
        .order-info { margin-top: auto; border-top: 1px solid #ddd; padding-top: 8px; font-size: 11px; }
        .order-items { margin-top: 6px; font-size: 11px; }
        .order-item { padding: 1px 0; }
        .total-row { font-size: 12px; font-weight: bold; margin-top: 6px; }
        .payment-badge { display: inline-block; background: #f0f0f0; padding: 2px 6px; border-radius: 4px; font-size: 11px; margin-top: 4px; }
        @media print { 
          body { padding: 0; margin: 0; } 
          @page { size: A4 portrait; margin: 5mm; }
        }
      </style></head>
      <body>
        <div class="page-grid">
          ${labelsHtml}
        </div>
        <script>window.onload = () => window.print();<\/script>
      </body></html>`;

    const win = window.open('', '_blank', 'width=800,height=900');
    win.document.write(pageHtml);
    win.document.close();
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      // Recalculate stats in case status affects total sales sum
      calculateStats(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  const handleVerifyPayment = async (orderId) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { paymentStatus: 'Paid' });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, paymentStatus: 'Paid' } : o));
      setStats(prev => ({ ...prev, pendingVerification: Math.max(0, prev.pendingVerification - 1) }));
    } catch (err) {
      console.error(err);
      alert("Failed to verify payment");
    }
  };

  const filteredOrders = orders.filter(order => {
    const search = searchTerm.toLowerCase();
    const matchesSearch = !search || 
      order.id.toLowerCase().includes(search) || 
      order.shipping?.name?.toLowerCase().includes(search) ||
      order.shipping?.phone?.includes(search);
    
    const matchesStatus = statusFilter === 'All' || 
      (statusFilter === 'Pending Verification' ? order.paymentStatus === statusFilter : order.status === statusFilter);
    
    return matchesSearch && matchesStatus;
  });

  if (!isAdmin) return <div className="container mt-5"><h3>Access Denied</h3></div>;

  return (
    <main className="admin-orders container fade-up">
      <h1 className="page-title">Orders Dashboard</h1>

      {/* Stats Widgets */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}><TrendingUp size={24} /></div>
          <div>
            <div className="stat-value">₹{stats.totalSales.toLocaleString('en-IN')}</div>
            <div className="stat-label">Total Sales Revenue</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e0f7fa', color: '#00838f' }}><ShoppingBag size={24} /></div>
          <div>
            <div className="stat-value">{stats.totalOrders}</div>
            <div className="stat-label">Total Orders Placed</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fffbeb', color: '#d97706' }}><AlertCircle size={24} /></div>
          <div>
            <div className="stat-value">{stats.pendingVerification}</div>
            <div className="stat-label">Pending Payments Verify</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search by Order ID, Name, Phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '8px 14px', border: '1px solid var(--border)', borderRadius: '8px', minWidth: '250px' }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '8px 14px', border: '1px solid var(--border)', borderRadius: '8px' }}
          >
            <option value="All">All Statuses</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Pending Verification">Pending Pay Verification</option>
          </select>
        </div>
        <button
          onClick={() => printShippingLabels(filteredOrders)}
          title="Print All Displayed Labels (4 per page)"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600' }}
        >
          <Printer size={16} /> Print {filteredOrders.length} Labels (4/page)
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading orders...</div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-3)' }}>No orders placed yet.</div>
      ) : (
        <div className="orders-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer / Shipping</th>
                <th>Books Ordered</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order.id}>
                  <td>
                    <span className="order-id-badge">#{order.id.slice(-6).toUpperCase()}</span>
                    <div className="order-date-text">{new Date(order.createdAt).toLocaleString()}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: '600' }}>{order.shipping?.name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-3)' }}>{order.shipping?.phone}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-3)', maxWidth: '200px', whiteSpace: 'normal', marginTop: '4px' }}>
                      {order.shipping?.address}, Pincode: {order.shipping?.pincode}
                    </div>
                  </td>
                  <td>
                    <div className="order-items-summary">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="order-item-row">
                          • {item.title} <span className="text-muted">x{item.qty}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: '700' }}>₹{order.total}</div>
                    {order.couponUsed && <div style={{ fontSize: '0.78rem', color: 'var(--success)' }}>Used {order.couponUsed}</div>}
                  </td>
                  <td>
                    <div style={{ fontSize: '0.88rem' }}><strong>{order.paymentMethod}</strong></div>
                    <div style={{ marginTop: '4px' }}>
                      {order.paymentStatus === 'Pending Verification' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                          <span className="payment-status-badge pending">🔍 Verify Pay</span>
                          {order.transactionId && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', wordBreak: 'break-all' }}>
                                Txn: {order.transactionId}
                              </span>
                              <button
                                onClick={() => { navigator.clipboard.writeText(order.transactionId); alert('Txn ID copied!'); }}
                                style={{ padding: '2px 6px', fontSize: '0.7rem', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', background: 'white' }}
                                title="Copy Txn ID"
                              >📋</button>
                            </div>
                          )}
                          <button 
                            className="btn btn-sm btn-success-light" 
                            onClick={() => handleVerifyPayment(order.id)}
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 8px', fontSize: '0.78rem', marginTop: '2px' }}
                          >
                            <Check size={12} /> Mark Paid
                          </button>
                        </div>
                      ) : (
                        <span className={`payment-status-badge ${order.paymentStatus?.toLowerCase().replace(' ', '-')}`}>
                          {order.paymentStatus || 'Pending'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <select
                      className="status-select"
                      value={order.status || 'Processing'}
                      onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                    >
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>
                    <button
                      onClick={() => printShippingLabels([order])}
                      title="Print Shipping Label"
                      style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 10px', background: '#1e3a5f', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600', whiteSpace: 'nowrap' }}
                    >
                      <Printer size={13} /> Print Label
                    </button>
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

export default AdminOrders;
