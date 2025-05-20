/**
 * Fixed Authentication Manager
 * 
 * Handles user authentication with various providers and local storage
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize auth elements
    const googleLoginBtns = document.querySelectorAll('[id$="GoogleLogin"]'); // Any button ending with GoogleLogin
    const facebookLoginBtns = document.querySelectorAll('[id$="FacebookLogin"]'); // Any button ending with FacebookLogin
    const logoutBtns = document.querySelectorAll('[id$="logoutBtn"]'); // Any button ending with logoutBtn
    const currentUserElements = document.querySelectorAll('.current-user');
    const localLoginForms = document.querySelectorAll('#localLoginForm, [id$="localNameForm"]');
    const saveLocalNameBtn = document.getElementById('saveLocalName');
    
    // Check if Firebase is available
    const isFirebaseAvailable = typeof firebase !== 'undefined' && 
                               typeof auth !== 'undefined' && 
                               typeof googleProvider !== 'undefined';
    
    // Authentication State Manager
    const authManager = {
        init() {
            // Check if a local player name is already set
            const localName = localStorage.getItem('playerName');
            if (localName) {
                this.updateUIForLocalUser(localName);
            }
            
            if (!isFirebaseAvailable) {
                console.warn('Firebase not available. Using local authentication only.');
                this.setupLocalAuth();
                return;
            }
            
            // Set up Firebase auth
            this.setupFirebaseAuth();
            
            // Set up event listeners
            this.setupEventListeners();
        },
        
        setupLocalAuth() {
            // Hide Firebase-specific elements
            document.querySelectorAll('.firebase-only').forEach(el => {
                el.classList.add('d-none');
            });
            
            // Show local auth elements
            document.querySelectorAll('.local-auth-only').forEach(el => {
                el.classList.remove('d-none');
            });
            
            // Set up all local auth forms
            localLoginForms.forEach(form => {
                if (form) {
                    form.addEventListener('submit', (e) => {
                        e.preventDefault();
                        const input = form.querySelector('input');
                        if (input && input.value.trim()) {
                            localStorage.setItem('playerName', input.value.trim());
                            this.updateUIForLocalUser(input.value.trim());
                            
                            // Close modal if inside one
                            const modal = form.closest('.modal');
                            if (modal && window.bootstrap && bootstrap.Modal) {
                                const modalInstance = bootstrap.Modal.getInstance(modal);
                                if (modalInstance) {
                                    modalInstance.hide();
                                }
                            }
                        }
                    });
                }
            });
            
            // Set up save local name button
            if (saveLocalNameBtn) {
                saveLocalNameBtn.addEventListener('click', () => {
                    const localUsername = document.getElementById('localUsername');
                    if (localUsername && localUsername.value.trim()) {
                        localStorage.setItem('playerName', localUsername.value.trim());
                        this.updateUIForLocalUser(localUsername.value.trim());
                        
                        // Show confirmation
                        this.showNotification('Name saved successfully!');
                        
                        // Close modal if inside one
                        const modal = saveLocalNameBtn.closest('.modal');
                        if (modal && window.bootstrap && bootstrap.Modal) {
                            const modalInstance = bootstrap.Modal.getInstance(modal);
                            if (modalInstance) {
                                modalInstance.hide();
                            }
                        }
                    }
                });
            }
            
            // Set up all name inputs to match current value
            document.querySelectorAll('#localUsername, #localNameInput, #playerNameInput').forEach(input => {
                if (input) {
                    input.value = localStorage.getItem('playerName') || '';
                }
            });
            
            // Set up all "Set Name" buttons
            document.querySelectorAll('[id$="SetName"], [id$="SaveName"]').forEach(btn => {
                if (btn) {
                    btn.addEventListener('click', () => {
                        // Find the closest input
                        const input = btn.closest('form')?.querySelector('input') || 
                                      btn.previousElementSibling ||
                                      document.getElementById('localNameInput') || 
                                      document.getElementById('playerNameInput');
                        
                        if (input && input.value.trim()) {
                            localStorage.setItem('playerName', input.value.trim());
                            this.updateUIForLocalUser(input.value.trim());
                            
                            // Show confirmation
                            this.showNotification('Name saved successfully!');
                        }
                    });
                }
            });
        },
        
        setupFirebaseAuth() {
            // Listen for auth state changes
            auth.onAuthStateChanged(user => {
                this.updateUIForAuthState(user);
            });
        },
        
        setupEventListeners() {
            // Google Login
            googleLoginBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    if (!isFirebaseAvailable) {
                        this.showNotification('Firebase is not configured. Please use the local authentication option.');
                        return;
                    }
                    
                    auth.signInWithPopup(googleProvider)
                        .catch(error => {
                            console.error('Google login error:', error);
                            this.showNotification(`Login failed: ${error.message}`);
                        });
                });
            });
            
            // Facebook Login
            facebookLoginBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    if (!isFirebaseAvailable) {
                        this.showNotification('Firebase is not configured. Please use the local authentication option.');
                        return;
                    }
                    
                    auth.signInWithPopup(facebookProvider)
                        .catch(error => {
                            console.error('Facebook login error:', error);
                            this.showNotification(`Login failed: ${error.message}`);
                        });
                });
            });
            
            // Logout
            logoutBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    if (isFirebaseAvailable && auth.currentUser) {
                        auth.signOut()
                            .catch(error => console.error('Logout error:', error));
                    } else {
                        localStorage.removeItem('playerName');
                        this.updateUIForLocalUser(null);
                        this.showNotification('You have been signed out.');
                    }
                });
            });
        },
        
        updateUIForAuthState(user) {
            const isLoggedIn = !!user;
            
            // Update login/logout button visibility
            document.querySelectorAll('.auth-buttons').forEach(div => {
                if (isLoggedIn) {
                    div.classList.add('logged-in');
                } else {
                    div.classList.remove('logged-in');
                }
            });
            
            // Update logout buttons
            logoutBtns.forEach(btn => {
                if (isLoggedIn) {
                    btn.classList.remove('d-none');
                } else {
                    btn.classList.add('d-none');
                }
            });
            
            // Update login buttons
            googleLoginBtns.forEach(btn => {
                if (isLoggedIn) {
                    btn.classList.add('d-none');
                } else {
                    btn.classList.remove('d-none');
                }
            });
            
            facebookLoginBtns.forEach(btn => {
                if (isLoggedIn) {
                    btn.classList.add('d-none');
                } else {
                    btn.classList.remove('d-none');
                }
            });
            
            // Update user display
            currentUserElements.forEach(el => {
                if (isLoggedIn) {
                    el.textContent = `Signed in as: ${user.displayName || user.email || 'Anonymous'}`;
                    el.classList.remove('d-none');
                } else {
                    el.classList.add('d-none');
                }
            });
            
            // Store user display name in localStorage for offline use
            if (user && user.displayName) {
                localStorage.setItem('playerName', user.displayName);
            }
            
            // Hide local auth forms when logged in
            localLoginForms.forEach(form => {
                if (form) {
                    form.classList.toggle('d-none', isLoggedIn);
                }
            });
        },
        
        updateUIForLocalUser(username) {
            const isLoggedIn = !!username;
            
            // Hide login form if logged in
            localLoginForms.forEach(form => {
                if (form) {
                    form.classList.toggle('d-none', isLoggedIn);
                }
            });
            
            // Update logout buttons
            document.querySelectorAll('.local-logout-btn, [id$="logoutBtn"]').forEach(btn => {
                if (isLoggedIn) {
                    btn.classList.remove('d-none');
                } else {
                    btn.classList.add('d-none');
                }
            });
            
            // Update user display
            document.querySelectorAll('.local-user-display, .current-user').forEach(el => {
                if (isLoggedIn) {
                    el.textContent = `Playing as: ${username}`;
                    el.classList.remove('d-none');
                } else {
                    el.classList.add('d-none');
                }
            });
            
            // Update all name inputs
            document.querySelectorAll('#localUsername, #localNameInput, #playerNameInput').forEach(input => {
                if (input) {
                    input.value = username || '';
                }
            });
        },
        
        // Show notification
        showNotification(message, duration = 3000) {
            // Check if there's a custom event available
            if (typeof CustomEvent === 'function') {
                const event = new CustomEvent('showNotification', {
                    detail: {
                        message: message,
                        duration: duration
                    }
                });
                document.dispatchEvent(event);
                return;
            }
            
            // Fallback notification
            let notification = document.querySelector('.notification');
            
            if (!notification) {
                notification = document.createElement('div');
                notification.className = 'notification';
                document.body.appendChild(notification);
            }
            
            notification.textContent = message;
            notification.style.display = 'block';
            
            // Clear any existing timeout
            if (notification.timeout) {
                clearTimeout(notification.timeout);
            }
            
            // Auto-hide after duration
            notification.timeout = setTimeout(() => {
                notification.classList.add('fade-out');
                setTimeout(() => {
                    notification.classList.remove('fade-out');
                    notification.style.display = 'none';
                }, 500);
            }, duration);
        },
        
        // Get current user info (works with both Firebase and local)
        getCurrentUser() {
            if (isFirebaseAvailable && auth.currentUser) {
                return {
                    name: auth.currentUser.displayName || auth.currentUser.email || 'Anonymous',
                    uid: auth.currentUser.uid,
                    isFirebase: true
                };
            } else {
                const localName = localStorage.getItem('playerName');
                if (localName) {
                    return {
                        name: localName,
                        uid: null,
                        isFirebase: false
                    };
                } else {
                    return null;
                }
            }
        }
    };
    
    // Initialize auth manager
    authManager.init();
    
    // Make auth manager available globally
    window.authManager = authManager;
});