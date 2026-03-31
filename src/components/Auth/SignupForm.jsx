import React, { useState } from 'react';

const SignupForm = ({ onSubmit, onActivate, disabled }) => {
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
          Continue
        </button>
      </form>
    </div>
  );
};

export default SignupForm;
