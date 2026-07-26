import { useState, useEffect } from 'react';
import { db } from '../utils/firebase';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../utils/AuthContext';
import { PlusCircle, Trash2, Save } from 'lucide-react';
import './AdminSettings.css';

const AdminSettings = () => {
  const { isAdmin } = useAuth();
  const [bannerText, setBannerText] = useState('');
  const [coupons, setCoupons] = useState([]);
  
  const [newCode, setNewCode] = useState('');
  const [newDiscount, setNewDiscount] = useState('');
  const [newType, setNewType] = useState('percentage');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    try {
      // Fetch Settings
      const siteDoc = await getDoc(doc(db, 'settings', 'site'));
      if (siteDoc.exists()) {
        setBannerText(siteDoc.data().homeBannerText || '');
      }

      // Fetch Coupons
      const snap = await getDocs(collection(db, 'coupons'));
      setCoupons(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'site'), { homeBannerText: bannerText }, { merge: true });
      alert("Settings saved!");
    } catch (err) {
      console.error(err);
      alert("Failed to save settings");
    }
    setSaving(false);
  };

  const handleAddCoupon = async (e) => {
    e.preventDefault();
    if (!newCode || !newDiscount) return;
    
    const upperCode = newCode.toUpperCase().trim();
    const discountVal = Number(newDiscount);

    if (coupons.some(c => c.code === upperCode)) {
      alert("Coupon already exists!");
      return;
    }

    try {
      const couponData = {
        code: upperCode,
        type: newType,
        discountValue: discountVal,
        active: true,
        createdAt: Date.now()
      };
      await setDoc(doc(db, 'coupons', upperCode), couponData);
      setCoupons(prev => [...prev, { id: upperCode, ...couponData }]);
      setNewCode('');
      setNewDiscount('');
    } catch (err) {
      console.error(err);
      alert("Failed to add coupon");
    }
  };

  const toggleCouponStatus = async (coupon) => {
    try {
      const newState = !coupon.active;
      await updateDoc(doc(db, 'coupons', coupon.id), { active: newState });
      setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, active: newState } : c));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteCoupon = async (couponId) => {
    if (!window.confirm("Delete this coupon forever?")) return;
    try {
      await deleteDoc(doc(db, 'coupons', couponId));
      setCoupons(prev => prev.filter(c => c.id !== couponId));
    } catch (err) {
      console.error(err);
    }
  };

  if (!isAdmin) return <div className="container mt-5"><h3>Access Denied</h3></div>;
  if (loading) return <div className="container mt-5">Loading...</div>;

  return (
    <main className="admin-settings container fade-up">
      <h1 className="page-title">Store Settings</h1>

      <section className="settings-section">
        <h2>General Settings</h2>
        <div className="form-group">
          <label>Homepage Announcement Text</label>
          <input 
            type="text" 
            className="input-field"
            value={bannerText} 
            onChange={(e) => setBannerText(e.target.value)} 
          />
        </div>
        <button className="btn btn-navy" onClick={handleSaveSettings} disabled={saving}>
          <Save size={18} style={{marginRight: 6}} /> {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </section>

      <section className="settings-section mt-5">
        <h2>Discount Coupons</h2>
        
        <form className="add-coupon-form" onSubmit={handleAddCoupon}>
          <input 
            type="text" 
            placeholder="Code (e.g. FESTIVAL20)" 
            className="input-field"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            required
          />
          <select 
            className="input-field" 
            value={newType} 
            onChange={(e) => setNewType(e.target.value)}
          >
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Flat Amount (₹)</option>
          </select>
          <input 
            type="number" 
            placeholder="Discount Value" 
            className="input-field"
            value={newDiscount}
            onChange={(e) => setNewDiscount(e.target.value)}
            min="1"
            required
          />
          <button type="submit" className="btn btn-primary">
            <PlusCircle size={18} style={{marginRight: 6}} /> Add
          </button>
        </form>

        <div className="coupons-list mt-4">
          {coupons.length === 0 ? <p>No coupons yet.</p> : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map(c => (
                  <tr key={c.id}>
                    <td><strong>{c.code}</strong></td>
                    <td>{c.type === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}</td>
                    <td>
                      <button 
                        className={`status-btn ${c.active ? 'active' : 'inactive'}`}
                        onClick={() => toggleCouponStatus(c)}
                      >
                        {c.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td>
                      <button className="btn-icon text-red" onClick={() => deleteCoupon(c.id)}>
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </main>
  );
};

export default AdminSettings;
