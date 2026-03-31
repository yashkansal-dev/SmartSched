import React, { useState } from 'react';

const LoginForm = ({ onSubmit, onActivate, isLoading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({ email, password });
  };

  return (
    <div className="form-card">
      <div className="form-heading">
        <h2>Welcome back</h2>
        <p>Sign in to continue managing your schedule.</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onFocus={onActivate}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@campus.edu"
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onFocus={onActivate}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            required
          />
        </label>

        <button className="primary-btn" type="submit" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
