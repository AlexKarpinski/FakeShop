import { Link, Navigate, useLocation } from 'react-router-dom';
import { decodeToken, isLoggedIn } from './auth';

function RequireAuth({ children, requireRole, forbidRole, forbidRedirectTo }) {
  const location = useLocation();
  const payload = decodeToken();

  if (!isLoggedIn()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (forbidRole && payload?.role === forbidRole) {
    return <Navigate to={forbidRedirectTo || '/products'} replace />;
  }

  if (requireRole) {
    if (!payload || payload.role !== requireRole) {
      return (
        <section className="page-card">
          <h2>Forbidden</h2>
          <p>You do not have access to this page.</p>
          <Link to="/products">Back to products</Link>
        </section>
      );
    }
  }

  return children;
}

export default RequireAuth;
