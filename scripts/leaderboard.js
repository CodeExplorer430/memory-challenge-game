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
            const localData = JSON.parse(localStorage.getItem('memoryMatrixLeaderboard') || "[]");
            console.log("Local Storage Contents:", localData); // Debug line
            return localData;
        } catch (e) {
            console.error("Local storage parse error:", e);
            return [];
        }
    }
    
    // Load leaderboard from Firebase
    async function loadFirebaseLeaderboard() {
        try {
            if (typeof db === 'undefined') return [];
            
            const querySnapshot = await db.collection('scores')
                .orderBy('score', 'desc')
                .limit(100)
                .get();

            return querySnapshot.docs.map(doc => ({
                ...doc.data(),
                online: true,
                timestamp: doc.data().timestamp?.toDate().getTime() || Date.now()
            }));
        } catch (error) {
            console.error("Firebase load error:", error);
            return [];
        }
    }
    
    // Merge local and Firebase leaderboards
    function mergeLeaderboards(localScores, firebaseScores) {
        // Normalize data formats
        const normalize = (entry) => ({
            name: entry.name || "Anonymous",
            score: Number(entry.score) || 0,
            difficulty: entry.difficulty || "easy",
            date: entry.date || new Date().toLocaleDateString("en-GB"),
            online: !!entry.online
        });

        return [...localScores.map(normalize), ...firebaseScores.map(normalize)]
            .sort((a, b) => b.score - a.score || b.timestamp - a.timestamp)
            .filter((v, i, a) => a.findIndex(t => t.name === v.name && t.score === v.score) === i) // Remove duplicates
            .slice(0, 100);
    }
    
    // Display the leaderboard in the UI
    function displayLeaderboard(leaderboard) {
        if (!leaderboardBody) return;
        
        if (!leaderboard || leaderboard.length === 0) {
            leaderboardBody.innerHTML = '<tr><td colspan="5" class="text-center">No scores yet. Be the first to play!</td></tr>';
            return;
        }
        
        // Debug log to check leaderboard data
        console.log("Displaying leaderboard with", leaderboard.length, "entries:", leaderboard);
        
        // Clear existing content first
        leaderboardBody.innerHTML = '';
        
        // Add each score row
        leaderboard.forEach((entry, index) => {
            const row = document.createElement('tr');
            if (entry.online) row.classList.add('online-score');
            
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${entry.name || 'Anonymous'}</td>
                <td>${Number(entry.score)}</td>
                <td>${entry.difficulty || 'easy'}</td>
                <td>${entry.date || new Date().toLocaleDateString()}</td>
            `;
            
            leaderboardBody.appendChild(row);
        });
    }
        
    // Add periodic refresh
    setInterval(loadLeaderboard, 30000); // Refresh every 30 seconds
});