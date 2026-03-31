import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';

const LoginForm = ({ onSubmit, onActivate, isLoading, onGoogleSuccess, onGoogleError }) => {
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
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>

        <div className="form-google">
          <GoogleLogin
            onSuccess={onGoogleSuccess}
            onError={onGoogleError}
            theme="outline"
            size="large"
            shape="pill"
            text="continue_with"
            width="100%"
          />
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
