import { Link, Navigate, useLocation } from 'react-router-dom';
import { decodeToken, isLoggedIn } from './auth';

function RequireAuth({ children, requireRole }) {
  const location = useLocation();

  if (!isLoggedIn()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (requireRole) {
    const payload = decodeToken();

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
