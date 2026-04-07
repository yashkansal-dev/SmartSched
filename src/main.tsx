import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.tsx';
import './index.css';
import { isGoogleOAuthConfigured } from './utils/auth';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const hasGoogleClientId = isGoogleOAuthConfigured(googleClientId);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {hasGoogleClientId ? (
      <GoogleOAuthProvider clientId={googleClientId}>
        <App />
      </GoogleOAuthProvider>
    ) : (
      <App />
    )}
  </StrictMode>
);
