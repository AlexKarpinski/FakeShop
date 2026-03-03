import { Navigate, Route, Routes } from 'react-router-dom';
import RequireAuth from './auth/RequireAuth';
import Login from './pages/Login';
import Products from './pages/Products';
import Cart from './pages/Cart';

function App() {
  return (
    <div className="app-shell">
      <h1 className="page-title">Fake Shop</h1>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/products" element={<Products />} />
        <Route
          path="/cart"
          element={
            <RequireAuth>
              <Cart />
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
