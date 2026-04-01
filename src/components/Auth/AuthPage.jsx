import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import RoleModal from './RoleModal';
import './AuthPage.css';

const AuthPage = () => {
  const { login, googleLogin } = useAuth();

  const [activePanel, setActivePanel] = useState('signup');
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [signupDraft, setSignupDraft] = useState(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [signupNotice, setSignupNotice] = useState('');

  const isSignup = activePanel === 'signup';
  const panelHeading = isSignup ? 'Welcome Back!' : 'Hello, new to SmartSched?';
  const panelMessage = isSignup
    ? 'Sign in to continue managing schedules smarter, publishing faster, and keeping your campus on track.'
    : 'Create your account and get AI-powered timetables, conflict-free scheduling, and faster academic planning.';

  const handleLogin = async ({ email, password }) => {
    setIsLoading(true);
    setAuthError('');

    try {
      await login(email, password);
    } catch (error) {
      setAuthError('Unable to sign in right now. Please try again.');
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      setAuthError('Google sign-in did not return a credential.');
      return;
    }

    setIsLoading(true);
    setAuthError('');

    try {
      await googleLogin(credentialResponse.credential);
    } catch (error) {
      setAuthError('Google sign-in failed. Please try again.');
      console.error('Google login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupStepOne = (formData) => {
    setSignupDraft(formData);
    setIsRoleModalOpen(true);
    setActivePanel('signup');
    setSignupNotice('');
  };

  const handleRoleSelect = (role) => {
    setIsRoleModalOpen(false);
    setSignupNotice(`Great choice! ${signupDraft?.name || 'Your account'} is set up as ${role}. Please log in to continue.`);
    setActivePanel('login');
  };

  return (
    <div className="auth-page">
      <div className="auth-card-shell">
        {signupNotice && <p className="auth-notice">{signupNotice}</p>}
        {authError && <p className="auth-error">{authError}</p>}

        <div className={`auth-split-card ${isSignup ? '' : 'panel-right'}`}>
          <aside className="auth-welcome-panel">
            <div className="auth-welcome-content">
              <img src="/logo.png" alt="SmartSched logo" className="auth-overlay-logo" />
              <h3>{panelHeading}</h3>
              <p>{panelMessage}</p>
              <button
                type="button"
                className="overlay-toggle-btn"
                onClick={() => setActivePanel(isSignup ? 'login' : 'signup')}
              >
                {isSignup ? 'SIGN IN' : 'SIGN UP'}
              </button>
            </div>
          </aside>

          <section className="auth-form-panel">
            {isSignup ? (
              <SignupForm
                onSubmit={handleSignupStepOne}
                disabled={isLoading}
                onGoogleSuccess={handleGoogleSuccess}
                onGoogleError={() => setAuthError('Google sign-in failed.')}
              />
            ) : (
              <LoginForm
                onSubmit={handleLogin}
                isLoading={isLoading}
                onGoogleSuccess={handleGoogleSuccess}
                onGoogleError={() => setAuthError('Google sign-in failed.')}
              />
            )}
          </section>
        </div>
      </div>

      <RoleModal
        open={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        onSelectRole={handleRoleSelect}
      />
    </div>
  );
};

export default AuthPage;
