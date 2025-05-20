/**
 * Enhanced UI Manager
 * 
 * Handles the game's user interface elements and interactions
 * with improved feedback and animations
 */
class UIManager {
    constructor() {
        // UI elements
        this.elements = {
            gameGrid: document.getElementById('game-grid'),
            levelDisplay: document.getElementById('level-display'),
            scoreDisplay: document.getElementById('score-display'),
            timerDisplay: document.getElementById('timer-display'),
            movesDisplay: document.getElementById('moves-display'),
            startBtn: document.getElementById('start-btn'),
            highScores: {
                easy: document.getElementById('easy-high-score'),
                medium: document.getElementById('medium-high-score'),
                hard: document.getElementById('hard-high-score')
            }
        };
        
        // Toast notification queue and state
        this.toastQueue = [];
        this.toastActive = false;
        
        // Animation states
        this.confettiActive = false;
        
        // Initialize event listeners
        this.setupEventListeners();
        
        // Create container for game feedback
        this.createFeedbackContainer();
    }
    
    /**
     * Create a container for dynamic game feedback (toasts, overlays, etc.)
     */
    createFeedbackContainer() {
        // Check if container already exists
        let container = document.getElementById('game-feedback-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'game-feedback-container';
            container.className = 'game-feedback-container';
            document.body.appendChild(container);
            
            // Add some basic styling inline (will be enhanced in CSS)
            const style = document.createElement('style');
            style.textContent = `
                .game-feedback-container {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: 9000;
                    overflow: hidden;
                }
                
                .game-toast {
                    position: absolute;
                    left: 50%;
                    transform: translateX(-50%);
                    padding: 10px 20px;
                    border-radius: 50px;
                    color: white;
                    font-weight: 600;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    opacity: 0;
                    transition: transform 0.5s ease, opacity 0.5s ease;
                    text-align: center;
                    min-width: 200px;
                    pointer-events: none;
                    z-index: 9100;
                }
                
                .game-toast.info {
                    background-color: rgba(var(--primary-color-rgb), 0.9);
                }
                
                .game-toast.success {
                    background-color: rgba(var(--secondary-color-rgb), 0.9);
                    color: #000;
                }
                
                .game-toast.warning {
                    background-color: rgba(255, 152, 0, 0.9);
                    color: #000;
                }
                
                .game-toast.error {
                    background-color: rgba(255, 82, 82, 0.9);
                }
                
                .game-toast.show {
                    opacity: 1;
                }
                
                .game-toast.top {
                    top: 100px;
                }
                
                .game-toast.center {
                    top: 50%;
                    transform: translate(-50%, -50%);
                    font-size: 1.5rem;
                }
                
                .game-toast.bottom {
                    bottom: 100px;
                }
                
                .game-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0,0,0,0.7);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    opacity: 0;
                    transition: opacity 0.5s ease;
                    pointer-events: none;
                }
                
                .game-overlay.show {
                    opacity: 1;
                }
                
                .level-up-animation {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) scale(0.5);
                    font-size: 5rem;
                    font-weight: bold;
                    color: var(--secondary-color);
                    text-shadow: 0 0 10px var(--secondary-light);
                    opacity: 0;
                    transition: transform 0.5s ease, opacity 0.5s ease;
                    pointer-events: none;
                    z-index: 9200;
                }
                
                .level-up-animation.show {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1.2);
                }
                
                @keyframes pulse-scale {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }
                
                .pulse-effect {
                    animation: pulse-scale 0.5s ease-in-out;
                }
                
                .confetti {
                    position: absolute;
                    width: 10px;
                    height: 10px;
                    background-color: #f00;
                    opacity: 0.8;
                    animation: fall linear forwards;
                }
                
                @keyframes fall {
                    0% { transform: translateY(-100px) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(calc(100vh + 100px)) rotate(360deg); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        this.feedbackContainer = container;
    }
    
    /**
     * Set up global UI event listeners
     */
    setupEventListeners() {
        // Show notification event listener
        document.addEventListener('showNotification', (e) => {
            this.showNotification(e.detail.message, e.detail.duration, e.detail.type);
        });
        
        // Resize handler
        window.addEventListener('resize', () => {
            this.adjustGridForScreenSize();
        });
        
        // Orientation change handler
        window.addEventListener('orientationchange', () => {
            this.handleOrientationChange();
        });
        
        // Initialize mobile layout
        this.adjustGridForScreenSize();
    }
    
    /**
     * Display a notification message with enhanced visuals
     * @param {string} message - The message to display
     * @param {number} duration - How long to show the message in ms (default: 3000ms)
     * @param {string} type - The type of toast (info, success, warning, error)
     * @param {string} position - Where to display the toast (top, center, bottom)
     */
    showNotification(message, duration = 3000, type = 'info', position = 'top') {
        // Add to queue
        this.toastQueue.push({ message, duration, type, position });
        
        // Process queue if no active toast
        if (!this.toastActive) {
            this.processToastQueue();
        }
    }
    
    /**
     * Process the toast notification queue
     */
    processToastQueue() {
        if (this.toastQueue.length === 0) {
            this.toastActive = false;
            return;
        }
        
        this.toastActive = true;
        const { message, duration, type, position } = this.toastQueue.shift();
        
        // Create new toast element
        const toast = document.createElement('div');
        toast.className = `game-toast ${type} ${position}`;
        toast.textContent = message;
        
        // Add to container
        this.feedbackContainer.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Auto-remove after the specified duration
        setTimeout(() => {
            toast.classList.remove('show');
            
            // Remove element after transition completes
            setTimeout(() => {
                toast.remove();
                this.processToastQueue(); // Process next in queue
            }, 500);
        }, duration);
    }
    
    /**
     * Show a congratulatory level up animation
     * @param {number} level - The new level number
     */
    showLevelUpAnimation(level) {
        // Create level up text animation
        const levelUpAnimation = document.createElement('div');
        levelUpAnimation.className = 'level-up-animation';
        levelUpAnimation.textContent = `LEVEL ${level}!`;
        this.feedbackContainer.appendChild(levelUpAnimation);
        
        // Trigger animation
        setTimeout(() => {
            levelUpAnimation.classList.add('show');
            
            // Show toast notification with additional info
            this.showNotification(`Level Up! Difficulty increases...`, 2000, 'success', 'bottom');
            
            // Create confetti effect
            this.createConfetti();
            
            // Remove after animation completes
            setTimeout(() => {
                levelUpAnimation.classList.remove('show');
                setTimeout(() => {
                    levelUpAnimation.remove();
                }, 500);
            }, 2000);
        }, 10);
        
        // Apply pulse effect to game info elements
        document.querySelectorAll('.game-info div').forEach(div => {
            div.classList.add('pulse-effect');
            setTimeout(() => {
                div.classList.remove('pulse-effect');
            }, 500);
        });
    }
    
    /**
     * Create a confetti effect for celebrations
     */
    createConfetti() {
        if (this.confettiActive) return;
        this.confettiActive = true;
        
        const colors = [
            '#FF5252', '#FFEB3B', '#4CAF50', '#2196F3', 
            '#9C27B0', '#FF9800', '#00BCD4', '#F44336'
        ];
        
        // Create confetti pieces
        for (let i = 0; i < 100; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.left = `${Math.random() * 100}%`;
                confetti.style.width = `${Math.random() * 10 + 5}px`;
                confetti.style.height = `${Math.random() * 10 + 5}px`;
                confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
                confetti.style.animationDuration = `${Math.random() * 3 + 2}s`;
                
                this.feedbackContainer.appendChild(confetti);
                
                // Remove confetti after animation
                setTimeout(() => {
                    confetti.remove();
                }, 5000);
            }, i * 20);
        }
        
        // Reset confetti state after all pieces are done
        setTimeout(() => {
            this.confettiActive = false;
        }, 5000);
    }
    
    /**
     * Show a match success animation and feedback
     * @param {HTMLElement} card1 - First matched card
     * @param {HTMLElement} card2 - Second matched card
     * @param {number} matchedPairs - Current number of matched pairs
     * @param {number} totalPairs - Total pairs in the game
     */
    showMatchAnimation(card1, card2, matchedPairs, totalPairs) {
        // Apply highlight effect
        card1.classList.add('highlight-match');
        card2.classList.add('highlight-match');
        
        // Show progress feedback for larger matches (every 25% progress)
        const progressPercentage = (matchedPairs / totalPairs) * 100;
        let message = '';
        
        if (progressPercentage === 100) {
            message = 'All pairs found! Level complete!';
        } else if (matchedPairs === 1) {
            message = 'First match found! Keep going!';
        } else if (progressPercentage >= 75 && matchedPairs % 2 === 0) {
            message = 'Almost there! Just a few more pairs!';
        } else if (progressPercentage >= 50 && matchedPairs % 2 === 0) {
            message = 'Halfway there! Good progress!';
        } else if (progressPercentage >= 25 && matchedPairs % 2 === 0) {
            message = 'Good job! Keep matching!';
        } else if (matchedPairs % 3 === 0) {
            // Occasional encouragement for continued progress
            const encouragements = [
                'Great match!',
                'You\'re doing well!',
                'Keep it up!',
                'Nice find!',
                'Good memory!'
            ];
            message = encouragements[Math.floor(Math.random() * encouragements.length)];
        }
        
        // Show feedback message if we have one
        if (message) {
            this.showNotification(message, 1500, 'success');
        }
        
        // Remove highlight effect after animation
        setTimeout(() => {
            card1.classList.remove('highlight-match');
            card2.classList.remove('highlight-match');
        }, 800);
    }
    
    /**
     * Update displays with current game state with animated transitions
     * @param {object} state - The current game state
     * @param {boolean} animate - Whether to animate the changes
     */
    updateDisplays(state, animate = false) {
        // Update level display
        if (this.elements.levelDisplay) {
            this.updateWithAnimation(this.elements.levelDisplay, state.level, animate);
        }
        
        // Update score display
        if (this.elements.scoreDisplay) {
            this.updateWithAnimation(this.elements.scoreDisplay, state.score, animate);
        }
        
        // Update moves display
        if (this.elements.movesDisplay) {
            this.updateWithAnimation(this.elements.movesDisplay, state.moves, animate);
        }
    }
    
    /**
     * Update an element with optional animation
     * @param {HTMLElement} element - The element to update
     * @param {*} value - The new value
     * @param {boolean} animate - Whether to animate the change
     */
    updateWithAnimation(element, value, animate) {
        if (animate) {
            // Add highlight class for animation
            element.classList.add('pulse-effect');
            
            // Remove class after animation completes
            setTimeout(() => {
                element.classList.remove('pulse-effect');
            }, 500);
        }
        
        // Update the text content
        element.textContent = value;
    }
    
    /**
     * Update the timer display with enhanced visual feedback
     * @param {number} timeLeft - The time left in seconds
     */
    updateTimer(timeLeft) {
        if (!this.elements.timerDisplay) return;
        
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Animate only if value actually changed
        if (this.elements.timerDisplay.textContent !== timeString) {
            this.elements.timerDisplay.textContent = timeString;
        }
        
        // Timer warning states with enhanced visuals
        this.elements.timerDisplay.classList.remove('time-warning', 'time-critical');
        
        if (timeLeft <= 10) {
            this.elements.timerDisplay.classList.add('time-critical');
            
            // Show warning notification at critical thresholds
            if (timeLeft === 10) {
                this.showNotification('10 seconds remaining!', 2000, 'warning');
            }
            else if (timeLeft <= 5 && timeLeft > 0) {
                // Visual pulse for final countdown
                this.elements.timerDisplay.classList.add('pulse-effect');
                setTimeout(() => {
                    this.elements.timerDisplay.classList.remove('pulse-effect');
                }, 300);
            }
        } else if (timeLeft <= 30) {
            this.elements.timerDisplay.classList.add('time-warning');
            
            // Show initial timer warning
            if (timeLeft === 30) {
                this.showNotification('30 seconds remaining!', 2000, 'info');
            }
        }
    }
    
    /**
     * Update high score displays with animation
     * @param {object} highScores - The high scores object
     * @param {boolean} newRecord - Whether a new record was set
     * @param {string} difficulty - The difficulty with the new record
     */
    updateHighScores(highScores, newRecord = false, difficulty = null) {
        Object.entries(highScores).forEach(([diff, score]) => {
            const element = this.elements.highScores[diff];
            if (element) {
                // Animate if this is the difficulty with the new record
                const shouldAnimate = newRecord && diff === difficulty;
                this.updateWithAnimation(element, score, shouldAnimate);
                
                if (shouldAnimate) {
                    // Show new record notification
                    this.showNotification(`New ${diff} high score: ${score}!`, 3000, 'success');
                }
            }
        });
    }
    
    /**
     * Enhanced game end modal with better UX
     * @param {string} message - The message to display
     * @param {number} score - The final score
     * @param {function} onSave - Callback when score is saved
     * @param {boolean} victory - Whether the game ended in victory
     */
    showGameEndModal(message, score, onSave, victory = false) {
        // Create overlay effect first
        const overlay = document.createElement('div');
        overlay.className = 'game-overlay';
        this.feedbackContainer.appendChild(overlay);
        
        // Fade in overlay
        setTimeout(() => {
            overlay.classList.add('show');
        }, 10);
        
        // Play victory effects if game was won
        if (victory) {
            this.createConfetti();
        }
        
        // Check if modal exists in the DOM
        let modal = document.getElementById('gameEndModal');
        
        if (!modal) {
            // Create modal if it doesn't exist
            modal = document.createElement('div');
            modal.id = 'gameEndModal';
            modal.className = 'modal fade';
            modal.tabIndex = '-1';
            
            modal.innerHTML = `
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Game Over</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <p id="gameEndMessage"></p>
                            <p>Your score: <span id="finalScoreDisplay"></span></p>
                            <div id="nameInputContainer">
                                <label for="playerNameInput" class="form-label">Enter your name for the leaderboard:</label>
                                <input type="text" class="form-control" id="playerNameInput">
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" id="saveScoreBtn">Save Score</button>
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
        }
        
        // Update modal content
        document.getElementById('gameEndMessage').textContent = message;
        document.getElementById('finalScoreDisplay').textContent = score;
        
        // Pre-fill player name from localStorage if available
        const playerNameInput = document.getElementById('playerNameInput');
        playerNameInput.value = localStorage.getItem('playerName') || '';
        
        // Set up save button event handler
        const saveScoreBtn = document.getElementById('saveScoreBtn');
        const saveHandler = () => {
            const playerName = playerNameInput.value.trim() || 'Player';
            localStorage.setItem('playerName', playerName);
            
            if (onSave && typeof onSave === 'function') {
                onSave(playerName);
            }
            
            // Show confirmation toast
            this.showNotification(`Score saved for ${playerName}!`, 2000, 'success');
            
            // Dismiss the modal
            const modalInstance = bootstrap.Modal.getInstance(modal);
            if (modalInstance) {
                modalInstance.hide();
            }
            
            // Remove the event listener to avoid duplicates
            saveScoreBtn.removeEventListener('click', saveHandler);
            
            // Remove overlay after modal closes
            setTimeout(() => {
                overlay.classList.remove('show');
                setTimeout(() => {
                    overlay.remove();
                }, 500);
            }, 300);
        };
        
        // Clear any previous event listeners
        saveScoreBtn.replaceWith(saveScoreBtn.cloneNode(true));
        document.getElementById('saveScoreBtn').addEventListener('click', saveHandler);
        
        // Add event listener for modal close to remove overlay
        modal.addEventListener('hidden.bs.modal', () => {
            overlay.classList.remove('show');
            setTimeout(() => {
                overlay.remove();
            }, 500);
        }, { once: true });
        
        // Show the modal
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
    }
    
