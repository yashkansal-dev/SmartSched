import React, { useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import RoleModal from './RoleModal';
import './AuthPage.css';

const AuthPage = () => {
  const { login, googleLogin } = useAuth();

  const [activePanel, setActivePanel] = useState('login');
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
        {signupNotice && <p className="auth-notice">{signupNotice}</p>}
        {authError && <p className="auth-error">{authError}</p>}

        <div className={panelClassName}>
          <section className="auth-panel signup-panel">
            <SignupForm
              onSubmit={handleSignupStepOne}
              onActivate={() => setActivePanel('signup')}
              disabled={isLoading}
              onGoogleSuccess={handleGoogleSuccess}
              onGoogleError={() => setAuthError('Google sign-in failed.')}
            />
          </section>

          <section className="auth-panel login-panel">
            <LoginForm
              onSubmit={handleLogin}
              onActivate={() => setActivePanel('login')}
              isLoading={isLoading}
              onGoogleSuccess={handleGoogleSuccess}
              onGoogleError={() => setAuthError('Google sign-in failed.')}
            />
          </section>

          <aside className="auth-overlay-panel">
            <div className="auth-overlay-content">
              <img src="/logo.png" alt="" className="auth-overlay-logo" />
              <h3>SmartSched</h3>
              <p>AI-powered academic scheduling made elegant.</p>
              <span>Plan smarter. Publish faster.</span>
              <small>{activePanel === 'login' ? 'Hello, Friend!' : 'Welcome Back!'}</small>
              <button
                type="button"
                className="overlay-toggle-btn"
                onClick={() => setActivePanel(activePanel === 'login' ? 'signup' : 'login')}
              >
                {activePanel === 'login' ? 'SIGN UP' : 'SIGN IN'}
              </button>
            </div>
          </aside>
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
