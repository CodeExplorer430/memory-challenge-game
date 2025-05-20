/**
 * Enhanced Audio Manager
 * 
 * Handles all game sounds and audio configuration with improved error handling
 */
class AudioManager {
    constructor() {
        console.log("Initializing Audio Manager...");
        
        // Try to get audio elements
        this.bgMusic = document.getElementById('backgroundMusic');
        this.flip = document.getElementById('flipSound');
        this.match = document.getElementById('matchSound');
        this.gameOver = document.getElementById('gameOverSound');
        this.levelUp = document.getElementById('levelUpSound');
        
        this.musicToggle = document.getElementById('musicToggle');
        this.sfxToggle = document.getElementById('sfxToggle');
        
        // Check if elements were found
        this.checkAudioElements();
        
        // Audio contexts for better performance
        this.audioContext = null;
        this.audioSources = {};
        this.audioBuffers = {};
        
        // Preload status tracking
        this.preloadComplete = false;
        this.preloadPromise = null;
        
        // Initialize audio settings from localStorage or defaults
        this.init();
    }
    
    /**
     * Check if all required audio elements exist
     */
    checkAudioElements() {
        const elements = {
            'backgroundMusic': this.bgMusic,
            'flipSound': this.flip,
            'matchSound': this.match,
            'gameOverSound': this.gameOver,
            'levelUpSound': this.levelUp,
            'musicToggle': this.musicToggle,
            'sfxToggle': this.sfxToggle
        };
        
        // Check each element
        let missingElements = [];
        for (const [name, element] of Object.entries(elements)) {
            if (!element) {
                missingElements.push(name);
                console.warn(`Audio element "${name}" not found`);
                
                // Create fallback element if it's an audio element
                if (name.endsWith('Sound') || name === 'backgroundMusic') {
                    this.createFallbackAudio(name);
                }
            }
        }
        
        if (missingElements.length > 0) {
            console.warn(`Missing audio elements: ${missingElements.join(', ')}`);
        } else {
            console.log("All audio elements found");
        }
    }
    
    /**
     * Create a fallback audio element
     * @param {string} id - Element ID
     */
    createFallbackAudio(id) {
        // Create element if it doesn't exist
        const audio = document.createElement('audio');
        audio.id = id;
        
        if (id === 'backgroundMusic') {
            audio.loop = true;
        }
        
        // Try to set a default source based on convention
        const type = id.replace('Sound', '').replace('background', 'background');
        audio.src = `/assets/sounds/${type.toLowerCase()}.mp3`;
        
        // Add to document
        document.body.appendChild(audio);
        
        // Update reference
        this[id.replace('Sound', '').replace('background', 'bg')] = audio;
        
        console.log(`Created fallback audio element: ${id}`);
    }
    
    init() {
        console.log("Initializing audio settings");
        // Get saved preferences or use defaults
        const musicEnabled = localStorage.getItem('musicEnabled') !== 'false'; // Default to true
        const sfxEnabled = localStorage.getItem('sfxEnabled') !== 'false'; // Default to true
        
        // Update toggle controls to match saved preferences
        if (this.musicToggle) this.musicToggle.checked = musicEnabled;
        if (this.sfxToggle) this.sfxToggle.checked = sfxEnabled;
        
        // Apply initial audio state (delayed to avoid autoplay issues)
        setTimeout(() => {
            this.updateBackgroundMusic();
        }, 1000);
        
        // Set up event listeners for audio controls
        this.setupEventListeners();
        
        // Initialize audio system based on browser capability
        this.initAudioSystem();
    }
    
    initAudioSystem() {
        // Try to use Web Audio API for better performance if available
        try {
            // Only create AudioContext when user interacts, to avoid autoplay policies
            const setupAudioContext = () => {
                if (this.audioContext) return; // Already initialized
                
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (AudioContext) {
                    this.audioContext = new AudioContext();
                    
                    // Optimize audio playback by pre-buffering audio files
                    this.preloadAudio();
                    
                    // Remove the initialization listener once done
                    document.removeEventListener('click', setupAudioContext);
                    document.removeEventListener('touchstart', setupAudioContext);
                }
            };
            
            // Set up listeners to initialize on first interaction
            document.addEventListener('click', setupAudioContext, { once: true });
            document.addEventListener('touchstart', setupAudioContext, { once: true });
        } catch (err) {
            console.warn('Advanced audio features not available:', err);
            // Fallback to standard HTML5 audio
        }
    }
    
