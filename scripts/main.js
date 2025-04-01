document.addEventListener('DOMContentLoaded', () => {
    // Game elements
    const gameGrid = document.getElementById('game-grid');
    const startBtn = document.getElementById('start-btn');
    const levelDisplay = document.getElementById('level-display');
    const scoreDisplay = document.getElementById('score-display');
    const timerDisplay = document.getElementById('timer-display');
    const movesDisplay = document.getElementById('moves-display');
    const difficultyBtns = document.querySelectorAll('.difficulty-btn');
    const cardTypeSelect = document.getElementById('cardType');

    // High score elements
    const easyHighScoreDisplay = document.getElementById('easy-high-score');
    const mediumHighScoreDisplay = document.getElementById('medium-high-score');
    const hardHighScoreDisplay = document.getElementById('hard-high-score');

    // Load high scores from local storage
    let highScores = {
        easy: parseInt(localStorage.getItem('colorMemoryHighScoreEasy')) || 0,
        medium: parseInt(localStorage.getItem('colorMemoryHighScoreMedium')) || 0,
        hard: parseInt(localStorage.getItem('colorMemoryHighScoreHard')) || 0
    };

    // Update high score display
    easyHighScoreDisplay.textContent = highScores.easy;
    mediumHighScoreDisplay.textContent = highScores.medium;
    hardHighScoreDisplay.textContent = highScores.hard;

    // Game state
    let cards = [];
    let flippedCards = [];
    let matchedPairs = 0;
    let level = 1;
    let score = 0;
    let moves = 0;
    let timer = null;
    let timeLeft = 0;
    let isProcessing = false;
    let gameStarted = false;
    let currentDifficulty = 'easy';
    let cardType = 'color';

    // Difficulty settings
    const difficulties = {
        easy: {
            viewTime: 3000,
            matchTime: 1000,
            cards: 18, // Changed from 16 to 18
            levels: [120, 105, 90, 60, 30],
            gridSize: {
                columns: 6, // Changed from 4 to 6
                rows: 3,    // Changed from 4 to 3
                totalPairs: 9  // Changed from 8 to 9
            }
        },
        medium: {
            viewTime: 2500,
            matchTime: 800,
            cards: 24, // Changed from 20 to 24
            levels: [105, 90, 75, 60, 45],
            gridSize: {
                columns: 6, // Changed from 5 to 6
                rows: 4,    // No change needed
                totalPairs: 12 // Changed from 10 to 12
            }
        },
        hard: {
            viewTime: 2000,
            matchTime: 600,
            cards: 36, // Changed from 30 to 36
            levels: [90, 75, 60, 45, 30],
            gridSize: {
                columns: 6, // No change needed
                rows: 6,    // Changed from 5 to 6
                totalPairs: 18 // Changed from 15 to 18
            }
        }
    };

    // Card Content Generators
    const contentGenerators = {
        color: {
            values: [
                '#FF5252', // Red
                '#FFEB3B', // Yellow
                '#4CAF50', // Green
                '#2196F3', // Blue
                '#9C27B0', // Purple
                '#FF9800', // Orange
                '#00BCD4', // Cyan
                '#795548', // Brown
                '#607D8B', // Blue Grey
                '#F44336', // Red variant
                '#FFC107', // Amber
                '#8BC34A', // Light Green
                '#3F51B5', // Indigo
                '#E91E63', // Pink
                '#FF5722', // Deep Orange
                '#009688', // Teal
                '#673AB7', // Deep Purple
                '#CDDC39', // Lime
                '#03A9F4', // Light Blue
                '#9E9E9E'  // Grey
            ],
            create: (value) => `<div class="color-card" style="background-color:${value}"></div>`
        },
        number: {
            values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
            create: (value) => `<span class="number">${value}</span>`
        },
        letter: {
            values: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'],
            create: (value) => `<span class="letter">${value}</span>`
        },
        image: {
            values: ['🐶', '🐱', '🐻', '🐼', '🐯', '🦁', '🐘', '🦊', '🐸', '🐢', '🦄', '🐬', '🦉', '🦜', '🐝', '🦋', '🐙', '🦞', '🦨', '🦔'],
            create: (value) => `<span class="image">${value}</span>`
        }
    };

    // Audio Manager
    const audio = {
        bgMusic: document.getElementById('backgroundMusic'),
        flip: document.getElementById('flipSound'),
        match: document.getElementById('matchSound'),
        gameOver: document.getElementById('gameOverSound'),
        play(sound) {
            if (document.getElementById('sfxToggle').checked && sound) {
                sound.currentTime = 0;
                sound.play().catch(() => {});
            }
        }
    };

    // Theme Manager
    const themes = {
        default: {
            '--primary-color': '#6200ea',
            '--secondary-color': '#00e676',
            '--bg-color': '#ecf0f1',
            '--card-bg': '#ffffff',
            '--text-color': '#000000'
        },
        dark: {
            '--primary-color': '#BB86FC',
            '--secondary-color': '#03DAC6',
            '--bg-color': '#121212',
            '--card-bg': '#2d2d2d',
            '--text-color': '#e0e0e0'
        },
        nature: {
            '--primary-color': '#2E7D32',
            '--secondary-color': '#FFB300',
            '--bg-color': '#C8E6C9',
            '--card-bg': '#FFFFFF',
            '--text-color': '#2E7D32'
        },
        cyber: {
            '--primary-color': '#FF2D70',
            '--secondary-color': '#00F0FF',
            '--bg-color': '#0A192F',
            '--card-bg': '#172A45',
            '--text-color': '#00F0FF'
        }
    };

    function setTheme(themeName) {
        const theme = themes[themeName];
        Object.entries(theme).forEach(([prop, value]) => {
            document.documentElement.style.setProperty(prop, value);
        });
        localStorage.setItem('selectedTheme', themeName);
    }

    // Leaderboard Manager
    let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

    function updateLeaderboard(score, difficulty) {
        const user = auth.currentUser;
        
        if (user) {
            db.collection('scores').add({
                userId: user.uid,
                name: user.displayName,
                score,
                difficulty,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
        } else {
            alert('You need to sign in to appear on the global leaderboard!');
        }
    }
    function updateLeaderboardDisplay() {
        const tbody = document.getElementById('leaderboardBody');
        tbody.innerHTML = leaderboard
            .map((entry, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${entry.name}</td>
                    <td>${entry.score}</td>
                    <td>${entry.difficulty}</td>
                    <td>${entry.date}</td>
                </tr>
            `).join('');
    }

    // // Sign-in buttons
    // const authSection = document.createElement('div');
    // authSection.className = 'auth-section text-center mb-3';
    // authSection.innerHTML = `
    //     <button id="mainGoogleLogin" class="btn btn-sm btn-danger">
    //         <i class="bi bi-google"></i> Sign in
    //     </button>
    //     <button id="mainFacebookLogin" class="btn btn-sm btn-primary">
    //         <i class="bi bi-facebook"></i> Sign in
    //     </button>
    // `;
    // document.querySelector('.controls-top').prepend(authSection);

    // // Add auth event listeners
    // document.getElementById('mainGoogleLogin').addEventListener('click', () => auth.signInWithPopup(googleProvider));
    // document.getElementById('mainFacebookLogin').addEventListener('click', () => auth.signInWithPopup(facebookProvider));

    // Theme Initialization
    const savedTheme = localStorage.getItem('selectedTheme') || 'default';
    document.getElementById('themeSelect').value = savedTheme;
    setTheme(savedTheme);

    // Event Listeners
    document.getElementById('themeSelect').addEventListener('change', (e) => {
        setTheme(e.target.value);
    });

    document.getElementById('musicToggle').addEventListener('change', (e) => {
        e.target.checked ? audio.bgMusic.play().catch(() => {}) : audio.bgMusic.pause();
    });

    // Timer Management
    function updateTimer() {
        if (!gameStarted) return;
        
        timeLeft--;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        if (timeLeft <= 0) endGame(false);
    }

    function startTimer() {
        timeLeft = getLevelTime();
        timer = setInterval(updateTimer, 1000);
    }

    function getLevelTime() {
        return difficulties[currentDifficulty].levels[level - 1];
    }

    // Handle orientation changes
    function handleOrientationChange() {
        // Force a re-layout if needed
        setTimeout(() => {
            createGrid();
            if (gameStarted) {
                // If game has started, restore the current state
                cards.forEach(card => {
                    if (card.classList.contains('matched')) {
                        card.classList.add('flipped');
                    }
                });
            }
        }, 300);
    }

    // Listen for orientation changes
    window.addEventListener('orientationchange', handleOrientationChange);

    // Set up difficulty selection
    difficultyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            difficultyBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentDifficulty = btn.dataset.difficulty;

            // Update grid class
            gameGrid.className = `grid-container ${currentDifficulty}`;

            if (gameStarted) {
                resetGame();
            } else {
                // If game hasn't started yet, just update the grid
                createGrid();
            }
        });
    });

    // Set up card type selection
    cardTypeSelect.addEventListener('change', (e) => {
        cardType = e.target.value;
        if (gameStarted) {
            resetGame();
        } else {
            createGrid();
        }
    });

    // Initialize the game grid
    function createGrid() {
        gameGrid.innerHTML = '';
        cards = [];
        flippedCards = [];

        const difficulty = difficulties[currentDifficulty];
        const generator = contentGenerators[cardType];
        const totalPairs = difficulty.gridSize.totalPairs;
        
        // Create a set of paired values
        let pairValues = [];
        if (cardType === 'color') {
            // Special handling for color category
            // 1. Shuffle all available colors
            const shuffledColors = shuffleArray([...generator.values]);
            // 2. Select unique colors needed for pairs
            const selectedColors = shuffledColors.slice(0, totalPairs);
            // 3. Create pairs from selected colors
            selectedColors.forEach(color => {
                pairValues.push(color);
                pairValues.push(color);
            });
        } else {
            // Original logic for other categories
            for (let i = 0; i < totalPairs; i++) {
                const value = generator.values[i % generator.values.length];
                pairValues.push(value);
                pairValues.push(value);
            }
        }
    
        // Shuffle the final pairs (keep this for all categories)
        pairValues = shuffleArray(pairValues);
    
        // Create the cards
        for (let i = 0; i < totalPairs * 2; i++) {
            const card = document.createElement('div');
            card.className = 'card';
            card.dataset.value = pairValues[i];
            card.dataset.index = i;
            
            // Add inner structure for proper 3D flipping
            const cardInner = document.createElement('div');
            cardInner.className = 'card-inner';
            
            const frontFace = document.createElement('div');
            frontFace.className = 'card-face card-front';
            
            const backFace = document.createElement('div');
            backFace.className = 'card-face card-back';
            backFace.innerHTML = generator.create(pairValues[i]);
            
            cardInner.appendChild(frontFace);
            cardInner.appendChild(backFace);
            card.appendChild(cardInner);
    
            // Event handling
            card.addEventListener('click', () => {
                handleCardInteraction(card);
            });
    
            card.addEventListener('touchstart', (e) => {
                e.preventDefault();
                handleCardInteraction(card);
            }, { passive: false });
    
            gameGrid.appendChild(card);
            cards.push(card);
        }
    
        // Update grid CSS classes
        gameGrid.className = `grid-container ${currentDifficulty}`;
        
        // Adjust grid layout based on screen orientation for mobile
        adjustGridForScreenSize();
    }

    // Handle card interaction (click or touch)
    function handleCardInteraction(card) {
        if (!gameStarted || isProcessing || card.classList.contains('flipped') || card.classList.contains('matched')) {
            return;
        }

        flipCard(card);
    }

    // Adjust grid layout for screen size and orientation
    function adjustGridForScreenSize() {
        const isMobile = window.innerWidth <= 768;
        const isLandscape = window.innerWidth > window.innerHeight;

        // Additional class adjustments can be made here if needed
        if (isMobile && isLandscape) {
            // Make sure landscape layout is applied
            document.querySelector('.game-container').classList.add('landscape-mode');
        } else {
            document.querySelector('.game-container').classList.remove('landscape-mode');
        }
    }

    // Start the game
    function startGame() {
        gameStarted = true;
        matchedPairs = 0;
        startBtn.textContent = 'Reset Game';
        isProcessing = true;

        // Add visual cue that game is starting
        startBtn.classList.add('active');

        // Show cards for a brief period with transition
        cards.forEach((card, index) => {
            // Staggered reveal for a nicer effect
            setTimeout(() => {
                card.classList.add('flipped');
            }, 50 * (index % 10));
        });

        // Start the timer
        startTimer();

        // Hide cards after a delay based on difficulty
        setTimeout(() => {
            cards.forEach((card, index) => {
                // Staggered hide for a nicer effect
                setTimeout(() => {
                    if (!card.classList.contains('matched')) {
                        card.classList.remove('flipped');
                    }
                }, 50 * (index % 10));
            });
            isProcessing = false;
            startBtn.classList.remove('active');
        }, difficulties[currentDifficulty].viewTime);
    }

    // Flip a card
    function flipCard(card) {
        audio.play(audio.flip);
        if (flippedCards.length < 2) {
            card.classList.add('flipped');
            flippedCards.push(card);

            if (flippedCards.length === 2) {
                moves++;
                movesDisplay.textContent = moves;
                isProcessing = true;

                setTimeout(() => {
                    checkForMatch();
                }, difficulties[currentDifficulty].matchTime);
            }
        }
    }

    // Check if flipped cards match
    function checkForMatch() {
        const card1 = flippedCards[0];
        const card2 = flippedCards[1];

        if (card1.dataset.value === card2.dataset.value) {
            audio.play(audio.match);
            
            // Match found
            card1.classList.add('matched');
            card2.classList.add('matched');
            matchedPairs++;

            // Update score with a more rewarding formula
            const matchBonus = 10 * level;
            const speedBonus = Math.max(0, 5 - Math.floor(moves / matchedPairs)); // Reward efficiency
            score += matchBonus + speedBonus;
            scoreDisplay.textContent = score;

            // Check for level completion
            if (matchedPairs === difficulties[currentDifficulty].gridSize.totalPairs) {
                if (level >= 5) {
                    endGame(true);
                } else {
                    levelUp();
                }
            }
        } else {
            // No match - add a short delay before flipping back
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
            }, 500);
        }

        flippedCards = [];
        isProcessing = false;
    }

    // Level up with improved visual feedback
    function levelUp() {
        level++;
        levelDisplay.textContent = level;
        matchedPairs = 0;

        // Update high score if current score is higher
        updateHighScore();

        // Visual feedback for level up
        document.querySelectorAll('.game-info div').forEach(div => {
            div.style.animation = 'pulse 0.6s';
            setTimeout(() => {
                div.style.animation = '';
            }, 600);
        });

        // Reset the grid for the next level
        setTimeout(() => {
            // Clear the timer
            clearInterval(timer);
            createGrid();
            startGame();
        }, 1200);
    }

    // End game function
    function endGame(won) {
        if (won) {
            audio.play(audio.match);
            updateLeaderboard(score, currentDifficulty);
        } else {
            audio.play(audio.gameOver);
        }

        clearInterval(timer);
        gameStarted = false;
        
        // Update high score
        updateHighScore();
        
        setTimeout(() => {
            alert(won ? 'Congratulations! You won!' : 'Time\'s up! Game Over!');
            resetGame();
        }, 500);
    }

    // Update high score
    function updateHighScore() {
        if (score > highScores[currentDifficulty]) {
            highScores[currentDifficulty] = score;
            localStorage.setItem(`colorMemoryHighScore${capitalize(currentDifficulty)}`, score);
            document.getElementById(`${currentDifficulty}-high-score`).textContent = score;
        }
    }

    // Reset the game
    function resetGame() {
        clearInterval(timer);
        level = 1;
        score = 0;
        moves = 0;
        matchedPairs = 0;
        gameStarted = false;
        flippedCards = [];
        isProcessing = false;
        timeLeft = 0;

        levelDisplay.textContent = level;
        scoreDisplay.textContent = score;
        movesDisplay.textContent = moves;
        timerDisplay.textContent = '00:00';

        createGrid();
        startBtn.textContent = 'Start Game';
    }

    // Utility function to shuffle an array
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Utility function to capitalize the first letter
    function capitalize(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // Set up event listeners
    startBtn.addEventListener('click', () => {
        if (!gameStarted) {
            startGame();
        } else {
            resetGame();
        }
    });

    // Check for screen size/orientation on resize
    window.addEventListener('resize', () => {
        adjustGridForScreenSize();
    });

    // Initialize the game
    adjustGridForScreenSize();
    createGrid();

    // Initialize leaderboard
    updateLeaderboardDisplay();
});