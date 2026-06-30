# 🎯 Guess Number Game

A number guessing web game built with **Node.js & Express**.

## How to Run

```bash
npm install
npm start
```

Open `http://localhost:3000` in your browser.

## How to Play

1. Choose a difficulty level on the homepage
2. Guess a number within the given range
3. Get feedback: **higher** ↑ or **lower** ↓
4. Use the 💡 **Hint** button if you're stuck (costs one guess)
5. Guess correctly before running out of attempts to win!

### Difficulty Levels

| Level  | Range   | Guesses | Hint Cost |
|--------|---------|---------|-----------|
| Easy   | 1 ~ 50  | 10      | 1 guess   |
| Normal | 1 ~ 100 | 7       | 1 guess   |
| Hard   | 1 ~ 200 | 5       | 1 guess   |

### Scoring

Score = remaining guesses × difficulty coefficient (Easy: ×3, Normal: ×5, Hard: ×10)

Scores are saved locally in your browser and viewable on the scoreboard page.

## Project Structure

```
├── server.js                    # Express static file server
├── package.json
├── public/
│   ├── index.html               # Homepage with difficulty selection
│   ├── game.html                # Game interface
│   ├── scoreboard.html          # Score history page
│   ├── css/
│   │   └── style.css            # Global styles (dark theme, responsive)
│   └── js/
│       ├── game.js              # Core game logic
│       ├── utils.js             # Utility functions (random, hints, scoring)
│       └── scoreboard.js        # Scoreboard management
```

## Tech Stack

- **Backend**: Node.js, Express
- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Storage**: localStorage (scores), sessionStorage (game state)
