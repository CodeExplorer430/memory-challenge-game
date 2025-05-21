/**
 * Enhanced Audio Manager
 * 
 * Handles all game sounds and audio configuration with improved error handling,
 * better accessibility, and additional sound effects for new game mechanics
 */
class AudioManager {
    constructor() {
        // Try to get audio elements
        this.audioElements = {
            bgMusic: document.getElementById('backgroundMusic'),
            flip: document.getElementById('flipSound'),
            match: document.getElementById('matchSound'),
            gameOver: document.getElementById('gameOverSound'),
            levelUp: document.getElementById('levelUpSound'),
            combo: document.getElementById('comboSound'),
            pause: null,  // Will be created dynamically
            resume: null, // Will be created dynamically
            victory: null, // Will be created dynamically
            timeWarning: null // Will be created dynamically
        };
        
        // UI controls
        this.controls = {
            musicToggle: document.getElementById('musicToggle'),
            sfxToggle: document.getElementById('sfxToggle')
        };
        
        // Audio state
        this.state = {
            musicEnabled: true,
            sfxEnabled: true,
            musicVolume: 0.4,
            sfxVolume: 0.7,
            lastPlayedTime: {},
            audioContext: null,
            audioBuffers: {},
            audioSources: {},
            preloadComplete: false,
            hasInteracted: false
        };
        
        // Create missing audio elements
        this.createMissingAudioElements();
        
        // Initialize audio settings from localStorage or defaults
        this.init();
    }
    
    /**
     * Create any missing audio elements programmatically
     */
    createMissingAudioElements() {
        // Check each required sound and create if missing
        this.createAudioElementIfMissing('pause', '/assets/sounds/pause.mp3');
        this.createAudioElementIfMissing('resume', '/assets/sounds/resume.mp3');
        this.createAudioElementIfMissing('victory', '/assets/sounds/victory.mp3');
        this.createAudioElementIfMissing('timeWarning', '/assets/sounds/timewarning.mp3');
        
        // Create combo sound if missing
        if (!this.audioElements.combo) {
            this.createAudioElementIfMissing('combo', '/assets/sounds/combo.mp3');
        }
    }
    
    /**
     * Create an audio element if it doesn't already exist
     */
    createAudioElementIfMissing(id, src) {
        if (!this.audioElements[id]) {
            const audio = document.createElement('audio');
            audio.id = `${id}Sound`;
            audio.preload = 'auto';
            
            // Try to set a source
            const source = document.createElement('source');
            source.src = src;
            source.type = 'audio/mpeg';
            audio.appendChild(source);
            
            // Add to document
            document.body.appendChild(audio);
            
            // Update reference
            this.audioElements[id] = audio;
            
            console.log(`Created audio element: ${id}Sound`);
        }
    }
    
