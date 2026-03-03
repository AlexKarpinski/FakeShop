import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { clearToken, decodeToken, isLoggedIn } from '../auth/auth';

const DEFAULT_FILTERS = {
  q: '',
  minPrice: '',
  maxPrice: '',
  onlyInStock: false,
  sort: 'createdAt',
  order: 'desc',
};

function readFilters(searchParams) {
  const sort = searchParams.get('sort');
  const order = searchParams.get('order');

  return {
    q: searchParams.get('q') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    onlyInStock: searchParams.get('inStockMin') === '1',
    sort: sort === 'price' || sort === 'name' || sort === 'createdAt' ? sort : DEFAULT_FILTERS.sort,
    order: order === 'asc' || order === 'desc' ? order : DEFAULT_FILTERS.order,
  };
}

function buildSearchParams(filters) {
  const params = new URLSearchParams();

  if (filters.q.trim()) {
    params.set('q', filters.q.trim());
  }

  if (filters.minPrice !== '') {
    params.set('minPrice', filters.minPrice);
  }

  if (filters.maxPrice !== '') {
    params.set('maxPrice', filters.maxPrice);
  }

  if (filters.onlyInStock) {
    params.set('inStockMin', '1');
  }

  if (filters.sort !== DEFAULT_FILTERS.sort) {
    params.set('sort', filters.sort);
  }

  if (filters.order !== DEFAULT_FILTERS.order) {
    params.set('order', filters.order);
  }

  return params;
}

function Products() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const authInfo = decodeToken();
  const isAdmin = authInfo?.role === 'admin';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [filters, setFilters] = useState(() => readFilters(searchParams));

  const queryString = useMemo(() => searchParams.toString(), [searchParams]);

  useEffect(() => {
    setFilters(readFilters(searchParams));
  }, [searchParams]);

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      setLoading(true);
      setError('');

      try {
        const path = queryString ? `/products?${queryString}` : '/products';
        const data = await apiFetch(path, { auth: false });
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
  }, [queryString]);

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

      const path = queryString ? `/products?${queryString}` : '/products';
      const refreshed = await apiFetch(path, { auth: false });
      setProducts(Array.isArray(refreshed) ? refreshed : []);

      setMessage('Added');
    } catch (err) {
      setError(err.message);
    }
  }

  function handleLogout() {
    clearToken();
    setMessage('Logged out');
  }

  function updateFilter(name, value) {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleApply(event) {
    event.preventDefault();
    setMessage('');
    setError('');
    setSearchParams(buildSearchParams(filters));
  }

  function handleReset() {
    setFilters(DEFAULT_FILTERS);
    setMessage('');
    setError('');
    setSearchParams(new URLSearchParams());
  }

  return (
    <section className="page-card">
      <div className="page-header">
        <h2>Products</h2>
        <div className="row">
          <Link to="/cart">Go to cart</Link>
          {isAdmin ? <Link to="/admin/products">Admin</Link> : null}
          {isLoggedIn() ? (
            <button type="button" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <>
              <Link to="/signup">Sign up</Link>
              <Link to="/login">Login</Link>
            </>
          )}
        </div>
      </div>

      <form className="filters-form" onSubmit={handleApply}>
        <div className="filters-grid">
          <label className="filters-field">
            Search
            <input
              type="text"
              value={filters.q}
              onChange={(event) => updateFilter('q', event.target.value)}
              placeholder="Product name"
            />
          </label>

          <label className="filters-field">
            Min price
            <input
              type="number"
              min="0"
              step="0.01"
              value={filters.minPrice}
              onChange={(event) => updateFilter('minPrice', event.target.value)}
            />
          </label>

          <label className="filters-field">
            Max price
            <input
              type="number"
              min="0"
              step="0.01"
              value={filters.maxPrice}
              onChange={(event) => updateFilter('maxPrice', event.target.value)}
            />
          </label>

          <label className="filters-field">
            Sort
            <select value={filters.sort} onChange={(event) => updateFilter('sort', event.target.value)}>
              <option value="createdAt">createdAt</option>
              <option value="price">price</option>
              <option value="name">name</option>
            </select>
          </label>

          <label className="filters-field">
            Order
            <select value={filters.order} onChange={(event) => updateFilter('order', event.target.value)}>
              <option value="desc">desc</option>
              <option value="asc">asc</option>
            </select>
          </label>

          <label className="filters-checkbox">
            <input
              type="checkbox"
              checked={filters.onlyInStock}
              onChange={(event) => updateFilter('onlyInStock', event.target.checked)}
            />
            Only in stock
          </label>
        </div>

        <div className="row">
          <button className="primary" type="submit">
            Apply
          </button>
          <button type="button" onClick={handleReset}>
            Reset
          </button>
        </div>
      </form>

      {message ? <p className="message ok">{message}</p> : null}
      {error ? <p className="message error">{error}</p> : null}

      {loading ? (
        <p>Loading products...</p>
      ) : products.length === 0 ? (
        <p>No products found.</p>
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
