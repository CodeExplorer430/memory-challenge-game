/**
 * Memory Matrix Challenge - Main Game Controller
 * 
 * This file handles the core game logic and coordinates the various game components.
 */

// Import game modules
import { audioManager } from './game/audio-manager.js';
import { cardGenerator } from './game/card-generator.js';
import { difficultyManager } from './game/difficulty-manager.js';
import { themeManager } from './game/theme-manager.js';
import { uiManager } from './game/ui-manager.js';
import { accessibilityManager } from './game/accessibility.js';

// Use an IIFE to avoid polluting the global namespace
(function() {
    // Game state
    const gameState = {
        cards: [],
        flippedCards: [],
        matchedPairs: 0,
        level: 1,
        score: 0,
        moves: 0,
        timer: null,
        timeLeft: 0,
        isProcessing: false,
        gameStarted: false,
        currentDifficulty: 'easy',
        cardType: 'color',
        highScores: {
            easy: 0,
            medium: 0,
            hard: 0
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
                this.leaderboard = JSON.parse(storedLeaderboard);
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
                score: numericScore, // Use the parsed integer
                difficulty: difficulty && difficulty.toLowerCase() ? difficulty.toLowerCase() : 'easy',
                date: new Date().toLocaleDateString(),
                timestamp: Date.now() // Add timestamp for sorting
            };
            
            console.log("Adding score to leaderboard:", newScore); // Debugging
            
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
                        score: numericScore, // Use the parsed integer
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
            
            console.log("Updated leaderboard display with", this.leaderboard.length, "entries");
        }
    };
    
    /**
     * Initialize the game
     */
    function init() {
        // Load high scores
        loadHighScores();
        
        // Set up event listeners
        setupEventListeners();
        
        // Create initial grid
        createGrid();
        
        // Initialize leaderboard if needed
        if (document.getElementById('leaderboardBody')) {
            leaderboardManager.init();
        }
    }
    
    /**
     * Load high scores from local storage
     */
    function loadHighScores() {
        gameState.highScores = {
            easy: parseInt(localStorage.getItem('colorMemoryHighScoreEasy')) || 0,
            medium: parseInt(localStorage.getItem('colorMemoryHighScoreMedium')) || 0,
            hard: parseInt(localStorage.getItem('colorMemoryHighScoreHard')) || 0
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
                if (!gameState.gameStarted) {
                    startGame();
                } else {
                    resetGame();
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
                if (gameState.gameStarted) {
                    resetGame();
                } else {
                    createGrid();
                }
            });
        }
        
        // Handle difficulty changes
        document.addEventListener('difficultyChange', (e) => {
            gameState.currentDifficulty = e.detail.difficulty;
            if (gameState.gameStarted) {
                resetGame();
            } else {
                createGrid();
            }
        });
        
        // Set initial difficulty from localStorage
        gameState.currentDifficulty = localStorage.getItem('currentDifficulty') || 'easy';
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
            
            // Get settings for current difficulty
            const difficulty = difficultyManager.getCurrentSettings();
            const totalPairs = difficulty.gridSize.totalPairs;
            
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
        });
    }
    
    /**
     * Handle card interaction (click or touch)
     */
    function handleCardInteraction(card) {
        if (!gameState.gameStarted || 
            gameState.isProcessing || 
            card.classList.contains('flipped') || 
            card.classList.contains('matched')) {
            return;
        }

        flipCard(card);
    }
    
    /**
     * Start the game
     */
    function startGame() {
        gameState.gameStarted = true;
        gameState.matchedPairs = 0;
        gameState.moves = 0;
        gameState.score = 0;
        gameState.isProcessing = true;
        
        // Update start button
        uiManager.updateStartButton(true);
        document.getElementById('start-btn').classList.add('active');
        
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
                    totalPairs: difficultyManager.getTotalPairs()
                }
            }));
            
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
                document.getElementById('start-btn').classList.remove('active');
                
                // Show a ready message when cards are hidden
                uiManager.showNotification('Cards hidden! Find the matches!', 2000, 'info');
                
                // Announce to screen readers that cards are hidden
                document.dispatchEvent(new CustomEvent('gameStateChange', {
                    detail: {
                        event: 'cardsHidden',
                        difficulty: gameState.currentDifficulty,
                        level: gameState.level,
                        totalPairs: difficultyManager.getTotalPairs()
                    }
                }));
            }, difficultyManager.getViewTime());
        });
    }
    
    /**
     * Start the game timer
     */
    function startTimer() {
        gameState.timeLeft = difficultyManager.getLevelTime(gameState.level);
        uiManager.updateTimer(gameState.timeLeft);
        gameState.timer = setInterval(updateTimer, 1000);
    }
    
    /**
     * Update timer with each tick
     */
    function updateTimer() {
        if (!gameState.gameStarted) return;
        
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
        }

        if (gameState.timeLeft <= 0) endGame(false);
    }
    
    /**
     * Flip a card
     */
    function flipCard(card) {
        audioManager.playFlip();
        
        if (gameState.flippedCards.length < 2) {
            card.classList.add('flipped');
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
            
            // Match found
            uiManager.applyMatchEffect(card1, card2);
            gameState.matchedPairs++;

            // Update score with a more rewarding formula
            const matchBonus = 10 * gameState.level;
            const speedBonus = Math.max(0, 5 - Math.floor(gameState.moves / gameState.matchedPairs)); // Reward efficiency
            const timeBonus = Math.floor(gameState.timeLeft / 10); // Time bonus
            const pointsEarned = matchBonus + speedBonus + timeBonus;
            
            gameState.score += pointsEarned;
            uiManager.updateDisplays(gameState, true); // Animate the score update
            
            // Show match animation with feedback
            uiManager.showMatchAnimation(card1, card2, gameState.matchedPairs, difficultyManager.getTotalPairs());
            
            // Announce match for accessibility
            document.dispatchEvent(new CustomEvent('gameStateChange', {
                detail: {
                    event: 'match',
                    matchedPairs: gameState.matchedPairs,
                    totalPairs: difficultyManager.getTotalPairs(),
                    cards: [card1, card2]
                }
            }));

            // Check for level completion
            if (gameState.matchedPairs === difficultyManager.getTotalPairs()) {
                if (gameState.level >= 5) {
                    endGame(true);
                } else {
                    levelUp();
                }
            }
        } else {
            // No match - add a short delay before flipping back
            setTimeout(() => {
                // Show no-match animation
                uiManager.showNoMatchAnimation(card1, card2);
                
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                
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
        gameState.level++;
        gameState.matchedPairs = 0;
        uiManager.updateDisplays(gameState, true); // Animate the updates

        // Update high score if current score is higher
        updateHighScore();

        // Visual feedback for level up
        uiManager.showLevelUpAnimation(gameState.level);
        
        // Play level up sound
        audioManager.playLevelUp();
        
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
        if (won) {
            audioManager.playMatch();
            
            // Announce game won for accessibility
            document.dispatchEvent(new CustomEvent('gameStateChange', {
                detail: {
                    event: 'gameWon',
                    score: gameState.score
                }
            }));
        } else {
            audioManager.playGameOver();
            
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
        console.log("Final game score:", finalScore); // Debug logging
        
        // Show game end modal
        setTimeout(() => {
            const message = won 
                ? 'Congratulations! You completed all levels!' 
                : 'Time\'s up! Game Over!';
                
            // Update UI elements first to ensure they display the correct score
            document.getElementById('finalScoreDisplay').textContent = finalScore;
            
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
                `colorMemoryHighScore${gameState.currentDifficulty.charAt(0).toUpperCase() + gameState.currentDifficulty.slice(1)}`, 
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

        uiManager.updateDisplays(gameState);
        uiManager.updateTimer(0);
        uiManager.updateStartButton(false);

        createGrid();
    }

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', init);
})();