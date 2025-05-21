/**
 * Enhanced Accessibility Manager
 * 
 * Comprehensive accessibility improvements for the Memory Matrix game
 * including keyboard navigation, screen reader support, and reduced motion options
 */
class AccessibilityManager {
    constructor() {
        // Store references to focusable elements
        this.focusableElements = {
            cards: [],
            buttons: [],
            controls: []
        };
        
        // Track current focus position
        this.state = {
            currentCardIndex: -1,
            focusTrapActive: false,
            currentFocusTrap: null,
            prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
            highContrastMode: window.matchMedia('(prefers-contrast: more)').matches,
            lastAnnouncement: '',
            enableSoundDescriptions: false,
            focusableElements: [],
            keyboardNavEnabled: true
        };
        
        // Initialize
        this.init();
    }
    
    /**
     * Initialize accessibility features
     */
    init() {
        // Set up event listeners for accessibility features
        this.setupEventListeners();
        
        // Add keyboard navigation for card grid
        this.addCardKeyboardNavigation();
        
        // Add modal accessibility improvements
        this.addModalAccessibility();
        
        // Add high contrast mode support
        this.setupHighContrastMode();
        
        // Add reduced motion support
        this.setupReducedMotion();
        
        // Listen for game state changes to update ARIA attributes
        document.addEventListener('gameStateChange', this.handleGameStateChange.bind(this));
        
        // Create announcer element for screen readers
        this.createScreenReaderAnnouncer();
    }
    
    /**
     * Set up event listeners for accessibility features
     */
    setupEventListeners() {
        // Listen for preference changes
        const motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (motionMediaQuery.addEventListener) {
            motionMediaQuery.addEventListener('change', this.handleReducedMotionChange.bind(this));
        } else {
            // Fallback for older browsers
            motionMediaQuery.addListener(this.handleReducedMotionChange.bind(this));
        }
        
        const contrastMediaQuery = window.matchMedia('(prefers-contrast: more)');
        if (contrastMediaQuery.addEventListener) {
            contrastMediaQuery.addEventListener('change', this.handleContrastChange.bind(this));
        } else {
            contrastMediaQuery.addListener(this.handleContrastChange.bind(this));
        }
        
        // Listen for focus events to track current focus
        document.addEventListener('focusin', this.handleFocusIn.bind(this));
        
        // Listen for keyboard shortcuts
        document.addEventListener('keydown', this.handleGlobalKeyboard.bind(this));
    }
    
    /**
     * Handle global keyboard shortcuts
     */
    handleGlobalKeyboard(e) {
        // Only handle if keyboard navigation is enabled
        if (!this.state.keyboardNavEnabled) return;
        
        // Check for modal open - if open, don't process global shortcuts
        if (document.body.classList.contains('modal-open')) return;
        
        switch (e.key) {
            case 'p':
            case 'P':
                // Pause/resume game shortcut
                const pauseBtn = document.getElementById('pause-btn');
                if (pauseBtn && !pauseBtn.classList.contains('d-none')) {
                    pauseBtn.click();
                    e.preventDefault();
                }
                break;
                
            case 'f':
            case 'F':
                // Fullscreen toggle shortcut
                const fullscreenBtn = document.getElementById('fullscreen-btn');
                if (fullscreenBtn && !fullscreenBtn.classList.contains('d-none')) {
                    fullscreenBtn.click();
                    e.preventDefault();
                }
                break;
                
            case 's':
            case 'S':
                // Start/reset game shortcut
                const startBtn = document.getElementById('start-btn');
                if (startBtn) {
                    startBtn.click();
                    e.preventDefault();
                }
                break;
                
            case 'h':
            case 'H':
                // Help/instructions shortcut
                const instructionsBtn = document.querySelector('[data-bs-target="#instructionsModal"]');
                if (instructionsBtn) {
                    instructionsBtn.click();
                    e.preventDefault();
                }
                break;
                
            case 'Escape':
                // Check if we need to handle Escape for game pause
                if (document.body.classList.contains('game-playing')) {
                    // Trigger pause
                    const pauseBtn = document.getElementById('pause-btn');
                    if (pauseBtn && !pauseBtn.classList.contains('d-none')) {
                        pauseBtn.click();
                        e.preventDefault();
                    }
                }
                break;
        }
    }
    
