/**
 * Difficulty Manager
 * 
 * Manages game difficulty settings and related parameters
 */
class DifficultyManager {
    constructor() {
        // Difficulty settings with time, grid size, etc.
        this.settings = {
            easy: {
                viewTime: 3000,
                matchTime: 1000,
                cards: 18,
                levels: [120, 105, 90, 60, 30],
                gridSize: {
                    columns: 6,
                    rows: 3,
                    totalPairs: 9
                }
            },
            medium: {
                viewTime: 2500,
                matchTime: 800,
                cards: 24,
                levels: [105, 90, 75, 60, 45],
                gridSize: {
                    columns: 6,
                    rows: 4,
                    totalPairs: 12
                }
            },
            hard: {
                viewTime: 2000,
                matchTime: 600,
                cards: 36,
                levels: [90, 75, 60, 45, 30],
                gridSize: {
                    columns: 6,
                    rows: 6,
                    totalPairs: 18
                }
            }
        };
        
        // Current difficulty level
        this.currentDifficulty = localStorage.getItem('currentDifficulty') || 'easy';
        
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
     * Get the time limit for a specific level
     * @param {number} level - The level to get the time limit for
     * @returns {number} The time limit in seconds
     */
    getLevelTime(level) {
        const settings = this.getCurrentSettings();
        const levelIndex = Math.min(level - 1, settings.levels.length - 1);
        return settings.levels[levelIndex];
    }
    
    /**
     * Get total pairs needed for the current difficulty
     * @returns {number} The total number of pairs
     */
    getTotalPairs() {
        return this.getCurrentSettings().gridSize.totalPairs;
    }
    
    /**
     * Get the view time for the current difficulty
     * @returns {number} The view time in milliseconds
     */
    getViewTime() {
        return this.getCurrentSettings().viewTime;
    }
    
    /**
     * Get the match checking time for the current difficulty
     * @returns {number} The match time in milliseconds
     */
    getMatchTime() {
        return this.getCurrentSettings().matchTime;
    }
}

export const difficultyManager = new DifficultyManager();