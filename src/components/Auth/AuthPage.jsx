import React, { useMemo, useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../contexts/AuthContext';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import RoleModal from './RoleModal';
import './AuthPage.css';

const AuthPage = () => {
  const { login, googleLogin } = useAuth();

  const [activePanel, setActivePanel] = useState('none');
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [signupDraft, setSignupDraft] = useState(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [signupNotice, setSignupNotice] = useState('');

  const panelClassName = useMemo(() => {
    if (activePanel === 'login') return 'auth-panels show-login';
    if (activePanel === 'signup') return 'auth-panels show-signup';
    return 'auth-panels';
  }, [activePanel]);

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
        <div className="auth-brand-row">
          <img src="/logo.png" alt="SmartSched logo" className="auth-logo" />
          <div>
            <h1>SmartSched</h1>
            <p>AI-powered academic scheduling made elegant.</p>
          </div>
        </div>

        <div className="auth-toggle" role="tablist" aria-label="Choose authentication mode">
          <button
            type="button"
            className={activePanel === 'signup' ? 'is-active' : ''}
            onClick={() => setActivePanel('signup')}
          >
            Signup
          </button>
          <button
            type="button"
            className={activePanel === 'login' ? 'is-active' : ''}
            onClick={() => setActivePanel('login')}
          >
            Login
          </button>
        </div>

        {signupNotice && <p className="auth-notice">{signupNotice}</p>}
        {authError && <p className="auth-error">{authError}</p>}

        <div className={panelClassName}>
          <section
            className="auth-panel signup-panel"
            onClick={() => setActivePanel('signup')}
          >
            <SignupForm
              onSubmit={handleSignupStepOne}
              onActivate={() => setActivePanel('signup')}
              disabled={isLoading}
            />
          </section>

          <section
            className="auth-panel login-panel"
            onClick={() => setActivePanel('login')}
          >
            <LoginForm
              onSubmit={handleLogin}
              onActivate={() => setActivePanel('login')}
              isLoading={isLoading}
            />
          </section>

          <aside className="auth-overlay-panel" aria-hidden="true">
            <div className="auth-overlay-content">
              <img src="/logo.png" alt="" className="auth-overlay-logo" />
              <h3>SmartSched</h3>
              <p>Plan smarter. Publish faster.</p>
            </div>
          </aside>
        </div>

        <footer className="auth-footer-google">
          <p>or continue with</p>
          <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setAuthError('Google sign-in failed.')} />
        </footer>
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
