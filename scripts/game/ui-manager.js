/**
 * Enhanced UI Manager
 * 
 * Handles the game's user interface elements and interactions
 * with improved feedback, animations, and responsive design
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
            fullscreenBtn: document.getElementById('fullscreen-btn'),
            highScores: {
                easy: document.getElementById('easy-high-score'),
                medium: document.getElementById('medium-high-score'),
                hard: document.getElementById('hard-high-score')
            }
        };
        
        // UI state tracking
        this.state = {
            animationsEnabled: !this.prefersReducedMotion(),
            currentGameState: 'idle', // idle, countdown, playing, paused, levelup, gameover
            isFullscreen: false,
            lastNotification: '',
            activeModals: new Set(),
            screenSize: this.getScreenSizeClass(),
            comboCount: 0,
            comboTimer: null,
            lastLevelNotified: 0
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
        
        // Initialize responsive layout
        this.handleResponsiveLayout();
    }
    
    /**
     * Check if user prefers reduced motion
     */
    prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    
    /**
     * Get current screen size class
     */
    getScreenSizeClass() {
        const width = window.innerWidth;
        if (width < 576) return 'xs';
        if (width < 768) return 'sm';
        if (width < 992) return 'md';
        if (width < 1200) return 'lg';
        return 'xl';
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
            
            // Add accessibility attributes
            container.setAttribute('aria-live', 'polite');
            container.setAttribute('aria-atomic', 'true');
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
        
        // Game viewport resize event
        document.addEventListener('gameViewportResized', this.handleViewportResize.bind(this));
        
        // Modal events for tracking active modals
        document.addEventListener('shown.bs.modal', (e) => {
            this.state.activeModals.add(e.target.id);
            // Pause game if playing
            if (this.state.currentGameState === 'playing') {
                document.dispatchEvent(new CustomEvent('pauseGame'));
            }
        });
        
        document.addEventListener('hidden.bs.modal', (e) => {
            this.state.activeModals.delete(e.target.id);
            // Resume game if all modals are closed and was previously playing
            if (this.state.activeModals.size === 0 && this.state.currentGameState === 'paused') {
                document.dispatchEvent(new CustomEvent('resumeGame'));
            }
        });
        
        // Theme change listener
        document.addEventListener('themeChange', (e) => {
            // Update visual elements based on new theme
            this.applyThemeToUI(e.detail.theme);
        });
        
        // Game state change
        document.addEventListener('gameStateChange', (e) => {
            this.state.currentGameState = e.detail.state || this.state.currentGameState;
            
            // Update UI based on game state
            this.updateUIForGameState(e.detail);
        });
        
        // Fullscreen button
        if (this.elements.fullscreenBtn) {
            this.elements.fullscreenBtn.addEventListener('click', () => {
                this.toggleFullscreen();
            });
        }
        
        // Initialize fullscreen change detection
        document.addEventListener('fullscreenchange', () => {
            this.state.isFullscreen = !!document.fullscreenElement;
            this.updateFullscreenButton();
        });
        
        // Media query for responsiveness
        this.setupMediaQueryListeners();
    }
    
    /**
     * Set up media query listeners for responsive design
     */
    setupMediaQueryListeners() {
        // Screen size changes
        const screenSizeMediaQueries = [
            { query: '(max-width: 575.98px)', size: 'xs' },
            { query: '(min-width: 576px) and (max-width: 767.98px)', size: 'sm' },
            { query: '(min-width: 768px) and (max-width: 991.98px)', size: 'md' },
            { query: '(min-width: 992px) and (max-width: 1199.98px)', size: 'lg' },
            { query: '(min-width: 1200px)', size: 'xl' }
        ];

        screenSizeMediaQueries.forEach(item => {
            const mediaQuery = window.matchMedia(item.query);
            
            // Initial check
            if (mediaQuery.matches) {
                this.state.screenSize = item.size;
            }
            
            // Add listener for future changes
            const handler = (e) => {
                if (e.matches) {
                    this.state.screenSize = item.size;
                    this.handleResponsiveLayout();
                }
            };
            
            if (mediaQuery.addEventListener) {
                mediaQuery.addEventListener('change', handler);
            } else {
                // Fallback for older browsers
                mediaQuery.addListener(handler);
            }
        });
        
        // Reduced motion preference
        const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const motionHandler = (e) => {
            this.state.animationsEnabled = !e.matches;
        };
        
        if (motionQuery.addEventListener) {
            motionQuery.addEventListener('change', motionHandler);
        } else {
            motionQuery.addListener(motionHandler);
        }
    }
    
    /**
     * Apply theme-specific styling to UI elements
     */
    applyThemeToUI(theme) {
        // Apply theme-specific modifications to UI elements
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) {
            gameContainer.dataset.theme = theme;
        }
        
        // Update card faces for the current theme
        this.updateCardStyles(theme);
        
        // Update button styles for the new theme
        this.updateButtonStyles(theme);
    }
    
    /**
     * Update card styles based on theme
     */
    updateCardStyles(theme) {
        const cardFronts = document.querySelectorAll('.card-front');
        const cardBacks = document.querySelectorAll('.card-back');
        
        // Define theme-specific card styles
        const cardStyles = {
            default: {
                front: 'linear-gradient(135deg, #333, #222)',
                shadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
            },
            dark: {
                front: 'linear-gradient(135deg, #1a1a1a, #0a0a0a)',
                shadow: '0 4px 8px rgba(0, 0, 0, 0.4)'
            },
            nature: {
                front: 'linear-gradient(135deg, #2E7D32, #1B5E20)',
                shadow: '0 4px 8px rgba(27, 94, 32, 0.3)'
            },
            cyber: {
                front: 'linear-gradient(135deg, #0A192F, #172A45)',
                shadow: '0 4px 15px rgba(0, 240, 255, 0.3)'
            }
        };
        
        const style = cardStyles[theme] || cardStyles.default;
        
        // Apply styles to card elements
        cardFronts.forEach(front => {
            front.style.background = style.front;
        });
        
        document.querySelectorAll('.card-inner').forEach(inner => {
            inner.style.boxShadow = style.shadow;
        });
    }
    
    /**
     * Update button styles based on theme
     */
    updateButtonStyles(theme) {
        // Get theme-specific button colors from CSS variables
        const root = document.documentElement;
        const btnPrimaryBg = getComputedStyle(root).getPropertyValue('--btn-primary-bg') || '#6200ea';
        const btnPrimaryText = getComputedStyle(root).getPropertyValue('--btn-primary-text') || '#ffffff';
        const btnSecondaryBg = getComputedStyle(root).getPropertyValue('--btn-secondary-bg') || '#6c757d';
        const btnSecondaryText = getComputedStyle(root).getPropertyValue('--btn-secondary-text') || '#ffffff';
        
        // Update primary buttons
        document.querySelectorAll('.btn-primary').forEach(btn => {
            btn.style.backgroundColor = btnPrimaryBg;
            btn.style.borderColor = btnPrimaryBg;
            btn.style.color = btnPrimaryText;
        });
        
        // Update secondary buttons
        document.querySelectorAll('.btn-secondary').forEach(btn => {
            btn.style.backgroundColor = btnSecondaryBg;
            btn.style.borderColor = btnSecondaryBg;
            btn.style.color = btnSecondaryText;
        });
    }
    
    /**
     * Handle responsive layout changes
     */
    handleResponsiveLayout() {
        document.body.dataset.screenSize = this.state.screenSize;
        
        // Apply size-specific adjustments
        switch (this.state.screenSize) {
            case 'xs':
                this.applyMobileLayout(true); // Extra small screens
                break;
            case 'sm':
                this.applyMobileLayout(false); // Small screens
                break;
            case 'md':
                this.applyTabletLayout(); // Medium screens
                break;
            case 'lg':
            case 'xl':
                this.applyDesktopLayout(); // Large and extra large screens
                break;
        }
    }
    
    /**
     * Apply mobile-specific layout
     * @param {boolean} isExtraSmall - Whether this is an extra small screen
     */
    applyMobileLayout(isExtraSmall) {
        // Simplify UI for very small screens
        const highScores = document.querySelector('.high-scores');
        if (highScores) {
            highScores.classList.add('d-none');
        }
        
        // Make buttons more compact
        document.querySelectorAll('.btn').forEach(btn => {
            btn.classList.add('btn-sm');
        });
        
        // Adjust game info display
        const gameInfo = document.querySelector('.game-info');
        if (gameInfo) {
            gameInfo.classList.add('compact-info');
        }
        
        // Adjust difficulty selector
        const difficultySelector = document.querySelector('.difficulty-selector');
        if (difficultySelector) {
            difficultySelector.classList.add('btn-group-sm');
        }
        
        // Extra adjustments for very small screens
        if (isExtraSmall) {
            // Simplify header
            const headerWrapper = document.querySelector('.header-wrapper');
            if (headerWrapper) {
                headerWrapper.classList.add('mini-header');
            }
            
            // Use more compact labels
            this.useCompactLabels(true);
        } else {
            this.useCompactLabels(false);
        }
    }
    
    /**
     * Apply tablet-specific layout
     */
    applyTabletLayout() {
        // Reset mobile adjustments
        document.querySelectorAll('.btn').forEach(btn => {
            btn.classList.remove('btn-sm');
        });
        
        const gameInfo = document.querySelector('.game-info');
        if (gameInfo) {
            gameInfo.classList.remove('compact-info');
        }
        
        // Show high scores again
        const highScores = document.querySelector('.high-scores');
        if (highScores) {
            highScores.classList.remove('d-none');
        }
        
        const headerWrapper = document.querySelector('.header-wrapper');
        if (headerWrapper) {
            headerWrapper.classList.remove('mini-header');
        }
        
        // Use standard labels
        this.useCompactLabels(false);
    }
    
    /**
     * Apply desktop-specific layout
     */
    applyDesktopLayout() {
        // Similar to tablet, but with potentially more enhancements
        this.applyTabletLayout();
        
        // Add desktop-specific enhancements
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) {
            gameContainer.classList.add('enhanced-shadows');
        }
    }
    
    /**
     * Toggle between full and compact labels for UI elements
     */
    useCompactLabels(compact) {
        // Get all elements with a data-label-full attribute
        const elements = document.querySelectorAll('[data-label-full]');
        
        elements.forEach(el => {
            if (compact && el.dataset.labelCompact) {
                el.textContent = el.dataset.labelCompact;
            } else {
                el.textContent = el.dataset.labelFull;
            }
        });
    }
    
    /**
     * Handle viewport resize events
     */
    handleViewportResize(e) {
        const detail = e.detail;
        
        // Update card grid based on new dimensions
        if (this.elements.gameGrid) {
            // Store the current dimensions in a data attribute
            this.elements.gameGrid.dataset.cardSize = detail.cardSize;
        }
        
        // Update other UI elements based on new viewport size
        this.adjustUIForViewport(detail);
    }
    
    /**
     * Adjust UI elements based on viewport changes
     */
    adjustUIForViewport(viewportInfo) {
        // Adjust font sizes based on card size
        if (viewportInfo.cardSize < 60) {
            document.body.classList.add('small-cards');
        } else {
            document.body.classList.remove('small-cards');
        }
        
        // Adjust layout based on orientation
        document.body.classList.toggle('layout-portrait', viewportInfo.orientation === 'portrait');
        document.body.classList.toggle('layout-landscape', viewportInfo.orientation === 'landscape');
        
        // Adjust button sizes based on device type
        const buttonSize = viewportInfo.deviceType === 'mobile' ? 'btn-sm' : '';
        document.querySelectorAll('.btn').forEach(btn => {
            btn.classList.remove('btn-sm', 'btn-lg');
            if (buttonSize) {
                btn.classList.add(buttonSize);
            }
        });
    }
    
    /**
     * Update UI based on current game state
     */
    updateUIForGameState(detail) {
        const state = detail.state || this.state.currentGameState;
        
        // Update body class
        document.body.classList.remove('game-idle', 'game-playing', 'game-paused', 'game-over', 'level-up');
        document.body.classList.add(`game-${state}`);
        
        // State-specific UI updates
        switch (state) {
            case 'playing':
                this.elements.startBtn.textContent = 'Reset Game';
                this.elements.startBtn.classList.add('btn-warning');
                this.elements.startBtn.classList.remove('btn-success', 'btn-primary');
                break;
                
            case 'paused':
                this.showNotification('Game Paused', 3000, 'info');
                this.elements.startBtn.textContent = 'Resume Game';
                this.elements.startBtn.classList.add('btn-success');
                this.elements.startBtn.classList.remove('btn-warning', 'btn-primary');
                break;
                
            case 'levelup':
                this.showLevelUpAnimation(detail.level);
                break;
                
            case 'gameover':
                this.elements.startBtn.textContent = 'Start New Game';
                this.elements.startBtn.classList.add('btn-primary');
                this.elements.startBtn.classList.remove('btn-warning', 'btn-success');
                break;
                
            case 'idle':
                this.elements.startBtn.textContent = 'Start Game';
                this.elements.startBtn.classList.add('btn-primary');
                this.elements.startBtn.classList.remove('btn-warning', 'btn-success');
                break;
        }
    }
    
    /**
     * Toggle fullscreen mode
     */
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            // Enter fullscreen
            const gameContainer = document.querySelector('.game-container');
            if (gameContainer && gameContainer.requestFullscreen) {
                gameContainer.requestFullscreen()
                    .catch(err => {
                        this.showNotification('Fullscreen not supported by your browser', 3000, 'error');
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
     * Update fullscreen button appearance
     */
    updateFullscreenButton() {
        if (!this.elements.fullscreenBtn) return;
        
        const icon = this.elements.fullscreenBtn.querySelector('i');
        if (icon) {
            if (this.state.isFullscreen) {
                icon.className = 'bi bi-fullscreen-exit';
                this.elements.fullscreenBtn.setAttribute('aria-label', 'Exit fullscreen');
                this.elements.fullscreenBtn.title = 'Exit fullscreen';
            } else {
                icon.className = 'bi bi-fullscreen';
                this.elements.fullscreenBtn.setAttribute('aria-label', 'Enter fullscreen');
                this.elements.fullscreenBtn.title = 'Enter fullscreen';
            }
        }
    }
    
    /**
     * Display a notification message with enhanced visuals
     * @param {string} message - The message to display
     * @param {number} duration - How long to show the message in ms (default: 3000ms)
     * @param {string} type - The type of toast (info, success, warning, error)
     * @param {string} position - Where to display the toast (top, center, bottom)
     */
    showNotification(message, duration = 3000, type = 'info', position = 'top') {
        // Avoid duplicate notifications in quick succession
        if (message === this.state.lastNotification) {
            return;
        }
        
        // Remember this notification
        this.state.lastNotification = message;
        setTimeout(() => {
            if (this.state.lastNotification === message) {
                this.state.lastNotification = '';
            }
        }, duration);
        
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
        
        // Add icon based on type for visual enhancement
        const iconTypes = {
            'success': 'bi-check-circle-fill',
            'warning': 'bi-exclamation-triangle-fill',
            'error': 'bi-x-circle-fill',
            'info': 'bi-info-circle-fill'
        };
        
        if (iconTypes[type]) {
            const icon = document.createElement('i');
            icon.className = `bi ${iconTypes[type]} toast-icon`;
            toast.prepend(icon);
        }
        
        // Add accessibility support
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
        
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
        // Avoid duplicate level up animations
        if (level === this.state.lastLevelNotified) return;
        this.state.lastLevelNotified = level;
        
        // Create level up text animation
        const levelUpAnimation = document.createElement('div');
        levelUpAnimation.className = 'level-up-animation';
        levelUpAnimation.innerHTML = `
            <div class="level-up-content">
                <i class="bi bi-arrow-up-circle-fill level-icon"></i>
                <h2>LEVEL ${level}!</h2>
                <p>Difficulty increases...</p>
            </div>
        `;
        
        // Add accessibility attributes
        levelUpAnimation.setAttribute('role', 'status');
        levelUpAnimation.setAttribute('aria-live', 'assertive');
        
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
        if (this.confettiActive || !this.state.animationsEnabled) return;
        this.confettiActive = true;
        
        // More vibrant colors
        const colors = [
            '#FF5252', '#FFEB3B', '#4CAF50', '#2196F3', 
            '#9C27B0', '#FF9800', '#00BCD4', '#F44336',
            '#76FF03', '#651FFF', '#FF4081', '#FFC107'
        ];
        
        // Different shapes
        const shapes = ['circle', 'square', 'triangle'];
        
        // Create confetti pieces
        for (let i = 0; i < 100; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                
                // Randomly select color and shape
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                
                // Apply different shapes
                const shape = shapes[Math.floor(Math.random() * shapes.length)];
                if (shape === 'circle') {
                    confetti.style.borderRadius = '50%';
                } else if (shape === 'triangle') {
                    confetti.style.width = '0';
                    confetti.style.height = '0';
                    confetti.style.backgroundColor = 'transparent';
                    confetti.style.borderLeft = `${Math.random() * 5 + 5}px solid transparent`;
                    confetti.style.borderRight = `${Math.random() * 5 + 5}px solid transparent`;
                    confetti.style.borderBottom = `${Math.random() * 10 + 10}px solid ${colors[Math.floor(Math.random() * colors.length)]}`;
                }
                
                // Position and size
                confetti.style.left = `${Math.random() * 100}%`;
                confetti.style.width = `${Math.random() * 10 + 5}px`;
                confetti.style.height = shape === 'triangle' ? 'auto' : `${Math.random() * 10 + 5}px`;
                
                // Animation properties
                confetti.style.animationDuration = `${Math.random() * 3 + 2}s`;
                confetti.style.animationDelay = `${Math.random() * 0.5}s`;
                
                // Add rotation for more dynamic movement
                const rotation = Math.random() * 360;
                confetti.style.transform = `rotate(${rotation}deg)`;
                
                // More varied falling patterns
                const translateX = (Math.random() - 0.5) * 100;
                confetti.style.setProperty('--translate-end-x', `${translateX}px`);
                
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
        
        // Update combo count
        this.state.comboCount++;
        
        // Clear any existing combo timer
        if (this.state.comboTimer) {
            clearTimeout(this.state.comboTimer);
        }
        
        // Set a combo timer - combo resets after 5 seconds of no matches
        this.state.comboTimer = setTimeout(() => {
            this.state.comboCount = 0;
        }, 5000);
        
        // Determine progress percentage
        const progressPercentage = (matchedPairs / totalPairs) * 100;
        
        // Show combo message for quick successive matches
        if (this.state.comboCount > 1) {
            const comboMessages = [
                "Nice combo!",
                "Combo x2!",
                "Memory master!",
                "Combo x3!",
                "Incredible!",
                "Combo x4!",
                "Unstoppable!",
                "Combo x5!",
                "Legendary!",
                "COMBO MASTER!"
            ];
            
            const messageIndex = Math.min(this.state.comboCount - 2, comboMessages.length - 1);
            const message = comboMessages[messageIndex];
            
            this.showComboAnimation(message, this.state.comboCount);
        }
        
        // Show progress feedback
        let message = '';
        
        if (progressPercentage === 100) {
            message = 'All pairs found! Level complete!';
        } else if (matchedPairs === 1) {
            message = 'First match found! Keep going!';
        } else if (progressPercentage >= 75 && progressPercentage < 100) {
            message = 'Almost there! Just a few more pairs!';
        } else if (progressPercentage >= 50 && progressPercentage < 75) {
            message = 'Halfway there! Good progress!';
        } else if (progressPercentage >= 25 && progressPercentage < 50) {
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
        
        // Create a match score popup
        this.createScorePopup(card1, matchedPairs);
        
        // Remove highlight effect after animation
        setTimeout(() => {
            card1.classList.remove('highlight-match');
            card2.classList.remove('highlight-match');
        }, 800);
    }
    
    /**
     * Create a score popup at the matched card
     */
    createScorePopup(card, matchNumber) {
        if (!this.state.animationsEnabled) return;
        
        // Calculate points based on match number and combo
        const basePoints = 10;
        const comboMultiplier = Math.min(this.state.comboCount, 5);
        const points = basePoints * comboMultiplier;
        
        // Create popup element
        const popup = document.createElement('div');
        popup.className = 'score-popup';
        popup.innerHTML = `+${points}`;
        
        // Style based on combo level
        if (comboMultiplier > 1) {
            popup.classList.add('combo');
            popup.innerHTML += ` <span class="combo-text">x${comboMultiplier}</span>`;
        }
        
        // Position popup at the card
        const cardRect = card.getBoundingClientRect();
        const containerRect = this.feedbackContainer.getBoundingClientRect();
        
        popup.style.left = `${cardRect.left - containerRect.left + (cardRect.width / 2)}px`;
        popup.style.top = `${cardRect.top - containerRect.top}px`;
        
        // Add to the feedback container
        this.feedbackContainer.appendChild(popup);
        
        // Apply show class to trigger animation
        setTimeout(() => {
            popup.classList.add('show');
        }, 10);
        
        // Remove after animation completes
        setTimeout(() => {
            popup.classList.remove('show');
            setTimeout(() => {
                popup.remove();
            }, 500);
        }, 1200);
    }
    
    /**
     * Show a combo animation in the center of the screen
     */
    showComboAnimation(message, comboCount) {
        if (!this.state.animationsEnabled) return;
        
        // Create combo animation element
        const comboAnim = document.createElement('div');
        comboAnim.className = 'combo-animation';
        comboAnim.innerHTML = `<span>${message}</span>`;
        
        // Add combo level class
        const comboLevel = Math.min(Math.floor(comboCount / 2), 5);
        comboAnim.classList.add(`combo-level-${comboLevel}`);
        
        // Add to feedback container
        this.feedbackContainer.appendChild(comboAnim);
        
        // Trigger animation
        setTimeout(() => {
            comboAnim.classList.add('show');
            
            // Remove after animation
            setTimeout(() => {
                comboAnim.classList.remove('show');
                setTimeout(() => {
                    comboAnim.remove();
                }, 300);
            }, 1000);
        }, 10);
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
        
        // Update progress indicators if available
        this.updateProgressIndicators(state);
    }
    
    /**
     * Update progress indicators (like completion percentage)
     */
    updateProgressIndicators(state) {
        const progressBar = document.getElementById('progress-bar');
        if (progressBar && state.matchedPairs !== undefined && state.totalPairs !== undefined) {
            const percentage = (state.matchedPairs / state.totalPairs) * 100;
            progressBar.style.width = `${percentage}%`;
            progressBar.setAttribute('aria-valuenow', percentage);
        }
    }
    
    /**
     * Update an element with optional animation
     * @param {HTMLElement} element - The element to update
     * @param {*} value - The new value
     * @param {boolean} animate - Whether to animate the change
     */
    updateWithAnimation(element, value, animate) {
        // Skip if the value hasn't changed
        if (element.textContent === value.toString()) return;
        
        if (animate && this.state.animationsEnabled) {
            // Create and position an animation element
            const animElement = document.createElement('div');
            animElement.className = 'value-change-animation';
            const currentValue = parseFloat(element.textContent) || 0;
            const newValue = parseFloat(value) || 0;
            
            // Determine direction of change
            if (newValue > currentValue) {
                animElement.classList.add('increasing');
                animElement.textContent = `+${newValue - currentValue}`;
            } else if (newValue < currentValue) {
                animElement.classList.add('decreasing');
                animElement.textContent = `-${currentValue - newValue}`;
            } else {
                // No change, no animation needed
                return;
            }
            
            // Position the animation near the element
            const rect = element.getBoundingClientRect();
            animElement.style.top = `${rect.top - 20}px`;
            animElement.style.left = `${rect.left + rect.width / 2}px`;
            
            // Add to DOM
            document.body.appendChild(animElement);
            
            // Trigger animation
            setTimeout(() => {
                animElement.classList.add('active');
                
                // Remove after animation completes
                setTimeout(() => {
                    animElement.remove();
                }, 1000);
            }, 10);
            
            // Add highlight class to element
            element.classList.add('pulse-effect');
            
            // Remove highlight after animation completes
            setTimeout(() => {
                element.classList.remove('pulse-effect');
            }, 500);
        }
        
        // Update the text content with the new value
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
        
        // Update circular timer if it exists
        this.updateCircularTimer(timeLeft);
    }
    
    /**
     * Update circular timer display
     */
    updateCircularTimer(timeLeft) {
        const circularTimer = document.querySelector('.circular-timer');
        if (!circularTimer) return;
        
        // Get maximum time from the element's data attribute
        const maxTime = parseInt(circularTimer.dataset.maxTime, 10) || 120;
        
        // Calculate percentage of time remaining
        const percentLeft = (timeLeft / maxTime) * 100;
        
        // Update progress circle
        const circleProgress = circularTimer.querySelector('.timer-progress');
        if (circleProgress) {
            // SVG circle circumference calculation
            const radius = parseInt(circleProgress.getAttribute('r'), 10) || 40;
            const circumference = 2 * Math.PI * radius;
            
            // Calculate stroke-dashoffset based on percentage
            const dashOffset = circumference * (1 - percentLeft / 100);
            circleProgress.style.strokeDashoffset = dashOffset;
            
            // Update timer colors based on time left
            if (timeLeft <= 10) {
                circleProgress.setAttribute('stroke', '#ff3d00'); // Critical - red
            } else if (timeLeft <= 30) {
                circleProgress.setAttribute('stroke', '#ff9800'); // Warning - orange
            } else {
                circleProgress.setAttribute('stroke', '#00e676'); // Normal - green
            }
        }
        
        // Update digital time display inside the circle
        const timeDisplay = circularTimer.querySelector('.timer-text');
        if (timeDisplay) {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timeDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
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
                    
                    // Add trophy icon temporarily
                    const trophyIcon = document.createElement('i');
                    trophyIcon.className = 'bi bi-trophy-fill high-score-trophy';
                    element.appendChild(trophyIcon);
                    
                    // Remove trophy after animation
                    setTimeout(() => {
                        trophyIcon.classList.add('fade-out');
                        setTimeout(() => {
                            trophyIcon.remove();
                        }, 500);
                    }, 3000);
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
                            <div id="game-result-container" class="text-center mb-4">
                                <div class="game-result-icon ${victory ? 'victory' : 'defeat'}">
                                    <i class="bi ${victory ? 'bi-trophy-fill' : 'bi-emoji-dizzy-fill'}"></i>
                                </div>
                                <p id="gameEndMessage" class="lead mt-3"></p>
                            </div>
                            
                            <div class="score-display mb-4">
                                <h3>Your Score</h3>
                                <div class="final-score-container">
                                    <span id="finalScoreDisplay" class="final-score"></span>
                                </div>
                            </div>
                            
                            <div id="nameInputContainer">
                                <label for="playerNameInput" class="form-label">Enter your name for the leaderboard:</label>
                                <div class="input-group">
                                    <span class="input-group-text"><i class="bi bi-person-fill"></i></span>
                                    <input type="text" class="form-control" id="playerNameInput" placeholder="Your Name">
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" id="saveScoreBtn">
                                <i class="bi bi-save"></i> Save Score
                            </button>
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                <i class="bi bi-x"></i> Close
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
        }
        
        // Update modal content
        document.getElementById('gameEndMessage').textContent = message;
        
        // Update final score with animation
        const finalScoreDisplay = document.getElementById('finalScoreDisplay');
        finalScoreDisplay.textContent = '0';
        
        // Animate score counting up
        if (this.state.animationsEnabled) {
            let currentScore = 0;
            const duration = 1500; // ms
            const interval = 20; // ms
            const increment = Math.max(1, Math.floor(score / (duration / interval)));
            
            const countUp = setInterval(() => {
                currentScore = Math.min(currentScore + increment, score);
                finalScoreDisplay.textContent = currentScore;
                
                if (currentScore >= score) {
                    clearInterval(countUp);
                    finalScoreDisplay.textContent = score;
                    finalScoreDisplay.classList.add('pulse-effect');
                    setTimeout(() => {
                        finalScoreDisplay.classList.remove('pulse-effect');
                    }, 500);
                }
            }, interval);
        } else {
            finalScoreDisplay.textContent = score;
        }
        
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
            
            // Show save animation
            saveScoreBtn.innerHTML = '<i class="bi bi-check-circle"></i> Score Saved!';
            saveScoreBtn.classList.add('btn-success');
            saveScoreBtn.classList.remove('btn-primary');
            
            // Show confirmation toast
            this.showNotification(`Score saved for ${playerName}!`, 2000, 'success');
            
            // Disable button to prevent multiple saves
            saveScoreBtn.disabled = true;
            
            // Close the modal after a delay
            setTimeout(() => {
                const modalInstance = bootstrap.Modal.getInstance(modal);
                if (modalInstance) {
                    modalInstance.hide();
                }
            }, 1500);
            
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
        
        // Create countdown container
        const countdownContainer = document.createElement('div');
        countdownContainer.className = 'countdown-container';
        
        // Create countdown element
        const countdown = document.createElement('div');
        countdown.className = 'countdown-number';
        countdown.textContent = count.toString();
        
        // Add label
        const label = document.createElement('div');
        label.className = 'countdown-label';
        label.textContent = 'Get Ready!';
        
        // Build the container
        countdownContainer.appendChild(countdown);
        countdownContainer.appendChild(label);
        
        // Add to feedback container
        this.feedbackContainer.appendChild(countdownContainer);
        
        // Add accessibility attributes
        countdownContainer.setAttribute('role', 'status');
        countdownContainer.setAttribute('aria-live', 'assertive');
        
        // Show the container
        setTimeout(() => {
            countdownContainer.classList.add('show');
        }, 10);
        
        // Update the count every second
        const interval = setInterval(() => {
            count--;
            
            if (count > 0) {
                // Update number
                countdown.textContent = count.toString();
                
                // Reset animation
                countdown.classList.remove('pulse');
                void countdown.offsetWidth; // Force reflow
                countdown.classList.add('pulse');
            } else {
                // Last number - "Go!"
                countdown.textContent = 'GO!';
                countdown.classList.add('go');
                label.classList.add('hidden');
                
                // Clear interval and prepare to remove
                clearInterval(interval);
                
                setTimeout(() => {
                    countdownContainer.classList.remove('show');
                    setTimeout(() => {
                        countdownContainer.remove();
                        if (onComplete) onComplete();
                    }, 500);
                }, 1000);
            }
        }, 1000);
    }
    
    /**
     * Show a loading spinner in the game grid
     * @param {string} message - Custom loading message
     */
    showGridLoading(message = 'Loading game...') {
        if (!this.elements.gameGrid) return;
        
        this.elements.gameGrid.innerHTML = `
            <div class="loading-container">
                <div class="spinner">
                    <div class="spinner-inner"></div>
                </div>
                <p>${message}</p>
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
            this.elements.startBtn.classList.add('btn-warning');
            this.elements.startBtn.classList.remove('btn-primary');
        } else {
            this.elements.startBtn.textContent = 'Start Game';
            this.elements.startBtn.classList.add('btn-primary');
            this.elements.startBtn.classList.remove('btn-warning');
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
        
        // Create a quick flash effect across the game
        if (timeLeft <= 10 && this.state.animationsEnabled) {
            const flash = document.createElement('div');
            flash.className = 'time-warning-flash';
            this.feedbackContainer.appendChild(flash);
            
            setTimeout(() => {
                flash.classList.add('show');
                setTimeout(() => {
                    flash.classList.remove('show');
                    setTimeout(() => {
                        flash.remove();
                    }, 300);
                }, 200);
            }, 10);
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
        
        // Reset combo count
        this.state.comboCount = 0;
        
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