    /**
     * Initialize audio system
     */
    init() {
        console.log("Initializing Audio Manager...");
        
        // Get saved preferences or use defaults
        this.state.musicEnabled = localStorage.getItem('musicEnabled') !== 'false'; // Default to true
        this.state.sfxEnabled = localStorage.getItem('sfxEnabled') !== 'false'; // Default to true
        
        // Load volume preferences
        this.state.musicVolume = parseFloat(localStorage.getItem('musicVolume') || '0.4');
        this.state.sfxVolume = parseFloat(localStorage.getItem('sfxVolume') || '0.7');
        
        // Update toggle controls to match saved preferences
        if (this.controls.musicToggle) this.controls.musicToggle.checked = this.state.musicEnabled;
        if (this.controls.sfxToggle) this.controls.sfxToggle.checked = this.state.sfxEnabled;
        
        // Set up event listeners for audio controls
        this.setupEventListeners();
        
        // Initialize audio system based on browser capability
        this.initAudioSystem();
        
        // Set initial volumes
        this.applyVolumeSettings();
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Music toggle
        if (this.controls.musicToggle) {
            this.controls.musicToggle.addEventListener('change', () => {
                this.state.musicEnabled = this.controls.musicToggle.checked;
                localStorage.setItem('musicEnabled', this.state.musicEnabled);
                this.updateBackgroundMusic();
            });
        }
        
        // Sound effects toggle
        if (this.controls.sfxToggle) {
            this.controls.sfxToggle.addEventListener('change', () => {
                this.state.sfxEnabled = this.controls.sfxToggle.checked;
                localStorage.setItem('sfxEnabled', this.state.sfxEnabled);
            });
        }
        
        // Volume sliders
        const musicVolumeSlider = document.getElementById('musicVolume');
        if (musicVolumeSlider) {
            // Set initial value
            musicVolumeSlider.value = this.state.musicVolume * 100;
            
            // Listen for changes
            musicVolumeSlider.addEventListener('input', () => {
                this.state.musicVolume = parseInt(musicVolumeSlider.value, 10) / 100;
                localStorage.setItem('musicVolume', this.state.musicVolume);
                this.applyVolumeSettings();
            });
        }
        
        const sfxVolumeSlider = document.getElementById('sfxVolume');
        if (sfxVolumeSlider) {
            // Set initial value
            sfxVolumeSlider.value = this.state.sfxVolume * 100;
            
            // Listen for changes
            sfxVolumeSlider.addEventListener('input', () => {
                this.state.sfxVolume = parseInt(sfxVolumeSlider.value, 10) / 100;
                localStorage.setItem('sfxVolume', this.state.sfxVolume);
            });
        }
        
        // Listen for user interaction to initialize audio
        const userInteractionEvents = ['click', 'touchstart', 'keydown'];
        const handleUserInteraction = () => {
            if (!this.state.hasInteracted) {
                this.state.hasInteracted = true;
                this.startAudio();
                
                // Remove event listeners once interaction has occurred
                userInteractionEvents.forEach(event => {
                    document.removeEventListener(event, handleUserInteraction);
                });
            }
        };
        
        userInteractionEvents.forEach(event => {
            document.addEventListener(event, handleUserInteraction, { once: false });
        });
    }
    
    /**
     * Initialize the Web Audio API if supported
     */
    initAudioSystem() {
        // Check if Web Audio API is supported
        if (window.AudioContext || window.webkitAudioContext) {
            try {
                // Initialize only on first interaction to avoid autoplay issues
                document.addEventListener('click', this.initWebAudio.bind(this), { once: true });
                document.addEventListener('touchstart', this.initWebAudio.bind(this), { once: true });
                document.addEventListener('keydown', this.initWebAudio.bind(this), { once: true });
            } catch (err) {
                console.warn('Web Audio API initialization error:', err);
                // Will fallback to standard HTML5 audio
            }
        }
    }
    
