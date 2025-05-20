/**
 * Enhanced Theme Manager
 * 
 * Handles game theme selection and application with improved color harmonies
 */
class ThemeManager {
    constructor() {
        // Available themes with improved color harmonies
        this.themes = {
            default: {
                '--primary-color': '#6200ea',
                '--primary-light': '#9d46ff',
                '--primary-dark': '#0a00b6',
                '--primary-color-rgb': '98, 0, 234',
                '--secondary-color': '#00e676',
                '--secondary-light': '#66ffa6',
                '--secondary-dark': '#00b248',
                '--secondary-color-rgb': '0, 230, 118',
                '--accent-color': '#ff4081',
                '--accent-color-rgb': '255, 64, 129',
                '--bg-color': '#f5f5f5',
                '--card-bg': '#ffffff',
                '--text-color': '#212121',
                '--text-secondary': '#757575',
                '--text-on-primary': '#ffffff',
                '--text-on-secondary': '#000000',
                '--header-color': '#f8f9fa',
                '--border-color': '#e0e0e0'
            },
            dark: {
                '--primary-color': '#BB86FC',
                '--primary-light': '#e2b9ff',
                '--primary-dark': '#8858c8',
                '--primary-color-rgb': '187, 134, 252',
                '--secondary-color': '#03DAC6',
                '--secondary-light': '#6effee',
                '--secondary-dark': '#00a896',
                '--secondary-color-rgb': '3, 218, 198',
                '--accent-color': '#CF6679',
                '--accent-color-rgb': '207, 102, 121',
                '--bg-color': '#121212',
                '--card-bg': '#1e1e1e',
                '--text-color': '#e0e0e0',
                '--text-secondary': '#aaaaaa',
                '--text-on-primary': '#000000',
                '--text-on-secondary': '#000000',
                '--header-color': '#1a1a1a',
                '--border-color': '#333333'
            },
            nature: {
                '--primary-color': '#2E7D32',
                '--primary-light': '#60ad5e',
                '--primary-dark': '#005005',
                '--primary-color-rgb': '46, 125, 50',
                '--secondary-color': '#FFB300',
                '--secondary-light': '#ffe54c',
                '--secondary-dark': '#c68400',
                '--secondary-color-rgb': '255, 179, 0',
                '--accent-color': '#d81b60',
                '--accent-color-rgb': '216, 27, 96',
                '--bg-color': '#E8F5E9',
                '--card-bg': '#FFFFFF',
                '--text-color': '#1B5E20',
                '--text-secondary': '#388E3C',
                '--text-on-primary': '#FFFFFF',
                '--text-on-secondary': '#000000',
                '--header-color': '#C8E6C9',
                '--border-color': '#A5D6A7'
            },
            cyber: {
                '--primary-color': '#FF2D70',
                '--primary-light': '#ff6d9f',
                '--primary-dark': '#c50048',
                '--primary-color-rgb': '255, 45, 112',
                '--secondary-color': '#00F0FF',
                '--secondary-light': '#6effff',
                '--secondary-dark': '#00bccb',
                '--secondary-color-rgb': '0, 240, 255',
                '--accent-color': '#F9FF21',
                '--accent-color-rgb': '249, 255, 33',
                '--bg-color': '#0A192F',
                '--card-bg': '#172A45',
                '--text-color': '#e6f1ff',
                '--text-secondary': '#8892b0',
                '--text-on-primary': '#0A192F',
                '--text-on-secondary': '#0A192F',
                '--header-color': '#112240',
                '--border-color': '#1c2d4e'
            }
        };
        
        // Generate additional theme variables for each theme
        this.generateAdditionalVariables();
        
        // Theme selector element
        this.themeSelect = document.getElementById('themeSelect');
        
        // Initialize theme from localStorage or use default
        this.init();
    }
    
