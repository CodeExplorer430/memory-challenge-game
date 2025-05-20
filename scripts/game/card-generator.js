/**
 * Card Generator
 * 
 * Handles the generation of different card types and content
 */
class CardGenerator {
    constructor() {
        // Card content generators by type
        this.generators = {
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
    }
    
    /**
     * Get the generator for the specified card type
     * @param {string} cardType - The type of card to generate (color, number, letter, image)
     * @returns {Object} The generator object for the specified type
     */
    getGenerator(cardType) {
        return this.generators[cardType] || this.generators.color;
    }
    
    /**
     * Generate card pairs for the game
     * @param {string} cardType - The type of card to generate
     * @param {number} totalPairs - The number of pairs to generate
     * @returns {Array} Array of card values in pairs, shuffled
     */
    generateCardPairs(cardType, totalPairs) {
        const generator = this.getGenerator(cardType);
        let pairValues = [];
        
        if (cardType === 'color') {
            // Special handling for color category
            // 1. Shuffle all available colors
            const shuffledColors = this.shuffleArray([...generator.values]);
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
        
        // Shuffle the final pairs
        return this.shuffleArray(pairValues);
    }
    
    /**
 * Create a card element with the specified value
 * @param {*} value - The value for the card
 * @param {number} index - The index of the card
 * @param {string} cardType - The type of card
 * @returns {HTMLElement} The created card element
 */
createCardElement(value, index, cardType) {
    const generator = this.getGenerator(cardType);
    
    // Create main card container
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.value = value;
    card.dataset.index = index;
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Card ${index + 1}`);
    
    // Create the inner card element that will flip
    const cardInner = document.createElement('div');
    cardInner.className = 'card-inner';
    
    // Create front face (card back when not flipped)
    const frontFace = document.createElement('div');
    frontFace.className = 'card-face card-front';
    
    // Create back face (shows content when flipped)
    const backFace = document.createElement('div');
    backFace.className = 'card-face card-back';
    
    // Create a wrapper for the card content to ensure proper centering
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'card-content';
    contentWrapper.innerHTML = generator.create(value);
    
    // Assemble the card structure
    backFace.appendChild(contentWrapper);
    cardInner.appendChild(frontFace);
    cardInner.appendChild(backFace);
    card.appendChild(cardInner);
    
    return card;
}
    /**
     * Shuffle an array using Fisher-Yates algorithm
     * @param {Array} array - The array to shuffle
     * @returns {Array} The shuffled array
     */
    shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }
}

export const cardGenerator = new CardGenerator();