    /**
     * Initialize Web Audio API on user interaction
     */
    initWebAudio() {
        if (this.state.audioContext) return; // Already initialized
        
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.state.audioContext = new AudioContext();
            
            // Resume audio context if suspended
            if (this.state.audioContext.state === 'suspended') {
                this.state.audioContext.resume();
            }
            
            // Preload audio files
            this.preloadAudio();
            
            console.log('Web Audio API initialized');
        } catch (err) {
            console.warn('Web Audio API initialization error:', err);
        }
    }
    
    /**
     * Start audio playback once user has interacted
     */
    startAudio() {
        // Init Web Audio if not already done
        this.initWebAudio();
        
        // Start background music if enabled
        this.updateBackgroundMusic();
    }
    
    /**
     * Preload audio files for better performance
     */
    preloadAudio() {
        if (this.state.preloadComplete || !this.state.audioContext) return;
        
        console.log('Preloading audio files...');
        
        // Create an array of files to preload
        const audioFiles = Object.entries(this.audioElements)
            .filter(([_, element]) => element && element.src)
            .map(([id, element]) => ({ id, url: element.src }));
        
        // Preload each file
        Promise.all(
            audioFiles.map(({ id, url }) => 
                fetch(url)
                    .then(response => response.arrayBuffer())
                    .then(arrayBuffer => this.state.audioContext.decodeAudioData(arrayBuffer))
                    .then(audioBuffer => {
                        this.state.audioBuffers[id] = audioBuffer;
                        console.log(`Preloaded audio: ${id}`);
                        return id;
                    })
                    .catch(err => {
                        console.warn(`Failed to preload audio ${id}:`, err);
                        return null;
                    })
            )
        ).then(results => {
            console.log('Audio preloading complete:', results.filter(Boolean));
            this.state.preloadComplete = true;
        }).catch(err => {
            console.error('Audio preloading failed:', err);
        });
    }
    
    /**
     * Apply volume settings to all audio elements
     */
    applyVolumeSettings() {
        // Set background music volume
        if (this.audioElements.bgMusic) {
            this.audioElements.bgMusic.volume = this.state.musicVolume;
        }
        
        // Set volume for all effect sounds
        Object.entries(this.audioElements).forEach(([key, element]) => {
            if (key !== 'bgMusic' && element) {
                element.volume = this.state.sfxVolume;
            }
        });
    }
    
    /**
     * Update background music state
     */
    updateBackgroundMusic() {
        const bgMusic = this.audioElements.bgMusic;
        if (!bgMusic) {
            console.warn("Background music element not available");
            return;
        }
        
        // Set volume
        bgMusic.volume = this.state.musicVolume;
        
        if (this.state.musicEnabled && this.state.hasInteracted) {
            // Try to play music
            bgMusic.play().catch(err => {
                console.warn('Background music autoplay failed:', err);
                
                // Handle autoplay policy restrictions
                if (err.name === 'NotAllowedError') {
                    this.setupAutoplayFix();
                }
            });
        } else {
            // Pause music
            bgMusic.pause();
        }
    }
    
    /**
     * Set up a fix for autoplay blocking
     */
    setupAutoplayFix() {
        const handleInteraction = () => {
            // Resume audio context if using Web Audio API
            if (this.state.audioContext && this.state.audioContext.state === 'suspended') {
                this.state.audioContext.resume().then(() => {
                    if (this.state.musicEnabled) {
                        this.updateBackgroundMusic();
                    }
                });
            }
            
            // Try to play background music again
            if (this.state.musicEnabled && this.audioElements.bgMusic) {
                this.audioElements.bgMusic.play().catch(() => {});
            }
            
            // Only need to do this once
            document.removeEventListener('click', handleInteraction);
            document.removeEventListener('touchstart', handleInteraction);
            document.removeEventListener('keydown', handleInteraction);
        };
        
        // Set up interaction listeners
        document.addEventListener('click', handleInteraction, { once: true });
        document.addEventListener('touchstart', handleInteraction, { once: true });
        document.addEventListener('keydown', handleInteraction, { once: true });
        
        // Show a notification about audio
        document.dispatchEvent(new CustomEvent('showNotification', {
            detail: {
                message: 'Click or tap anywhere to enable audio',
                duration: 5000,
                type: 'info'
            }
        }));
    }
    
    /**
     * Play a sound with throttling to prevent sound overlapping
     * @param {string} soundId - The ID of the sound to play
     * @param {number} throttleMs - Minimum time between plays of this sound (default: 100ms)
     */
    play(soundId, throttleMs = 100) {
        // Check if sound effects are enabled
        if (!this.state.sfxEnabled) return;
        
        // Get current time
        const now = Date.now();
        
        // Check throttling
        if (this.state.lastPlayedTime[soundId] && 
            now - this.state.lastPlayedTime[soundId] < throttleMs) {
            return;
        }
        
        // Update last played time
        this.state.lastPlayedTime[soundId] = now;
        
        // Determine the sound element to play
        let sound = this.audioElements[soundId];
        
        // Fallback to match sound for some special effects if missing
        if (!sound && ['levelUp', 'victory', 'combo'].includes(soundId)) {
            sound = this.audioElements.match;
        }
        
        if (!sound) {
            console.warn(`Sound ${soundId} not found`);
            return;
        }
        
        // First try to play using the Web Audio API for better performance
        if (this.state.audioContext && this.state.audioBuffers[soundId]) {
            this.playWithWebAudio(soundId);
        } else {
            // Fallback to HTML5 Audio
            try {
                // Reset playback position
                sound.currentTime = 0;
                
                // Set volume
                sound.volume = this.state.sfxVolume;
                
                // Play the sound
                sound.play().catch((err) => {
                    console.warn(`Failed to play sound ${soundId}:`, err);
                });
            } catch (err) {
                console.warn(`Error playing sound ${soundId}:`, err);
            }
        }
    }
    
    /**
     * Play a sound using Web Audio API
     * @param {string} soundId - The ID of the sound to play
     */
    playWithWebAudio(soundId) {
        if (!this.state.audioContext || !this.state.audioBuffers[soundId]) return;
        
        try {
            // Stop previous playback of this sound
            if (this.state.audioSources[soundId]) {
                try {
                    this.state.audioSources[soundId].stop();
                } catch (e) {
                    // Ignore if already stopped
                }
                delete this.state.audioSources[soundId];
            }
            
            // Create a new audio source
            const source = this.state.audioContext.createBufferSource();
            source.buffer = this.state.audioBuffers[soundId];
            
            // Create a gain node for volume control
            const gainNode = this.state.audioContext.createGain();
            gainNode.gain.value = this.state.sfxVolume;
            
            // Connect the source to the gain node and then to the output
            source.connect(gainNode);
            gainNode.connect(this.state.audioContext.destination);
            
            // Start playback
            source.start(0);
            
            // Save reference to the source
            this.state.audioSources[soundId] = source;
            
            // Handle cleanup when the sound ends
            source.onended = () => {
                delete this.state.audioSources[soundId];
            };
        } catch (err) {
            console.error(`Error playing sound ${soundId} with Web Audio:`, err);
        }
    }
    
    /**
     * Convenience methods for specific sounds
     */
    playFlip() {
        this.play('flip');
    }
    
    playMatch() {
        this.play('match');
    }
    
    playGameOver() {
        this.play('gameOver');
    }
    
    playLevelUp() {
        this.play('levelUp', 500); // Longer throttle for level up
    }
    
    playCombo() {
        this.play('combo', 300);
    }
    
    playPause() {
        this.play('pause', 300);
    }
    
    playResume() {
        this.play('resume', 300);
    }
    
    playVictory() {
        this.play('victory', 500);
    }
    
    /**
     * Play a specific modified version of a sound
     * @param {string} soundId - Base sound ID
     * @param {object} options - Modification options
     */
    playModified(soundId, options = {}) {
        if (!this.state.sfxEnabled || !this.state.audioContext) {
            // Fall back to regular play
            this.play(soundId);
            return;
        }
        
        const audioBuffer = this.state.audioBuffers[soundId];
        if (!audioBuffer) {
            this.play(soundId);
            return;
        }
        
        try {
            // Create a new source
            const source = this.state.audioContext.createBufferSource();
            source.buffer = audioBuffer;
            
            // Apply pitch modification if specified
            if (options.pitch) {
                source.playbackRate.value = options.pitch;
            }
            
            // Create gain node for volume
            const gainNode = this.state.audioContext.createGain();
            gainNode.gain.value = options.volume || this.state.sfxVolume;
            
            // Connect nodes
            source.connect(gainNode);
            gainNode.connect(this.state.audioContext.destination);
            
            // Start playback
            source.start(0);
            
            // Clean up
            source.onended = () => {
                source.disconnect();
                gainNode.disconnect();
            };
        } catch (err) {
            console.warn('Error playing modified sound:', err);
            // Fall back to regular play
            this.play(soundId);
        }
    }
}

// Export as a singleton
export const audioManager = new AudioManager();