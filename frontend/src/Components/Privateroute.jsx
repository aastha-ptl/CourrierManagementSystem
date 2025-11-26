import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const PrivateRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" />;
  }

  try {
    const decoded = jwtDecode(token);
    if (decoded.role !== requiredRole) {
      return <Navigate to="/login" />;
    }
    return children;
  } catch (err) {
    return <Navigate to="/login" />;
  }
};

export default PrivateRoute;
