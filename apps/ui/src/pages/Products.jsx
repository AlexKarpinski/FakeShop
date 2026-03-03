import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { clearToken, isLoggedIn } from '../auth/auth';

function Products() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      setLoading(true);
      setError('');

      try {
        const data = await apiFetch('/products', { auth: false });
        if (active) {
          setProducts(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (active) {
          setError(err.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      active = false;
    };
  }, []);

  async function handleAddToCart(productId) {
    setMessage('');
    setError('');

    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }

    try {
      await apiFetch('/cart/items', {
        method: 'POST',
        body: { productId, qty: 1 },
      });
      setMessage('Added');
    } catch (err) {
      setError(err.message);
    }
  }

  function handleLogout() {
    clearToken();
    setMessage('Logged out');
  }

  return (
    <section className="page-card">
      <div className="page-header">
        <h2>Products</h2>
        <div className="row">
          <Link to="/cart">Go to cart</Link>
          {isLoggedIn() ? (
            <button type="button" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </div>
      </div>

      {message ? <p className="message ok">{message}</p> : null}
      {error ? <p className="message error">{error}</p> : null}

      {loading ? (
        <p>Loading products...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>In Stock</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>${Number(product.price).toFixed(2)}</td>
                <td>{product.inStock}</td>
                <td>
                  <button type="button" onClick={() => handleAddToCart(product.id)}>
                    Add to cart
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

export default Products;
