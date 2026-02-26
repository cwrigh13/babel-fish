import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, addDoc, query, getDocs } from 'firebase/firestore';

// Ensure __app_id and __firebase_config are defined in the environment
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Firebase service class
class FirebaseService {
  constructor() {
    this.auth = auth;
    this.db = db;
    this.currentUser = null;
    this.isInitialized = false;
  }

  // Initialize Firebase and authenticate user
  async initialize() {
    try {
      // Sign in anonymously
      const userCredential = await signInAnonymously(this.auth);
      this.currentUser = userCredential.user;
      
      // Listen for auth state changes
      onAuthStateChanged(this.auth, (user) => {
        this.currentUser = user;
        this.isInitialized = true;
      });

      return this.currentUser;
    } catch (error) {
      console.error('Firebase initialization error:', error);
      throw error;
    }
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Add document to Firestore
  async addDocument(collectionName, data) {
    try {
      const docRef = await addDoc(collection(this.db, collectionName), {
        ...data,
        timestamp: new Date(),
        userId: this.currentUser?.uid || 'anonymous'
      });
      return docRef;
    } catch (error) {
      console.error('Error adding document:', error);
      throw error;
    }
  }

  // Listen to collection changes
  subscribeToCollection(collectionName, callback) {
    const q = query(collection(this.db, collectionName));
    return onSnapshot(q, (querySnapshot) => {
      const documents = [];
      querySnapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() });
      });
      callback(documents);
    });
  }

  // Get documents from collection
  async getDocuments(collectionName) {
    try {
      const q = query(collection(this.db, collectionName));
      const querySnapshot = await getDocs(q);
      const documents = [];
      querySnapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() });
      });
      return documents;
    } catch (error) {
      console.error('Error getting documents:', error);
      throw error;
    }
  }

  // Log conversation
  async logConversation(phraseId, userType) {
    try {
      await this.addDocument('conversations', {
        phraseId,
        userType,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error logging conversation:', error);
    }
  }
}

// Create and export singleton instance
const firebaseService = new FirebaseService();
export default firebaseService; 