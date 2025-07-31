class StarCollectorGame {
    constructor() {
        this.score = 0;
        this.timeLeft = 120; // 2 minutes in seconds
        this.gameRunning = false;
        this.basket = document.getElementById('basket');
        this.gameArea = document.getElementById('gameArea');
        this.scoreElement = document.getElementById('score');
        this.timerElement = document.getElementById('timer');
        this.gameOverScreen = document.getElementById('gameOver');
        this.finalScoreElement = document.getElementById('finalScore');
        this.restartBtn = document.getElementById('restartBtn');
        
        this.stars = [];
        this.gameTimer = null;
        this.starSpawnTimer = null;
        this.bigStarSpawnTimer = null;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.startGame();
    }
    
    setupEventListeners() {
        // Mouse movement for basket
        document.addEventListener('mousemove', (e) => {
            if (this.gameRunning) {
                this.moveBasket(e.clientX);
            }
        });
        
        // Touch support for mobile
        document.addEventListener('touchmove', (e) => {
            if (this.gameRunning) {
                e.preventDefault();
                this.moveBasket(e.touches[0].clientX);
            }
        });
        
        // Restart button
        this.restartBtn.addEventListener('click', () => {
            this.restartGame();
        });
        
        // Keyboard support (arrow keys)
        document.addEventListener('keydown', (e) => {
            if (this.gameRunning) {
                const basketRect = this.basket.getBoundingClientRect();
                const currentLeft = basketRect.left + basketRect.width / 2;
                
                if (e.key === 'ArrowLeft') {
                    this.moveBasket(currentLeft - 20);
                } else if (e.key === 'ArrowRight') {
                    this.moveBasket(currentLeft + 20);
                }
            }
        });
    }
    
    moveBasket(x) {
        const gameAreaRect = this.gameArea.getBoundingClientRect();
        const basketWidth = this.basket.offsetWidth;
        
        // Keep basket within game area bounds
        const minX = basketWidth / 2;
        const maxX = gameAreaRect.width - basketWidth / 2;
        
        const relativeX = x - gameAreaRect.left;
        const constrainedX = Math.max(minX, Math.min(maxX, relativeX));
        
        this.basket.style.left = constrainedX + 'px';
        this.basket.style.transform = 'translateX(-50%)';
    }
    
    startGame() {
        this.gameRunning = true;
        this.score = 0;
        this.timeLeft = 120;
        this.updateDisplay();
        
        // Start game timer
        this.gameTimer = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();
            
            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
        
        // Start spawning regular stars
        this.starSpawnTimer = setInterval(() => {
            this.createStar(false);
        }, 1000);
        
        // Start spawning big stars (less frequently)
        this.bigStarSpawnTimer = setInterval(() => {
            this.createStar(true);
        }, 5000);
    }
    
    createStar(isBig = false) {
        const star = document.createElement('div');
        star.className = isBig ? 'star big-star' : 'star';
        star.textContent = '⭐';
        
        // Random horizontal position
        const gameAreaWidth = this.gameArea.offsetWidth;
        const randomX = Math.random() * (gameAreaWidth - 50);
        star.style.left = randomX + 'px';
        star.style.top = '-50px';
        
        // Faster fall speed - reduced from 3-6 seconds to 1.5-3 seconds
        const fallDuration = Math.random() * 1.5 + 1.5; // 1.5-3 seconds (much faster)
        star.style.animationDuration = fallDuration + 's';
        
        this.gameArea.appendChild(star);
        this.stars.push({
            element: star,
            isBig: isBig,
            points: isBig ? 50 : 10
        });
        
        // Check for collection during fall
        const fallInterval = setInterval(() => {
            if (this.checkCollisionWithBasketTop(star)) {
                this.collectStar(star, isBig ? 50 : 10);
                clearInterval(fallInterval);
            } else if (star.offsetTop > window.innerHeight) {
                // Star fell off screen
                this.removeStar(star);
                clearInterval(fallInterval);
            }
        }, 20); // Increased frequency for better collision detection
        
        // Auto-remove star after animation
        setTimeout(() => {
            this.removeStar(star);
            clearInterval(fallInterval);
        }, fallDuration * 1000);
    }
    
    // New precise collision detection - only counts when star hits the top surface of basket
    checkCollisionWithBasketTop(star) {
        const starRect = star.getBoundingClientRect();
        const basketRect = this.basket.getBoundingClientRect();
        
        // Check if star is horizontally within basket bounds
        const starCenterX = starRect.left + starRect.width / 2;
        const basketLeftEdge = basketRect.left;
        const basketRightEdge = basketRect.right;
        
        // Check if star bottom is touching or slightly overlapping basket top
        const starBottom = starRect.bottom;
        const basketTop = basketRect.top;
        
        // More precise collision: star must be within basket width and touching the top
        return (
            starCenterX >= basketLeftEdge &&
            starCenterX <= basketRightEdge &&
            starBottom >= basketTop &&
            starBottom <= basketTop + 15 // Small tolerance for top surface hit
        );
    }
    
    collectStar(starElement, points) {
        this.score += points;
        this.updateDisplay();
        
        // Enhanced visual feedback for successful collection
        starElement.style.transform = 'scale(1.5)';
        starElement.style.transition = 'all 0.3s ease';
        starElement.style.opacity = '0';
        starElement.style.color = '#00FF00'; // Green flash on collection
        
        // Remove star
        setTimeout(() => {
            this.removeStar(starElement);
        }, 300);
    }
    
    removeStar(starElement) {
        if (starElement && starElement.parentNode) {
            starElement.parentNode.removeChild(starElement);
        }
        
        // Remove from stars array
        this.stars = this.stars.filter(star => star.element !== starElement);
    }
    
    updateDisplay() {
        this.scoreElement.textContent = this.score;
        
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        this.timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    endGame() {
        this.gameRunning = false;
        
        // Clear all timers
        clearInterval(this.gameTimer);
        clearInterval(this.starSpawnTimer);
        clearInterval(this.bigStarSpawnTimer);
        
        // Remove all remaining stars
        this.stars.forEach(star => {
            this.removeStar(star.element);
        });
        this.stars = [];
        
        // Show game over screen
        this.finalScoreElement.textContent = this.score;
        this.gameOverScreen.style.display = 'block';
    }
    
    restartGame() {
        // Hide game over screen
        this.gameOverScreen.style.display = 'none';
        
        // Reset basket position
        this.basket.style.left = '50%';
        this.basket.style.transform = 'translateX(-50%)';
        
        // Start new game
        this.startGame();
    }
}

// Start the game when page loads
window.addEventListener('load', () => {
    new StarCollectorGame();
});
