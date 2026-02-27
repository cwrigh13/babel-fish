const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const admin = require('firebase-admin');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Initialize Firebase Admin SDK
let serviceAccount;
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // Use default credentials from environment
    serviceAccount = undefined;
  }
} catch (error) {
  console.warn('Firebase service account key parsing failed:', error.message);
  serviceAccount = undefined;
}

try {
  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL
    });
  } else {
    // Use default credentials (useful for deployment environments like Google Cloud)
    admin.initializeApp();
  }
  console.log('Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('Firebase Admin SDK initialization failed:', error);
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API routes
app.get('/api/phrases', async (req, res) => {
  try {
    const db = admin.firestore();
    const phrasesSnapshot = await db.collection('phrases').get();
    const phrases = [];
    phrasesSnapshot.forEach(doc => {
      phrases.push({ id: doc.id, ...doc.data() });
    });
    res.json(phrases);
  } catch (error) {
    console.error('Error fetching phrases:', error);
    res.status(500).json({ error: 'Failed to fetch phrases' });
  }
});

// Create GitHub issue (proxies to GitHub API so the PAT stays server-side)
app.post('/api/create-issue', async (req, res) => {
  const pat = process.env.GITHUB_PAT;
  if (!pat) {
    return res.status(503).json({ error: 'GitHub integration is not configured.' });
  }

  const { title, body, labels } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required.' });
  }

  try {
    const response = await fetch('https://api.github.com/repos/cwrigh13/babel-fish/issues', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${pat}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, body, labels: labels || ['user-testing'] }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error('GitHub API error:', response.status, err);
      return res.status(response.status).json({ error: err.message || 'Failed to create issue.' });
    }

    const issue = await response.json();
    res.status(201).json({ url: issue.html_url, number: issue.number });
  } catch (error) {
    console.error('Error creating GitHub issue:', error);
    res.status(500).json({ error: 'Failed to create issue.' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Babel Fish server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