    preloadAudio() {
        // Skip if already preloaded or in progress
        if (this.preloadComplete || this.preloadPromise) return this.preloadPromise;
        
        const audioFiles = {
            'bgMusic': this.bgMusic ? this.bgMusic.src : null,
            'flip': this.flip ? this.flip.src : null,
            'match': this.match ? this.match.src : null,
            'gameOver': this.gameOver ? this.gameOver.src : null,
            'levelUp': this.levelUp ? this.levelUp.src : null
        };
        
        // Filter out null entries
        const validFiles = Object.entries(audioFiles).filter(([_, url]) => url);
        console.log("Audio files to preload:", validFiles.map(([id]) => id));
        
        // Create a promise to track preloading completion
        this.preloadPromise = Promise.all(
            validFiles.map(([id, url]) => {
                return fetch(url)
                    .then(response => response.arrayBuffer())
                    .then(arrayBuffer => this.audioContext.decodeAudioData(arrayBuffer))
                    .then(audioBuffer => {
                        this.audioBuffers[id] = audioBuffer;
                        return id;
                    })
                    .catch(err => {
                        console.warn(`Failed to preload audio ${id}:`, err);
                        return null;
                    });
            })
        ).then(results => {
            console.log('Audio preloading complete:', results.filter(Boolean));
            this.preloadComplete = true;
            return true;
        }).catch(err => {
            console.error('Audio preloading failed:', err);
            return false;
        });
        
        return this.preloadPromise;
    }
    
    setupEventListeners() {
        if (this.musicToggle) {
            this.musicToggle.addEventListener('change', () => {
                localStorage.setItem('musicEnabled', this.musicToggle.checked);
                this.updateBackgroundMusic();
            });
        }
        
        if (this.sfxToggle) {
            this.sfxToggle.addEventListener('change', () => {
                localStorage.setItem('sfxEnabled', this.sfxToggle.checked);
            });
        }
    }
    
    // Update background music state based on toggle
    updateBackgroundMusic() {
        if (!this.bgMusic) {
            console.warn("Background music element not available");
            return;
        }
        
        if (this.musicToggle && this.musicToggle.checked) {
            console.log("Starting background music");
            this.bgMusic.volume = 0.4; // Slightly lower volume to prevent distortion
            
            // Use different playback method based on browser support
            if (this.audioContext && this.audioBuffers['bgMusic']) {
                this.playBufferedAudio('bgMusic', true);
            } else {
                this.bgMusic.play().catch(err => {
                    console.log('Audio play failed:', err);
                    // Provide visual feedback if autoplay is blocked
                    if (err.name === 'NotAllowedError') {
                        this.showPlayBlockedMessage();
                        this.setupAutoplayFix();
                    }
                });
            }
        } else {
            console.log("Pausing background music");
            this.bgMusic.pause();
            
            // Also stop the buffered version if using Web Audio API
            if (this.audioSources['bgMusic']) {
                try {
                    this.audioSources['bgMusic'].stop();
                } catch (e) {
                    // Ignore if already stopped
                }
                delete this.audioSources['bgMusic'];
            }
        }
    }
    
