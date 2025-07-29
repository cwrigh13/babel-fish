import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Define global variables for Firebase config (these would normally come from environment variables)
window.__app_id = 'babel-fish-app';
window.__firebase_config = JSON.stringify({
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 