    /**
     * Display a countdown before starting the game
     * @param {function} onComplete - Callback when countdown finishes
     */
    showCountdown(onComplete) {
        let count = 3;
        
        // Create countdown element
        const countdown = document.createElement('div');
        countdown.className = 'level-up-animation';
        countdown.textContent = count.toString();
        this.feedbackContainer.appendChild(countdown);
        
        // Update the count every second
        const interval = setInterval(() => {
            count--;
            countdown.textContent = count > 0 ? count.toString() : 'GO!';
            
            countdown.classList.remove('show');
            setTimeout(() => {
                countdown.classList.add('show');
            }, 50);
            
            if (count < 0) {
                clearInterval(interval);
                setTimeout(() => {
                    countdown.classList.remove('show');
                    setTimeout(() => {
                        countdown.remove();
                        if (onComplete) onComplete();
                    }, 500);
                }, 500);
            }
        }, 1000);
        
        // Start the countdown
        setTimeout(() => {
            countdown.classList.add('show');
        }, 10);
    }
    
    /**
     * Adjust grid layout based on screen size and orientation
     */
    adjustGridForScreenSize() {
        if (!this.elements.gameGrid) return;
        
        const isMobile = window.innerWidth <= 768;
        const isLandscape = window.innerWidth > window.innerHeight;
        const gameContainer = document.querySelector('.game-container');
        
        if (!gameContainer) return;
        
        // Apply appropriate layout classes
        gameContainer.classList.toggle('landscape-mode', isMobile && isLandscape);
        
        // Dynamically adjust card sizes based on grid and viewport
        this.resizeCardsForViewport();
    }
    