    // Play a buffered audio file using Web Audio API
    playBufferedAudio(id, loop = false) {
        if (!this.audioContext || !this.audioBuffers[id]) return false;
        
        // Stop previous playback of this sound
        if (this.audioSources[id]) {
            try {
                this.audioSources[id].stop();
            } catch (e) {
                // Ignore if already stopped
            }
        }
        
        try {
            // Create a new audio source
            const source = this.audioContext.createBufferSource();
            source.buffer = this.audioBuffers[id];
            source.loop = loop;
            
            // Create a gain node for volume control
            const gainNode = this.audioContext.createGain();
            gainNode.gain.value = id === 'bgMusic' ? 0.4 : 0.7;
            
            // Connect the source to the gain node and then to the output
            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // Start playback
            source.start(0);
            
            // Save reference to the source
            this.audioSources[id] = source;
            
            // Handle cleanup when the sound ends (if not looping)
            if (!loop) {
                source.onended = () => {
                    delete this.audioSources[id];
                };
            }
            
            return true;
        } catch (err) {
            console.error(`Error playing buffered audio ${id}:`, err);
            return false;
        }
    }
    
    // Show a notification that audio is blocked
    showPlayBlockedMessage() {
        const event = new CustomEvent('showNotification', {
            detail: {
                message: 'Click anywhere to enable audio',
                duration: 5000
            }
        });
        document.dispatchEvent(event);
    }
    
    // Set up a fix for autoplay blocking
    setupAutoplayFix() {
        const startAudioOnce = () => {
            // Resume audioContext if using Web Audio API
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume().then(() => {
                    if (this.musicToggle && this.musicToggle.checked) {
                        this.updateBackgroundMusic();
                    }
                });
            } else {
                // Fallback to regular HTML5 audio
                this.bgMusic.play().catch(() => {});
            }
            
            document.body.removeEventListener('click', startAudioOnce);
        };
        
        document.body.addEventListener('click', startAudioOnce);
    }
    
    // Play a sound effect if enabled
    play(soundId) {
        // Check if sound effects are enabled
        if (this.sfxToggle && !this.sfxToggle.checked) return;
        
        // Determine the sound element or buffer to play
        let sound = null;
        switch (soundId) {
            case 'flip':
                sound = this.flip;
                break;
            case 'match':
                sound = this.match;
                break;
            case 'gameOver':
                sound = this.gameOver;
                break;
            case 'levelUp':
                sound = this.levelUp || this.match; // Fallback to match sound
                break;
            default:
                sound = soundId; // Direct element passed in
        }
        
        // First try to play using the Web Audio API for better performance
        if (this.audioContext && this.audioBuffers[soundId]) {
            this.playBufferedAudio(soundId);
        } else if (sound && typeof sound !== 'string') {
            // Fallback to HTML5 Audio
            try {
                sound.currentTime = 0;
                sound.volume = 0.7; // Slightly lower volume to prevent distortion
                sound.play().catch((err) => {
                    console.warn(`Failed to play sound ${soundId}:`, err);
                });
            } catch (err) {
                console.warn(`Error playing sound ${soundId}:`, err);
            }
        } else {
            console.warn(`Sound ${soundId} not found`);
        }
    }
    
    // Convenience methods for specific sounds
    playFlip() {
        this.play('flip');
    }
    
    playMatch() {
        this.play('match');
    }
    
    playGameOver() {
        this.play('gameOver');
    }
    
    // New method: play a level up celebration sound
    playLevelUp() {
        // Use the levelUp sound if available, or fallback to match with modified pitch
        if (this.levelUp) {
            this.play('levelUp');
        } else if (this.match) {
            // Use the match sound but with special parameters for distinction
            if (this.audioContext && this.audioBuffers['match']) {
                const source = this.audioContext.createBufferSource();
                source.buffer = this.audioBuffers['match'];
                source.playbackRate.value = 1.3; // Slightly higher pitch
                
                const gainNode = this.audioContext.createGain();
                gainNode.gain.value = 0.8; // Slightly louder
                
                source.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                source.start(0);
            } else if (this.match) {
                // Fallback to regular HTML5 audio
                try {
                    const clonedMatch = this.match.cloneNode();
                    clonedMatch.volume = 0.8;
                    if ('playbackRate' in clonedMatch) {
                        clonedMatch.playbackRate = 1.3;
                    }
                    clonedMatch.play().catch(() => {});
                } catch (err) {
                    console.warn("Error playing level up sound:", err);
                    // Last resort: just play the match sound
                    this.playMatch();
                }
            }
        }
    }
}

// Export as a singleton
export const audioManager = new AudioManager();