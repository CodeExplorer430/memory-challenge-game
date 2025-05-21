/**
 * Enhanced Difficulty Manager
 * 
 * Manages game difficulty settings with improved progression, 
 * responsive layouts, and better balancing
 */
class DifficultyManager {
    constructor() {
        // Difficulty settings with time, grid size, etc.
        this.settings = {
            easy: {
                viewTime: 3000,         // Initial view time in ms
                matchTime: 1000,        // Time to wait before checking for match
                initialTimeLimit: 120,  // Starting time limit in seconds
                levels: [
                    { timeLimit: 120, viewTime: 3000, gridSize: { columns: 4, rows: 3, totalPairs: 6 } },
                    { timeLimit: 110, viewTime: 2800, gridSize: { columns: 4, rows: 4, totalPairs: 8 } },
                    { timeLimit: 100, viewTime: 2600, gridSize: { columns: 5, rows: 4, totalPairs: 10 } },
                    { timeLimit: 90, viewTime: 2400, gridSize: { columns: 6, rows: 4, totalPairs: 12 } },
                    { timeLimit: 80, viewTime: 2200, gridSize: { columns: 6, rows: 5, totalPairs: 15 } }
                ],
                scoreMultiplier: 1.0    // Base score multiplier for this difficulty
            },
            medium: {
                viewTime: 2500,
                matchTime: 800,
                initialTimeLimit: 105,
                levels: [
                    { timeLimit: 105, viewTime: 2500, gridSize: { columns: 5, rows: 4, totalPairs: 10 } },
                    { timeLimit: 95, viewTime: 2300, gridSize: { columns: 6, rows: 4, totalPairs: 12 } },
                    { timeLimit: 85, viewTime: 2100, gridSize: { columns: 6, rows: 5, totalPairs: 15 } },
                    { timeLimit: 75, viewTime: 1900, gridSize: { columns: 7, rows: 5, totalPairs: 17 } },
                    { timeLimit: 65, viewTime: 1700, gridSize: { columns: 8, rows: 5, totalPairs: 20 } }
                ],
                scoreMultiplier: 1.5    // 50% score bonus for medium difficulty
            },
            hard: {
                viewTime: 2000,
                matchTime: 600,
                initialTimeLimit: 90,
                levels: [
                    { timeLimit: 90, viewTime: 2000, gridSize: { columns: 6, rows: 5, totalPairs: 15 } },
                    { timeLimit: 80, viewTime: 1800, gridSize: { columns: 7, rows: 5, totalPairs: 17 } },
                    { timeLimit: 70, viewTime: 1600, gridSize: { columns: 7, rows: 6, totalPairs: 21 } },
                    { timeLimit: 60, viewTime: 1400, gridSize: { columns: 8, rows: 6, totalPairs: 24 } },
                    { timeLimit: 50, viewTime: 1200, gridSize: { columns: 8, rows: 7, totalPairs: 28 } }
                ],
                scoreMultiplier: 2.0    // Double score for hard difficulty
            }
        };
        
        // Responsive layout overrides for different screen sizes
        this.responsiveLayouts = {
            mobile: {
                portrait: {
                    easy: [
                        { columns: 3, rows: 4 },  // Level 1: 6 pairs
                        { columns: 4, rows: 4 },  // Level 2: 8 pairs
                        { columns: 4, rows: 5 },  // Level 3: 10 pairs
                        { columns: 4, rows: 6 },  // Level 4: 12 pairs
                        { columns: 5, rows: 6 }   // Level 5: 15 pairs
                    ],
                    medium: [
                        { columns: 4, rows: 5 },  // Level 1: 10 pairs
                        { columns: 4, rows: 6 },  // Level 2: 12 pairs
                        { columns: 5, rows: 6 },  // Level 3: 15 pairs
                        { columns: 5, rows: 7 },  // Level 4: 17 pairs
                        { columns: 5, rows: 8 }   // Level 5: 20 pairs
                    ],
                    hard: [
                        { columns: 5, rows: 6 },  // Level 1: 15 pairs
                        { columns: 5, rows: 7 },  // Level 2: 17 pairs
                        { columns: 5, rows: 9 },  // Level 3: 21 pairs
                        { columns: 6, rows: 8 },  // Level 4: 24 pairs
                        { columns: 7, rows: 8 }   // Level 5: 28 pairs
                    ]
                },
                landscape: {
                    easy: [
                        { columns: 6, rows: 2 },  // Level 1: 6 pairs
                        { columns: 8, rows: 2 },  // Level 2: 8 pairs
                        { columns: 5, rows: 4 },  // Level 3: 10 pairs
                        { columns: 6, rows: 4 },  // Level 4: 12 pairs
                        { columns: 5, rows: 6 }   // Level 5: 15 pairs
                    ],
                    medium: [
                        { columns: 5, rows: 4 },  // Level 1: 10 pairs
                        { columns: 6, rows: 4 },  // Level 2: 12 pairs
                        { columns: 5, rows: 6 },  // Level 3: 15 pairs
                        { columns: 6, rows: 6 },  // Level 4: 17 pairs
                        { columns: 8, rows: 5 }   // Level 5: 20 pairs
                    ],
                    hard: [
                        { columns: 5, rows: 6 },  // Level 1: 15 pairs
                        { columns: 6, rows: 6 },  // Level 2: 17 pairs
                        { columns: 7, rows: 6 },  // Level 3: 21 pairs
                        { columns: 8, rows: 6 },  // Level 4: 24 pairs
                        { columns: 8, rows: 7 }   // Level 5: 28 pairs
                    ]
                }
            },
            tablet: {
                portrait: {
                    // Tablet portrait layouts (more columns than mobile portrait)
                    easy: [
                        { columns: 4, rows: 3 },  // Level 1: 6 pairs
                        { columns: 4, rows: 4 },  // Level 2: 8 pairs
                        { columns: 5, rows: 4 },  // Level 3: 10 pairs
                        { columns: 6, rows: 4 },  // Level 4: 12 pairs
                        { columns: 5, rows: 6 }   // Level 5: 15 pairs
                    ],
                    medium: [
                        { columns: 5, rows: 4 },  // Level 1: 10 pairs
                        { columns: 6, rows: 4 },  // Level 2: 12 pairs
                        { columns: 5, rows: 6 },  // Level 3: 15 pairs
                        { columns: 6, rows: 6 },  // Level 4: 17 pairs
                        { columns: 5, rows: 8 }   // Level 5: 20 pairs
                    ],
                    hard: [
                        { columns: 5, rows: 6 },  // Level 1: 15 pairs
                        { columns: 6, rows: 6 },  // Level 2: 17 pairs
                        { columns: 7, rows: 6 },  // Level 3: 21 pairs
                        { columns: 8, rows: 6 },  // Level 4: 24 pairs
                        { columns: 7, rows: 8 }   // Level 5: 28 pairs
                    ]
                },
                landscape: {
                    // Tablet landscape layouts (similar to desktop)
                    easy: [
                        { columns: 4, rows: 3 },  // Level 1: 6 pairs
                        { columns: 4, rows: 4 },  // Level 2: 8 pairs
                        { columns: 5, rows: 4 },  // Level 3: 10 pairs
                        { columns: 6, rows: 4 },  // Level 4: 12 pairs
                        { columns: 6, rows: 5 }   // Level 5: 15 pairs
                    ],
                    medium: [
                        { columns: 5, rows: 4 },  // Level 1: 10 pairs
                        { columns: 6, rows: 4 },  // Level 2: 12 pairs
                        { columns: 6, rows: 5 },  // Level 3: 15 pairs
                        { columns: 7, rows: 5 },  // Level 4: 17 pairs
                        { columns: 8, rows: 5 }   // Level 5: 20 pairs
                    ],
                    hard: [
                        { columns: 6, rows: 5 },  // Level 1: 15 pairs
                        { columns: 7, rows: 5 },  // Level 2: 17 pairs
                        { columns: 7, rows: 6 },  // Level 3: 21 pairs
                        { columns: 8, rows: 6 },  // Level 4: 24 pairs
                        { columns: 8, rows: 7 }   // Level 5: 28 pairs
                    ]
                }
            }
        };
        
        // Current difficulty level
        this.currentDifficulty = localStorage.getItem('currentDifficulty') || 'easy';
        
        // Current device info
        this.deviceInfo = {
            type: 'desktop',  // Can be 'mobile', 'tablet', or 'desktop'
            orientation: 'landscape'  // Can be 'portrait' or 'landscape'
        };
        
        // Listen for device info updates
        this.setupDeviceInfoListeners();
        
        // Initialize difficulty selector buttons
        this.difficultyBtns = document.querySelectorAll('.difficulty-btn');
        this.setupEventListeners();
    }
    
