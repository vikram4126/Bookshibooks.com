import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addBook } from '../utils/storage';
import { db } from '../utils/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { compressAndUploadImage } from '../utils/imageUpload';
import { Html5Qrcode } from 'html5-qrcode';
import { UploadCloud } from 'lucide-react';
import './AddBook.css';

const AddBook = () => {
  const navigate = useNavigate();
  const [isbn, setIsbn] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [form, setForm] = useState({ 
    title: '', author: '', category: 'Kids', condition: 'New', 
    price: '', oldPrice: '', coverUrl: '', badge: '', quantity: '1'
  });
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Rapid Scan Mode States
  const [isRapidMode, setIsRapidMode] = useState(false);
  const [rapidCategory, setRapidCategory] = useState('Kids');
  const [rapidMrp, setRapidMrp] = useState('299');
  const [successScans, setSuccessScans] = useState([]);
  const [failedScans, setFailedScans] = useState([]);

  // Camera Scanner States
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const scannerRef = useRef(null);

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, []);

  const playSound = (type) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {
      console.log('Audio not supported', e);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const url = await compressAndUploadImage(file, 'books');
      setForm(prev => ({ ...prev, coverUrl: url }));
    } catch (err) {
      console.error(err);
      alert('Failed to upload image.');
    }
    setUploadingImage(false);
  };

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  // Magic ISBN Fetcher with Fallback (Google -> Open Library)
  const handleFetchIsbn = async () => {
    if (!isbn) {
      if (!isRapidMode) setErrorMsg("Please enter an ISBN number first.");
      return;
    }
    const currentIsbn = isbn;
    setLoading(true);
    setErrorMsg('');
    try {
      // Step 0: Check if book already exists in DB
      const q = query(collection(db, 'books'), where("isbn", "==", currentIsbn));
      const snap = await getDocs(q);
      
      if (!snap.empty) {
        // Book already exists! Just increment quantity
        const existingDoc = snap.docs[0];
        const existingData = existingDoc.data();
        const currentQty = Number(existingData.quantity || 0);
        await updateDoc(doc(db, 'books', existingDoc.id), { quantity: currentQty + 1 });
        
        if (isRapidMode) {
          setSuccessScans(prev => [{ isbn: currentIsbn, title: `(Qty +1) ${existingData.title}` }, ...prev]);
          playSound('success');
          setIsbn('');
        } else {
          setErrorMsg(`Book already exists! We increased its stock to ${currentQty + 1}.`);
          setForm(prev => ({
            ...prev,
            title: existingData.title || prev.title,
            author: existingData.author || prev.author,
            coverUrl: existingData.coverUrl || prev.coverUrl,
          }));
        }
        setLoading(false);
        return;
      }

      let bookData = null;
      let cover = '';
      
      // Step 1: Try Google Books API
      const googleRes = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${currentIsbn}`);
      const googleData = await googleRes.json();

      if (googleData.items && googleData.items.length > 0) {
        const vInfo = googleData.items[0].volumeInfo;
        cover = vInfo.imageLinks?.thumbnail || '';
        if (cover && cover.startsWith('http:')) cover = cover.replace('http:', 'https:');
        bookData = {
          title: vInfo.title,
          author: vInfo.authors ? vInfo.authors.join(', ') : 'Unknown Author',
          coverUrl: cover
        };
      } else {
        // Step 2: Open Library Fallback
        const olRes = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${currentIsbn}&jscmd=data&format=json`);
        const olData = await olRes.json();
        const olBook = olData[`ISBN:${currentIsbn}`];
        if (olBook) {
          bookData = {
            title: olBook.title,
            author: olBook.authors ? olBook.authors.map(a => a.name).join(', ') : 'Unknown Author',
            coverUrl: olBook.cover ? olBook.cover.large : ''
          };
        }
      }

      if (bookData) {
        if (isRapidMode) {
          const oldPrice = Number(rapidMrp) || 299; // Default MRP
          const price = Math.floor(oldPrice * 0.5); // 50% discount
          const newBook = {
            title: bookData.title,
            author: bookData.author,
            category: rapidCategory,
            condition: 'Good',
            price,
            oldPrice,
            coverUrl: bookData.coverUrl,
            badge: '',
            quantity: 1,
            isbn: currentIsbn
          };
          await addBook(newBook);
          setSuccessScans(prev => [{ isbn: currentIsbn, title: bookData.title }, ...prev]);
          playSound('success');
          setIsbn('');
        } else {
          setForm(prev => ({
            ...prev,
            title: bookData.title || prev.title,
            author: bookData.author || prev.author,
            coverUrl: bookData.coverUrl || prev.coverUrl,
          }));
        }
      } else {
        if (isRapidMode) {
          setFailedScans(prev => [currentIsbn, ...prev]);
          playSound('error');
          setIsbn('');
        } else {
          setErrorMsg("Book not found in any database. You can still enter details manually.");
        }
      }
    } catch (err) {
      if (isRapidMode) {
        setFailedScans(prev => [currentIsbn, ...prev]);
        playSound('error');
        setIsbn('');
      } else {
        setErrorMsg("Failed to fetch book data. Enter manually.");
      }
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleFetchIsbn();
    }
  };

  const startCamera = async () => {
    setCameraError('');
    setIsCameraOpen(true);
    // wait for DOM to render the div
    setTimeout(async () => {
      try {
        const html5QrCode = new Html5Qrcode('qr-reader');
        scannerRef.current = html5QrCode;
        await html5QrCode.start(
          { facingMode: 'environment' }, // back camera
          { fps: 10, qrbox: { width: 250, height: 150 } },
          async (decodedText) => {
            // Got barcode — stop camera first, then process
            await html5QrCode.stop();
            scannerRef.current = null;
            setIsCameraOpen(false);
            setIsbn(decodedText);
            // Auto-trigger fetch with scanned ISBN
            setTimeout(() => {
              document.getElementById('rapid-scan-trigger')?.click();
            }, 200);
          },
          () => {} // ignore decode errors
        );
      } catch (err) {
        console.error('Camera error', err);
        setCameraError('Camera access denied or not available. Please allow camera permission in your browser settings.');
        setIsCameraOpen(false);
      }
    }, 300);
  };

  const stopCamera = async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); } catch(e) {}
      scannerRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    await addBook({ ...form, isbn });
    setSubmitted(true);
    setTimeout(() => navigate('/'), 1500);
  };

  return (
    <main className="addbook-page">
      <div className="container addbook-container">
        {/* Sidebar info */}
        <div className="addbook-info fade-up">
          <h2>📋 Auto-List Book</h2>
          <p>Scan or type the ISBN barcode to instantly fetch the book's title, author, and cover image from our global database.</p>
          <div className="addbook-tips">
            <div className="tip-item">📠 <strong>ISBN Scan</strong> — The barcode number on the back of the book</div>
            <div className="tip-item">🔍 <strong>Condition</strong> — Be honest about the physical condition</div>
            <div className="tip-item">₹ <strong>Pricing</strong> — Compare with Original MRP to show a discount</div>
          </div>
        </div>

        {/* Form */}
        <div className="addbook-form-card fade-up">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: isRapidMode ? '#eef2ff' : '#f8fafc', padding: '16px', borderRadius: '8px', border: isRapidMode ? '2px solid #4f46e5' : '1px solid #e2e8f0' }}>
            <div>
              <h3 style={{ margin: 0, color: isRapidMode ? '#4f46e5' : '#334155' }}>⚡ Rapid Barcode Scanner Mode</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-3)' }}>Automatically list books instantly via scanner.</p>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input type="checkbox" checked={isRapidMode} onChange={(e) => setIsRapidMode(e.target.checked)} style={{ transform: 'scale(1.5)', marginRight: '10px' }} />
              <span style={{ fontWeight: '600' }}>Enable</span>
            </label>
          </div>

          {isRapidMode ? (
            <div className="rapid-mode-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Camera viewfinder */}
              {isCameraOpen && (
                <div style={{ position: 'relative', background: '#000', borderRadius: '12px', overflow: 'hidden' }}>
                  <div id="qr-reader" style={{ width: '100%' }} />
                  <button
                    type="button"
                    onClick={stopCamera}
                    style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: '36px', height: '36px', fontSize: '18px', cursor: 'pointer' }}
                  >✕</button>
                  <div style={{ position: 'absolute', bottom: '12px', left: 0, right: 0, textAlign: 'center', color: '#fff', fontSize: '0.85rem', background: 'rgba(0,0,0,0.4)', padding: '6px' }}>
                    📸 Point camera at the barcode on the back of the book
                  </div>
                </div>
              )}
              {cameraError && <p style={{ color: '#dc2626', fontSize: '0.85rem', background: '#fef2f2', padding: '10px', borderRadius: '8px' }}>⚠️ {cameraError}</p>}

              <div className="isbn-input-group" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input 
                  type="text" 
                  placeholder="Scan barcode or type ISBN here..." 
                  value={isbn} 
                  onChange={e => setIsbn(e.target.value)}
                  onKeyDown={handleKeyDown}
                  style={{ flex: 1, minWidth: '150px', padding: '16px', fontSize: '1.1rem', border: '2px solid #4f46e5', borderRadius: '8px', outline: 'none' }}
                  autoFocus={!isCameraOpen}
                />
                {/* Hidden trigger button used by camera scanner */}
                <button id="rapid-scan-trigger" type="button" onClick={handleFetchIsbn} style={{ display: 'none' }} />
                <button
                  type="button"
                  onClick={isCameraOpen ? stopCamera : startCamera}
                  style={{ padding: '0 20px', fontSize: '1rem', background: isCameraOpen ? '#dc2626' : '#059669', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  {isCameraOpen ? '📷 Stop Camera' : '📷 Camera'}
                </button>
                <button type="button" onClick={handleFetchIsbn} disabled={loading} className="btn btn-navy" style={{ padding: '0 24px', fontSize: '1rem' }}>
                  {loading ? '...' : '✓ Add'}
                </button>
              </div>
              <p style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: '0.85rem', margin: 0 }}>Books are automatically saved with 50% discount on ₹{rapidMrp} MRP in '{rapidCategory}' category.</p>

              <div style={{ display: 'flex', gap: '10px', background: '#fff', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>Category for Scanned Books</label>
                  <select value={rapidCategory} onChange={e => setRapidCategory(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                    <option value="Kids">Kids</option>
                    <option value="Adults">Adults</option>
                    <option value="Fiction">Fiction</option>
                    <option value="Non-Fiction">Non-Fiction</option>
                    <option value="Textbook">Textbook</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>Base MRP (50% applied on this)</label>
                  <input type="number" value={rapidMrp} onChange={e => setRapidMrp(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ flex: 1, border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', background: '#f8fafc', maxHeight: '300px', overflowY: 'auto' }}>
                  <h4 style={{ color: '#16a34a', margin: '0 0 10px 0' }}>✅ Added ({successScans.length})</h4>
                  {successScans.map((s, i) => (
                    <div key={i} style={{ fontSize: '0.85rem', padding: '6px 0', borderBottom: '1px solid #e2e8f0' }}>
                      <strong>{s.isbn}</strong> - {s.title}
                    </div>
                  ))}
                  {successScans.length === 0 && <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>No books scanned yet.</div>}
                </div>
                <div style={{ flex: 1, border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', background: '#fef2f2', maxHeight: '300px', overflowY: 'auto' }}>
                  <h4 style={{ color: '#dc2626', margin: '0 0 10px 0' }}>❌ Failed ({failedScans.length})</h4>
                  <p style={{ fontSize: '0.75rem', color: '#dc2626', margin: '0 0 10px 0' }}>Not found globally. Add manually later.</p>
                  {failedScans.map((f, i) => (
                    <div key={i} style={{ fontSize: '0.85rem', padding: '6px 0', borderBottom: '1px solid #fecaca' }}>
                      <strong>{f}</strong>
                    </div>
                  ))}
                  {failedScans.length === 0 && <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>No failures!</div>}
                </div>
              </div>
            </div>
          ) : submitted ? (
            <div className="success-msg">
              <div style={{fontSize:'3rem'}}>✅</div>
              <h3>Book Listed Successfully!</h3>
              <p>Redirecting to homepage...</p>
            </div>
          ) : (
            <div className="addbook-form-wrapper">
              
              {/* ISBN Fetch Section */}
              <div className="isbn-section">
                <h3 className="form-heading">Smart ISBN Scan</h3>
                <div className="isbn-input-group">
                  <input 
                    type="text" 
                    placeholder="Enter ISBN (e.g. 9780439554930)" 
                    value={isbn} 
                    onChange={e => setIsbn(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <button type="button" onClick={handleFetchIsbn} disabled={loading} className="btn btn-navy">
                    {loading ? 'Fetching...' : '🔍 Fetch Book'}
                  </button>
                </div>
                {errorMsg && <p className="error-text" style={{color: 'var(--red)', fontSize: '0.85rem', marginTop: '8px'}}>{errorMsg}</p>}
              </div>

              <hr className="form-divider" />

              <form onSubmit={handleSubmit} className="addbook-form">
                <h3 className="form-heading">Book Details</h3>

                <div className="form-group">
                  <label htmlFor="title">Book Title *</label>
                  <input id="title" name="title" type="text" placeholder="e.g. The Gruffalo" value={form.title} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label htmlFor="author">Author *</label>
                  <input id="author" name="author" type="text" placeholder="e.g. Julia Donaldson" value={form.author} onChange={handleChange} required />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label htmlFor="category">Category *</label>
                    <select id="category" name="category" value={form.category} onChange={handleChange}>
                      <option value="Kids">Kids</option>
                      <option value="Adults">Adults</option>
                      <option value="Fiction">Fiction</option>
                      <option value="Non-Fiction">Non-Fiction</option>
                      <option value="Textbook">Textbook</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="condition">Condition *</label>
                    <select id="condition" name="condition" value={form.condition} onChange={handleChange}>
                      <option value="New">New</option>
                      <option value="Like New">Like New (Unread)</option>
                      <option value="Good">Good (Minor wear)</option>
                      <option value="Acceptable">Acceptable (Damaged/Old)</option>
                    </select>
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label htmlFor="price">Selling Price (₹) *</label>
                    <input id="price" name="price" type="number" step="1" min="0" placeholder="e.g. 299" value={form.price} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="oldPrice">Original MRP (₹)</label>
                    <input id="oldPrice" name="oldPrice" type="number" step="1" min="0" placeholder="Optional" value={form.oldPrice} onChange={handleChange} />
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label htmlFor="quantity">Quantity in Stock *</label>
                    <input id="quantity" name="quantity" type="number" step="1" min="1" placeholder="e.g. 3" value={form.quantity} onChange={handleChange} required />
                    <small style={{color:'#64748b', fontSize:'0.78rem'}}>Kitni copies hain aapke paas?</small>
                  </div>
                  <div className="form-group">
                    <label htmlFor="badge">Badge</label>
                    <select id="badge" name="badge" value={form.badge} onChange={handleChange}>
                      <option value="">None</option>
                      <option value="New">New</option>
                      <option value="Sale">Sale</option>
                      <option value="Best">Bestseller</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="coverUrl">Cover Image URL</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input id="coverUrl" name="coverUrl" type="url" placeholder="https://..." value={form.coverUrl} onChange={handleChange} style={{ flex: 1 }} />
                    <label className="btn btn-navy" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', opacity: uploadingImage ? 0.7 : 1 }}>
                      <UploadCloud size={16} /> {uploadingImage ? 'Uploading...' : 'Upload'}
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} disabled={uploadingImage} />
                    </label>
                  </div>
                </div>

                {form.coverUrl && (
                  <div className="cover-preview" style={{ marginTop: '10px' }}>
                    <img src={form.coverUrl} alt="Preview" style={{maxHeight: '150px', borderRadius: '8px'}} onError={e => e.target.style.display='none'} />
                  </div>
                )}

                <button type="submit" className="btn btn-red btn-full" style={{marginTop:'16px', fontSize:'1rem', padding:'14px'}}>
                  📋 List Book Now
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default AddBook;
