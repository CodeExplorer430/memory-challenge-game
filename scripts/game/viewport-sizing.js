/**
 * Viewport Sizing Helper
 * 
 * Handles dynamic sizing of game elements to fit any screen size without scrolling
 */
class ViewportSizingHelper {
    constructor() {
        // Configuration
        this.config = {
            minCardSize: 60,      // Minimum card size in pixels
            maxCardSize: 120,     // Maximum card size in pixels
            cardGap: 10,          // Gap between cards in pixels
            containerPadding: 20, // Game container padding in pixels
        };
        
        // Initialize
        this.init();
    }
    
    init() {
        // Set up resize listener
        window.addEventListener('resize', this.resizeGameElements.bind(this));
        window.addEventListener('orientationchange', () => {
            // Allow time for orientation change to complete
            setTimeout(this.resizeGameElements.bind(this), 300);
        });
        
        // Initial sizing
        this.resizeGameElements();
    }
    
    resizeGameElements() {
        this.adjustGameContainer();
        this.adjustCardGrid();
    }
    
    adjustGameContainer() {
        const gameContainer = document.querySelector('.game-container');
        if (!gameContainer) return;
        
        // Calculate available height
        const viewportHeight = window.innerHeight;
        const headerHeight = document.querySelector('.header-wrapper')?.offsetHeight || 0;
        const controlsTopHeight = document.querySelector('.controls-top')?.offsetHeight || 0;
        const gameInfoHeight = document.querySelector('.game-info-wrapper')?.offsetHeight || 0;
        const controlsBottomHeight = document.querySelector('.controls')?.offsetHeight || 0;
        const highScoresHeight = document.querySelector('.high-scores')?.offsetHeight || 0;
        
        // Calculate total height of non-grid elements
        const nonGridHeight = headerHeight + controlsTopHeight + gameInfoHeight + 
                             controlsBottomHeight + highScoresHeight + (this.config.containerPadding * 2);
        
        // Available height for the grid
        const availableGridHeight = viewportHeight - nonGridHeight - 30; // 30px buffer
        
        // Set max-height for grid container wrapper
        const gridWrapper = document.querySelector('.grid-container-wrapper');
        if (gridWrapper) {
            gridWrapper.style.maxHeight = `${availableGridHeight}px`;
        }
        
        // Check if we need to hide any elements on very small screens
        if (availableGridHeight < 200) {
            // Hide high scores on very small screens
            const highScores = document.querySelector('.high-scores');
            if (highScores) {
                highScores.style.display = 'none';
            }
        } else {
            // Show high scores again if they were hidden
            const highScores = document.querySelector('.high-scores');
            if (highScores) {
                highScores.style.display = '';
            }
        }
    }
    
    adjustCardGrid() {
        const grid = document.getElementById('game-grid');
        if (!grid) return;
        
        // Get the grid's container dimensions
        const gridContainer = document.querySelector('.grid-container-wrapper');
        if (!gridContainer) return;
        
        const gridRect = gridContainer.getBoundingClientRect();
        const availableWidth = gridRect.width - (this.config.containerPadding * 2);
        const availableHeight = gridRect.height - (this.config.containerPadding * 2);
        
        // Get current difficulty to determine grid dimensions
        const difficulty = grid.className.includes('easy') ? 'easy' : 
                          grid.className.includes('medium') ? 'medium' : 'hard';
        
        // Set columns based on difficulty
        let columns = 6; // Default
        let rows = 3;    // Default
        
        switch (difficulty) {
            case 'easy':
                columns = 6;
                rows = 3;
                break;
            case 'medium':
                columns = 6;
                rows = 4;
                break;
            case 'hard':
                columns = 6;
                rows = 6;
                break;
        }
        
        // Check if we're in landscape mode on small screens
        const isMobile = window.innerWidth <= 768;
        const isLandscape = window.innerWidth > window.innerHeight;
        
        if (isMobile && isLandscape) {
            // Adjust grid to better use landscape space
            if (difficulty === 'hard') {
                columns = 9;
                rows = 4;
            } else if (difficulty === 'medium') {
                columns = 8;
                rows = 3;
            } else {
                columns = 6;
                rows = 3;
            }
        } else if (isMobile && !isLandscape) {
            // Portrait mode on mobile - taller grid
            if (difficulty === 'hard') {
                columns = 4;
                rows = 9;
            } else if (difficulty === 'medium') {
                columns = 4;
                rows = 6;
            } else {
                columns = 3;
                rows = 6;
            }
        }
        
        // Calculate optimal card size based on available space
        const optimalWidthBasedSize = (availableWidth - ((columns - 1) * this.config.cardGap)) / columns;
        const optimalHeightBasedSize = (availableHeight - ((rows - 1) * this.config.cardGap)) / rows;
        
        // Use the smaller of the two to ensure cards fit properly
        let optimalCardSize = Math.min(optimalWidthBasedSize, optimalHeightBasedSize);
        
        // Enforce min/max constraints
        optimalCardSize = Math.min(Math.max(optimalCardSize, this.config.minCardSize), this.config.maxCardSize);
        
        // Update the grid style
        grid.style.gridTemplateColumns = `repeat(${columns}, ${optimalCardSize}px)`;
        grid.style.gap = `${this.config.cardGap}px`;
        grid.style.maxWidth = `${(optimalCardSize * columns) + (this.config.cardGap * (columns - 1))}px`;
        grid.style.margin = '0 auto'; // Center the grid
        
        // Update all cards with the new size
        const cards = grid.querySelectorAll('.card');
        cards.forEach(card => {
            card.style.width = `${optimalCardSize}px`;
            card.style.height = `${optimalCardSize}px`;
        });
    }
}

// Create and export the viewport sizing helper
export const viewportSizingHelper = new ViewportSizingHelper();