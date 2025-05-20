/**
 * Firebase Configuration
 * 
 * This script initializes Firebase for authentication and Firestore database.
 * It gracefully handles missing configuration by falling back to local storage.
 */

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA6cEZLka442__6BCdfV__H9-7DiPPRjHU",
    authDomain: "memory-matrix-game.firebaseapp.com",
    projectId: "memory-matrix-game",
    storageBucket: "memory-matrix-game.firebasestorage.app",
    messagingSenderId: "298506260371",
    appId: "1:298506260371:web:cf63ed5ceee421b255e266",
    measurementId: "G-0J9ESR6XFF"

  };


// Initialize Firebase if configuration is valid
(function initializeFirebase() {
    // Check if the config has been updated from placeholder values
    const isValidConfig = Object.values(firebaseConfig).every(value => 
        value && !value.includes('YOUR_')
    );
    
    if (!isValidConfig) {
        console.warn('Firebase configuration is not set. Using local storage fallback. To enable online features, please update firebase-config.js with valid credentials.');
        
        // Create dummy Firebase objects to prevent errors
        window.firebase = {
            auth: () => {},
            firestore: () => {}
        };
        
        window.auth = {
            onAuthStateChanged: (callback) => callback(null),
            signInWithPopup: () => Promise.reject(new Error('Firebase not configured')),
            signOut: () => Promise.resolve(),
            currentUser: null
        };
        
        window.db = {
            collection: () => ({
                add: () => Promise.reject(new Error('Firebase not configured')),
                orderBy: () => ({
                    limit: () => ({
                        get: () => Promise.reject(new Error('Firebase not configured'))
                    })
                })
            })
        };
        
        window.googleProvider = {};
        window.facebookProvider = {};
        
        return;
    }
    
    try {
        // Initialize Firebase
        const app = firebase.initializeApp(firebaseConfig);
        window.auth = firebase.auth();
        window.db = firebase.firestore();
        
        // Initialize Auth Providers
        window.googleProvider = new firebase.auth.GoogleAuthProvider();
        window.facebookProvider = new firebase.auth.FacebookAuthProvider();
        
        console.log('Firebase initialized successfully');
    } catch (error) {
        console.error('Firebase initialization error:', error);
        alert('There was a problem connecting to online services. The game will run in offline mode.');
    }
})();