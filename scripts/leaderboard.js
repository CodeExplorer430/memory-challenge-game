document.addEventListener('DOMContentLoaded', () => {
    const leaderboardBody = document.getElementById('globalLeaderboard');
    const signOutDisplay = document.getElementById('currentUser');
    
    // Check for authentication state on load
    checkAuthState();
    
    // Load leaderboard from both local storage and Firebase (if available)
    loadLeaderboard();
    
    // Authentication state listener
    function checkAuthState() {
        if (typeof auth !== 'undefined') {
            auth.onAuthStateChanged(user => {
                updateUIForAuthState(user);
            });
        } else {
            // If Firebase auth is not available, show only local storage leaderboard
            console.warn('Firebase auth not available, using local storage only');
            document.querySelectorAll('.firebase-auth-only').forEach(el => {
                el.style.display = 'none';
            });
        }
    }
    
    // Update UI based on authentication state
    function updateUIForAuthState(user) {
        const loginButtons = document.querySelectorAll('.auth-login-btn');
        const logoutBtn = document.getElementById('logoutBtn');
        
        if (user) {
            // User is signed in
            loginButtons.forEach(btn => btn.classList.add('d-none'));
            logoutBtn.classList.remove('d-none');
            
            // Display user info
            if (signOutDisplay) {
                signOutDisplay.textContent = `Signed in as: ${user.displayName || user.email || 'User'}`;
                signOutDisplay.classList.remove('d-none');
            }
            
            // Refresh leaderboard to include online scores
            loadLeaderboard();
        } else {
            // User is signed out
            loginButtons.forEach(btn => btn.classList.remove('d-none'));
            if (logoutBtn) logoutBtn.classList.add('d-none');
            if (signOutDisplay) signOutDisplay.classList.add('d-none');
        }
    }
    
    // Load and display the leaderboard
    function loadLeaderboard() {
        // First load local leaderboard
        const localLeaderboard = loadLocalLeaderboard();
        
        // Then try to load Firebase leaderboard and merge
        loadFirebaseLeaderboard()
            .then(firebaseLeaderboard => {
                const mergedLeaderboard = mergeLeaderboards(localLeaderboard, firebaseLeaderboard);
                displayLeaderboard(mergedLeaderboard);
            })
            .catch(error => {
                console.warn('Failed to load online leaderboard:', error);
                // If Firebase fails, just display local leaderboard
                displayLeaderboard(localLeaderboard);
            });
    }
    
    // Load leaderboard from local storage
    function loadLocalLeaderboard() {
        try {
            return JSON.parse(localStorage.getItem('memoryMatrixLeaderboard')) || [];
        } catch (e) {
            console.error('Error loading local leaderboard:', e);
            return [];
        }
    }
    
    // Load leaderboard from Firebase
    function loadFirebaseLeaderboard() {
        return new Promise((resolve, reject) => {
            if (typeof db === 'undefined') {
                return resolve([]);
            }
            
            db.collection('scores')
                .orderBy('score', 'desc')
                .limit(100)
                .get()
                .then(querySnapshot => {
                    const firebaseScores = [];
                    querySnapshot.forEach(doc => {
                        const data = doc.data();
                        firebaseScores.push({
                            name: data.name || 'Anonymous',
                            score: data.score,
                            difficulty: data.difficulty,
                            date: new Date(data.timestamp?.toDate() || Date.now()).toLocaleDateString(),
                            online: true
                        });
                    });
                    resolve(firebaseScores);
                })
                .catch(error => {
                    console.error('Leaderboard fetch error:', error);
                    reject(error);
                });
        });
    }
    
    // Merge local and Firebase leaderboards
    function mergeLeaderboards(localScores, firebaseScores) {
        // Add a source flag to local scores
        const flaggedLocalScores = localScores.map(score => ({
            ...score,
            online: false
        }));
        
        // Combine, sort by score, and take top 100
        return [...flaggedLocalScores, ...firebaseScores]
            .sort((a, b) => b.score - a.score)
            .slice(0, 100);
    }
    
    // Display the leaderboard in the UI
    function displayLeaderboard(leaderboard) {
        if (!leaderboardBody) return;
        
        if (leaderboard.length === 0) {
            leaderboardBody.innerHTML = '<tr><td colspan="5" class="text-center">No scores yet. Be the first to play!</td></tr>';
            return;
        }
        
        leaderboardBody.innerHTML = leaderboard
            .map((entry, index) => `
                <tr${entry.online ? ' class="online-score"' : ''}>
                    <td>${index + 1}</td>
                    <td>${entry.name}</td>
                    <td>${entry.score}</td>
                    <td>${entry.difficulty}</td>
                    <td>${entry.date}</td>
                </tr>
            `).join('');
    }
    
    // Add periodic refresh
    setInterval(loadLeaderboard, 30000); // Refresh every 30 seconds
});