    /**
     * Set up event listeners for difficulty buttons
     */
    setupEventListeners() {
        this.difficultyBtns.forEach(btn => {
            // Set initial active state
            if (btn.dataset.difficulty === this.currentDifficulty) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
            
            // Add click listener
            btn.addEventListener('click', () => {
                this.setDifficulty(btn.dataset.difficulty);
                
                // Dispatch difficulty change event
                const event = new CustomEvent('difficultyChange', {
                    detail: { 
                        difficulty: this.currentDifficulty,
                        settings: this.getCurrentSettings()
                    }
                });
                document.dispatchEvent(event);
            });
        });
        
        // Listen for viewport resize events to update device info
        document.addEventListener('gameViewportResized', this.handleViewportResize.bind(this));
    }
    
    /**
     * Set up listeners for device info changes
     */
    setupDeviceInfoListeners() {
        // Initial device info detection
        this.updateDeviceInfo();
        
        // Listen for resize events
        window.addEventListener('resize', this.updateDeviceInfo.bind(this));
    }
    
    /**
     * Update device info based on current viewport
     */
    updateDeviceInfo() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        // Determine device type based on screen width
        if (width < 576) {
            this.deviceInfo.type = 'mobile';
        } else if (width < 992) {
            this.deviceInfo.type = 'tablet';
        } else {
            this.deviceInfo.type = 'desktop';
        }
        
