/**
 * Accessibility Enhancements
 * 
 * Handles keyboard navigation, screen reader support, and other accessibility features
 */
class AccessibilityManager {
    constructor() {
        this.init();
    }
    
    /**
     * Initialize accessibility features
     */
    init() {
        this.addCardKeyboardNavigation();
        this.addModalAccessibility();
        this.addAriaLabels();
        
        // Listen for game state changes to update ARIA attributes
        document.addEventListener('gameStateChange', this.handleGameStateChange.bind(this));
    }
    
    /**
     * Add keyboard navigation for card grid
     */
    addCardKeyboardNavigation() {
        const gameGrid = document.getElementById('game-grid');
        if (!gameGrid) return;
        
        // Set tabindex on cards for keyboard navigation
        gameGrid.addEventListener('focusin', (e) => {
            if (e.target.classList.contains('card')) {
                // Update active card for keyboard navigation
                this.currentCardIndex = parseInt(e.target.dataset.index || '0');
            }
        });
        
        // Handle keyboard events
        document.addEventListener('keydown', (e) => {
            // Only handle if game grid has focus or a card has focus
            const activeElement = document.activeElement;
            if (!activeElement || 
                (!activeElement.classList.contains('card') && 
                 activeElement !== gameGrid)) {
                return;
            }
            
            const cards = Array.from(gameGrid.querySelectorAll('.card'));
            if (cards.length === 0) return;
            
            // Current position in grid
            let index = this.currentCardIndex || 0;
            let columns = 6; // Default, will be calculated from grid style
            
            // Get actual columns from computed style
            const computedStyle = window.getComputedStyle(gameGrid);
            const gridColumns = computedStyle.getPropertyValue('grid-template-columns');
            if (gridColumns) {
                columns = gridColumns.split(' ').length;
            }
            
            // Calculate rows
            const rows = Math.ceil(cards.length / columns);
            
            // Calculate current row and column
            const row = Math.floor(index / columns);
            const col = index % columns;
            
            // Handle arrow keys
            switch (e.key) {
                case 'ArrowRight':
                    index = row * columns + ((col + 1) % columns);
                    break;
                case 'ArrowLeft':
                    index = row * columns + ((col - 1 + columns) % columns);
                    break;
                case 'ArrowDown':
                    index = ((row + 1) % rows) * columns + col;
                    // Adjust if we're past the end of cards
                    if (index >= cards.length) {
                        index = col;
                    }
                    break;
                case 'ArrowUp':
                    index = ((row - 1 + rows) % rows) * columns + col;
                    // Adjust if we're past the end of cards
                    if (index >= cards.length) {
                        index = ((rows - 1) * columns) + col;
                        if (index >= cards.length) {
                            index = cards.length - 1;
                        }
                    }
                    break;
                case 'Enter':
                case ' ': // Space key
                    // Activate card if it can be clicked
                    const card = cards[index];
                    if (card && 
                        !card.classList.contains('flipped') && 
                        !card.classList.contains('matched')) {
                        card.click();
                    }
                    break;
                default:
                    return; // Don't prevent default for other keys
            }
            
            // Focus the new card
            if (cards[index]) {
                cards[index].focus();
                this.currentCardIndex = index;
                e.preventDefault(); // Prevent scrolling with arrow keys
            }
        });
    }
    
    /**
     * Add accessibility improvements to modals
     */
    addModalAccessibility() {
        // Add keyboard handling for modals
        document.querySelectorAll('.modal').forEach(modal => {
            // Trap focus inside modal when open
            modal.addEventListener('shown.bs.modal', () => {
                this.trapFocusInModal(modal);
            });
            
            // When modal closes, return focus to element that opened it
            modal.addEventListener('hidden.bs.modal', (e) => {
                const trigger = e.relatedTarget || document.querySelector(`[data-bs-target="#${modal.id}"]`);
                if (trigger) {
                    trigger.focus();
                }
            });
        });
    }
    