    /**
     * Handle focus events to track current focus
     */
    handleFocusIn(e) {
        const target = e.target;
        
        // Update current card index if a card is focused
        if (target.classList.contains('card')) {
            this.state.currentCardIndex = parseInt(target.dataset.index || '0', 10);
        }
        
        // Check if this is a focusable element we should track
        if (target.tagName === 'BUTTON' || 
            target.tagName === 'A' || 
            target.tagName === 'INPUT' || 
            target.classList.contains('card')) {
            
            // Store in state to restore focus later if needed
            this.state.lastFocusedElement = target;
        }
    }
    
    /**
     * Handle changes to reduced motion preference
     */
    handleReducedMotionChange(e) {
        this.state.prefersReducedMotion = e.matches;
        this.applyReducedMotionSettings();
    }
    
    /**
     * Handle changes to high contrast preference
     */
    handleContrastChange(e) {
        this.state.highContrastMode = e.matches;
        this.applyHighContrastSettings();
    }
    
    /**
     * Add keyboard navigation for card grid
     */
    addCardKeyboardNavigation() {
        const gameGrid = document.getElementById('game-grid');
        if (!gameGrid) return;
        
        // Set tabindex on grid for keyboard access
        gameGrid.setAttribute('tabindex', '0');
        
        // Add focusin event listener to track when grid receives focus
        gameGrid.addEventListener('focusin', (e) => {
            if (e.target === gameGrid) {
                // Grid itself received focus, try to focus the first card or the last active card
                this.focusCurrentOrFirstCard();
            }
        });
        
        // Handle keyboard events on the grid and cards
        document.addEventListener('keydown', (e) => {
            // Only handle if grid or a card has focus
            const activeElement = document.activeElement;
            if (!activeElement || 
                (!activeElement.classList.contains('card') && 
                 activeElement !== gameGrid)) {
                return;
            }
            
            const cards = Array.from(gameGrid.querySelectorAll('.card'));
            if (cards.length === 0) return;
            
            // Current position in grid
            let index = this.state.currentCardIndex;
            
            // Make sure we have a valid index
            if (index < 0 || index >= cards.length) {
                index = 0;
            }
            
            // Get current columns from grid style or data attribute
            let columns = parseInt(gameGrid.dataset.columns, 10) || 6;
            
            // Calculate rows
            const rows = Math.ceil(cards.length / columns);
            
            // Calculate current row and column
            const row = Math.floor(index / columns);
            const col = index % columns;
            
            // Handle arrow keys for grid navigation
            switch (e.key) {
                case 'ArrowRight':
                    // Move right, wrap to next row if at edge
                    if (col === columns - 1) {
                        // At right edge, move to first column of next row
                        const nextRow = (row + 1) % rows;
                        index = nextRow * columns;
                    } else {
                        // Just move right
                        index = row * columns + (col + 1);
                    }
                    
                    // Ensure we don't go past the last card
                    if (index >= cards.length) {
                        index = row * columns;
                    }
                    break;
                    
                case 'ArrowLeft':
                    // Move left, wrap to previous row if at edge
                    if (col === 0) {
                        // At left edge, move to last column of previous row
                        const prevRow = (row - 1 + rows) % rows;
                        index = prevRow * columns + (columns - 1);
                    } else {
                        // Just move left
                        index = row * columns + (col - 1);
                    }
                    
                    // Ensure we don't go past the last card
                    if (index >= cards.length) {
                        index = cards.length - 1;
                    }
                    break;
                    
                case 'ArrowDown':
                    // Move down, wrap to top if at bottom
                    const nextRow = (row + 1) % rows;
                    index = nextRow * columns + col;
                    
                    // If this position is beyond the last card, adjust
                    if (index >= cards.length) {
                        // Go to the first column of the same row
                        index = nextRow * columns;
                        
                        // If still invalid, go to the first card
                        if (index >= cards.length) {
                            index = 0;
                        }
                    }
                    break;
                    
                case 'ArrowUp':
                    // Move up, wrap to bottom if at top
                    const prevRow = (row - 1 + rows) % rows;
                    index = prevRow * columns + col;
                    
                    // If this position is beyond the last card, adjust
                    if (index >= cards.length) {
                        // Find the last valid column in the previous row
                        let lastValidCol = columns - 1;
                        while (prevRow * columns + lastValidCol >= cards.length && lastValidCol >= 0) {
                            lastValidCol--;
                        }
                        
                        if (lastValidCol >= 0) {
                            index = prevRow * columns + lastValidCol;
                        } else {
                            // If no valid columns in previous row, go to first card
                            index = 0;
                        }
                    }
                    break;
                    
                case 'Home':
                    // Move to first card
                    index = 0;
                    break;
                    
                case 'End':
                    // Move to last card
                    index = cards.length - 1;
                    break;
                    
                case 'Enter':
                case ' ': // Space key
                    // Activate card if it can be clicked
                    if (activeElement.classList.contains('card')) {
                        // Only if not already matched or flipped
                        if (!activeElement.classList.contains('flipped') && 
                            !activeElement.classList.contains('matched')) {
                            activeElement.click();
                            e.preventDefault(); // Prevent scrolling on space key
                        }
                    }
                    return;
                    
                default:
                    return; // Exit for other keys
            }
            
            // Validate index is within bounds
            index = Math.max(0, Math.min(index, cards.length - 1));
            
            // Store the new index
            this.state.currentCardIndex = index;
            
            // Focus the new card
            if (cards[index]) {
                cards[index].focus();
                e.preventDefault(); // Prevent scrolling with arrow keys
            }
        });
    }
    
