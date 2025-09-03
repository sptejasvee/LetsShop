import { Navigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';

export const ProtectedRoute = ({ children }) => {
  const { token } = useContext(ShopContext);
  const location = useLocation();

  if (!token) {
    // Redirect them to the /login page, but save the current location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
