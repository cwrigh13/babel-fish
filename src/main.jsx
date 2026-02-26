import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App';
import LiveTestPage from './pages/LiveTestPage';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter basename="/babel-fish/">
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="/live-test-scenarios" element={<LiveTestPage />} />
                <Route path="/live-test-scenarios/:role" element={<LiveTestPage />} />
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
);