    /**
     * Focus the current card or the first card in the grid
     */
    focusCurrentOrFirstCard() {
        const gameGrid = document.getElementById('game-grid');
        if (!gameGrid) return;
        
        const cards = Array.from(gameGrid.querySelectorAll('.card'));
        if (cards.length === 0) return;
        
        // If we have a valid current index, use it
        if (this.state.currentCardIndex >= 0 && 
            this.state.currentCardIndex < cards.length) {
            cards[this.state.currentCardIndex].focus();
        } else {
            // Otherwise focus the first card
            cards[0].focus();
            this.state.currentCardIndex = 0;
        }
    }
    
    /**
     * Add accessibility improvements to modals
     */
    addModalAccessibility() {
        // Add keyboard handling for modals
        document.querySelectorAll('.modal').forEach(modal => {
            // Store original element that opened the modal to return focus
            modal.addEventListener('show.bs.modal', (e) => {
                modal.dataset.returnFocus = (document.activeElement?.id || '');
                this.state.focusTrapActive = true;
                this.state.currentFocusTrap = modal;
            });
            
            // Trap focus inside modal when open
            modal.addEventListener('shown.bs.modal', () => {
                this.trapFocusInModal(modal);
            });
            
            // When modal closes, return focus to element that opened it
            modal.addEventListener('hidden.bs.modal', () => {
                const returnId = modal.dataset.returnFocus;
                if (returnId) {
                    const returnElement = document.getElementById(returnId);
                    if (returnElement) {
                        returnElement.focus();
                    } else if (this.state.lastFocusedElement) {
                        // Fallback to last focused element
                        this.state.lastFocusedElement.focus();
                    }
                }
                
                this.state.focusTrapActive = false;
                this.state.currentFocusTrap = null;
            });
        });
    }
    
