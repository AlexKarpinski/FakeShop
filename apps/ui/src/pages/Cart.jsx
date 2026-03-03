import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { clearToken, decodeToken } from '../auth/auth';

function Cart() {
  const navigate = useNavigate();
  const authInfo = decodeToken();
  const isAdmin = authInfo?.role === 'admin';

  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkoutResult, setCheckoutResult] = useState(null);

  async function loadCart() {
    setLoading(true);
    setError('');

    try {
      const data = await apiFetch('/cart');
      setCart(data || { items: [], total: 0 });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCart();
  }, []);

  async function handleRemove(productId) {
    setError('');

    try {
      const data = await apiFetch(`/cart/items/${productId}`, {
        method: 'DELETE',
      });
      setCart(data || { items: [], total: 0 });
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCheckout() {
    setError('');
    setCheckoutResult(null);

    try {
      const result = await apiFetch('/cart/checkout', { method: 'POST' });
      setCheckoutResult(result);
      await loadCart();
    } catch (err) {
      setError(err.message);
    }
  }

  function handleLogout() {
    clearToken();
    navigate('/login', { replace: true });
  }

  if (isAdmin) {
    return (
      <section className="page-card">
        <div className="page-header">
          <h2>Your Cart</h2>
          <div className="row">
            <Link to="/admin/products">Admin</Link>
            <button type="button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
        <p>Admins cannot use cart/checkout. Use Admin → Products management.</p>
      </section>
    );
  }

  return (
    <section className="page-card">
      <div className="page-header">
        <h2>Your Cart</h2>
        <div className="row">
          <Link to="/products">Back to products</Link>
          <button type="button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {error ? <p className="message error">{error}</p> : null}
      {checkoutResult ? (
        <p className="message ok">
          Checkout complete: items={checkoutResult.itemsCount}, total=${Number(checkoutResult.total).toFixed(2)}
        </p>
      ) : null}

      {loading ? (
        <p>Loading cart...</p>
      ) : cart.items.length === 0 ? (
        <p>Cart is empty.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Qty</th>
              <th>Subtotal</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {cart.items.map((item) => (
              <tr key={item.productId}>
                <td>{item.name}</td>
                <td>${Number(item.price).toFixed(2)}</td>
                <td>{item.qty}</td>
                <td>${(Number(item.price) * Number(item.qty)).toFixed(2)}</td>
                <td>
                  <button className="danger" type="button" onClick={() => handleRemove(item.productId)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="row" style={{ marginTop: '14px' }}>
        <strong>Total: ${Number(cart.total || 0).toFixed(2)}</strong>
        <button className="primary" type="button" onClick={handleCheckout}>
          Checkout
        </button>
      </div>
    </section>
  );
}

export default Cart;
