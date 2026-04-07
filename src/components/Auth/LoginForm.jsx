import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { isGoogleOAuthConfigured } from '../../utils/auth';

const LoginForm = ({ onSubmit, isLoading, onGoogleSuccess, onGoogleError }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const showGoogleLogin = isGoogleOAuthConfigured(import.meta.env.VITE_GOOGLE_CLIENT_ID);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({ email, password });
  };

  return (
    <div className="form-card">
      <div className="form-heading">
        <h2>Sign In</h2>
        <p>Use your account credentials to continue.</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            value={email}
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
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            required
          />
        </label>

        <button className="primary-btn" type="submit" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>

        {showGoogleLogin ? (
          <>
            <p className="auth-form-separator">or continue with Google</p>

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
          </>
        ) : null}
      </form>
    </div>
  );
};

export default LoginForm;