    /**
     * Trap keyboard focus inside a modal
     */
    trapFocusInModal(modal) {
        // Get all focusable elements in the modal
        const focusableElements = this.getFocusableElements(modal);
        this.state.focusableElements = focusableElements;
        
        if (focusableElements.length === 0) return;
        
        // Focus the first element or the close button
        const closeButton = modal.querySelector('.btn-close');
        const firstElement = closeButton || focusableElements[0];
        firstElement.focus();
        
        // Trap focus in the modal
        modal.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab') return;
            
            const firstFocusableElement = focusableElements[0];
            const lastFocusableElement = focusableElements[focusableElements.length - 1];
            
            if (e.shiftKey) {
                // Shift+Tab - if on first element, wrap to last
                if (document.activeElement === firstFocusableElement) {
                    e.preventDefault();
                    lastFocusableElement.focus();
                }
            } else {
                // Tab - if on last element, wrap to first
                if (document.activeElement === lastFocusableElement) {
                    e.preventDefault();
                    firstFocusableElement.focus();
                }
            }
        });
    }
    
    /**
     * Get all focusable elements within a container
     */
    getFocusableElements(container) {
        const selector = 'a[href]:not([disabled]), button:not([disabled]), ' +
                         'textarea:not([disabled]), input[type="text"]:not([disabled]), ' +
                         'input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), ' +
                         'select:not([disabled]), [tabindex]:not([tabindex="-1"])';
        
        return Array.from(container.querySelectorAll(selector))
            .filter(el => {
                // Ensure element is visible
                const style = window.getComputedStyle(el);
                return style.display !== 'none' && 
                       style.visibility !== 'hidden' && 
                       style.opacity !== '0';
            });
    }
    
    /**
     * Set up reduced motion support
     */
    setupReducedMotion() {
        this.applyReducedMotionSettings();
        
        // Add toggle in settings if needed
        const animationsToggle = document.getElementById('animationsToggle');
        if (animationsToggle) {
            // Set initial state based on system preference
            animationsToggle.checked = !this.state.prefersReducedMotion;
            
            // Listen for changes
            animationsToggle.addEventListener('change', () => {
                // Override system preference
                document.body.classList.toggle('force-animations', animationsToggle.checked);
                document.body.classList.toggle('reduce-motion', !animationsToggle.checked);
                
                // Announce change to screen readers
                this.announce(
                    animationsToggle.checked 
                        ? 'Animations enabled' 
                        : 'Animations disabled for reduced motion'
                );
            });
        }
    }
    
    /**
     * Apply reduced motion settings based on preferences
     */
    applyReducedMotionSettings() {
        if (this.state.prefersReducedMotion) {
            document.body.classList.add('reduce-motion');
            
            // Update animation toggle in settings if it exists
            const animationsToggle = document.getElementById('animationsToggle');
            if (animationsToggle) {
                animationsToggle.checked = false;
            }
        } else {
            document.body.classList.remove('reduce-motion');
            
            // Check if animations are forced on despite system preferences
            if (document.body.classList.contains('force-animations')) {
                document.body.classList.remove('reduce-motion');
            }
        }
    }
    
    /**
     * Set up high contrast mode support
     */
    setupHighContrastMode() {
        this.applyHighContrastSettings();
    }
    
    /**
     * Apply high contrast settings based on preferences
     */
    applyHighContrastSettings() {
        if (this.state.highContrastMode) {
            document.body.classList.add('high-contrast');
        } else {
            document.body.classList.remove('high-contrast');
        }
    }
    
    /**
     * Create an announcer element for screen readers
     */
    createScreenReaderAnnouncer() {
        // Check if announcer already exists
        let announcer = document.getElementById('sr-announcer');
        
        if (!announcer) {
            announcer = document.createElement('div');
            announcer.id = 'sr-announcer';
            announcer.className = 'sr-only';
            announcer.setAttribute('aria-live', 'polite');
            announcer.setAttribute('aria-atomic', 'true');
            document.body.appendChild(announcer);
        }
        
        this.announcer = announcer;
        return announcer;
    }
    
    /**
     * Make an announcement to screen readers
     */
    announce(message, priority = 'polite') {
        if (!message || message === this.state.lastAnnouncement) return;
        
        // Remember this announcement to avoid duplicates
        this.state.lastAnnouncement = message;
        
        // Set priority (assertive for important messages, polite for others)
        this.announcer.setAttribute('aria-live', priority);
        
        // Clear existing content first
        this.announcer.textContent = '';
        
        // Then add the new message after a small delay to ensure it's announced
        setTimeout(() => {
            this.announcer.textContent = message;
            
            // Clear after a few seconds to avoid cluttering the DOM
            setTimeout(() => {
                // Only clear if this is still the same message
                if (this.announcer.textContent === message) {
                    this.announcer.textContent = '';
                }
            }, 5000);
        }, 50);
    }
    
    /**
     * Handle game state changes
     */
    handleGameStateChange(e) {
        const state = e.detail;
        
        // Update card states if specific cards are provided
        if (state.cards) {
            state.cards.forEach(card => {
                this.updateCardAriaState(card);
            });
        }
        
        // Announce game events based on event type
        if (state.event) {
            this.announceGameEvent(state.event, state);
        }
        
        // Update game controls based on state
        if (state.state) {
            this.updateControlLabels(state.state);
        }
    }
    
    /**
     * Update card ARIA attributes based on its state
     */
    updateCardAriaState(card) {
        if (!card) return;
        
        // Get the card type and name (if available)
        const cardType = card.dataset.type || 'card';
        const cardName = card.dataset.name || '';
        const cardIndex = parseInt(card.dataset.index, 10) + 1;
        
        if (card.classList.contains('matched')) {
            // Card is matched - update aria attributes
            card.setAttribute('aria-label', `Card ${cardIndex} matched - ${cardType} ${cardName}`);
            card.setAttribute('aria-disabled', 'true');
            card.setAttribute('aria-pressed', 'true');
            card.tabIndex = -1; // Remove from tab order when matched
        } else if (card.classList.contains('flipped')) {
            // Card is flipped - update aria attributes
            card.setAttribute('aria-label', `Card ${cardIndex} flipped - ${cardType} ${cardName}`);
            card.setAttribute('aria-pressed', 'true');
        } else {
            // Card is face down - update aria attributes
            card.setAttribute('aria-label', `Card ${cardIndex} - face down`);
            card.setAttribute('aria-pressed', 'false');
            card.removeAttribute('aria-disabled');
            card.tabIndex = 0; // Ensure it's in the tab order
        }
    }
    
    /**
     * Update all card ARIA states
     */
    updateAllCardStates() {
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            this.updateCardAriaState(card);
        });
    }
    
    /**
     * Update control labels based on game state
     */
    updateControlLabels(gameState) {
        const startBtn = document.getElementById('start-btn');
        const pauseBtn = document.getElementById('pause-btn');
        
        if (startBtn) {
            // Update start button based on state
            switch (gameState) {
                case 'playing':
                    startBtn.setAttribute('aria-label', 'Reset Game');
                    break;
                case 'paused':
                    startBtn.setAttribute('aria-label', 'Reset Game');
                    break;
                case 'idle':
                case 'gameover':
                    startBtn.setAttribute('aria-label', 'Start Game');
                    break;
            }
        }
        
        if (pauseBtn) {
            // Update pause button based on state
            switch (gameState) {
                case 'playing':
                    pauseBtn.textContent = 'Pause Game';
                    pauseBtn.setAttribute('aria-label', 'Pause Game');
                    break;
                case 'paused':
                    pauseBtn.textContent = 'Resume Game';
                    pauseBtn.setAttribute('aria-label', 'Resume Game');
                    break;
            }
        }
    }
    
    /**
     * Announce game events to screen readers
     */
    announceGameEvent(event, state) {
        let message = '';
        let priority = 'polite';
        
        switch (event) {
            case 'gameStart':
                message = `Game started. Difficulty: ${state.difficulty}. Level: ${state.level}. Memorize the cards now.`;
                priority = 'assertive';
                break;
                
            case 'cardsHidden':
                message = 'Cards are now hidden. Find the matching pairs.';
                break;
                
            case 'match':
                message = `Match found! ${state.matchedPairs} out of ${state.totalPairs} pairs matched.`;
                break;
                
            case 'noMatch':
                message = 'No match. Try again.';
                break;
                
            case 'levelUp':
                message = `Level complete! Moving to level ${state.level}. Get ready.`;
                priority = 'assertive';
                break;
                
            case 'gameWon':
                message = `Congratulations! You won with a score of ${state.score}.`;
                priority = 'assertive';
                break;
                
            case 'gameLost':
                message = `Game over. Your score was ${state.score}.`;
                priority = 'assertive';
                break;
                
            case 'gamePaused':
                message = 'Game paused.';
                priority = 'assertive';
                break;
                
            case 'gameResumed':
                message = 'Game resumed.';
                priority = 'assertive';
                break;
                
            case 'timeWarning':
                message = `Warning: ${state.timeLeft} seconds remaining.`;
                priority = 'assertive';
                break;
                
            case 'combo':
                message = `Combo x${state.comboCount}! Bonus points earned.`;
                break;
        }
        
        if (message) {
            this.announce(message, priority);
        }
    }
    
    /**
     * Enable sound descriptions for better audio accessibility
     * @param {boolean} enable - Whether to enable sound descriptions
     */
    enableSoundDescriptions(enable) {
        this.state.enableSoundDescriptions = enable;
        
        // Announce the change
        this.announce(
            enable 
                ? 'Sound descriptions enabled. Audio events will be described.' 
                : 'Sound descriptions disabled.'
        );
    }
    
    /**
     * Describe a sound effect for screen readers
     * @param {string} soundType - The type of sound playing
     */
    describeSoundEffect(soundType) {
        if (!this.state.enableSoundDescriptions) return;
        
        let description = '';
        
        switch (soundType) {
            case 'flip':
                description = 'Card flip sound';
                break;
            case 'match':
                description = 'Card match sound';
                break;
            case 'levelUp':
                description = 'Level up fanfare';
                break;
            case 'gameOver':
                description = 'Game over sound';
                break;
            case 'combo':
                description = 'Combo bonus sound';
                break;
            case 'timeWarning':
                description = 'Time warning alert';
                break;
        }
        
        if (description) {
            this.announce(description, 'polite');
        }
    }
}

// Initialize and export as a singleton
export const accessibilityManager = new AccessibilityManager();