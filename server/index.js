const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const admin = require('firebase-admin');
const axios = require('axios');

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

// Feedback endpoint - creates GitHub issues
app.post('/api/feedback', async (req, res) => {
  try {
    const { message, pageUrl, userAgent, scenario } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Feedback message is required' });
    }

    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_REPO_OWNER || 'grlibraries';
    const repo = process.env.GITHUB_REPO_NAME || 'babel-fish';

    if (!token) {
      console.error('GITHUB_TOKEN not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const timestamp = new Date().toISOString();
    const issueTitle = `User Feedback - ${scenario || 'General'} (${timestamp.split('T')[0]})`;
    const issueBody = `## Feedback

${message}

---

**Context:**
- **Page/Scenario:** ${scenario || 'N/A'}
- **URL:** ${pageUrl || 'N/A'}
- **Timestamp:** ${timestamp}
- **User Agent:** ${userAgent || 'N/A'}
`;

    const response = await axios.post(
      `https://api.github.com/repos/${owner}/${repo}/issues`,
      {
        title: issueTitle,
        body: issueBody,
        labels: ['user-feedback', 'live-test']
      },
      {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'babel-fish-feedback'
        }
      }
    );

    res.json({
      success: true,
      issueUrl: response.data.html_url,
      issueNumber: response.data.number
    });
  } catch (error) {
    console.error('Error creating GitHub issue:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to submit feedback',
      details: error.response?.data?.message || error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Babel Fish server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
