import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { clearToken, decodeToken } from '../auth/auth';

function normalizeProducts(data) {
  if (!Array.isArray(data)) {
    return [];
  }

  return data.map((product) => ({
    ...product,
    editing: {
      name: String(product.name || ''),
      price: String(product.price ?? ''),
      inStock: String(product.inStock ?? ''),
    },
  }));
}

function AdminProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [createForm, setCreateForm] = useState({ name: '', price: '', inStock: '' });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const authInfo = decodeToken();

  async function loadProducts() {
    setLoading(true);
    setError('');

    try {
      const data = await apiFetch('/products', { auth: false });
      setProducts(normalizeProducts(data));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function updateEditing(id, field, value) {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id
          ? {
              ...product,
              editing: {
                ...product.editing,
                [field]: value,
              },
            }
          : product
      )
    );
  }

  async function handleCreate(event) {
    event.preventDefault();
    setMessage('');
    setError('');

    try {
      await apiFetch('/products', {
        method: 'POST',
        body: {
          name: createForm.name.trim(),
          price: Number(createForm.price),
          inStock: Number(createForm.inStock),
        },
      });

      setCreateForm({ name: '', price: '', inStock: '' });
      setMessage('Product created');
      await loadProducts();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSave(product) {
    setMessage('');
    setError('');

    const body = {
      name: product.editing.name.trim(),
      price: Number(product.editing.price),
      inStock: Number(product.editing.inStock),
    };

    try {
      await apiFetch(`/products/${product.id}`, {
        method: 'PATCH',
        body,
      });

      setMessage('Product updated');
      await loadProducts();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(productId) {
    setMessage('');
    setError('');

    try {
      await apiFetch(`/products/${productId}`, {
        method: 'DELETE',
      });

      setMessage('Product deleted');
      await loadProducts();
    } catch (err) {
      setError(err.message);
    }
  }

  function handleLogout() {
    clearToken();
    navigate('/login', { replace: true });
  }

  return (
    <section className="page-card">
      <div className="page-header">
        <h2>Admin Products</h2>
        <div className="row">
          <Link to="/products">Products</Link>
          <Link to="/cart">Cart</Link>
          <button type="button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <p style={{ marginTop: 0 }}>Signed in as: {authInfo?.email || 'admin'}</p>

      <form className="admin-create" onSubmit={handleCreate}>
        <h3 style={{ margin: '0 0 8px' }}>Create Product</h3>
        <div className="admin-grid">
          <label className="filters-field">
            Name
            <input
              type="text"
              value={createForm.name}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
          </label>

          <label className="filters-field">
            Price
            <input
              type="number"
              min="0"
              step="0.01"
              value={createForm.price}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, price: event.target.value }))}
              required
            />
          </label>

          <label className="filters-field">
            In stock
            <input
              type="number"
              min="0"
              step="1"
              value={createForm.inStock}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, inStock: event.target.value }))}
              required
            />
          </label>

          <div className="row admin-actions">
            <button className="primary" type="submit">
              Create
            </button>
          </div>
        </div>
      </form>

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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>
                  <input
                    value={product.editing.name}
                    onChange={(event) => updateEditing(product.id, 'name', event.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={product.editing.price}
                    onChange={(event) => updateEditing(product.id, 'price', event.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={product.editing.inStock}
                    onChange={(event) => updateEditing(product.id, 'inStock', event.target.value)}
                  />
                </td>
                <td>
                  <div className="row">
                    <button className="primary" type="button" onClick={() => handleSave(product)}>
                      Save
                    </button>
                    <button className="danger" type="button" onClick={() => handleDelete(product.id)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

export default AdminProducts;
