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
    
    // Create a function to setup offline persistence
    const setupOfflinePersistence = (db) => {
        // Enable offline persistence where possible
        if (db && db.enablePersistence) {
            db.enablePersistence({ synchronizeTabs: true })
                .catch((err) => {
                    if (err.code === 'failed-precondition') {
                        // Multiple tabs open, persistence can only be enabled in one tab at a time
                        console.warn('Firebase persistence could not be enabled: Multiple tabs open');
                    } else if (err.code === 'unimplemented') {
                        // The current browser does not support persistence
                        console.warn('Firebase persistence not supported in this browser');
                    } else {
                        console.warn('Firebase persistence error:', err);
                    }
                });
        }
    };
    
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
            }),
            enablePersistence: () => Promise.reject(new Error('Firebase not configured'))
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
        
        // Setup offline persistence for Firestore
        setupOfflinePersistence(window.db);
        
        // Configure Firestore settings for better offline performance
        window.db.settings({
            cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
        });
        
        // Add offline event handlers
        window.addEventListener('online', () => {
            console.log('Device is online. Syncing data with Firebase...');
            // You could add specific sync logic here if needed
        });
        
        window.addEventListener('offline', () => {
            console.log('Device is offline. Using cached Firebase data.');
            // Show a user-friendly notification if needed
            if (typeof document.dispatchEvent === 'function') {
                document.dispatchEvent(new CustomEvent('showNotification', {
                    detail: {
                        message: 'You are offline. Some features may be limited.',
                        duration: 3000,
                        type: 'warning'
                    }
                }));
            }
        });
        
        // Initialize Auth Providers
        window.googleProvider = new firebase.auth.GoogleAuthProvider();
        window.facebookProvider = new firebase.auth.FacebookAuthProvider();
        
        console.log('Firebase initialized successfully');
    } catch (error) {
        console.error('Firebase initialization error:', error);
        
        // Create fallback objects to prevent errors
        if (!window.db) {
            window.db = {
                collection: () => ({
                    add: () => Promise.reject(new Error('Firebase failed to initialize')),
                    orderBy: () => ({
                        limit: () => ({
                            get: () => Promise.reject(new Error('Firebase failed to initialize'))
                        })
                    })
                })
            };
        }
        
        if (!window.auth) {
            window.auth = {
                onAuthStateChanged: (callback) => callback(null),
                signInWithPopup: () => Promise.reject(new Error('Firebase failed to initialize')),
                signOut: () => Promise.resolve(),
                currentUser: null
            };
        }
        
        // Show a user-friendly message
        alert('There was a problem connecting to online services. The game will run in offline mode.');
    }
})();