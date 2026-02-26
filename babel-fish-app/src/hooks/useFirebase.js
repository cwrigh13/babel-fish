import { useState, useEffect } from 'react';
import firebaseService from '../services/firebase';

export const useFirebase = () => {
  const [user, setUser] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        const currentUser = await firebaseService.initialize();
        setUser(currentUser);
        setIsInitialized(true);
      } catch (err) {
        setError(err.message);
        setIsInitialized(true);
      }
    };

    initializeFirebase();
  }, []);

  const addDocument = async (collectionName, data) => {
    try {
      return await firebaseService.addDocument(collectionName, data);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const subscribeToCollection = (collectionName, callback) => {
    return firebaseService.subscribeToCollection(collectionName, callback);
  };

  const getDocuments = async (collectionName) => {
    try {
      return await firebaseService.getDocuments(collectionName);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logConversation = async (phraseId, userType) => {
    try {
      await firebaseService.logConversation(phraseId, userType);
    } catch (err) {
      setError(err.message);
    }
  };

  return {
    user,
    isInitialized,
    error,
    addDocument,
    subscribeToCollection,
    getDocuments,
    logConversation,
  };
}; 