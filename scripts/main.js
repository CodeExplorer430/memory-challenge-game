/**
 * Memory Matrix Challenge - Enhanced Main Game Controller
 * 
 * This file handles the core game logic and coordinates the various game components
 * with improved responsiveness, mechanics, and accessibility.
 */

// Import game modules
import { audioManager } from './game/audio-manager.js';
import { cardGenerator } from './game/card-generator.js';
import { difficultyManager } from './game/difficulty-manager.js';
import { themeManager } from './game/theme-manager.js';
import { uiManager } from './game/ui-manager.js';
import { accessibilityManager } from './game/accessibility.js';
import { viewportSizingHelper } from './game/viewport-sizing.js';

// Use an IIFE to avoid polluting the global namespace
(function() {
    // Game state
    const gameState = {
        cards: [],
        flippedCards: [],
        matchedPairs: 0,
        totalPairs: 0,
        level: 1,
        score: 0,
        moves: 0,
        timer: null,
        timeLeft: 0,
        isProcessing: false,
        gameStatus: 'idle', // idle, countdown, playing, paused, levelup, gameover
        currentDifficulty: 'easy',
        cardType: 'color',
        highScores: {
            easy: 0,
            medium: 0,
            hard: 0
        },
        // New features
        comboCount: 0,
        comboTimer: null,
        comboMode: true,
        lastMatchTime: 0,
        pauseStartTime: 0,
        totalPauseTime: 0,
        currentLevel: {
            startTime: 0,
            initialTimeLimit: 0
        }
    };

    // Leaderboard Manager
    const leaderboardManager = {
        leaderboard: [],
        
        init() {
            this.loadLeaderboard();
        },
        
        loadLeaderboard() {
            // Load from localStorage
            const storedLeaderboard = localStorage.getItem('memoryMatrixLeaderboard');
            if (storedLeaderboard) {
                try {
                    this.leaderboard = JSON.parse(storedLeaderboard);
                } catch (e) {
                    console.error("Error parsing leaderboard data:", e);
                    this.leaderboard = [];
                }
            }
            
            // If Firebase is initialized, also load from there
            if (typeof db !== 'undefined') {
                this.loadFromFirebase();
            }
        },
        
        loadFromFirebase() {
            if (typeof db !== 'undefined') {
                db.collection('scores')
                    .orderBy('score', 'desc')
                    .limit(100)
                    .get()
                    .then(querySnapshot => {
                        // Process Firebase data here if needed
                        const firebaseScores = [];
                        querySnapshot.forEach(doc => {
                            const data = doc.data();
                            firebaseScores.push({
                                name: data.name || 'Anonymous',
                                score: data.score,
                                difficulty: data.difficulty,
                                date: new Date(data.timestamp?.toDate() || Date.now()).toLocaleDateString()
                            });
                        });
                        
                        // Merge with local scores
                        this.mergeLeaderboards(firebaseScores);
                        this.updateLeaderboardDisplay();
                    })
                    .catch(error => {
                        console.warn('Firebase leaderboard fetch failed:', error);
                        // Continue with local leaderboard if Firebase fails
                        this.updateLeaderboardDisplay();
                    });
            } else {
                this.updateLeaderboardDisplay();
            }
        },
        
        mergeLeaderboards(onlineScores) {
            // Combine local and online scores, sort, and keep top entries
            const allScores = [...this.leaderboard, ...onlineScores]
                .sort((a, b) => b.score - a.score)
                .slice(0, 100); // Keep top 100
                
            this.leaderboard = allScores;
            
            // Save back to localStorage
            localStorage.setItem('memoryMatrixLeaderboard', JSON.stringify(this.leaderboard));
        },
        
        addScore(playerName, score, difficulty) {
            // Ensure score is a number
            const numericScore = parseInt(score, 10);
            if (isNaN(numericScore)) {
                console.error("Invalid score:", score);
                return;
            }

            const newScore = {
                name: playerName && playerName.trim() ? playerName.trim() : 'Anonymous',
                score: numericScore,
                difficulty: difficulty && typeof difficulty === 'string' ? difficulty.toLowerCase() : 'easy',
                date: new Date().toLocaleDateString(),
                timestamp: Date.now()
            };
            
            // Add to local leaderboard
            this.leaderboard.push(newScore);
            
            // Sort and limit
            this.leaderboard.sort((a, b) => b.score - a.score);
            if (this.leaderboard.length > 100) {
                this.leaderboard = this.leaderboard.slice(0, 100);
            }
            
            // Save to localStorage
            localStorage.setItem('memoryMatrixLeaderboard', JSON.stringify(this.leaderboard));
            
            // If user is signed in with Firebase, save there too
            if (typeof auth !== 'undefined' && auth.currentUser) {
                try {
                    db.collection('scores').add({
                        userId: auth.currentUser.uid,
                        name: auth.currentUser.displayName || playerName,
                        score: numericScore,
                        difficulty: difficulty,
                        timestamp: firebase.firestore.FieldValue.serverTimestamp()
                    });
                } catch (err) {
                    console.warn('Failed to save score to Firebase:', err);
                }
            }
            
            // Update display if on leaderboard page
            this.updateLeaderboardDisplay();
        },
        
        updateLeaderboardDisplay() {
            const tbody = document.getElementById('leaderboardBody');
            if (!tbody) return;
            
            // Clear existing content
            tbody.innerHTML = '';
            
            if (this.leaderboard.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center">No scores yet. Be the first to play!</td></tr>';
                return;
            }
            
            // Ensure proper sorting by score (highest first)
            const sortedLeaderboard = [...this.leaderboard].sort((a, b) => b.score - a.score);
            
            // Create and append rows
            sortedLeaderboard.forEach((entry, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${entry.name || 'Anonymous'}</td>
                    <td>${entry.score}</td>
                    <td>${entry.difficulty || 'easy'}</td>
                    <td>${entry.date || new Date().toLocaleDateString()}</td>
                `;
                tbody.appendChild(row);
            });
        },

        // Filter leaderboard by difficulty
        filterByDifficulty(difficulty) {
            const tbody = document.getElementById('leaderboardBody');
            if (!tbody) return;
            
            const rows = tbody.querySelectorAll('tr');
            rows.forEach(row => {
                const difficultyCell = row.querySelector('td:nth-child(4)');
                if (difficultyCell) {
                    const rowDifficulty = difficultyCell.textContent.toLowerCase();
                    if (difficulty === 'all' || rowDifficulty === difficulty) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                }
            });
        }
    };
    
    /**
     * Initialize the game
     */
    function init() {
        // Initialize theme manager
        themeManager.init();
        
        // Initialize viewport sizing
        viewportSizingHelper.resizeGameElements();
        
        // Load high scores
        loadHighScores();
        
        // Set up event listeners
        setupEventListeners();
        
        // Create initial grid
        createGrid();
        
        // Initialize leaderboard if needed
        if (document.getElementById('leaderboardBody')) {
            leaderboardManager.init();
            setupLeaderboardFilters();
        }

        // Initialize combo mode setting
        initComboMode();
        
        // Set game status
        updateGameStatus('idle');
    }
    
    /**
     * Initialize combo mode setting
     */
    function initComboMode() {
        // Get combo mode preference from localStorage
        const savedComboMode = localStorage.getItem('comboMode');
        if (savedComboMode !== null) {
            gameState.comboMode = savedComboMode === 'true';
        }
        
        // Update checkbox in settings if it exists
        const comboModeToggle = document.getElementById('comboModeToggle');
        if (comboModeToggle) {
            comboModeToggle.checked = gameState.comboMode;
            
            // Add change event listener
            comboModeToggle.addEventListener('change', () => {
                gameState.comboMode = comboModeToggle.checked;
                localStorage.setItem('comboMode', gameState.comboMode);
            });
        }
    }
    
    /**
     * Set up leaderboard filter buttons
     */
    function setupLeaderboardFilters() {
        const filterButtons = document.querySelectorAll('.leaderboard-filter button[data-filter]');
        
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Update button states
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Apply filter
                const filter = button.dataset.filter;
                leaderboardManager.filterByDifficulty(filter);
            });
        });
    }
    
    /**
     * Load high scores from local storage
     */
    function loadHighScores() {
        gameState.highScores = {
            easy: parseInt(localStorage.getItem('memoryMatrixHighScoreEasy')) || 0,
            medium: parseInt(localStorage.getItem('memoryMatrixHighScoreMedium')) || 0,
            hard: parseInt(localStorage.getItem('memoryMatrixHighScoreHard')) || 0
        };
        
        uiManager.updateHighScores(gameState.highScores);
    }
    
    /**
     * Set up game event listeners
     */
    function setupEventListeners() {
        // Start/Reset button
        const startBtn = document.getElementById('start-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                if (gameState.gameStatus === 'idle' || gameState.gameStatus === 'gameover') {
                    startGame();
                } else {
                    resetGame();
                }
            });
        }
        
        // Pause/Resume button
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', togglePause);
            pauseBtn.classList.add('d-none'); // Hidden initially
        }
        
        // Listen for pause events
        document.addEventListener('pauseGame', () => {
            if (gameState.gameStatus === 'playing') {
                pauseGame();
            }
        });
        
        document.addEventListener('resumeGame', () => {
            if (gameState.gameStatus === 'paused') {
                resumeGame();
            }
        });
        
        // Game overlay interaction
        const overlayButton = document.getElementById('overlay-button');
        if (overlayButton) {
            overlayButton.addEventListener('click', () => {
                const overlayContainer = document.querySelector('.game-overlay-container');
                
                if (gameState.gameStatus === 'paused') {
                    // Resume game
                    resumeGame();
                    overlayContainer.classList.add('d-none');
                } else {
                    // Handle other overlay actions if needed
                    overlayContainer.classList.add('d-none');
                }
            });
        }
        
        // Card type selection
        const cardTypeSelect = document.getElementById('cardType');
        if (cardTypeSelect) {
            // Set initial value from localStorage or default
            const savedCardType = localStorage.getItem('cardType') || 'color';
            cardTypeSelect.value = savedCardType;
            gameState.cardType = savedCardType;
            
            cardTypeSelect.addEventListener('change', (e) => {
                gameState.cardType = e.target.value;
                localStorage.setItem('cardType', e.target.value);
                if (gameState.gameStatus !== 'idle' && gameState.gameStatus !== 'gameover') {
                    resetGame();
                } else {
                    createGrid();
                }
            });
        }
        
        // Handle difficulty changes
        document.addEventListener('difficultyChange', (e) => {
            gameState.currentDifficulty = e.detail.difficulty;
            if (gameState.gameStatus !== 'idle' && gameState.gameStatus !== 'gameover') {
                resetGame();
            } else {
                createGrid();
            }
        });
        
        // Handle fullscreen toggle
        const fullscreenBtn = document.getElementById('fullscreen-btn');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', toggleFullscreen);
        }
        
        // Set initial difficulty from localStorage
        gameState.currentDifficulty = localStorage.getItem('currentDifficulty') || 'easy';
        
        // Difficulty buttons
        const difficultyBtns = document.querySelectorAll('.difficulty-btn');
        difficultyBtns.forEach(btn => {
            if (btn.dataset.difficulty === gameState.currentDifficulty) {
                btn.classList.add('active');
            }
            
            btn.addEventListener('click', () => {
                // Update button states
                difficultyBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Update current difficulty
                gameState.currentDifficulty = btn.dataset.difficulty;
                localStorage.setItem('currentDifficulty', gameState.currentDifficulty);
                
                // Recreate the grid if in idle state
                if (gameState.gameStatus === 'idle' || gameState.gameStatus === 'gameover') {
                    createGrid();
                } else {
                    resetGame();
                }
                
                // Dispatch difficulty change event 
                document.dispatchEvent(new CustomEvent('difficultyChange', {
                    detail: { 
                        difficulty: gameState.currentDifficulty
                    }
                }));
            });
        });
        
        // Keyboard shortcut for pause/resume
        document.addEventListener('keydown', (e) => {
            if (e.key === 'p' || e.key === 'P') {
                if (gameState.gameStatus === 'playing' || gameState.gameStatus === 'paused') {
                    togglePause();
                    e.preventDefault();
                }
            }
        });
    }
    
    /**
     * Toggle fullscreen mode
     */
    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            // Enter fullscreen
            const gameContainer = document.querySelector('.game-container');
            if (gameContainer && gameContainer.requestFullscreen) {
                gameContainer.requestFullscreen()
                    .catch(err => {
                        uiManager.showNotification('Fullscreen not supported by your browser', 3000, 'error');
                    });
            }
        } else {
            // Exit fullscreen
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }
    
    /**
     * Create the game grid with cards
     */
    function createGrid() {
        const gameGrid = document.getElementById('game-grid');
        if (!gameGrid) return;
        
        // Show loading spinner
        uiManager.showGridLoading();
        
        // Wait for next frame to ensure the loading spinner is shown
        requestAnimationFrame(() => {
            gameGrid.innerHTML = '';
            gameState.cards = [];
            gameState.flippedCards = [];
            
            // Make sure difficultyManager is initialized
            if (!difficultyManager.settings) {
                console.error("Difficulty manager not properly initialized");
                return;
            }
            
            // Get settings for current difficulty
            const difficulty = difficultyManager.getCurrentSettings();
            
            if (!difficulty || !difficulty.levels || !difficulty.levels[0] || !difficulty.levels[0].gridSize) {
                console.error("Invalid difficulty settings");
                return;
            }
            
            // Use level 1 grid size for initial display
            const totalPairs = difficulty.levels[0].gridSize.totalPairs;
            gameState.totalPairs = totalPairs;
            
            // Update grid attribute for keyboard navigation
            const gridLayout = difficulty.levels[0].gridSize;
            gameGrid.dataset.columns = gridLayout.columns;
            gameGrid.dataset.rows = gridLayout.rows;
            
            // Generate card pairs
            const pairValues = cardGenerator.generateCardPairs(gameState.cardType, totalPairs);
            
            // Create the cards
            pairValues.forEach((value, index) => {
                const card = cardGenerator.createCardElement(value, index, gameState.cardType);
                
                // Event handling
                card.addEventListener('click', () => {
                    handleCardInteraction(card);
                });
            
                card.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    handleCardInteraction(card);
                }, { passive: false });
            
                gameGrid.appendChild(card);
                gameState.cards.push(card);
            });
            
            // Update grid CSS classes
            gameGrid.className = `grid-container ${gameState.currentDifficulty}`;
            
            // Update progress bar to zero
            updateProgressBar(0, totalPairs);
            
            // Update accessibility states for all cards
            setTimeout(() => {
                accessibilityManager.updateAllCardStates();
            }, 100);
        });
    }
    
    /**
     * Update the progress bar
     */
    function updateProgressBar(matched, total) {
        const progressBar = document.getElementById('progress-bar');
        if (!progressBar) return;
        
        const percentage = (matched / total) * 100;
        progressBar.style.width = `${percentage}%`;
        progressBar.setAttribute('aria-valuenow', percentage);
    }
    
    /**
     * Handle card interaction (click or touch)
     */
    function handleCardInteraction(card) {
        if (gameState.gameStatus !== 'playing' || 
            gameState.isProcessing || 
            card.classList.contains('flipped') || 
            card.classList.contains('matched')) {
            return;
        }

        flipCard(card);
    }
    
    /**
     * Toggle game pause state
     */
    function togglePause() {
        if (gameState.gameStatus === 'playing') {
            pauseGame();
        } else if (gameState.gameStatus === 'paused') {
            resumeGame();
        }
    }
    
    /**
     * Pause the game
     */
    function pauseGame() {
        // Only pause if currently playing
        if (gameState.gameStatus !== 'playing') return;
        
        // Store the pause start time
        gameState.pauseStartTime = Date.now();
        
        // Stop the timer
        clearInterval(gameState.timer);
        
        // Update game status
        updateGameStatus('paused');
        
        // Play pause sound
        audioManager.playPause();
        
        // Show pause overlay
        const overlayContainer = document.querySelector('.game-overlay-container');
        if (overlayContainer) {
            const overlayTitle = document.getElementById('overlay-title');
            const overlayMessage = document.getElementById('overlay-message');
            const overlayButton = document.getElementById('overlay-button');
            
            if (overlayTitle) overlayTitle.textContent = 'Game Paused';
            if (overlayMessage) overlayMessage.textContent = 'Take a breather!';
            if (overlayButton) {
                overlayButton.textContent = 'Resume Game';
                overlayButton.classList.remove('btn-danger');
                overlayButton.classList.add('btn-success');
            }
            
            overlayContainer.classList.remove('d-none');
        }
        
        // Show notification
        uiManager.showNotification('Game Paused', 2000, 'info');
        
        // Dispatch event for screen readers
        document.dispatchEvent(new CustomEvent('gameStateChange', {
            detail: {
                event: 'gamePaused',
                state: 'paused'
            }
        }));
    }
    
    /**
     * Resume the game from paused state
     */
    function resumeGame() {
        // Only resume if currently paused
        if (gameState.gameStatus !== 'paused') return;
        
        // Calculate paused duration
        const pauseDuration = Date.now() - gameState.pauseStartTime;
        gameState.totalPauseTime += pauseDuration;
        
        // Update game status
        updateGameStatus('playing');
        
        // Restart the timer
        startTimer();
        
        // Play resume sound
        audioManager.playResume();
        
        // Hide pause overlay
        const overlayContainer = document.querySelector('.game-overlay-container');
        if (overlayContainer) {
            overlayContainer.classList.add('d-none');
        }
        
        // Show notification
        uiManager.showNotification('Game Resumed', 2000, 'success');
        
        // Dispatch event for screen readers
        document.dispatchEvent(new CustomEvent('gameStateChange', {
            detail: {
                event: 'gameResumed',
                state: 'playing'
            }
        }));
    }
    
    /**
     * Update the game status and UI
     */
    function updateGameStatus(status) {
        // Update state
        gameState.gameStatus = status;
        
        // Update body class
        document.body.dataset.gameStatus = status;
        
        // Update UI
        const startBtn = document.getElementById('start-btn');
        const pauseBtn = document.getElementById('pause-btn');
        
        if (startBtn) {
            switch (status) {
                case 'playing':
                    startBtn.textContent = 'Reset Game';
                    startBtn.classList.add('btn-danger');
                    startBtn.classList.remove('btn-primary', 'btn-success');
                    break;
                case 'paused':
                    startBtn.textContent = 'Reset Game';
                    startBtn.classList.add('btn-danger');
                    startBtn.classList.remove('btn-primary', 'btn-success');
                    break;
                case 'idle':
                case 'gameover':
                    startBtn.textContent = 'Start Game';
                    startBtn.classList.add('btn-primary');
                    startBtn.classList.remove('btn-danger', 'btn-success');
                    break;
                case 'countdown':
                    startBtn.textContent = 'Reset Game';
                    startBtn.classList.add('btn-danger');
                    startBtn.classList.remove('btn-primary', 'btn-success');
                    break;
            }
        }
        
        if (pauseBtn) {
            switch (status) {
                case 'playing':
                    pauseBtn.textContent = 'Pause Game';
                    pauseBtn.classList.remove('d-none');
                    pauseBtn.classList.add('btn-warning');
                    pauseBtn.classList.remove('btn-success');
                    break;
                case 'paused':
                    pauseBtn.textContent = 'Resume Game';
                    pauseBtn.classList.remove('d-none');
                    pauseBtn.classList.add('btn-success');
                    pauseBtn.classList.remove('btn-warning');
                    break;
                default:
                    pauseBtn.classList.add('d-none');
                    break;
            }
        }
        
        // Dispatch event for other components
        document.dispatchEvent(new CustomEvent('gameStateChange', {
            detail: {
                state: status
            }
        }));
    }
    
    /**
     * Start the game
     */
    function startGame() {
        resetGameState();
        gameState.gameStarted = true;
        
        // Update UI for game start
        uiManager.updateStartButton(true);
        updateGameStatus('countdown');
        
        // Show a countdown before starting the game
        uiManager.showCountdown(() => {
            // Show cards for a brief period with transition
            gameState.cards.forEach((card, index) => {
                // Staggered reveal for a nicer effect
                setTimeout(() => {
                    card.classList.add('flipped');
                }, 30 * (index % 12));
            });
            
            // Announce to screen readers that game has started
            document.dispatchEvent(new CustomEvent('gameStateChange', {
                detail: {
                    event: 'gameStart',
                    difficulty: gameState.currentDifficulty,
                    level: gameState.level,
                    totalPairs: gameState.totalPairs
                }
            }));
            
            // Set game status to playing
            updateGameStatus('playing');
            
            // Record start time for this level
            gameState.currentLevel = {
                startTime: Date.now(),
                initialTimeLimit: difficultyManager.getLevelTime(gameState.level)
            };
            
            // Start the timer
            startTimer();
            
            // Hide cards after a delay based on difficulty
            setTimeout(() => {
                gameState.cards.forEach((card, index) => {
                    // Staggered hide for a nicer effect
                    setTimeout(() => {
                        if (!card.classList.contains('matched')) {
                            card.classList.remove('flipped');
                        }
                    }, 30 * (index % 12));
                });
                gameState.isProcessing = false;
                
                // Show a ready message when cards are hidden
                uiManager.showNotification('Cards hidden! Find the matches!', 2000, 'info');
                
                // Announce to screen readers that cards are hidden
                document.dispatchEvent(new CustomEvent('gameStateChange', {
                    detail: {
                        event: 'cardsHidden',
                        difficulty: gameState.currentDifficulty,
                        level: gameState.level,
                        totalPairs: gameState.totalPairs
                    }
                }));
            }, difficultyManager.getViewTime());
        });
    }
    
    /**
     * Reset the game state for a new game
     */
    function resetGameState() {
        gameState.matchedPairs = 0;
        gameState.moves = 0;
        gameState.score = 0;
        gameState.isProcessing = true;
        gameState.comboCount = 0;
        gameState.lastMatchTime = 0;
        gameState.totalPauseTime = 0;
        
        // Clear any active timers
        if (gameState.comboTimer) {
            clearTimeout(gameState.comboTimer);
            gameState.comboTimer = null;
        }
    }
    
    /**
     * Start the game timer
     */
    function startTimer() {
        gameState.timeLeft = difficultyManager.getLevelTime(gameState.level);
        
        // Update circular timer max time
        const circularTimer = document.querySelector('.circular-timer');
        if (circularTimer) {
            circularTimer.dataset.maxTime = gameState.timeLeft;
        }
        
        uiManager.updateTimer(gameState.timeLeft);
        gameState.timer = setInterval(updateTimer, 1000);
    }
    
    /**
     * Update timer with each tick
     */
    function updateTimer() {
        if (gameState.gameStatus !== 'playing') return;
        
        gameState.timeLeft--;
        uiManager.updateTimer(gameState.timeLeft);
        
        // Time warnings for both UI and accessibility 
        if (gameState.timeLeft === 30 || gameState.timeLeft === 10) {
            uiManager.showTimeWarning(gameState.timeLeft);
            
            document.dispatchEvent(new CustomEvent('gameStateChange', {
                detail: {
                    event: 'timeWarning',
                    timeLeft: gameState.timeLeft
                }
            }));
            
            // Play warning sound if time is critical
            if (gameState.timeLeft === 10) {
                audioManager.play('timeWarning');
                accessibilityManager.describeSoundEffect('timeWarning');
            }
        }

        if (gameState.timeLeft <= 0) endGame(false);
    }
    
    /**
     * Flip a card
     */
    function flipCard(card) {
        audioManager.playFlip();
        accessibilityManager.describeSoundEffect('flip');
        
        if (gameState.flippedCards.length < 2) {
            card.classList.add('flipped');
            
            // Update ARIA attributes
            card.setAttribute('aria-pressed', 'true');
            
            gameState.flippedCards.push(card);

            if (gameState.flippedCards.length === 2) {
                gameState.moves++;
                uiManager.updateDisplays(gameState, gameState.moves % 5 === 0); // Animate every 5 moves
                gameState.isProcessing = true;

                setTimeout(() => {
                    checkForMatch();
                }, difficultyManager.getMatchTime());
            }
        }
    }
    
    /**
     * Check if flipped cards match
     */
    function checkForMatch() {
        const card1 = gameState.flippedCards[0];
        const card2 = gameState.flippedCards[1];

        if (card1.dataset.value === card2.dataset.value) {
            audioManager.playMatch();
            accessibilityManager.describeSoundEffect('match');
            
            // Match found
            uiManager.applyMatchEffect(card1, card2);
            gameState.matchedPairs++;
            
            // Update progress bar
            updateProgressBar(gameState.matchedPairs, gameState.totalPairs);

            // Calculate combo bonus
            let comboMultiplier = 1;
            const now = Date.now();
            
            // Check for combo if enabled
            if (gameState.comboMode) {
                // Check if this match was quick enough for a combo
                if (gameState.lastMatchTime > 0 && (now - gameState.lastMatchTime) < 5000) {
                    // Increment combo counter
                    gameState.comboCount++;
                    
                    // Get combo multiplier (capped at 5x)
                    comboMultiplier = Math.min(gameState.comboCount + 1, 5);
                    
                    // Play combo sound if combo > 1
                    if (gameState.comboCount > 1) {
                        audioManager.play('combo');
                        accessibilityManager.describeSoundEffect('combo');
                        
                        // Announce combo
                        document.dispatchEvent(new CustomEvent('gameStateChange', {
                            detail: {
                                event: 'combo',
                                comboCount: gameState.comboCount
                            }
                        }));
                    }
                    
                    // Clear any existing combo timer
                    if (gameState.comboTimer) {
                        clearTimeout(gameState.comboTimer);
                    }
                } else {
                    // Reset combo if too slow
                    gameState.comboCount = 0;
                }
                
                // Update last match time
                gameState.lastMatchTime = now;
                
                // Set combo timer - combo resets after 5 seconds
                gameState.comboTimer = setTimeout(() => {
                    gameState.comboCount = 0;
                }, 5000);
            }

            // Update score with a more rewarding formula
            const matchBonus = 10 * gameState.level;
            const speedBonus = Math.max(0, 5 - Math.floor(gameState.moves / gameState.matchedPairs)); // Reward efficiency
            const timeBonus = Math.floor(gameState.timeLeft / 10); // Time bonus
            let pointsEarned = (matchBonus + speedBonus + timeBonus) * comboMultiplier;
            
            gameState.score += pointsEarned;
            uiManager.updateDisplays(gameState, true); // Animate the score update
            
            // Show match animation with feedback
            uiManager.showMatchAnimation(card1, card2, gameState.matchedPairs, gameState.totalPairs);
            
            // Announce match for accessibility
            document.dispatchEvent(new CustomEvent('gameStateChange', {
                detail: {
                    event: 'match',
                    matchedPairs: gameState.matchedPairs,
                    totalPairs: gameState.totalPairs,
                    cards: [card1, card2]
                }
            }));

            // Check for level completion
            if (gameState.matchedPairs === gameState.totalPairs) {
                if (gameState.level >= 5) {
                    endGame(true);
                } else {
                    levelUp();
                }
            }
        } else {
            // No match - add a short delay before flipping back
            setTimeout(() => {
                // Reset combo
                gameState.comboCount = 0;
                
                // Show no-match animation
                uiManager.showNoMatchAnimation(card1, card2);
                
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                
                // Update ARIA attributes
                card1.setAttribute('aria-pressed', 'false');
                card2.setAttribute('aria-pressed', 'false');
                
                // Announce no match for accessibility
                document.dispatchEvent(new CustomEvent('gameStateChange', {
                    detail: {
                        event: 'noMatch',
                        cards: [card1, card2]
                    }
                }));
            }, 500);
        }

        gameState.flippedCards = [];
        gameState.isProcessing = false;
    }

    /**
     * Level up - advance to next level
     */
    function levelUp() {
        // Update status
        updateGameStatus('levelup');
        
        gameState.level++;
        gameState.matchedPairs = 0;
        uiManager.updateDisplays(gameState, true); // Animate the updates

        // Update high score if current score is higher
        updateHighScore();

        // Visual feedback for level up
        uiManager.showLevelUpAnimation(gameState.level);
        
        // Play level up sound
        audioManager.playLevelUp();
        accessibilityManager.describeSoundEffect('levelUp');
        
        // Announce level up for accessibility
        document.dispatchEvent(new CustomEvent('gameStateChange', {
            detail: {
                event: 'levelUp',
                level: gameState.level
            }
        }));

        // Reset the grid for the next level
        setTimeout(() => {
            // Clear the timer
            clearInterval(gameState.timer);
            createGrid();
            
            // Start next level after a delay
            setTimeout(() => {
                startGame();
            }, 500);
        }, 2000); // Longer delay to show level up animation
    }
    
    /**
     * End the game
     */
    function endGame(won) {
        // Update game status
        updateGameStatus('gameover');
        
        if (won) {
            audioManager.playVictory();
            accessibilityManager.describeSoundEffect('victory');
            
            // Announce game won for accessibility
            document.dispatchEvent(new CustomEvent('gameStateChange', {
                detail: {
                    event: 'gameWon',
                    score: gameState.score
                }
            }));
        } else {
            audioManager.playGameOver();
            accessibilityManager.describeSoundEffect('gameOver');
            
            // Announce game lost for accessibility
            document.dispatchEvent(new CustomEvent('gameStateChange', {
                detail: {
                    event: 'gameLost',
                    score: gameState.score
                }
            }));
        }

        clearInterval(gameState.timer);
        gameState.gameStarted = false;
        
        // Update high score
        const newRecord = updateHighScore();
        
        // Ensure score is properly set before showing modal
        const finalScore = gameState.score;
        
        // Show game end modal
        setTimeout(() => {
            const message = won 
                ? 'Congratulations! You completed all levels!' 
                : 'Time\'s up! Game Over!';
                
            // Update UI elements first to ensure they display the correct score
            const finalScoreDisplay = document.getElementById('finalScoreDisplay');
            if (finalScoreDisplay) {
                finalScoreDisplay.textContent = finalScore;
            }
            
            // Set victory/defeat icon in modal
            const resultIcon = document.querySelector('.game-result-icon');
            if (resultIcon) {
                resultIcon.className = `game-result-icon ${won ? 'victory' : 'defeat'}`;
                
                const iconElement = resultIcon.querySelector('i');
                if (iconElement) {
                    iconElement.className = `bi ${won ? 'bi-trophy-fill' : 'bi-emoji-dizzy-fill'}`;
                }
            }
            
            uiManager.showGameEndModal(message, finalScore, (playerName) => {
                // Pass the final score explicitly to prevent any state issues
                leaderboardManager.addScore(playerName, finalScore, gameState.currentDifficulty);
            }, won);
            
            resetGame();
        }, 800);
    }
        
    /**
     * Update high score
     */
    function updateHighScore() {
        let isNewRecord = false;
        
        if (gameState.score > gameState.highScores[gameState.currentDifficulty]) {
            isNewRecord = true;
            gameState.highScores[gameState.currentDifficulty] = gameState.score;
            localStorage.setItem(
                `memoryMatrixHighScore${gameState.currentDifficulty.charAt(0).toUpperCase() + gameState.currentDifficulty.slice(1)}`, 
                gameState.score
            );
            uiManager.updateHighScores(gameState.highScores, true, gameState.currentDifficulty);
        } else {
            uiManager.updateHighScores(gameState.highScores);
        }
        
        return isNewRecord;
    }
    
    /**
     * Reset the game
     */
    function resetGame() {
        clearInterval(gameState.timer);
        gameState.level = 1;
        gameState.score = 0;
        gameState.moves = 0;
        gameState.matchedPairs = 0;
        gameState.gameStarted = false;
        gameState.flippedCards = [];
        gameState.isProcessing = false;
        gameState.timeLeft = 0;
        gameState.comboCount = 0;
        gameState.totalPauseTime = 0;
        
        if (gameState.comboTimer) {
            clearTimeout(gameState.comboTimer);
            gameState.comboTimer = null;
        }

        uiManager.updateDisplays(gameState);
        uiManager.updateTimer(0);
        uiManager.updateStartButton(false);
        updateGameStatus('idle');
        updateProgressBar(0, gameState.totalPairs);

        createGrid();
    }

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', init);
})();