import { useState, useEffect } from 'react';
import { db } from '../utils/firebase';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../utils/AuthContext';
import { PlusCircle, Trash2, Save, UploadCloud } from 'lucide-react';
import { compressAndUploadImage } from '../utils/imageUpload';
import './AdminSettings.css';

const AdminSettings = () => {
  const { isAdmin } = useAuth();
  const [bannerText, setBannerText] = useState('');
  const [promos, setPromos] = useState(
    Array(4).fill({ image: '', link: '' })
  );
  const [coupons, setCoupons] = useState([]);
  
  const [newCode, setNewCode] = useState('');
  const [newDiscount, setNewDiscount] = useState('');
  const [newType, setNewType] = useState('percentage');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState(null);

  const handleImageUpload = async (e, idx) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingIdx(idx);
    try {
      const url = await compressAndUploadImage(file, 'promos');
      const newP = [...promos];
      newP[idx] = { ...newP[idx], image: url };
      setPromos(newP);
    } catch (err) {
      console.error(err);
      alert('Failed to upload image.');
    }
    setUploadingIdx(null);
  };

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
        const data = siteDoc.data();
        setBannerText(data.homeBannerText || '');
        if (data.promos && data.promos.length) {
          // ensure it's always length 4
          const loadedPromos = [...data.promos];
          while (loadedPromos.length < 4) loadedPromos.push({ image: '', link: '' });
          setPromos(loadedPromos.slice(0, 4));
        }
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
      await setDoc(doc(db, 'settings', 'site'), { 
        homeBannerText: bannerText,
        promos
      }, { merge: true });
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
        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h4>Promo Banners</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-3)' }}>Leave image URL empty to hide that slot.</p>
          {promos.map((promo, idx) => (
            <div key={idx} style={{ padding: '12px', border: '1px solid var(--border)', borderRadius: '8px' }}>
              <div style={{ fontWeight: '600', marginBottom: '8px' }}>Promo {idx + 1}</div>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'stretch' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="text" 
                      className="input-field"
                      placeholder="Image URL (e.g. https://...)"
                      value={promo.image}
                      onChange={(e) => {
                        const newP = [...promos];
                        newP[idx] = { ...newP[idx], image: e.target.value };
                        setPromos(newP);
                      }}
                      style={{ flex: 1, margin: 0 }}
                    />
                    <label className="btn btn-navy" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', opacity: uploadingIdx === idx ? 0.7 : 1 }}>
                      <UploadCloud size={16} /> {uploadingIdx === idx ? 'Uploading...' : 'Upload'}
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleImageUpload(e, idx)} disabled={uploadingIdx === idx} />
                    </label>
                  </div>
                  <input 
                    type="text" 
                    className="input-field"
                    placeholder="Target Link (e.g. /shop?category=Kids)"
                    value={promo.link}
                    onChange={(e) => {
                      const newP = [...promos];
                      newP[idx] = { ...newP[idx], link: e.target.value };
                      setPromos(newP);
                    }}
                  />
                </div>
                <div style={{ 
                  flex: 1, 
                  background: '#f8fafc', 
                  border: '1px dashed #cbd5e1', 
                  borderRadius: '8px', 
                  overflow: 'hidden', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  minHeight: '100px'
                }}>
                  {promo.image ? (
                    <img 
                      src={promo.image} 
                      alt={`Promo ${idx + 1} Preview`} 
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                      onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} 
                    />
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>No Image</span>
                  )}
                  <span style={{ display: 'none', fontSize: '0.75rem', color: '#ef4444', textAlign: 'center', padding: '4px' }}>Invalid URL</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button className="btn btn-navy" onClick={handleSaveSettings} disabled={saving} style={{ marginTop: '24px' }}>
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
