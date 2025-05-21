/**
 * Enhanced Viewport Sizing Helper
 * 
 * Handles dynamic sizing of game elements to fit any screen size without scrolling
 * Improved to handle all device types, orientations, and provide smoother transitions
 */
class ViewportSizingHelper {
    constructor() {
        // Configuration
        this.config = {
            minCardSize: 50,      // Minimum card size in pixels
            maxCardSize: 120,     // Maximum card size in pixels
            idealCardGap: 10,     // Ideal gap between cards in pixels
            minCardGap: 5,        // Minimum gap between cards when space is limited
            containerPadding: 10, // Game container padding in pixels
            aspectRatio: 1,       // Card aspect ratio (1 = square)
            animationDuration: 250, // Duration of resize animations in ms
        };
        
        // State tracking
        this.state = {
            currentOrientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
            lastResizeTime: 0,
            isResizing: false,
            currentCardSize: 0,
            currentGridSize: { width: 0, height: 0 },
            deviceType: this.getDeviceType(),
            isFullscreenMode: false,
        };
        
        // Initialize
        this.init();
    }
    
    /**
     * Determine device type based on screen size and user agent
     */
    getDeviceType() {
        const ua = navigator.userAgent;
        if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
            return 'tablet';
        } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
            return 'mobile';
        }
        return 'desktop';
    }
    
    init() {
        // Set up resize listener with debounce
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // Handle orientation changes with better detection
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia("(orientation: portrait)");
            mediaQuery.addEventListener("change", this.handleOrientationChange.bind(this));
        } else {
            window.addEventListener('orientationchange', this.handleOrientationChange.bind(this));
        }
        
        // Add fullscreen toggle capability
        document.addEventListener('fullscreenchange', this.handleFullscreenChange.bind(this));
        
        // Initial sizing
        this.resizeGameElements();
        
        // Add resize observer for more responsive adjustments
        this.setupResizeObserver();
        
        // Apply initial layout class to body
        this.updateLayoutClass();
    }
    
    /**
     * Set up resize observer for key elements
     */
    setupResizeObserver() {
        if (window.ResizeObserver) {
            const gameContainer = document.querySelector('.game-container');
            if (gameContainer) {
                const observer = new ResizeObserver(entries => {
                    // Only trigger resize if not already in a resize operation
                    if (!this.state.isResizing) {
                        this.resizeGameElements();
                    }
                });
                observer.observe(gameContainer);
            }
        }
    }
    
    /**
     * Handle window resize with debounce
     */
    handleResize() {
        // Avoid excessive resize operations
        const now = Date.now();
        this.state.isResizing = true;
        
        if (now - this.state.lastResizeTime > 100) {
            this.state.lastResizeTime = now;
            this.resizeGameElements();
            
            // Update layout class on resize
            this.updateLayoutClass();
        }
        
        // Clear existing timeout
        if (this.resizeTimeout) {
            clearTimeout(this.resizeTimeout);
        }
        
        // Set a timeout to ensure final resize happens
        this.resizeTimeout = setTimeout(() => {
            this.resizeGameElements();
            this.state.isResizing = false;
        }, 150);
    }
    
    /**
     * Handle orientation change with better transition
     */
    handleOrientationChange(event) {
        // Detect orientation change
        const isPortrait = event.matches !== undefined ? event.matches : window.innerHeight > window.innerWidth;
        this.state.currentOrientation = isPortrait ? 'portrait' : 'landscape';
        
        // Add transition class to body
        document.body.classList.add('orientation-changing');
        
        // Reset game container dimensions and trigger resize
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) {
            // Apply smooth transition during orientation change
            gameContainer.style.transition = `height ${this.config.animationDuration}ms ease, width ${this.config.animationDuration}ms ease`;
            
            // Update layout class
            this.updateLayoutClass();
            
            // Allow time for orientation change to complete
            setTimeout(() => {
                this.resizeGameElements();
                
                // Remove transition after resize
                setTimeout(() => {
                    gameContainer.style.transition = '';
                    document.body.classList.remove('orientation-changing');
                }, this.config.animationDuration);
            }, 50);
        }
    }
    
    /**
     * Update body class based on current device and orientation
     */
    updateLayoutClass() {
        // Remove existing layout classes
        document.body.classList.remove('layout-desktop', 'layout-mobile', 'layout-tablet');
        document.body.classList.remove('layout-portrait', 'layout-landscape');
        
        // Add current device class
        document.body.classList.add(`layout-${this.state.deviceType}`);
        
        // Add orientation class
        document.body.classList.add(`layout-${this.state.currentOrientation}`);
    }
    
    /**
     * Handle fullscreen mode changes
     */
    handleFullscreenChange() {
        this.state.isFullscreenMode = !!document.fullscreenElement;
        
        // Update body class
        document.body.classList.toggle('fullscreen-mode', this.state.isFullscreenMode);
        
        // Resize game elements after switching fullscreen mode
        setTimeout(() => {
            this.resizeGameElements();
        }, 100);
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
                        console.warn('Error attempting to enable fullscreen:', err);
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
     * Main function to resize all game elements
     */
    resizeGameElements() {
        // Resize the main container first
        this.resizeGameContainer();
        
        // Then adjust the grid and cards
        this.adjustCardGrid();
        
        // Adjust information panels and controls
        this.adjustInfoPanels();
        
        // Emit resize event for other components
        this.emitResizeEvent();
    }
    
    /**
     * Emit a custom event with resize information
     */
    emitResizeEvent() {
        const event = new CustomEvent('gameViewportResized', {
            detail: {
                cardSize: this.state.currentCardSize,
                gridSize: this.state.currentGridSize,
                orientation: this.state.currentOrientation,
                deviceType: this.state.deviceType,
                isFullscreen: this.state.isFullscreenMode
            }
        });
        document.dispatchEvent(event);
    }
    
    /**
     * Resize the main game container to fit the viewport
     */
    resizeGameContainer() {
        const gameContainer = document.querySelector('.game-container');
        if (!gameContainer) return;
        
        // Calculate available viewport height and width
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        // Set maximum dimensions based on viewport with margins
        const maxHeight = viewportHeight - 20; // 10px margin top and bottom
        const maxWidth = Math.min(viewportWidth - 20, 1200); // 10px margin left and right, max width 1200px
        
        // Apply dimensions
        gameContainer.style.maxHeight = `${maxHeight}px`;
        gameContainer.style.height = `${maxHeight}px`;
        gameContainer.style.maxWidth = `${maxWidth}px`;
        
        // Apply proper overflow handling to ensure no scrolling
        gameContainer.style.overflow = 'hidden';
        
        // Apply responsive padding based on device size
        const paddingScale = this.state.deviceType === 'mobile' ? 0.5 : 1;
        gameContainer.style.padding = `${Math.max(8, this.config.containerPadding * paddingScale)}px`;
    }
    
    /**
     * Adjust card grid based on available space and current difficulty
     */
    adjustCardGrid() {
        const grid = document.getElementById('game-grid');
        if (!grid) return;
        
        // Get the grid's container dimensions
        const gridContainer = document.querySelector('.grid-container-wrapper');
        if (!gridContainer) return;
        
        // Apply responsive styling to grid container
        gridContainer.style.maxHeight = 'none'; // We'll control height via card sizing
        gridContainer.style.padding = this.state.deviceType === 'mobile' ? '10px' : '20px';
        
        // Get grid container dimensions
        const containerRect = gridContainer.getBoundingClientRect();
        const availableWidth = containerRect.width - (this.config.containerPadding * 2);
        const availableHeight = containerRect.height - (this.config.containerPadding * 2);
        
        // Get current difficulty to determine grid dimensions
        const difficulty = grid.className.includes('easy') ? 'easy' : 
                         grid.className.includes('medium') ? 'medium' : 'hard';
        
        // Determine optimal grid layout based on difficulty and orientation
        const gridLayout = this.getOptimalGridLayout(difficulty);
        
        // Calculate optimal card size based on available space
        const cardGap = this.state.deviceType === 'mobile' ? this.config.minCardGap : this.config.idealCardGap;
        
        const optimalWidthBasedSize = Math.floor((availableWidth - ((gridLayout.columns - 1) * cardGap)) / gridLayout.columns);
        const optimalHeightBasedSize = Math.floor((availableHeight - ((gridLayout.rows - 1) * cardGap)) / gridLayout.rows);
        
        // Use the smaller of the two to ensure cards fit properly
        let optimalCardSize = Math.min(optimalWidthBasedSize, optimalHeightBasedSize);
        
        // Enforce min/max constraints
        optimalCardSize = Math.min(Math.max(optimalCardSize, this.config.minCardSize), this.config.maxCardSize);
        
        // Save current card size to state
        this.state.currentCardSize = optimalCardSize;
        
        // Calculate total grid size
        this.state.currentGridSize = {
            width: (optimalCardSize * gridLayout.columns) + (cardGap * (gridLayout.columns - 1)),
            height: (optimalCardSize * gridLayout.rows) + (cardGap * (gridLayout.rows - 1))
        };
        
        // Update the grid style
        grid.style.gridTemplateColumns = `repeat(${gridLayout.columns}, ${optimalCardSize}px)`;
        grid.style.gap = `${cardGap}px`;
        grid.style.maxWidth = `${this.state.currentGridSize.width}px`;
        grid.style.margin = '0 auto'; // Center the grid
        
        // Add data attributes to grid for other components
        grid.dataset.columns = gridLayout.columns;
        grid.dataset.rows = gridLayout.rows;
        grid.dataset.cardSize = optimalCardSize;
        
        // Update all cards with the new size
        const cards = grid.querySelectorAll('.card');
        cards.forEach(card => {
            card.style.width = `${optimalCardSize}px`;
            card.style.height = `${optimalCardSize}px`;
        });
        
        // Update grid container wrapper dimensions
        gridContainer.style.width = `${this.state.currentGridSize.width + (this.config.containerPadding * 2)}px`;
        gridContainer.style.maxWidth = '100%';
    }
    
    /**
     * Determine optimal grid layout based on difficulty and screen orientation
     */
    getOptimalGridLayout(difficulty) {
        const isPortrait = this.state.currentOrientation === 'portrait';
        const isMobile = this.state.deviceType === 'mobile';
        const isTablet = this.state.deviceType === 'tablet';
        
        // Default layouts
        const layouts = {
            easy: { columns: 6, rows: 3, totalPairs: 9 },
            medium: { columns: 6, rows: 4, totalPairs: 12 },
            hard: { columns: 6, rows: 6, totalPairs: 18 }
        };
        
        // Adjust based on orientation and device type
        if (isPortrait) {
            if (isMobile) {
                // Mobile portrait - narrower layout
                switch (difficulty) {
                    case 'easy': return { columns: 4, rows: 5, totalPairs: 10 };
                    case 'medium': return { columns: 4, rows: 6, totalPairs: 12 };
                    case 'hard': return { columns: 4, rows: 9, totalPairs: 18 };
                }
            } else if (isTablet) {
                // Tablet portrait
                switch (difficulty) {
                    case 'easy': return { columns: 4, rows: 5, totalPairs: 10 };
                    case 'medium': return { columns: 5, rows: 5, totalPairs: 12 };
                    case 'hard': return { columns: 6, rows: 6, totalPairs: 18 };
                }
            }
        } else { // Landscape
            if (isMobile) {
                // Mobile landscape - wider layout
                switch (difficulty) {
                    case 'easy': return { columns: 6, rows: 3, totalPairs: 9 };
                    case 'medium': return { columns: 6, rows: 4, totalPairs: 12 };
                    case 'hard': return { columns: 8, rows: 5, totalPairs: 20 };
                }
            } else if (isTablet) {
                // Tablet landscape
                switch (difficulty) {
                    case 'easy': return { columns: 6, rows: 3, totalPairs: 9 };
                    case 'medium': return { columns: 8, rows: 3, totalPairs: 12 };
                    case 'hard': return { columns: 9, rows: 4, totalPairs: 18 };
                }
            }
        }
        
        // Default to the pre-defined layouts if no specific adjustment
        return layouts[difficulty];
    }
    
    /**
     * Adjust info panels and controls based on screen size and orientation
     */
    adjustInfoPanels() {
        const gameInfoWrapper = document.querySelector('.game-info-wrapper');
        const highScores = document.querySelector('.high-scores');
        const controlsTop = document.querySelector('.controls-top');
        
        if (!gameInfoWrapper || !highScores) return;
        
        const isMobile = this.state.deviceType === 'mobile';
        const isPortrait = this.state.currentOrientation === 'portrait';
        
        // Apply different layouts based on device and orientation
        if (isMobile) {
            // On mobile, simplify the UI
            if (isPortrait) {
                // Stacked layout for portrait
                gameInfoWrapper.style.flexDirection = 'column';
                highScores.style.display = 'none'; // Hide high scores on small screens
                
                // Stack control buttons on small screens
                if (controlsTop) {
                    controlsTop.style.flexDirection = 'column';
                    controlsTop.querySelectorAll('.btn').forEach(btn => {
                        btn.style.marginBottom = '8px';
                        btn.style.width = '100%';
                    });
                }
            } else {
                // Side-by-side for landscape
                gameInfoWrapper.style.flexDirection = 'row';
                highScores.style.display = 'none'; // Still hide high scores
                
                // Horizontal control buttons
                if (controlsTop) {
                    controlsTop.style.flexDirection = 'row';
                    controlsTop.querySelectorAll('.btn').forEach(btn => {
                        btn.style.marginBottom = '0';
                        btn.style.width = 'auto';
                    });
                }
            }
        } else {
            // Tablet and desktop can show more info
            gameInfoWrapper.style.flexDirection = 'row';
            highScores.style.display = 'block';
            
            // Full control buttons
            if (controlsTop) {
                controlsTop.style.flexDirection = 'row';
                controlsTop.querySelectorAll('.btn').forEach(btn => {
                    btn.style.marginBottom = '0';
                    btn.style.width = 'auto';
                });
            }
        }
        
        // Adjust game info display
        const gameInfo = document.querySelector('.game-info');
        if (gameInfo) {
            if (isMobile && isPortrait) {
                // Simple layout for mobile portrait
                gameInfo.style.gridTemplateColumns = 'repeat(2, 1fr)';
                gameInfo.style.gap = '8px';
            } else if (isMobile && !isPortrait) {
                // More compact layout for mobile landscape
                gameInfo.style.gridTemplateColumns = 'repeat(4, 1fr)';
                gameInfo.style.gap = '5px';
            } else {
                // Full layout for tablet/desktop
                gameInfo.style.gridTemplateColumns = 'repeat(4, 1fr)';
                gameInfo.style.gap = '10px';
            }
        }
    }
}

// Create and export the viewport sizing helper
export const viewportSizingHelper = new ViewportSizingHelper();