    /**
     * Trap keyboard focus inside a modal
     */
    trapFocusInModal(modal) {
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        // Focus the first element
        firstElement.focus();
        
        // Trap focus in the modal
        modal.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab') return;
            
            if (e.shiftKey) {
                // If shift+tab and on first element, wrap to last
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                // If tab and on last element, wrap to first
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        });
    }
    
    /**
     * Add ARIA labels to game elements
     */
    addAriaLabels() {
        // Game grid
        const gameGrid = document.getElementById('game-grid');
        if (gameGrid) {
            gameGrid.setAttribute('role', 'grid');
            gameGrid.setAttribute('aria-label', 'Memory card game grid');
        }
        
        // Cards
        document.querySelectorAll('.card').forEach((card, index) => {
            card.setAttribute('role', 'button');
            card.setAttribute('aria-label', `Card ${index + 1}`);
            card.setAttribute('tabindex', '0');
            
            // Update card state
            this.updateCardAriaState(card);
        });
        
        // Game info elements
        document.querySelectorAll('.game-info div').forEach(div => {
            const label = div.querySelector('h3');
            const value = div.querySelector('p');
            
            if (label && value) {
                value.setAttribute('aria-label', `${label.textContent}: ${value.textContent}`);
                value.setAttribute('aria-live', 'polite');
            }
        });
        
        // Start/reset button
        const startBtn = document.getElementById('start-btn');
        if (startBtn) {
            startBtn.setAttribute('aria-label', 'Start game');
        }
    }
    
    /**
     * Update ARIA state of a card
     */
    updateCardAriaState(card) {
        if (card.classList.contains('matched')) {
            card.setAttribute('aria-label', `Card ${card.dataset.index} matched`);
            card.setAttribute('aria-disabled', 'true');
        } else if (card.classList.contains('flipped')) {
            // Get the card content description
            let contentDesc = '';
            if (card.dataset.value) {
                if (card.dataset.value.startsWith('#')) {
                    // For color cards
                    const colorName = this.getColorName(card.dataset.value);
                    contentDesc = `${colorName} color card`;
                } else {
                    // For other card types
                    contentDesc = `Card with ${card.dataset.value}`;
                }
            }
            
            card.setAttribute('aria-label', `Card ${parseInt(card.dataset.index) + 1} flipped, showing ${contentDesc}`);
        } else {
            card.setAttribute('aria-label', `Card ${parseInt(card.dataset.index) + 1}, face down`);
            card.removeAttribute('aria-disabled');
        }
    }
    
    /**
     * Convert hex color to color name
     */
    getColorName(hexColor) {
        // Simple mapping of hex colors to names
        const colorMap = {
            '#FF5252': 'red',
            '#FFEB3B': 'yellow',
            '#4CAF50': 'green',
            '#2196F3': 'blue',
            '#9C27B0': 'purple',
            '#FF9800': 'orange',
            '#00BCD4': 'cyan',
            '#795548': 'brown',
            '#607D8B': 'blue grey',
            '#F44336': 'red',
            '#FFC107': 'amber',
            '#8BC34A': 'light green',
            '#3F51B5': 'indigo',
            '#E91E63': 'pink',
            '#FF5722': 'deep orange',
            '#009688': 'teal',
            '#673AB7': 'deep purple',
            '#CDDC39': 'lime',
            '#03A9F4': 'light blue',
            '#9E9E9E': 'grey'
        };
        
        return colorMap[hexColor] || 'unknown';
    }
    
    /**
     * Handle game state changes
     */
    handleGameStateChange(e) {
        const state = e.detail;
        
        // Update card states
        if (state.cards) {
            state.cards.forEach(card => {
                this.updateCardAriaState(card);
            });
        }
        
        // Announce game events
        if (state.event) {
            this.announceGameEvent(state.event, state);
        }
    }
    
    /**
     * Announce game events to screen readers
     */
    announceGameEvent(event, state) {
        let message = '';
        const announcer = document.getElementById('game-announcer') || this.createAnnouncer();
        
        switch (event) {
            case 'gameStart':
                message = `Game started. Difficulty: ${state.difficulty}. Level: ${state.level}. Memorize the cards now.`;
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
                break;
            case 'gameWon':
                message = `Congratulations! You won with a score of ${state.score}.`;
                break;
            case 'gameLost':
                message = `Game over. Your score was ${state.score}.`;
                break;
            case 'timeWarning':
                message = `Warning: ${state.timeLeft} seconds remaining.`;
                break;
        }
        
        if (message) {
            announcer.textContent = message;
        }
    }
    
    /**
     * Create screen reader announcer element
     */
    createAnnouncer() {
        const announcer = document.createElement('div');
        announcer.id = 'game-announcer';
        announcer.className = 'sr-only';
        announcer.setAttribute('aria-live', 'assertive');
        announcer.setAttribute('aria-atomic', 'true');
        document.body.appendChild(announcer);
        return announcer;
    }
}

// Initialize accessibility features
export const accessibilityManager = new AccessibilityManager();