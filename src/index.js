import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './services/authService';
import 'react-toastify/dist/ReactToastify.css';

// Validate required environment variables
const requiredEnv = ['REACT_APP_API_URL', 'REACT_APP_API_KEY', 'REACT_APP_API_SECRET'];
const missing = requiredEnv.filter(key => {
  const val = process.env[key];
  return !val || val.includes('REPLACE') || val.includes('YOUR_');
});

if (missing.length > 0) {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <div style={{ fontFamily: 'system-ui', maxWidth: 600, margin: '80px auto', padding: 32, background: '#FEF2F2', borderRadius: 12, border: '1px solid #FECACA' }}>
      <h2 style={{ color: '#DC2626', marginTop: 0 }}>Configuration Required</h2>
      <p style={{ color: '#7F1D1D' }}>The following environment variables are missing or not configured:</p>
      <ul style={{ color: '#991B1B' }}>
        {missing.map(key => <li key={key}><code>{key}</code></li>)}
      </ul>
      <p style={{ color: '#7F1D1D', marginBottom: 8 }}>To fix this:</p>
      <ol style={{ color: '#7F1D1D' }}>
        <li>Copy <code>.env.example</code> to <code>.env</code></li>
        <li>Get your API Key and Secret from <a href="https://sakhaglobal.com" target="_blank" rel="noreferrer">sakhaglobal.com</a></li>
        <li>Fill in the values and restart the dev server</li>
      </ol>
    </div>
  );
} else {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, refetchOnWindowFocus: false },
    },
  });

  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <App />
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} closeOnClick draggable pauseOnHover />
          </AuthProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
}