    /**
     * Dynamically resize cards to fit the viewport
     */
    resizeCardsForViewport() {
        const grid = this.elements.gameGrid;
        if (!grid) return;
        
        // Get grid dimensions
        const gridRect = grid.getBoundingClientRect();
        
        // Count grid columns from computed style
        const computedStyle = window.getComputedStyle(grid);
        const gridTemplateColumns = computedStyle.gridTemplateColumns;
        const columnCount = gridTemplateColumns.split(' ').length;
        
        // Count total cards
        const cards = grid.querySelectorAll('.card');
        if (cards.length === 0) return;
        
        // Calculate rows (ceiling division)
        const rowCount = Math.ceil(cards.length / columnCount);
        
        // Calculate optimal card size with gap
        const gap = parseInt(computedStyle.gap) || 0;
        const maxCardWidth = (gridRect.width - (gap * (columnCount - 1))) / columnCount;
        const maxCardHeight = (gridRect.height - (gap * (rowCount - 1))) / rowCount;
        
        // Apply the smaller of the two dimensions to maintain aspect ratio
        const optimalSize = Math.min(maxCardWidth, maxCardHeight);
        
        // Apply size to all cards
        cards.forEach(card => {
            card.style.width = `${optimalSize}px`;
            card.style.height = `${optimalSize}px`;
        });
    }
    
