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

// Start server
app.listen(PORT, () => {
  console.log(`Babel Fish server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
