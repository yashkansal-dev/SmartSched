import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';

const SignupForm = ({ onSubmit, onActivate, disabled, onGoogleSuccess, onGoogleError }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({ name, email, password });
  };

  return (
    <div className="form-card">
      <div className="form-heading">
        <h2>Create account</h2>
        <p>Start with basic details, then pick your role.</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Name
          <input
            type="text"
            value={name}
            onFocus={onActivate}
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
            onFocus={onActivate}
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
            onFocus={onActivate}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Create a strong password"
            required
          />
        </label>

        <button className="primary-btn" type="submit" disabled={disabled}>
          Sign Up
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

export default SignupForm;
