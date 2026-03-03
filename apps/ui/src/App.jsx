import { Navigate, Route, Routes } from 'react-router-dom';
import RequireAuth from './auth/RequireAuth';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Products from './pages/Products';
import Cart from './pages/Cart';
import AdminProducts from './pages/AdminProducts';

function App() {
  return (
    <div className="app-shell">
      <h1 className="page-title">Fake Shop</h1>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/products" element={<Products />} />
        <Route
          path="/cart"
          element={
            <RequireAuth forbidRole="admin" forbidRedirectTo="/admin/products">
              <Cart />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/products"
          element={
            <RequireAuth requireRole="admin">
              <AdminProducts />
            </RequireAuth>
          }
        />
        <Route path="/" element={<Navigate to="/products" replace />} />
        <Route path="*" element={<Navigate to="/products" replace />} />
      </Routes>
    </div>
  );
}

export default App;
