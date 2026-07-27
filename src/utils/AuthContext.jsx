import { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isWorker, setIsWorker] = useState(false);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        const userRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(userRef);

        if (!docSnap.exists()) {
          // New user — create doc with role: 'user'
          await setDoc(userRef, {
            email: currentUser.email,
            displayName: currentUser.displayName || 'User',
            createdAt: Date.now(),
            wishlist: [],
            role: 'user'
          });
          setIsAdmin(false);
          setIsWorker(false);
          setWishlistIds([]);
        } else {
          const data = docSnap.data();
          // Read role from Firestore
          setIsAdmin(data.role === 'admin');
          setIsWorker(data.role === 'worker');
          setWishlistIds(data.wishlist || []);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
        setIsWorker(false);
        setWishlistIds([]);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const toggleWishlist = async (bookId) => {
    if (!user) {
      alert("Please login to add to wishlist.");
      return;
    }
    const isLiked = wishlistIds.includes(bookId);
    const userRef = doc(db, 'users', user.uid);
    try {
      if (isLiked) {
        await updateDoc(userRef, { wishlist: arrayRemove(bookId) });
        setWishlistIds(prev => prev.filter(id => id !== bookId));
      } else {
        await updateDoc(userRef, { wishlist: arrayUnion(bookId) });
        setWishlistIds(prev => [...prev, bookId]);
      }
    } catch (err) {
      console.error("Failed to update wishlist", err);
    }
  };

  const loginAdmin = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Galat email ya password.' };
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, error: 'Google Sign-In failed.' };
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  if (authLoading) return null;

  return (
    <AuthContext.Provider value={{
      user,
      isAdmin,
      isWorker,
      wishlistIds,
      authLoading,
      toggleWishlist,
      loginWithGoogle,
      loginAdmin,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};
