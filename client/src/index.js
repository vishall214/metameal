import React from 'react';
import ReactDOM from 'react-dom/client';
// import './index.css'; // Removed as redundant
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import './utils/axios';
import 'leaflet/dist/leaflet.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);