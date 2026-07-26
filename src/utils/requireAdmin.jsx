import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// HOC to protect admin pages
const requireAdmin = (Component) => {
  return function AdminProtected(props) {
    const navigate = useNavigate();
    const isAdmin = sessionStorage.getItem('bsb_admin') === 'true';

    useEffect(() => {
      if (!isAdmin) navigate('/admin');
    }, [isAdmin, navigate]);

    if (!isAdmin) return null;
    return <Component {...props} />;
  };
};

export default requireAdmin;
