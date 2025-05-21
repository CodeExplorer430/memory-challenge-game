/**
 * Enhanced Card Generator
 * 
 * Handles the generation of different card types with improved designs,
 * accessibility features, and better responsiveness
 */
class CardGenerator {
    constructor() {
        // Card content generators by type
        this.generators = {
            color: {
                values: [
                    { value: '#FF5252', name: 'Red' },
                    { value: '#FFEB3B', name: 'Yellow' },
                    { value: '#4CAF50', name: 'Green' },
                    { value: '#2196F3', name: 'Blue' },
                    { value: '#9C27B0', name: 'Purple' },
                    { value: '#FF9800', name: 'Orange' },
                    { value: '#00BCD4', name: 'Cyan' },
                    { value: '#795548', name: 'Brown' },
                    { value: '#607D8B', name: 'Blue Grey' },
                    { value: '#F44336', name: 'Crimson' },
                    { value: '#FFC107', name: 'Amber' },
                    { value: '#8BC34A', name: 'Light Green' },
                    { value: '#3F51B5', name: 'Indigo' },
                    { value: '#E91E63', name: 'Pink' },
                    { value: '#FF5722', name: 'Deep Orange' },
                    { value: '#009688', name: 'Teal' },
                    { value: '#673AB7', name: 'Deep Purple' },
                    { value: '#CDDC39', name: 'Lime' },
                    { value: '#03A9F4', name: 'Light Blue' },
                    { value: '#9E9E9E', name: 'Grey' }
                ],
                create: (item) => `
                    <div class="color-card" style="background-color:${item.value}" 
                         aria-label="${item.name} color"></div>
                `
            },
            number: {
                values: [
                    { value: 1, name: 'One' },
                    { value: 2, name: 'Two' },
                    { value: 3, name: 'Three' },
                    { value: 4, name: 'Four' },
                    { value: 5, name: 'Five' },
                    { value: 6, name: 'Six' },
                    { value: 7, name: 'Seven' },
                    { value: 8, name: 'Eight' },
                    { value: 9, name: 'Nine' },
                    { value: 10, name: 'Ten' },
                    { value: 11, name: 'Eleven' },
                    { value: 12, name: 'Twelve' },
                    { value: 13, name: 'Thirteen' },
                    { value: 14, name: 'Fourteen' },
                    { value: 15, name: 'Fifteen' },
                    { value: 16, name: 'Sixteen' },
                    { value: 17, name: 'Seventeen' },
                    { value: 18, name: 'Eighteen' },
                    { value: 19, name: 'Nineteen' },
                    { value: 20, name: 'Twenty' }
                ],
                create: (item) => `
                    <div class="number-card">
                        <span class="number" aria-label="Number ${item.name}">${item.value}</span>
                    </div>
                `
            },
            letter: {
                values: [
                    { value: 'A', name: 'A' },
                    { value: 'B', name: 'B' },
                    { value: 'C', name: 'C' },
                    { value: 'D', name: 'D' },
                    { value: 'E', name: 'E' },
                    { value: 'F', name: 'F' },
                    { value: 'G', name: 'G' },
                    { value: 'H', name: 'H' },
                    { value: 'I', name: 'I' },
                    { value: 'J', name: 'J' },
                    { value: 'K', name: 'K' },
                    { value: 'L', name: 'L' },
                    { value: 'M', name: 'M' },
                    { value: 'N', name: 'N' },
                    { value: 'O', name: 'O' },
                    { value: 'P', name: 'P' },
                    { value: 'Q', name: 'Q' },
                    { value: 'R', name: 'R' },
                    { value: 'S', name: 'S' },
                    { value: 'T', name: 'T' }
                ],
                create: (item) => `
                    <div class="letter-card">
                        <span class="letter" aria-label="Letter ${item.name}">${item.value}</span>
                    </div>
                `
            },
            image: {
                values: [
                    { value: '🐶', name: 'Dog' },
                    { value: '🐱', name: 'Cat' },
                    { value: '🐻', name: 'Bear' },
                    { value: '🐼', name: 'Panda' },
                    { value: '🐯', name: 'Tiger' },
                    { value: '🦁', name: 'Lion' },
                    { value: '🐘', name: 'Elephant' },
                    { value: '🦊', name: 'Fox' },
                    { value: '🐸', name: 'Frog' },
                    { value: '🐢', name: 'Turtle' },
                    { value: '🦄', name: 'Unicorn' },
                    { value: '🐬', name: 'Dolphin' },
                    { value: '🦉', name: 'Owl' },
                    { value: '🦜', name: 'Parrot' },
                    { value: '🐝', name: 'Bee' },
                    { value: '🦋', name: 'Butterfly' },
                    { value: '🐙', name: 'Octopus' },
                    { value: '🦞', name: 'Lobster' },
                    { value: '🦨', name: 'Skunk' },
                    { value: '🦔', name: 'Hedgehog' }
                ],
                create: (item) => `
                    <div class="image-card">
                        <span class="image" role="img" aria-label="${item.name}">${item.value}</span>
                    </div>
                `
            },
            pattern: {
                values: [
                    { value: 'stripes', name: 'Stripes' },
                    { value: 'dots', name: 'Dots' },
                    { value: 'zigzag', name: 'Zigzag' },
                    { value: 'waves', name: 'Waves' },
                    { value: 'grid', name: 'Grid' },
                    { value: 'diamonds', name: 'Diamonds' },
                    { value: 'checkered', name: 'Checkered' },
                    { value: 'stars', name: 'Stars' },
                    { value: 'triangles', name: 'Triangles' },
                    { value: 'circles', name: 'Circles' },
                    { value: 'swirls', name: 'Swirls' },
                    { value: 'hearts', name: 'Hearts' },
                    { value: 'leaves', name: 'Leaves' },
                    { value: 'flowers', name: 'Flowers' },
                    { value: 'crosshatch', name: 'Crosshatch' },
                    { value: 'arrows', name: 'Arrows' },
                    { value: 'plaid', name: 'Plaid' },
                    { value: 'polka', name: 'Polka dots' },
                    { value: 'herringbone', name: 'Herringbone' },
                    { value: 'honeycomb', name: 'Honeycomb' }
                ],
                create: (item) => {
                    // SVG patterns with better visibility and contrast
                    const patterns = {
                        stripes: `<svg width="100%" height="100%" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                            <pattern id="stripes-${item.value}" patternUnits="userSpaceOnUse" width="10" height="10" patternTransform="rotate(45)">
                                <rect width="6" height="10" fill="#3f51b5" x="0" y="0" />
                            </pattern>
                            <rect width="40" height="40" fill="url(#stripes-${item.value})" />
                        </svg>`,
                        dots: `<svg width="100%" height="100%" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                            <pattern id="dots-${item.value}" patternUnits="userSpaceOnUse" width="10" height="10">
                                <circle cx="5" cy="5" r="2.5" fill="#e91e63" />
                            </pattern>
                            <rect width="40" height="40" fill="url(#dots-${item.value})" />
                        </svg>`,
                        zigzag: `<svg width="100%" height="100%" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                            <pattern id="zigzag-${item.value}" patternUnits="userSpaceOnUse" width="20" height="10">
                                <polyline points="0,0 5,10 10,0 15,10 20,0" stroke="#ff9800" stroke-width="2" fill="none" />
                            </pattern>
                            <rect width="40" height="40" fill="url(#zigzag-${item.value})" />
                        </svg>`,
                        waves: `<svg width="100%" height="100%" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                            <pattern id="waves-${item.value}" patternUnits="userSpaceOnUse" width="20" height="10">
                                <path d="M0,5 C2.5,2.5 7.5,7.5 10,5 C12.5,2.5 17.5,7.5 20,5" stroke="#009688" stroke-width="2" fill="none" />
                            </pattern>
                            <rect width="40" height="40" fill="url(#waves-${item.value})" />
                        </svg>`,
                        grid: `<svg width="100%" height="100%" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                            <pattern id="grid-${item.value}" patternUnits="userSpaceOnUse" width="10" height="10">
                                <path d="M0,0 L0,10 M0,0 L10,0 M10,0 L10,10 M0,10 L10,10" stroke="#607d8b" stroke-width="1" fill="none" />
                            </pattern>
                            <rect width="40" height="40" fill="url(#grid-${item.value})" />
                        </svg>`,
                        diamonds: `<svg width="100%" height="100%" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                            <pattern id="diamonds-${item.value}" patternUnits="userSpaceOnUse" width="20" height="20">
                                <rect x="5" y="5" width="10" height="10" transform="rotate(45, 10, 10)" fill="#9c27b0" />
                            </pattern>
                            <rect width="40" height="40" fill="url(#diamonds-${item.value})" />
                        </svg>`,
                        checkered: `<svg width="100%" height="100%" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                            <pattern id="checkered-${item.value}" patternUnits="userSpaceOnUse" width="20" height="20">
                                <rect x="0" y="0" width="10" height="10" fill="#ff5252" />
                                <rect x="10" y="10" width="10" height="10" fill="#ff5252" />
                            </pattern>
                            <rect width="40" height="40" fill="url(#checkered-${item.value})" />
                        </svg>`,
                        stars: `<svg width="100%" height="100%" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                            <pattern id="stars-${item.value}" patternUnits="userSpaceOnUse" width="20" height="20">
                                <polygon points="10,2 12,8 18,8 13,12 15,18 10,14 5,18 7,12 2,8 8,8" fill="#ffc107" />
                            </pattern>
                            <rect width="40" height="40" fill="url(#stars-${item.value})" />
                        </svg>`,
                        triangles: `<svg width="100%" height="100%" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                            <pattern id="triangles-${item.value}" patternUnits="userSpaceOnUse" width="20" height="20">
                                <polygon points="10,5 5,15 15,15" fill="#4caf50" />
                            </pattern>
                            <rect width="40" height="40" fill="url(#triangles-${item.value})" />
                        </svg>`,
                        circles: `<svg width="100%" height="100%" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                            <pattern id="circles-${item.value}" patternUnits="userSpaceOnUse" width="20" height="20">
                                <circle cx="10" cy="10" r="6" stroke="#2196f3" stroke-width="2" fill="none" />
                            </pattern>
                            <rect width="40" height="40" fill="url(#circles-${item.value})" />
                        </svg>`,
                        swirls: `<svg width="100%" height="100%" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                            <pattern id="swirls-${item.value}" patternUnits="userSpaceOnUse" width="20" height="20">
                                <path d="M10,5 C15,5 15,15 10,15 C5,15 5,10 7.5,10 C10,10 10,12.5 7.5,12.5" stroke="#673ab7" stroke-width="1.5" fill="none" />
                            </pattern>
                            <rect width="40" height="40" fill="url(#swirls-${item.value})" />
                        </svg>`,
                        hearts: `<svg width="100%" height="100%" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                            <pattern id="hearts-${item.value}" patternUnits="userSpaceOnUse" width="20" height="20">
                                <path d="M10,6 C6,6 6,12 10,16 C14,12 14,6 10,6 Z" fill="#e91e63" />
                            </pattern>
                            <rect width="40" height="40" fill="url(#hearts-${item.value})" />
                        </svg>`,
                        leaves: `<svg width="100%" height="100%" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                            <pattern id="leaves-${item.value}" patternUnits="userSpaceOnUse" width="20" height="20">
                                <path d="M10,5 C15,5 15,15 5,15 C5,5 10,5 10,5 Z" fill="#8bc34a" />
                            </pattern>
                            <rect width="40" height="40" fill="url(#leaves-${item.value})" />
                        </svg>`,
                        flowers: `<svg width="100%" height="100%" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                            <pattern id="flowers-${item.value}" patternUnits="userSpaceOnUse" width="20" height="20">
                                <circle cx="10" cy="6" r="3" fill="#ff9800" />
                                <circle cx="14" cy="10" r="3" fill="#ff9800" />
                                <circle cx="10" cy="14" r="3" fill="#ff9800" />
                                <circle cx="6" cy="10" r="3" fill="#ff9800" />
                                <circle cx="10" cy="10" r="2" fill="#ff9800" />
                            </pattern>
                            <rect width="40" height="40" fill="url(#flowers-${item.value})" />
                        </svg>`,
                        crosshatch: `<svg width="100%" height="100%" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                            <pattern id="crosshatch-${item.value}" patternUnits="userSpaceOnUse" width="10" height="10" patternTransform="rotate(45)">
                                <line x1="0" y1="0" x2="0" y2="10" stroke="#795548" stroke-width="1" />
                                <line x1="0" y1="0" x2="10" y2="0" stroke="#795548" stroke-width="1" />
                            </pattern>
                            <rect width="40" height="40" fill="url(#crosshatch-${item.value})" />
                        </svg>`,
                        arrows: `<svg width="100%" height="100%" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                            <pattern id="arrows-${item.value}" patternUnits="userSpaceOnUse" width="20" height="10">
                                <path d="M0,5 L16,5 M16,5 L10,0 M16,5 L10,10" stroke="#ff5722" stroke-width="1.5" fill="none" />
                            </pattern>
                            <rect width="40" height="40" fill="url(#arrows-${item.value})" />
                        </svg>`,
                        plaid: `<svg width="100%" height="100%" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                            <pattern id="plaid-${item.value}" patternUnits="userSpaceOnUse" width="20" height="20">
                                <rect x="0" y="0" width="20" height="20" fill="#f5f5f5" />
                                <rect x="0" y="8" width="20" height="4" fill="#03a9f4" fill-opacity="0.7" />
                                <rect x="8" y="0" width="4" height="20" fill="#03a9f4" fill-opacity="0.7" />
                            </pattern>
                            <rect width="40" height="40" fill="url(#plaid-${item.value})" />
                        </svg>`,
                        polka: `<svg width="100%" height="100%" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                            <pattern id="polka-${item.value}" patternUnits="userSpaceOnUse" width="10" height="10">
                                <circle cx="5" cy="5" r="2" fill="#9c27b0" />
                                <circle cx="0" cy="0" r="2" fill="#9c27b0" />
                                <circle cx="10" cy="0" r="2" fill="#9c27b0" />
                                <circle cx="0" cy="10" r="2" fill="#9c27b0" />
                                <circle cx="10" cy="10" r="2" fill="#9c27b0" />
                            </pattern>
                            <rect width="40" height="40" fill="url(#polka-${item.value})" />
                        </svg>`,
                        herringbone: `<svg width="100%" height="100%" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                            <pattern id="herringbone-${item.value}" patternUnits="userSpaceOnUse" width="10" height="10">
                                <path d="M0,0 L5,5 M0,10 L10,0 M5,10 L10,5" stroke="#607d8b" stroke-width="1" fill="none" />
                            </pattern>
                            <rect width="40" height="40" fill="url(#herringbone-${item.value})" />
                        </svg>`,
                        honeycomb: `<svg width="100%" height="100%" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                            <pattern id="honeycomb-${item.value}" patternUnits="userSpaceOnUse" width="17.32" height="20">
                                <polygon points="0,5 4.33,0 12.99,0 17.32,5 12.99,10 4.33,10" fill="none" stroke="#ffc107" stroke-width="1" />
                                <polygon points="0,15 4.33,10 12.99,10 17.32,15 12.99,20 4.33,20" fill="none" stroke="#ffc107" stroke-width="1" />
                                <polygon points="-8.66,10 -4.33,5 4.33,5 8.66,10 4.33,15 -4.33,15" fill="none" stroke="#ffc107" stroke-width="1" />
                                <polygon points="8.66,10 12.99,5 21.65,5 25.98,10 21.65,15 12.99,15" fill="none" stroke="#ffc107" stroke-width="1" />
                            </pattern>
                            <rect width="40" height="40" fill="url(#honeycomb-${item.value})" />
                        </svg>`
                    };
                    
                    // Return the SVG pattern for this type
                    return `
                        <div class="pattern-card" aria-label="${item.name} pattern">
                            ${patterns[item.value]}
                        </div>
                    `;
                }
            },
            icon: {
                values: [
                    { value: 'home', name: 'Home' },
                    { value: 'heart', name: 'Heart' },
                    { value: 'star', name: 'Star' },
                    { value: 'bell', name: 'Bell' },
                    { value: 'book', name: 'Book' },
                    { value: 'music', name: 'Music' },
                    { value: 'camera', name: 'Camera' },
                    { value: 'cloud', name: 'Cloud' },
                    { value: 'moon', name: 'Moon' },
                    { value: 'sun', name: 'Sun' },
                    { value: 'gear', name: 'Gear' },
                    { value: 'award', name: 'Award' },
                    { value: 'basket', name: 'Basket' },
                    { value: 'cup', name: 'Cup' },
                    { value: 'gift', name: 'Gift' },
                    { value: 'map', name: 'Map' },
                    { value: 'palette', name: 'Palette' },
                    { value: 'shield', name: 'Shield' },
                    { value: 'truck', name: 'Truck' },
                    { value: 'wallet', name: 'Wallet' }
                ],
                create: (item) => `
                    <div class="icon-card">
                        <i class="bi bi-${item.value}" aria-label="${item.name} icon"></i>
                    </div>
                `
            }
        };
    }
    
