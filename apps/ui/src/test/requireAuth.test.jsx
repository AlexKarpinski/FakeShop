import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import RequireAuth from '../auth/RequireAuth';

describe('RequireAuth', () => {
  it('redirects to /login when token is missing', () => {
    localStorage.removeItem('token');

    render(
      <MemoryRouter initialEntries={['/cart']}>
        <Routes>
          <Route
            path="/cart"
            element={
              <RequireAuth>
                <div>Cart Page</div>
              </RequireAuth>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });
});
