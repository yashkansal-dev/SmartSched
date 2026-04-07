import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { isGoogleOAuthConfigured } from '../../utils/auth';

const SignupForm = ({ onSubmit, disabled, onGoogleSuccess, onGoogleError }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const showGoogleLogin = isGoogleOAuthConfigured(import.meta.env.VITE_GOOGLE_CLIENT_ID);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({ name, email, password });
  };

  return (
    <div className="form-card">
      <div className="form-heading">
        <h2>Create Account</h2>
        <p>Register with Google or your email.</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Name
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Jane Doe"
            required
          />
        </label>

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="jane@campus.edu"
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Create a strong password"
            required
          />
        </label>

        <button className="primary-btn" type="submit" disabled={disabled}>
          Sign Up
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

export default SignupForm;