    /**
     * Handle orientation changes
     */
    handleOrientationChange() {
        // Force a re-layout after orientation change
        setTimeout(() => {
            this.adjustGridForScreenSize();
        }, 300);
    }
    
    /**
     * Show a loading spinner in the game grid
     */
    showGridLoading() {
        if (!this.elements.gameGrid) return;
        
        this.elements.gameGrid.innerHTML = `
            <div class="loading-container">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p>Loading game...</p>
            </div>
        `;
    }
    
    /**
     * Apply visual feedback for card matching
     * @param {HTMLElement} card1 - The first matched card
     * @param {HTMLElement} card2 - The second matched card
     */
    applyMatchEffect(card1, card2) {
        card1.classList.add('matched');
        card2.classList.add('matched');
        
        // Add a temporary highlight effect
        card1.classList.add('highlight-match');
        card2.classList.add('highlight-match');
        
        setTimeout(() => {
            card1.classList.remove('highlight-match');
            card2.classList.remove('highlight-match');
        }, 800);
    }
    
    /**
     * Update the start button state
     * @param {boolean} gameStarted - Whether the game has started
     */
    updateStartButton(gameStarted) {
        if (!this.elements.startBtn) return;
        
        if (gameStarted) {
            this.elements.startBtn.textContent = 'Reset Game';
        } else {
            this.elements.startBtn.textContent = 'Start Game';
        }
    }
    