    /**
     * Get the generator for the specified card type
     * @param {string} cardType - The type of card to generate
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
        
        // Make a copy of all available values for the card type
        const availableValues = [...generator.values];
        
        // Shuffle the available values
        const shuffledValues = this.shuffleArray(availableValues);
        
        // Select unique values needed for pairs
        const selectedValues = shuffledValues.slice(0, totalPairs);
        
        // Create pairs from selected values
        selectedValues.forEach(item => {
            pairValues.push(item);
            pairValues.push(item);
        });
        
        // Shuffle the final pairs
        return this.shuffleArray(pairValues);
    }
    
    /**
     * Create a card element with the specified value
     * @param {*} item - The value object for the card
     * @param {number} index - The index of the card
     * @param {string} cardType - The type of card
     * @returns {HTMLElement} The created card element
     */
    createCardElement(item, index, cardType) {
        const generator = this.getGenerator(cardType);
        
        // Create main card container
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.value = item.value;
        card.dataset.name = item.name;
        card.dataset.index = index;
        card.dataset.type = cardType;
        
        // Add accessibility attributes
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', `Card ${index + 1} - ${cardType} ${item.name}`);
        card.setAttribute('aria-pressed', 'false');
        
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
        contentWrapper.innerHTML = generator.create(item);
        
        // Assemble the card structure
        backFace.appendChild(contentWrapper);
        cardInner.appendChild(frontFace);
        cardInner.appendChild(backFace);
        card.appendChild(cardInner);
        
        // Add keyboard interaction
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.click();
            }
        });
        
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
    
    /**
     * Add enhanced animations to all cards
     * @param {NodeList} cards - The cards to animate
     * @param {number} delay - The delay between card animations
     * @param {boolean} animateIn - Whether to animate in or out
     */
    animateCards(cards, delay = 30, animateIn = true) {
        cards.forEach((card, index) => {
            setTimeout(() => {
                if (animateIn) {
                    card.classList.add('animate-in');
                } else {
                    card.classList.remove('animate-in');
                }
            }, delay * (index % 12));
        });
    }
    
    /**
     * Create a preview of all available card types for settings
     * @param {HTMLElement} container - The container to append previews to
     */
    createCardTypePreviews(container) {
        if (!container) return;
        
        // Clear container
        container.innerHTML = '';
        
        // Add preview for each card type
        Object.keys(this.generators).forEach(type => {
            const previewCard = document.createElement('div');
            previewCard.className = 'card-type-preview';
            
            // Use the first value from the generator
            const firstItem = this.generators[type].values[0];
            
            // Create the preview content
            const previewContent = document.createElement('div');
            previewContent.className = 'preview-content';
            previewContent.innerHTML = this.generators[type].create(firstItem);
            
            // Add type label
            const typeLabel = document.createElement('div');
            typeLabel.className = 'type-label';
            typeLabel.textContent = type.charAt(0).toUpperCase() + type.slice(1);
            
            // Assemble preview
            previewCard.appendChild(previewContent);
            previewCard.appendChild(typeLabel);
            
            // Add click handler to select this type
            previewCard.addEventListener('click', () => {
                document.querySelectorAll('.card-type-preview').forEach(p => {
                    p.classList.remove('selected');
                });
                previewCard.classList.add('selected');
                
                // Update card type selection
                const cardTypeSelect = document.getElementById('cardType');
                if (cardTypeSelect) {
                    cardTypeSelect.value = type;
                    
                    // Trigger change event
                    const event = new Event('change');
                    cardTypeSelect.dispatchEvent(event);
                }
            });
            
            container.appendChild(previewCard);
        });
    }
}

export const cardGenerator = new CardGenerator();