    /**
     * Generate additional variables for each theme
     */
    generateAdditionalVariables() {
        // For each theme, add additional computed variables
        Object.keys(this.themes).forEach(themeName => {
            const theme = this.themes[themeName];
            
            // Add card face colors
            theme['--card-front-bg'] = themeName === 'default' || themeName === 'nature' 
                ? 'linear-gradient(135deg, #333, #222)' 
                : 'linear-gradient(135deg, #1a1a1a, #0a0a0a)';
                
            // Card matched state background
            theme['--matched-card-opacity'] = '0.7';
            
            // Button colors (specific to each theme)
            if (themeName === 'default') {
                theme['--btn-primary-bg'] = theme['--primary-color'];
                theme['--btn-primary-text'] = '#ffffff';
                theme['--btn-secondary-bg'] = '#6c757d';
                theme['--btn-secondary-text'] = '#ffffff';
            } else if (themeName === 'dark') {
                theme['--btn-primary-bg'] = theme['--primary-color'];
                theme['--btn-primary-text'] = '#000000';
                theme['--btn-secondary-bg'] = '#555555';
                theme['--btn-secondary-text'] = '#ffffff';
            } else if (themeName === 'nature') {
                theme['--btn-primary-bg'] = theme['--primary-color'];
                theme['--btn-primary-text'] = '#ffffff';
                theme['--btn-secondary-bg'] = '#66bb6a';
                theme['--btn-secondary-text'] = '#ffffff';
            } else if (themeName === 'cyber') {
                theme['--btn-primary-bg'] = theme['--primary-color'];
                theme['--btn-primary-text'] = '#0A192F';
                theme['--btn-secondary-bg'] = '#3a506b';
                theme['--btn-secondary-text'] = '#e6f1ff';
            }
            
            // Compute RGB versions of colors if not already set
            if (!theme['--primary-color-rgb']) {
                theme['--primary-color-rgb'] = this.hexToRgb(theme['--primary-color']);
            }
            if (!theme['--secondary-color-rgb']) {
                theme['--secondary-color-rgb'] = this.hexToRgb(theme['--secondary-color']);
            }
            if (!theme['--accent-color-rgb']) {
                theme['--accent-color-rgb'] = this.hexToRgb(theme['--accent-color']);
            }
        });
    }
    
    /**
     * Convert hex color to RGB
     * @param {string} hex - The hex color code
     * @returns {string} The RGB values as comma-separated string
     */
    hexToRgb(hex) {
        // Remove # if present
        hex = hex.replace('#', '');
        
        // Convert to RGB
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        return `${r}, ${g}, ${b}`;
    }
    
    /**
     * Initialize theme settings
     */
    init() {
        const savedTheme = localStorage.getItem('selectedTheme') || this.detectPreferredTheme();
        if (this.themeSelect) {
            this.themeSelect.value = savedTheme;
        }
        this.setTheme(savedTheme);
        this.setupEventListeners();
    }
    
    /**
     * Detect user's preferred theme from system settings
     * @returns {string} The detected theme name
     */
    detectPreferredTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'default';
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        if (this.themeSelect) {
            this.themeSelect.addEventListener('change', (e) => {
                this.setTheme(e.target.value);
            });
        }
        
        // Listen for system theme changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)')
                .addEventListener('change', e => {
                    if (!localStorage.getItem('selectedTheme')) {
                        this.setTheme(e.matches ? 'dark' : 'default');
                        if (this.themeSelect) {
                            this.themeSelect.value = e.matches ? 'dark' : 'default';
                        }
                    }
                });
        }
    }
    
    /**
     * Apply the selected theme
     * @param {string} themeName - The name of the theme to apply
     */
    setTheme(themeName) {
        const theme = this.themes[themeName] || this.themes.default;
        
        // Apply CSS variables
        Object.entries(theme).forEach(([prop, value]) => {
            document.documentElement.style.setProperty(prop, value);
        });
        
        // Save to localStorage
        localStorage.setItem('selectedTheme', themeName);
        
        // Add theme class to body for additional styling options
        document.body.className = document.body.className.replace(/theme-\w+/g, '');
        document.body.classList.add(`theme-${themeName}`);
        
        // Dispatch theme change event
        const event = new CustomEvent('themeChange', {
            detail: { theme: themeName }
        });
        document.dispatchEvent(event);
        
        // Update buttons with theme-specific colors
        this.updateButtonStyles(themeName);
    }
    
    /**
     * Update button styles based on the current theme
     * @param {string} themeName - The name of the current theme
     */
    updateButtonStyles(themeName) {
        const theme = this.themes[themeName];
        
        // Update primary buttons
        document.querySelectorAll('.btn-primary').forEach(btn => {
            btn.style.backgroundColor = theme['--btn-primary-bg'];
            btn.style.borderColor = theme['--btn-primary-bg'];
            btn.style.color = theme['--btn-primary-text'];
        });
        
        // Update secondary buttons
        document.querySelectorAll('.btn-secondary').forEach(btn => {
            btn.style.backgroundColor = theme['--btn-secondary-bg'];
            btn.style.borderColor = theme['--btn-secondary-bg'];
            btn.style.color = theme['--btn-secondary-text'];
        });
    }
}

export const themeManager = new ThemeManager();