    /**
     * Show a time warning effect
     * @param {number} timeLeft - Seconds remaining
     */
    showTimeWarning(timeLeft) {
        // Show warning notification
        if (timeLeft === 30) {
            this.showNotification('30 seconds remaining!', 2000, 'warning');
        } else if (timeLeft === 10) {
            this.showNotification('Hurry! Only 10 seconds left!', 2000, 'warning');
        }
        
        // Apply visual pulse to timer
        if (this.elements.timerDisplay) {
            this.elements.timerDisplay.classList.add('pulse-effect');
            setTimeout(() => {
                this.elements.timerDisplay.classList.remove('pulse-effect');
            }, 500);
        }
    }
    
    /**
     * Show a no-match feedback animation
     * @param {HTMLElement} card1 - First card
     * @param {HTMLElement} card2 - Second card
     */
    showNoMatchAnimation(card1, card2) {
        // Add a temporary shake effect
        card1.classList.add('shake-effect');
        card2.classList.add('shake-effect');
        
        // Occasionally show a hint message
        if (Math.random() < 0.2) {
            const messages = [
                'Not a match. Try again!',
                'Keep trying!',
                'Almost there!',
                'Memorize the cards!'
            ];
            const message = messages[Math.floor(Math.random() * messages.length)];
            this.showNotification(message, 1500, 'info');
        }
        
        // Remove shake effect after animation
        setTimeout(() => {
            card1.classList.remove('shake-effect');
            card2.classList.remove('shake-effect');
        }, 500);
    }
}

export const uiManager = new UIManager();