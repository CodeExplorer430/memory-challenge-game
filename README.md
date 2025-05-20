# Memory Matrix Challenge

![Memory Matrix Challenge Game Screenshot](assets/images/screenshot.jpg)

A modern, responsive memory matching card game with multiple difficulty levels, themes, and online leaderboards.

## 🎮 Features

- **Multiple Difficulty Levels**: Easy, Medium, and Hard modes with increasing complexity
- **Card Types**: Choose between colors, numbers, letters, or emoji
- **Theme Options**: Select from four visual themes (Default, Dark, Nature, Cyberpunk)
- **Audio Control**: Toggle background music and sound effects
- **Leaderboards**: Local and online leaderboards via Firebase
- **Authentication**: Sign in with Google or Facebook to track scores
- **Responsive Design**: Works on all devices and screen orientations
- **Accessibility**: Keyboard navigation and screen reader support

## 🚀 Getting Started

### Online Demo

Play the game online at: [https://yourdomain.com/memory-matrix](https://yourdomain.com/memory-matrix)

### Local Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/memory-matrix.git
   cd memory-matrix
   ```

2. Configure Firebase (optional for online features):
   - Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Enable Authentication (Google and Facebook providers)
   - Create a Firestore database
   - Update the Firebase configuration in `scripts/firebase-config.js`

3. Run a local server:
   ```bash
   # Using Python
   python -m http.server
   
   # OR using Node.js
   npx serve
   ```

4. Open your browser and navigate to `http://localhost:8000` or the port shown in your terminal.

## 🎮 How to Play

1. Select your preferred difficulty level (Easy, Medium, or Hard)
2. Click "Start Game" to begin
3. Memorize the initial card positions when they're briefly revealed
4. Flip cards by clicking on them to find matching pairs
5. Complete all matches before the timer runs out to win
6. Progress through 5 levels in each difficulty to win the game

## 🏆 Scoring System

- Each match earns base points based on the current level
- Bonus points are awarded for efficiency (fewer moves)
- Higher difficulty levels offer greater scoring potential
- High scores are saved locally and to the online leaderboard (if signed in)

## 🧩 Game Difficulties

| Difficulty | Cards | Pairs | Initial Time | Grid |
|------------|-------|-------|--------------|------|
| Easy       | 18    | 9     | 2:00         | 6×3  |
| Medium     | 24    | 12    | 1:45         | 6×4  |
| Hard       | 36    | 18    | 1:30         | 6×6  |

## 🎨 Themes

- **Default**: Light theme with purple and green accents
- **Dark**: Dark mode with purple and teal accents
- **Nature**: Green and amber accents with natural background
- **Cyberpunk**: Futuristic theme with neon pink and cyan

## 🛠️ Project Structure

```
memory-matrix/
├── assets/
│   ├── images/        # Game images and icons
│   └── sounds/        # Audio files
├── pages/
│   └── leaderboard.html # Global leaderboard page
├── scripts/
│   ├── game/          # Core game components
│   │   ├── audio-manager.js
│   │   ├── card-generator.js
│   │   ├── difficulty-manager.js
│   │   ├── theme-manager.js
│   │   └── ui-manager.js
│   ├── auth.js        # Authentication handling
│   ├── firebase-config.js # Firebase configuration
│   ├── leaderboard.js # Leaderboard functionality
│   └── main.js        # Main game controller
├── styles/
│   └── styles.css     # Game styling
├── index.html         # Main game page
└── README.md          # This file
```

## 💻 Technologies Used

- HTML5, CSS3, and JavaScript (ES6+)
- Firebase Authentication and Firestore
- Bootstrap 5 for modals and UI components
- Modern CSS features (Grid, Flexbox, Variables)
- Responsive design principles

## 🧠 Technical Implementation

### Modular Architecture

The game uses a modular architecture with separate components for:
- Audio management
- Card generation
- Difficulty settings
- Theme management
- UI handling
- Authentication
- Leaderboard

### Local Storage

The game saves the following to localStorage:
- High scores for each difficulty
- Selected theme preferences
- Audio settings
- Player name
- Local leaderboard entries

### Firebase Integration

When Firebase is configured, the game provides:
- User authentication via Google and Facebook
- Cloud-synchronized leaderboards
- Persistence across devices when signed in

## 📱 Mobile Support

- Responsive layout adapts to all screen sizes
- Landscape and portrait orientation support
- Touch-optimized controls for mobile devices
- Offline functionality for on-the-go play

## 🔮 Future Improvements

- [ ] Add more card types (symbols, shapes, custom images)
- [ ] Implement progressive difficulty scaling within levels
- [ ] Add multiplayer mode for head-to-head competition
- [ ] Create custom card deck creator
- [ ] Add animations and particle effects for matches
- [ ] Implement achievements system

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Contact

Your Name - [@yourtwitter](https://twitter.com/yourtwitter) - email@example.com

Project Link: [https://github.com/yourusername/memory-matrix](https://github.com/yourusername/memory-matrix)