        // Determine orientation
        this.deviceInfo.orientation = width > height ? 'landscape' : 'portrait';
    }
    
    /**
     * Handle viewport resize event
     */
    handleViewportResize(e) {
        const detail = e.detail;
        
        // Update device info from event data
        if (detail.deviceType) {
            this.deviceInfo.type = detail.deviceType;
        }
        
        if (detail.orientation) {
            this.deviceInfo.orientation = detail.orientation;
        }
    }
    
    /**
     * Set the current difficulty
     * @param {string} difficulty - The difficulty level to set
     */
    setDifficulty(difficulty) {
        if (!this.settings[difficulty]) return;
        
        // Update buttons UI
        this.difficultyBtns.forEach(b => b.classList.remove('active'));
        this.difficultyBtns.forEach(b => {
            if (b.dataset.difficulty === difficulty) {
                b.classList.add('active');
            }
        });
        
        // Update current difficulty
        this.currentDifficulty = difficulty;
        localStorage.setItem('currentDifficulty', difficulty);
        
        // Update grid class
        const gameGrid = document.getElementById('game-grid');
        if (gameGrid) {
            gameGrid.className = `grid-container ${difficulty}`;
        }
    }
    
    /**
     * Get the current difficulty settings
     * @returns {Object} The settings for the current difficulty
     */
    getCurrentSettings() {
        return this.settings[this.currentDifficulty];
    }
    
    /**
     * Get level-specific settings
     * @param {number} level - The current level (1-5)
     * @returns {Object} Level-specific settings
     */
    getLevelSettings(level) {
        // Ensure level is within bounds (1-5)
        const levelIndex = Math.min(Math.max(level - 1, 0), 4);
        return this.settings[this.currentDifficulty].levels[levelIndex];
    }
    
    /**
     * Get responsive grid layout for current device/orientation
     * @param {number} level - The current level (1-5)
     * @returns {Object} Grid layout with columns and rows
     */
    getResponsiveGridLayout(level) {
        const levelIndex = Math.min(Math.max(level - 1, 0), 4);
        const difficulty = this.currentDifficulty;
        
        // Default to desktop layout from settings
        let gridLayout = this.getLevelSettings(level).gridSize;
        
        // Use responsive layout overrides if available for current device
        if (this.deviceInfo.type !== 'desktop' && 
            this.responsiveLayouts[this.deviceInfo.type] && 
            this.responsiveLayouts[this.deviceInfo.type][this.deviceInfo.orientation] && 
            this.responsiveLayouts[this.deviceInfo.type][this.deviceInfo.orientation][difficulty]) {
            
            // Get the responsive layout override
            const responsiveLayout = this.responsiveLayouts[this.deviceInfo.type][this.deviceInfo.orientation][difficulty][levelIndex];
            
            if (responsiveLayout) {
                // Use the responsive layout but keep the total pairs the same
                gridLayout = {
                    columns: responsiveLayout.columns,
                    rows: responsiveLayout.rows,
                    totalPairs: gridLayout.totalPairs
                };
            }
        }
        
        return gridLayout;
    }
    
    /**
     * Get the time limit for a specific level
     * @param {number} level - The level to get the time limit for
     * @returns {number} The time limit in seconds
     */
    getLevelTime(level) {
        return this.getLevelSettings(level).timeLimit;
    }
    
    /**
     * Get total pairs needed for the current difficulty and level
     * @param {number} level - The current level
     * @returns {number} The total number of pairs
     */
    getTotalPairs(level = 1) {
        return this.getLevelSettings(level).gridSize.totalPairs;
    }
    
    /**
     * Get the view time for the current difficulty level
     * @param {number} level - The current level
     * @returns {number} The view time in milliseconds
     */
    getViewTime(level = 1) {
        return this.getLevelSettings(level).viewTime;
    }
    
    /**
     * Get the match checking time for the current difficulty
     * @returns {number} The match time in milliseconds
     */
    getMatchTime() {
        return this.getCurrentSettings().matchTime;
    }
    
    /**
     * Get score multiplier for current difficulty
     * @returns {number} The score multiplier
     */
    getScoreMultiplier() {
        return this.getCurrentSettings().scoreMultiplier || 1.0;
    }
    
    /**
     * Calculate bonus time for completing a level quickly
     * @param {number} level - Current level
     * @param {number} timeLeft - Seconds left on the timer
     * @param {number} totalTime - Total time allowed for the level
     * @returns {number} Bonus time in seconds to add to next level
     */
    calculateTimeBonus(level, timeLeft, totalTime) {
        if (timeLeft <= 0) return 0;
        
        // Calculate time bonus as a percentage of time left
        const percentComplete = timeLeft / totalTime;
        let bonusMultiplier = 0;
        
        if (percentComplete > 0.6) {
            // Finished with more than 60% of time left - excellent!
            bonusMultiplier = 0.5;  // 50% of time left becomes bonus
        } else if (percentComplete > 0.4) {
            // Finished with 40-60% of time left - good!
            bonusMultiplier = 0.3;  // 30% of time left becomes bonus
        } else if (percentComplete > 0.2) {
            // Finished with 20-40% of time left - average
            bonusMultiplier = 0.2;  // 20% of time left becomes bonus
        } else {
            // Finished with less than 20% of time left - no significant bonus
            bonusMultiplier = 0.1;  // 10% of time left becomes bonus
        }
        
        // Calculate actual bonus seconds
        return Math.round(timeLeft * bonusMultiplier);
    }
}

export const difficultyManager = new DifficultyManager();