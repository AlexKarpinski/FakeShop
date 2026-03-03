import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { setToken } from '../auth/auth';

const ADMIN_DEFAULTS = {
  email: 'admin@example.com',
  password: 'admin123',
};

const USER_DEFAULTS = {
  email: 'user@example.com',
  password: 'user123',
};

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/products';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function fillCredentials(values) {
    setEmail(values.email);
    setPassword(values.password);
    setError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: { email, password },
        auth: false,
      });

      setToken(data.token);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="page-card">
      <div className="page-header">
        <h2>Login</h2>
        <Link to="/products">Back to products</Link>
      </div>

      <div className="row" style={{ marginBottom: '12px' }}>
        <button type="button" onClick={() => fillCredentials(ADMIN_DEFAULTS)}>
          Use admin
        </button>
        <button type="button" onClick={() => fillCredentials(USER_DEFAULTS)}>
          Use user
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={6}
          />
        </label>

        <button className="primary" type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Login'}
        </button>
      </form>

      {error ? <p className="message error">{error}</p> : null}
    </section>
  );
}

export default Login;
