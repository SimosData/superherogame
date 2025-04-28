document.addEventListener('DOMContentLoaded', () => {

    // ==========================================================================
    // Configuration & Constants
    // ==========================================================================

    // --- Paths & Files ---
    const backgroundImageFolderPath = 'backgrounds/';
    const imageFolderPath = 'textures/'; // Path for CARD images
    const imageExtension = '.jpg';       // Image file type
    const soundFolderPath = 'sounds/';   // Path for sound files

    // --- Background Images ---
    const backgroundImages = [
        `${backgroundImageFolderPath}flames.jpg`, `${backgroundImageFolderPath}abstraction.jpg`,
        `${backgroundImageFolderPath}girl_robot_cyborg.jpg`, `${backgroundImageFolderPath}magic_ball_library.jpg`,
        `${backgroundImageFolderPath}blue.jpg`, `${backgroundImageFolderPath}cube.jpg`,
        `${backgroundImageFolderPath}green.jpg`, `${backgroundImageFolderPath}mountain.jpg`,
        `${backgroundImageFolderPath}sea.jpg`, `${backgroundImageFolderPath}snowmountain.jpg`,
        `${backgroundImageFolderPath}space.jpg`, `${backgroundImageFolderPath}tiger.jpg`,
        `${backgroundImageFolderPath}wave.jpg`,
    ];

    // --- Difficulty Settings ---
    const difficultySettings = {
        easy:    { rows: 3, cols: 4, pairs: 6 },
        medium:  { rows: 4, cols: 4, pairs: 8 },
        hard:    { rows: 4, cols: 5, pairs: 10 },
        extreme: { rows: 5, cols: 6, pairs: 15 },
        god:     { rows: 8, cols: 8, pairs: 32 }
    };

    // --- Superhero Card Names ---
    // !!! Ensure AT LEAST 32 unique names for God Mode !!!
    const allSuperheroes = [
        'batman', 'superman', 'wonderWoman', 'flash', 'aquaman', 'greenLantern', 'cyborg', 'darkseid',
        'doomsday', 'ainzSpecial', 'celestialSpecial', 'godzillaSpecial', 'gokuSpecial', 'joker', 'thanos', 'drDoom',
        'galactus', 'hulk', 'captainmarvel', 'darkphoenix', 'deadpool', 'drmanhatan', 'spiderman', 'venom',
        'wolverine', 'martianhunter', 'drstrange', 'elderdragon', 'evangellion', 'genos', 'gipsydanger', 'monster0',
        'onebelowall', 'onemanpunch', 'voltron', 'kingkong' // Ensure 32 unique names here
    ];
    const SPECIAL_SUFFIX = 'special'; // Suffix used for special cards

    // --- Timing Constants ---
    const BACKGROUND_ROTATION_INTERVAL = 10000; // ms
    const FLIP_BACK_DELAY = 800;              // ms before non-matches flip back
    const WIN_DISPLAY_DELAY = 2000;           // ms before showing win image/restarting
    const GAME_OVER_DISPLAY_DELAY = 2000;      // ms before showing lose image/restarting
    const BANNER_DISPLAY_TIME = 2500;         // ms for special banner display
    const RESTART_FLASH_TIME = 300;           // ms for green flash on restart
    const LOW_TIME_THRESHOLD_SEC = 30;        // Seconds remaining to trigger low time style

    // --- Scoring Constants ---
    const POINTS_REGULAR_MATCH = 100;
    const POINTS_SPECIAL_MATCH = 1000;
    const POINTS_TIME_BONUS = 5000;

    // --- Lives Configuration ---
    const DEFAULT_STARTING_LIVES = 3;
    const MIN_LIVES = 1;

    // --- Timer Configuration ---
    const DEFAULT_TIMER_DURATION_MIN = 5;
    const MIN_TIMER_DURATION_MIN = 1;

    // --- High Score Config ---
    const HIGH_SCORE_STORAGE_KEY = 'memoryGameHighScores';
    const MAX_HIGH_SCORES_STORED = 10;

    // --- Vibration Patterns ---
    const VIBRATE_BUTTON_PRESS = 30;
    const VIBRATE_CARD_FLIP = 40;
    const VIBRATE_MATCH = [80, 50, 80];
    const VIBRATE_SPECIAL_MATCH = [120, 70, 120, 70, 250];
    const VIBRATE_NO_MATCH = 60;
    const VIBRATE_LOSE_LIFE = [100, 80, 100];
    const VIBRATE_WIN = [150, 100, 150, 100, 300];
    const VIBRATE_LOSE = [250, 150, 400];
    const VIBRATE_TOGGLE_ON = 50;

    // --- Card Size Adjustment ---
    const MIN_CARD_SIZE_MULTIPLIER = 0.6; // Minimum size (e.g., 60%)
    const MAX_CARD_SIZE_MULTIPLIER = 1.5; // Maximum size (e.g., 150%)
    const CARD_SIZE_STEP = 0.1;           // How much to change size per click

    // --- Pinch Zoom ---
    const MIN_PAGE_ZOOM_SCALE = 0.5; // Min zoom level for the page
    const MAX_PAGE_ZOOM_SCALE = 3.0; // Max zoom level for the page

    // ==========================================================================
    // DOM Element References
    // ==========================================================================
    const bodyElement = document.body;
    const gameBoard = document.getElementById('gameBoard');
    const zoomContainer = document.getElementById('zoom-container'); // *** IMPORTANT: Assumes this element exists in HTML ***
    // Difficulty Buttons
    const difficultyButtons = document.querySelectorAll('.difficulty-btn');
    // Scoreboard & Lives
    const scoreDisplay = document.getElementById('current-score');
    const highScoreDisplay = document.getElementById('high-score');
    const livesDisplay = document.getElementById('current-lives');
    const btnLivesDown = document.getElementById('btn-lives-down');
    const btnLivesUp = document.getElementById('btn-lives-up');
    // Overlays & Banners
    const winOverlay = document.getElementById('win-overlay');
    const loseOverlay = document.getElementById('lose-overlay');
    const specialMatchBanner = document.getElementById('special-match-banner');
    const winBanner = document.getElementById('win-banner');
    const loseBanner = document.getElementById('lose-banner');
    // Game Controls
    const btnRestart = document.getElementById('btn-restart');
    const btnPausePlay = document.getElementById('btn-pause-play');
    const fullscreenButton = document.getElementById('btn-fullscreen');
    const docElement = document.documentElement; // The <html> element
    // Card Size Controls
    const btnCardSizeIncrease = document.getElementById('btn-card-size-increase');
    const btnCardSizeDecrease = document.getElementById('btn-card-size-decrease');
    // Time Controls
    const realTimeClockDisplay = document.getElementById('real-time-clock');
    const timerEnabledCheckbox = document.getElementById('timer-enabled-checkbox');
    const timerDurationDisplay = document.getElementById('timer-duration');
    const btnTimerMinus = document.getElementById('btn-timer-minus');
    const btnTimerPlus = document.getElementById('btn-timer-plus');
    const timeLeftDisplay = document.getElementById('time-left');
    // High Score Controls
    const btnResetScores = document.getElementById('btn-reset-scores');
    const btnToggleHighScores = document.getElementById('btn-toggle-highscores');
    const highScoreListContainer = document.getElementById('high-score-list-container');
    const highScoreListOL = document.getElementById('high-score-list-ol');
    // Audio/Vibration Controls
    const btnSoundToggle = document.getElementById('btn-sound-toggle');
    const btnVibrationToggle = document.getElementById('btn-vibration-toggle');

    // ==========================================================================
    // Audio Setup
    // ==========================================================================
    const sounds = {
        flip: new Audio(`${soundFolderPath}flip.mp3`),
        match: new Audio(`${soundFolderPath}match.mp3`),
        noMatch: new Audio(`${soundFolderPath}no_match.mp3`),
        specialMatch: new Audio(`${soundFolderPath}special_match.mp3`),
        loseLife: new Audio(`${soundFolderPath}lose_life.mp3`),
        gameOver: new Audio(`${soundFolderPath}game_over.mp3`),
        win: new Audio(`${soundFolderPath}win.mp3`)
    };

    // Preload and error handling for sounds
    Object.values(sounds).forEach(sound => {
        if (sound instanceof Audio) {
            sound.preload = 'auto';
            sound.onerror = (e) => console.error(`Error loading sound: ${sound.src}`, e);
        } else {
            console.warn("Invalid sound object found:", sound);
        }
    });

    // ==========================================================================
    // Game State Variables
    // ==========================================================================
    let cards = []; // Array to hold card DOM elements
    let firstCard = null;
    let secondCard = null;
    let lockBoard = false; // Prevents clicking during checks/animations
    let matchesFound = 0;
    let currentScore = 0;
    let currentLives = DEFAULT_STARTING_LIVES;
    let gameIsActive = false; // Is the game running (after first click)?
    let isPaused = false;
    let currentDifficulty = 'easy'; // Default difficulty
    let allScores = []; // Array to hold high score objects { name: '...', score: ... }
    // --- Timer State ---
    let timerEnabled = true; // Default based on checkbox 'checked' state
    let timerDurationMinutes = DEFAULT_TIMER_DURATION_MIN;
    let timeLeftSeconds = 0;
    let countdownIntervalId = null;
    // --- Background State ---
    let currentBackgroundIndex = 0;
    let backgroundIntervalId = null;
    // --- Real Time Clock State ---
    let realTimeClockIntervalId = null;
    // --- Banner State ---
    let bannerTimeoutId = null;
    // --- Audio/Vibration State ---
    let isMuted = false;
    let vibrationsEnabled = true; // Default vibration state
    // --- Card Size State ---
    let currentCardSizeMultiplier = 1.0;
    // --- Pinch-to-Zoom State ---
    let initialPinchDistance = null;
    let currentPageZoomScale = 1; // Tracks the base scale for the page container
    let isPinching = false;
    let pinchZoomActive = false; // Flag to know if zoom listeners are active
    let latestScale = 1; // Store the latest scale calculated in touchmove
    let rafPending = false; // Flag to track if requestAnimationFrame is pending

    // ==========================================================================
    // Helper Functions
    // ==========================================================================

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function formatTime(totalSeconds) {
        if (isNaN(totalSeconds) || totalSeconds < 0) return "00:00";
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    // Robust image name generation from hero name
    function generateImageName(hero) {
        const baseHeroName = hero.replace(/\.jpg$/i, ''); // Remove .jpg if exists
        return baseHeroName
            .replace(/([A-Z])/g, '-$1') // Hyphen before uppercase
            .toLowerCase()             // Lowercase all
            .replace(/[^a-z0-9-]+/g, '-') // Replace non-alphanumeric/hyphen with hyphen
            .replace(/-+/g, '-')       // Collapse multiple hyphens
            .replace(/^-+|-+$/g, '');  // Trim leading/trailing hyphens
    }

    // ==========================================================================
    // Sound & Vibration Functions
    // ==========================================================================

    function playSound(sound) {
        if (!sound || typeof sound.play !== 'function' || isMuted) return;
        sound.currentTime = 0; // Rewind
        sound.play().catch(error => {
            // Ignore user interaction errors, log others
            if (error.name !== 'NotAllowedError') {
                console.warn(`Sound playback failed: ${sound.src}`, error);
            }
        });
    }

    function triggerVibration(pattern) {
        if (vibrationsEnabled && navigator.vibrate) {
            try {
                navigator.vibrate(pattern);
            } catch (error) {
                console.warn("Vibration failed:", error);
            }
        }
    }

    function updateSoundButtonVisuals() {
        if (!btnSoundToggle) return;
        if (isMuted) {
            btnSoundToggle.textContent = '🔇';
            btnSoundToggle.classList.remove('sound-on');
            btnSoundToggle.classList.add('sound-off');
            btnSoundToggle.title = 'Unmute Sound';
        } else {
            btnSoundToggle.textContent = '🔊';
            btnSoundToggle.classList.remove('sound-off');
            btnSoundToggle.classList.add('sound-on');
            btnSoundToggle.title = 'Mute Sound';
        }
    }

    function toggleMute() {
        isMuted = !isMuted;
        updateSoundButtonVisuals();
        console.log("Sound Muted:", isMuted);
        // Persist preference (optional)
        // localStorage.setItem('soundMuted', isMuted);
    }

    function updateVibrationButtonVisuals() {
        if (!btnVibrationToggle) return;
        if (vibrationsEnabled) {
            btnVibrationToggle.classList.add('vibration-on');
            btnVibrationToggle.classList.remove('vibration-off');
            btnVibrationToggle.textContent = '📳'; // On icon
            btnVibrationToggle.title = "Disable Vibration";
        } else {
            btnVibrationToggle.classList.remove('vibration-on');
            btnVibrationToggle.classList.add('vibration-off');
            btnVibrationToggle.textContent = '📴'; // Off icon
            btnVibrationToggle.title = "Enable Vibration";
        }
    }

    function toggleVibration() {
        vibrationsEnabled = !vibrationsEnabled;
        updateVibrationButtonVisuals();
        if (vibrationsEnabled) {
            triggerVibration(VIBRATE_TOGGLE_ON); // Feedback when turning on
        }
        console.log("Vibrations enabled:", vibrationsEnabled);
        // Persist preference (optional)
        // localStorage.setItem('vibrationsEnabled', vibrationsEnabled);
    }

    // ==========================================================================
    // Background Rotation Functions
    // ==========================================================================

    function changeBackground() {
        // Ensure the body element exists and game is not paused
        if (bodyElement && !isPaused && backgroundImages.length > 0) {
            // Use CSS transition for smoothness (CSS handles the transition)
            bodyElement.style.backgroundImage = `url('${backgroundImages[currentBackgroundIndex]}')`;
        }
        // Always update index, even if paused, so it resumes correctly
        currentBackgroundIndex = (currentBackgroundIndex + 1) % backgroundImages.length;
    }

    function startBackgroundRotation() {
        stopBackgroundRotation(); // Clear any existing interval
        // Only start if not paused and there are images
        if (!isPaused && backgroundImages.length > 0) {
            changeBackground(); // Set initial background immediately
            if (backgroundImages.length > 1) { // Only set interval if more than one image
                backgroundIntervalId = setInterval(changeBackground, BACKGROUND_ROTATION_INTERVAL);
            }
        }
    }

    function stopBackgroundRotation() {
        if (backgroundIntervalId) {
            clearInterval(backgroundIntervalId);
            backgroundIntervalId = null; // Clear the ID
        }
    }

    // ==========================================================================
    // High Score Functions
    // ==========================================================================

    function getRomanRank(rankIndex) {
        // Simplified Roman numeral ranks for top 10
        const ranks = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
        return ranks[rankIndex] || `${rankIndex + 1}th`; // Fallback for > 10 (though unlikely)
    }

    function loadScores() {
        const storedScores = localStorage.getItem(HIGH_SCORE_STORAGE_KEY);
        try {
            const parsed = storedScores ? JSON.parse(storedScores) : [];
            // Basic validation: ensure it's an array of objects with name/score
            if (Array.isArray(parsed) && parsed.every(item => typeof item === 'object' && 'name' in item && 'score' in item)) {
                return parsed;
            }
            console.warn("Stored scores format invalid, resetting.");
            return [];
        } catch (e) {
            console.error("Error parsing stored scores:", e);
            return [];
        }
    }

    function saveScores() {
        try {
            localStorage.setItem(HIGH_SCORE_STORAGE_KEY, JSON.stringify(allScores));
        } catch (e) {
            console.error("Error saving scores to localStorage:", e);
        }
    }

    function getCurrentHighScore() {
        return allScores.length > 0 ? allScores[0].score : 0;
    }

    function updateHighScoreListDisplay() {
        if (!highScoreListOL) return;
        highScoreListOL.innerHTML = ''; // Clear previous list
        if (allScores.length === 0) {
            highScoreListOL.innerHTML = '<li>No scores yet!</li>';
            return;
        }
        allScores.forEach((scoreEntry, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="rank-display">${getRomanRank(index)}</span>
                <span class="name-display" title="${scoreEntry.name}">${scoreEntry.name}</span>
                <span class="score-value-display">${scoreEntry.score}</span>
            `;
            highScoreListOL.appendChild(li);
        });
    }

    function addNewScore(name, score) {
        if (!name || name.trim() === "") name = "Anonymous";
        if (typeof score !== 'number' || isNaN(score)) {
            console.error("Attempted to add invalid score:", score);
            return;
        }
        allScores.push({ name: name.trim(), score });
        allScores.sort((a, b) => b.score - a.score); // Sort descending by score
        if (allScores.length > MAX_HIGH_SCORES_STORED) {
            allScores = allScores.slice(0, MAX_HIGH_SCORES_STORED); // Keep only top N
        }
        saveScores();
        updateScoreDisplay(); // Update main high score display
        // Only update the list if it's currently visible
        if (highScoreListContainer && highScoreListContainer.classList.contains('visible')) {
            updateHighScoreListDisplay();
        }
        console.log("Scores updated:", allScores);
    }

    function resetHighScores() {
        triggerVibration(VIBRATE_BUTTON_PRESS); // Vibrate on button press
        if (confirm("Are you sure you want to reset all high scores? This cannot be undone.")) {
            allScores = [];
            saveScores();
            updateScoreDisplay();
            updateHighScoreListDisplay(); // Update list even if hidden
            console.log("High scores reset.");
        }
    }

    // ==========================================================================
    // UI Update Functions
    // ==========================================================================

    function updateScoreDisplay() {
        if (scoreDisplay) scoreDisplay.textContent = currentScore;
        if (highScoreDisplay) highScoreDisplay.textContent = getCurrentHighScore();
    }

    function updateLivesDisplay() {
        if (livesDisplay) livesDisplay.textContent = currentLives;
        // Enable/disable buttons based on state
        if (btnLivesDown) btnLivesDown.disabled = (currentLives <= MIN_LIVES || gameIsActive || isPaused);
        if (btnLivesUp) btnLivesUp.disabled = (gameIsActive || isPaused);
    }

    function toggleLifeButtons(enable) {
        // More specific enabling/disabling based on game state
        const disableReason = gameIsActive || isPaused;
        if (btnLivesDown) btnLivesDown.disabled = !enable || disableReason || currentLives <= MIN_LIVES;
        if (btnLivesUp) btnLivesUp.disabled = !enable || disableReason;
    }

    function updateTimerDurationDisplay() {
        if (timerDurationDisplay) timerDurationDisplay.textContent = timerDurationMinutes;
        // Update time left display only if game hasn't started
        if (!gameIsActive && timeLeftDisplay) {
            if (timerEnabled) {
                timeLeftSeconds = timerDurationMinutes * 60; // Recalculate based on new duration
                timeLeftDisplay.textContent = formatTime(timeLeftSeconds);
            } else {
                timeLeftDisplay.textContent = '--:--';
            }
            timeLeftDisplay.classList.remove('low-time'); // Ensure low-time style is off
        }
        // Enable/disable timer adjust buttons
        if (btnTimerMinus) btnTimerMinus.disabled = (timerDurationMinutes <= MIN_TIMER_DURATION_MIN || gameIsActive || isPaused);
        if (btnTimerPlus) btnTimerPlus.disabled = (gameIsActive || isPaused);
    }

    function toggleTimerAdjustButtons(enable) {
        const disableReason = gameIsActive || isPaused;
        if (btnTimerMinus) btnTimerMinus.disabled = !enable || disableReason || timerDurationMinutes <= MIN_TIMER_DURATION_MIN;
        if (btnTimerPlus) btnTimerPlus.disabled = !enable || disableReason;
        if (timerEnabledCheckbox) timerEnabledCheckbox.disabled = !enable || disableReason;
    }

    function updateDifficultyButtonsUI() {
        difficultyButtons.forEach(button => {
            if (button) {
                // Use dataset.difficulty which was added in HTML
                button.classList.toggle('active', button.dataset.difficulty === currentDifficulty);
            }
        });
    }

    function updatePausePlayButton() {
        if (!btnPausePlay) return;
        if (isPaused) {
            btnPausePlay.textContent = 'Play';
            btnPausePlay.classList.remove('playing');
            btnPausePlay.classList.add('paused');
            btnPausePlay.title = 'Resume Game';
        } else {
            btnPausePlay.textContent = 'Pause';
            btnPausePlay.classList.remove('paused');
            btnPausePlay.classList.add('playing');
            btnPausePlay.title = 'Pause Game';
        }
        // Disable pause/play if game hasn't started or is over
        const totalPairs = difficultySettings[currentDifficulty]?.pairs || 0;
        btnPausePlay.disabled = !gameIsActive || currentLives <= 0 || matchesFound === totalPairs;
    }

    function hideOverlaysAndBanners() {
        if (winOverlay) winOverlay.classList.remove('visible');
        if (loseOverlay) loseOverlay.classList.remove('visible');
        if (specialMatchBanner) specialMatchBanner.classList.remove('visible');
        if (winBanner) winBanner.classList.remove('visible');
        if (loseBanner) loseBanner.classList.remove('visible');
        if (bannerTimeoutId) clearTimeout(bannerTimeoutId); // Clear any pending banner removal
        bannerTimeoutId = null;
    }

    function showSpecialBanner() {
        if (!specialMatchBanner) return;
        if (bannerTimeoutId) clearTimeout(bannerTimeoutId); // Clear previous timeout if any
        specialMatchBanner.classList.add('visible');
        bannerTimeoutId = setTimeout(() => {
            specialMatchBanner.classList.remove('visible');
            bannerTimeoutId = null;
        }, BANNER_DISPLAY_TIME);
    }

    // ==========================================================================
    // Card Size Adjustment Functions
    // ==========================================================================

    function updateCardSizeButtonsState() {
        if (btnCardSizeDecrease) {
            btnCardSizeDecrease.disabled = currentCardSizeMultiplier <= MIN_CARD_SIZE_MULTIPLIER;
        }
        if (btnCardSizeIncrease) {
            btnCardSizeIncrease.disabled = currentCardSizeMultiplier >= MAX_CARD_SIZE_MULTIPLIER;
        }
    }

    function applyCardSize() {
        if (gameBoard) {
            // Ensure multiplier stays within bounds (safety check)
            currentCardSizeMultiplier = Math.max(MIN_CARD_SIZE_MULTIPLIER, Math.min(currentCardSizeMultiplier, MAX_CARD_SIZE_MULTIPLIER));
            // Set the CSS variable
            gameBoard.style.setProperty('--card-size-multiplier', currentCardSizeMultiplier.toFixed(2)); // Use toFixed for cleaner CSS value
            console.log(`Card size multiplier set to: ${currentCardSizeMultiplier.toFixed(2)}`);
        }
        updateCardSizeButtonsState();
    }

    function changeCardSize(increase) {
        triggerVibration(VIBRATE_BUTTON_PRESS);
        const newMultiplier = increase
            ? currentCardSizeMultiplier + CARD_SIZE_STEP
            : currentCardSizeMultiplier - CARD_SIZE_STEP;

        // Clamp the value immediately before setting
        currentCardSizeMultiplier = Math.max(MIN_CARD_SIZE_MULTIPLIER, Math.min(newMultiplier, MAX_CARD_SIZE_MULTIPLIER));

        applyCardSize();
    }

    // ==========================================================================
    // Timer Functions
    // ==========================================================================

    function stopCountdown() {
        if (countdownIntervalId) {
            clearInterval(countdownIntervalId);
            countdownIntervalId = null;
        }
    }

    function startCountdown() {
        stopCountdown(); // Ensure no duplicate timers
        if (!timerEnabled || isPaused || !gameIsActive) return;

        // If timeLeft is 0 or less, reset it from duration (handles restarts)
        if (timeLeftSeconds <= 0) {
            timeLeftSeconds = timerDurationMinutes * 60;
        }

        // Update display immediately
        if (timeLeftDisplay) {
            timeLeftDisplay.textContent = formatTime(timeLeftSeconds);
            timeLeftDisplay.classList.toggle('low-time', timeLeftSeconds <= LOW_TIME_THRESHOLD_SEC && timeLeftSeconds > 0);
        }

        countdownIntervalId = setInterval(() => {
            if (isPaused || !gameIsActive) { // Double check state within interval
                stopCountdown();
                return;
            }
            timeLeftSeconds--;
            if (timeLeftDisplay) {
                timeLeftDisplay.textContent = formatTime(timeLeftSeconds);
                timeLeftDisplay.classList.toggle('low-time', timeLeftSeconds <= LOW_TIME_THRESHOLD_SEC && timeLeftSeconds > 0);
            }

            if (timeLeftSeconds <= 0) {
                handleGameOver('time'); // Pass reason
            }
        }, 1000);
    }

    function updateRealTimeClock() {
        if (isPaused || !realTimeClockDisplay) return; // Don't update if paused or element missing
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        realTimeClockDisplay.textContent = `${hours}:${minutes}:${seconds}`;
    }

    function startRealTimeClock() {
        stopRealTimeClock(); // Clear existing interval
        if (!isPaused) { // Only start if not paused
            updateRealTimeClock(); // Update immediately
            realTimeClockIntervalId = setInterval(updateRealTimeClock, 1000);
        }
    }

    function stopRealTimeClock() {
        if (realTimeClockIntervalId) {
            clearInterval(realTimeClockIntervalId);
            realTimeClockIntervalId = null;
        }
    }

    // ==========================================================================
    // Pinch-to-Zoom Logic (Fullscreen - Page Container) <<< REFINED FOR PERFORMANCE
    // ==========================================================================

    function getDistance(touch1, touch2) {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    function getMidpoint(touch1, touch2) {
        return {
            x: (touch1.clientX + touch2.clientX) / 2,
            y: (touch1.clientY + touch2.clientY) / 2,
        };
    }

    // Function to apply the scale - called by requestAnimationFrame
    function applyZoomScale() {
        // Ensure we are still pinching and the container exists
        if (!zoomContainer || !isPinching) {
             rafPending = false; // Reset flag if pinch ended before rAF fired
             return;
        }
        // Apply the latest calculated scale
        zoomContainer.style.transform = `scale(${latestScale})`;

        // Reset the flag *after* applying the scale in the animation frame
        rafPending = false;
    }

    // Event handlers now target the document/zoomContainer
    function handlePageTouchStart(event) {
        if (!zoomContainer || event.touches.length !== 2) return; // Only care about 2 touches

        event.preventDefault(); // Prevent default browser pinch zoom/scroll
        isPinching = true;
        initialPinchDistance = getDistance(event.touches[0], event.touches[1]);
        // Start scaling from the current base scale
        latestScale = currentPageZoomScale;

        // --- Performance: Disable CSS transitions during pinch ---
        zoomContainer.classList.add('no-transition');

        // Set transform origin based on the initial pinch center
        const midpoint = getMidpoint(event.touches[0], event.touches[1]);
        const containerRect = zoomContainer.getBoundingClientRect();

        // Calculate origin relative to the container's *visual* top-left
        // This accounts for current scale/transform
        const originXPercent = ((midpoint.x - containerRect.left) / containerRect.width) * 100;
        const originYPercent = ((midpoint.y - containerRect.top) / containerRect.height) * 100;

        // Clamp origin percentages (safety)
        const clampedOriginX = Math.max(0, Math.min(100, originXPercent));
        const clampedOriginY = Math.max(0, Math.min(100, originYPercent));

        zoomContainer.style.transformOrigin = `${clampedOriginX}% ${clampedOriginY}%`;

        // Cancel any pending rAF from previous interactions (safety)
        rafPending = false;
    }

    function handlePageTouchMove(event) {
        // Ensure we are actively pinching with exactly two fingers
        if (!zoomContainer || !isPinching || event.touches.length !== 2) return;

        event.preventDefault(); // Prevent scrolling/other defaults during pinch move

        const currentDistance = getDistance(event.touches[0], event.touches[1]);

        // Calculate scale relative to the *base* scale recorded at the end of the last pinch
        let scale = (currentDistance / initialPinchDistance) * currentPageZoomScale;

        // Clamp the scale within defined min/max limits
        scale = Math.max(MIN_PAGE_ZOOM_SCALE, Math.min(scale, MAX_PAGE_ZOOM_SCALE));

        // Store the latest scale value - rAF will read this
        latestScale = scale;

        // If no animation frame is currently pending, request one
        // This throttles the actual style updates to the browser's repaint cycle
        if (!rafPending) {
            rafPending = true;
            requestAnimationFrame(applyZoomScale);
        }
    }

    function handlePageTouchEnd(event) {
        if (!zoomContainer || !isPinching) return; // Only act if we were pinching

        // --- Performance: Re-enable CSS transitions after pinch ---
        zoomContainer.classList.remove('no-transition');

        // Update the base scale for the next pinch gesture using the last calculated scale
        currentPageZoomScale = latestScale;

        // Clamp the final base scale again (safety)
        currentPageZoomScale = Math.max(MIN_PAGE_ZOOM_SCALE, Math.min(currentPageZoomScale, MAX_PAGE_ZOOM_SCALE));

        // If fewer than 2 touches remain, the pinch gesture has ended
        if (event.touches.length < 2) {
            isPinching = false;
            initialPinchDistance = null;
            rafPending = false; // Ensure rAF flag is reset
            // Optional: Could reset transform-origin here if needed, but often better to keep it
            // zoomContainer.style.transformOrigin = 'center center';
        }

        // Note: If event.touches.length is still >= 2, another finger might have lifted/moved,
        // but we let the next touchstart/touchmove handle the new state.
    }

    function resetPageZoom() {
        currentPageZoomScale = 1;
        isPinching = false;
        initialPinchDistance = null;
        latestScale = 1; // Reset latest scale too
        rafPending = false; // Reset rAF flag
        if (zoomContainer) {
            zoomContainer.classList.remove('no-transition'); // Ensure transitions are enabled
            zoomContainer.style.transform = 'scale(1)';
            zoomContainer.style.transformOrigin = 'center center'; // Reset origin
        }
        console.log("Page Zoom Reset");
    }

    // Attach/detach listeners to the document
    function addPageZoomListeners() {
        if (!pinchZoomActive) {
             if (!zoomContainer) {
                 console.warn("Zoom container not found. Pinch-to-zoom disabled.");
                 return;
             }
            console.log("Adding page zoom listeners to document");
            // Use capture phase for touchstart to potentially catch it earlier? (Optional, test)
            // document.addEventListener('touchstart', handlePageTouchStart, { passive: false, capture: true });
            document.addEventListener('touchstart', handlePageTouchStart, { passive: false });
            document.addEventListener('touchmove', handlePageTouchMove, { passive: false });
            // touchend and touchcancel don't need passive: false
            document.addEventListener('touchend', handlePageTouchEnd);
            document.addEventListener('touchcancel', handlePageTouchEnd);
            pinchZoomActive = true;
        }
    }

    function removePageZoomListeners() {
        if (pinchZoomActive) {
            console.log("Removing page zoom listeners from document");
            // document.removeEventListener('touchstart', handlePageTouchStart, { capture: true }); // Match capture if used above
            document.removeEventListener('touchstart', handlePageTouchStart);
            document.removeEventListener('touchmove', handlePageTouchMove);
            document.removeEventListener('touchend', handlePageTouchEnd);
            document.removeEventListener('touchcancel', handlePageTouchEnd);
            resetPageZoom(); // Reset zoom state and styles
            pinchZoomActive = false;
        }
    }

    // ==========================================================================
    // Fullscreen Logic (Integrated with Page Zoom)
    // ==========================================================================
    const updateFullscreenButtonState = () => {
         const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
         if (fullscreenButton) { // Check if button exists
             if (isFullscreen) {
                 fullscreenButton.title = "Exit Fullscreen";
                 // You could change the icon/text here too
                 addPageZoomListeners(); // <<< Add listeners when entering fullscreen
             } else {
                 fullscreenButton.title = "Enter Fullscreen";
                 // Reset icon/text if you changed it
                 removePageZoomListeners(); // <<< Remove listeners when exiting fullscreen
             }
         }
    };

    if (fullscreenButton) {
        fullscreenButton.addEventListener('click', () => {
            triggerVibration(VIBRATE_BUTTON_PRESS);
            const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;

            if (!isFullscreen) {
                // Request fullscreen on the main document element
                if (docElement.requestFullscreen) docElement.requestFullscreen();
                else if (docElement.webkitRequestFullscreen) docElement.webkitRequestFullscreen();
                else if (docElement.mozRequestFullScreen) docElement.mozRequestFullScreen();
                else if (docElement.msRequestFullscreen) docElement.msRequestFullscreen();
            } else {
                // Exit fullscreen
                if (document.exitFullscreen) document.exitFullscreen();
                else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
                else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
                else if (document.msExitFullscreen) document.msExitFullscreen();
            }
        });

        // Listen for fullscreen changes
        document.addEventListener('fullscreenchange', updateFullscreenButtonState);
        document.addEventListener('webkitfullscreenchange', updateFullscreenButtonState);
        document.addEventListener('mozfullscreenchange', updateFullscreenButtonState);
        document.addEventListener('MSFullscreenChange', updateFullscreenButtonState);

        // Initial state check
        updateFullscreenButtonState();
    } else {
        console.warn("Fullscreen button not found.");
    }

    // ==========================================================================
    // Core Game Logic Functions
    // ==========================================================================

    function createCardElement(hero) {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.hero = hero; // Store hero identifier

        const cardFaceFront = document.createElement('div');
        cardFaceFront.classList.add('card-face', 'card-face--front');

        const cardFaceBack = document.createElement('div');
        cardFaceBack.classList.add('card-face', 'card-face--back');

        const img = document.createElement('img');
        const imageName = generateImageName(hero); // Use helper function
        img.src = `${imageFolderPath}${imageName}${imageExtension}`;
        img.alt = hero; // Use original name for alt text
        img.loading = 'lazy'; // Improve initial load performance

        // Basic error display on image load failure
        img.onerror = () => {
            console.error(`Failed to load image: ${img.src} (Derived from hero: '${hero}')`);
            cardFaceBack.innerHTML = `<span style="font-size: 10px; color: red; text-align: center;">Load Error</span>`;
        };

        cardFaceBack.appendChild(img);
        card.appendChild(cardFaceFront);
        card.appendChild(cardFaceBack);

        // Add event listener directly here
        card.addEventListener('click', handleCardClick);

        return card;
    }

    function handleCardClick() {
        // 'this' refers to the clicked card element
        if (isPaused || lockBoard || this.classList.contains('is-matched') || this.classList.contains('is-flipped') || this === firstCard) {
            return; // Ignore clicks if board locked, paused, matched, already flipped, or same card clicked twice
        }

        // Start game on first valid click
        if (!gameIsActive) {
            gameIsActive = true;
            toggleLifeButtons(false); // Disable life adjustments during game
            toggleTimerAdjustButtons(false); // Disable timer adjustments during game
            updatePausePlayButton(); // Enable pause button
            if (timerEnabled) {
                startCountdown(); // Start timer if enabled
            }
        }

        playSound(sounds.flip);
        triggerVibration(VIBRATE_CARD_FLIP);
        this.classList.add('is-flipped');

        if (!firstCard) {
            // This is the first card flipped in a turn
            firstCard = this;
            return;
        }

        // This is the second card flipped
        secondCard = this;
        lockBoard = true; // Lock board while checking for match
        checkForMatch();
    }

    function checkForMatch() {
        const isMatch = firstCard.dataset.hero === secondCard.dataset.hero;
        // Use setTimeout to allow the second card's flip animation to be seen briefly
        setTimeout(() => {
            isMatch ? handleMatch() : handleMismatch();
        }, 200); // Short delay before processing match/mismatch
    }

    function handleMatch() {
        const heroName = firstCard.dataset.hero;
        const isSpecial = heroName.toLowerCase().endsWith(SPECIAL_SUFFIX.toLowerCase());
        let pointsEarned = isSpecial ? POINTS_SPECIAL_MATCH : POINTS_REGULAR_MATCH;

        playSound(isSpecial ? sounds.specialMatch : sounds.match);
        triggerVibration(isSpecial ? VIBRATE_SPECIAL_MATCH : VIBRATE_MATCH);
        if (isSpecial) showSpecialBanner();

        matchesFound++;
        const totalPairsInGame = difficultySettings[currentDifficulty].pairs;
        const isWin = matchesFound === totalPairsInGame;

        // Add time bonus if it's the winning match and timer is active
        if (isWin && timerEnabled && timeLeftSeconds > 0) {
            console.log("Time Bonus Added!");
            pointsEarned += POINTS_TIME_BONUS;
        }

        currentScore += pointsEarned;
        updateScoreDisplay();

        // Mark cards as matched and remove listener (prevents re-clicking)
        firstCard.classList.add('is-matched');
        secondCard.classList.add('is-matched');
        firstCard.removeEventListener('click', handleCardClick);
        secondCard.removeEventListener('click', handleCardClick);

        resetTurnState(); // Prepare for next turn

        if (isWin) {
            handleWin();
        }
    }

    function handleMismatch() {
        playSound(sounds.loseLife);
        triggerVibration(VIBRATE_LOSE_LIFE);
        currentLives--;
        updateLivesDisplay();

        if (currentLives <= 0) {
            handleGameOver('lives'); // Pass reason
        } else {
            // Unflip cards after a delay
            unflipMismatchedCards();
        }
    }

    function unflipMismatchedCards() {
        playSound(sounds.noMatch); // Play sound for unflip
        triggerVibration(VIBRATE_NO_MATCH);
        setTimeout(() => {
            if (firstCard) firstCard.classList.remove('is-flipped');
            if (secondCard) secondCard.classList.remove('is-flipped');
            resetTurnState(); // Unlock board after animation
        }, FLIP_BACK_DELAY);
    }

    function resetTurnState() {
        [firstCard, secondCard] = [null, null];
        // Only unlock if game is active and not paused
        if (gameIsActive && !isPaused) {
            lockBoard = false;
        }
    }

    function handleWin() {
        console.log("Game Won!");
        gameIsActive = false;
        lockBoard = true; // Keep board locked
        stopCountdown();
        updatePausePlayButton(); // Disable pause/play button
        playSound(sounds.win);
        triggerVibration(VIBRATE_WIN);

        // Delay showing win elements slightly for effect
        setTimeout(() => {
            const playerName = prompt(`You Win! Final Score: ${currentScore}\nEnter your name for the high score list:`, "Player");
            addNewScore(playerName, currentScore); // Add score before showing overlay

            if (winOverlay) winOverlay.classList.add('visible');
            if (winBanner) winBanner.classList.add('visible');

            // Schedule next game initialization after win display time
            setTimeout(initializeGame, WIN_DISPLAY_DELAY);
        }, 500); // Short delay before prompt/overlay
    }

    function handleGameOver(reason) {
        // Prevent multiple game over triggers
        if (!gameIsActive && reason !== 'time') return; // Allow time out even if game ended slightly before

        console.log(`Game Over: ${reason}`);
        lockBoard = true;
        gameIsActive = false;
        stopCountdown();
        updatePausePlayButton(); // Disable pause/play button
        playSound(sounds.gameOver);
        triggerVibration(VIBRATE_LOSE);

        // Ensure any flipped cards are visually reset if game ends abruptly
        cards.forEach(card => card.classList.remove('is-flipped'));

        // Delay showing lose elements
        setTimeout(() => {
            if (loseOverlay) loseOverlay.classList.add('visible');
            if (loseBanner) loseBanner.classList.add('visible');
            // Schedule next game initialization after lose display time
            setTimeout(initializeGame, GAME_OVER_DISPLAY_DELAY);
        }, 500); // Short delay before overlay
    }

    function setDifficulty(difficulty) {
        triggerVibration(VIBRATE_BUTTON_PRESS);
        if (currentDifficulty !== difficulty && difficultySettings[difficulty]) {
            currentDifficulty = difficulty;
            initializeGame(); // Re-initialize with new difficulty
        } else if (!difficultySettings[difficulty]) {
            console.warn(`Attempted to set invalid difficulty: ${difficulty}`);
        }
        // Update UI immediately after click, even if difficulty doesn't change
        updateDifficultyButtonsUI();
    }

    function initializeGame() {
        console.log(`--- Initializing Game: ${currentDifficulty} ---`);
        // Don't reset page zoom on game init, only when exiting fullscreen
        // resetPageZoom();
        const settings = difficultySettings[currentDifficulty];
        if (!settings) {
            console.error(`Invalid difficulty setting object for: ${currentDifficulty}. Falling back.`);
            currentDifficulty = 'medium'; // Fallback
            settings = difficultySettings.medium;
        }
        const requiredPairs = settings.pairs;

        // --- Reset Game State ---
        matchesFound = 0;
        currentScore = 0;
        // currentLives = DEFAULT_STARTING_LIVES; // Lives persist between restarts unless manually changed
        gameIsActive = false;
        isPaused = false; // Ensure game is not paused on start
        lockBoard = false;
        resetTurnState();
        cards = []; // Clear card array
        stopCountdown(); // Stop any existing timers
        timeLeftSeconds = timerDurationMinutes * 60; // Reset timer value

        // --- Clear Board & UI ---
        if (gameBoard) {
            gameBoard.innerHTML = ''; // Clear previous cards
        } else {
            console.error("FATAL: Game board element not found!");
            return; // Cannot proceed
        }
        hideOverlaysAndBanners(); // Hide win/lose/special elements
        if (highScoreListContainer) highScoreListContainer.classList.remove('visible'); // Hide high scores
        if (btnToggleHighScores) btnToggleHighScores.classList.remove('open'); // Reset toggle button

        // --- Update UI Elements ---
        updateScoreDisplay();
        updateLivesDisplay();
        toggleLifeButtons(true); // Enable life buttons before game starts
        toggleTimerAdjustButtons(true); // Enable timer buttons before game starts
        updateTimerDurationDisplay(); // Reflects current duration setting
        updatePausePlayButton(); // Should be disabled initially
        updateDifficultyButtonsUI(); // Highlight correct difficulty
        updateSoundButtonVisuals(); // Reflect current mute state
        updateVibrationButtonVisuals(); // Reflect current vibration state
        applyCardSize(); // <<< Apply current card size multiplier
        updateCardSizeButtonsState(); // <<< Update card size button states

        // --- Start Timers/Background ---
        startBackgroundRotation(); // Start or restart background rotation
        startRealTimeClock(); // Start or restart real-time clock

        // --- Set Grid Layout ---
        gameBoard.style.setProperty('--grid-rows', settings.rows);
        gameBoard.style.setProperty('--grid-cols', settings.cols);

        // --- Validate Card Resources ---
        if (allSuperheroes.length < requiredPairs) {
            console.error(`FATAL: Not enough unique superheroes defined for ${currentDifficulty}! Need ${requiredPairs}, have ${allSuperheroes.length}.`);
            gameBoard.innerHTML = `<div style="color: red; text-align: center; padding: 20px;">Error: Not enough card types defined for ${currentDifficulty}. Cannot start game.</div>`;
            // Disable controls to prevent interaction
            difficultyButtons.forEach(btn => { if (btn) btn.disabled = true; });
            if (btnRestart) btnRestart.disabled = true;
            if (btnPausePlay) btnPausePlay.disabled = true;
            toggleLifeButtons(false);
            toggleTimerAdjustButtons(false);
            // Disable card size buttons too
            if (btnCardSizeIncrease) btnCardSizeIncrease.disabled = true;
            if (btnCardSizeDecrease) btnCardSizeDecrease.disabled = true;
            return; // Stop initialization
        } else {
            // Ensure controls are enabled if enough heroes exist
            difficultyButtons.forEach(btn => { if (btn) btn.disabled = false; });
            if (btnRestart) btnRestart.disabled = false;
            // Timer adjust should be enabled before game starts
            toggleTimerAdjustButtons(true);
            // Card size buttons should be enabled (state updated in applyCardSize)
            // if (btnCardSizeIncrease) btnCardSizeIncrease.disabled = false; // Handled by updateCardSizeButtonsState
            // if (btnCardSizeDecrease) btnCardSizeDecrease.disabled = false;
        }

        // --- Prepare and Create Cards ---
        const shuffledHeroes = [...allSuperheroes];
        shuffleArray(shuffledHeroes);
        const gameHeroes = shuffledHeroes.slice(0, requiredPairs);
        const cardPairs = [...gameHeroes, ...gameHeroes]; // Create pairs
        shuffleArray(cardPairs); // Shuffle the pairs

        // Use DocumentFragment for performance when adding many cards
        const fragment = document.createDocumentFragment();
        cardPairs.forEach(hero => {
            const cardElement = createCardElement(hero);
            cards.push(cardElement); // Keep track of card elements if needed later
            fragment.appendChild(cardElement);
        });
        gameBoard.appendChild(fragment); // Add all cards to the board at once

        console.log(`Game Initialized: ${settings.rows}x${settings.cols} (${requiredPairs * 2} cards)`);
    }

    // ==========================================================================
    // Event Listeners
    // ==========================================================================

    // --- Difficulty Buttons ---
    difficultyButtons.forEach(button => {
        if (button && button.dataset.difficulty) {
            button.addEventListener('click', () => setDifficulty(button.dataset.difficulty));
        } else {
            console.warn("Found a difficulty button without a data-difficulty attribute:", button);
        }
    });

    // --- Lives Buttons ---
    if (btnLivesDown) {
        btnLivesDown.addEventListener('click', () => {
            if (!gameIsActive && !isPaused && currentLives > MIN_LIVES) {
                triggerVibration(VIBRATE_BUTTON_PRESS);
                currentLives--;
                updateLivesDisplay();
            }
        });
    }
    if (btnLivesUp) {
        btnLivesUp.addEventListener('click', () => {
            if (!gameIsActive && !isPaused) {
                triggerVibration(VIBRATE_BUTTON_PRESS);
                currentLives++;
                updateLivesDisplay();
            }
        });
    }

    // --- Game Control Buttons ---
    if (btnRestart) {
        btnRestart.addEventListener('click', () => {
            triggerVibration(VIBRATE_BUTTON_PRESS);
            btnRestart.classList.add('restarting'); // Visual feedback
            initializeGame();
            // Remove visual feedback after a short delay
            setTimeout(() => {
                if (btnRestart) btnRestart.classList.remove('restarting');
            }, RESTART_FLASH_TIME);
        });
    }

    if (btnPausePlay) {
        btnPausePlay.addEventListener('click', () => {
            if (!gameIsActive) return; // Don't allow pause if game hasn't started
            triggerVibration(VIBRATE_BUTTON_PRESS);
            isPaused = !isPaused;
            if (isPaused) {
                lockBoard = true; // Lock board when paused
                stopBackgroundRotation();
                stopCountdown();
                stopRealTimeClock();
                toggleLifeButtons(false); // Disable life buttons when paused
                toggleTimerAdjustButtons(false); // Disable timer buttons when paused
            } else {
                lockBoard = false; // Unlock board when resuming (if game active)
                startBackgroundRotation();
                startCountdown(); // Resumes timer
                startRealTimeClock();
                toggleLifeButtons(!gameIsActive); // Re-enable based on game state
                toggleTimerAdjustButtons(!gameIsActive); // Re-enable based on game state
            }
            updatePausePlayButton(); // Update button text/state
        });
    }

    // --- Timer Controls ---
    if (timerEnabledCheckbox) {
        timerEnabledCheckbox.checked = timerEnabled; // Set initial state from variable
        timerEnabledCheckbox.addEventListener('change', (e) => {
            triggerVibration(VIBRATE_BUTTON_PRESS);
            timerEnabled = e.target.checked;
            console.log("Timer enabled:", timerEnabled);
            // Update display immediately if game hasn't started
            if (!gameIsActive && timeLeftDisplay) {
                if (timerEnabled) {
                    timeLeftSeconds = timerDurationMinutes * 60; // Reset time based on duration
                    timeLeftDisplay.textContent = formatTime(timeLeftSeconds);
                } else {
                    timeLeftDisplay.textContent = '--:--';
                    timeLeftDisplay.classList.remove('low-time');
                    stopCountdown(); // Stop timer if disabled
                }
            }
        });
    }

    if (btnTimerMinus) {
        btnTimerMinus.addEventListener('click', () => {
            if (!gameIsActive && !isPaused && timerDurationMinutes > MIN_TIMER_DURATION_MIN) {
                triggerVibration(VIBRATE_BUTTON_PRESS);
                timerDurationMinutes--;
                updateTimerDurationDisplay(); // Updates display and resets time if needed
            }
        });
    }

    if (btnTimerPlus) {
        btnTimerPlus.addEventListener('click', () => {
            if (!gameIsActive && !isPaused) {
                triggerVibration(VIBRATE_BUTTON_PRESS);
                timerDurationMinutes++;
                updateTimerDurationDisplay(); // Updates display and resets time if needed
            }
        });
    }

    // --- High Score Controls ---
    if (btnResetScores) {
        btnResetScores.addEventListener('click', resetHighScores); // Already vibrates
    }

    if (btnToggleHighScores && highScoreListContainer) {
        btnToggleHighScores.addEventListener('click', () => {
            triggerVibration(VIBRATE_BUTTON_PRESS);
            highScoreListContainer.classList.toggle('visible');
            btnToggleHighScores.classList.toggle('open');
            // Update list content only when opening it
            if (highScoreListContainer.classList.contains('visible')) {
                updateHighScoreListDisplay();
            }
        });
    }

    // --- Audio/Vibration Toggles ---
    if (btnSoundToggle) {
        btnSoundToggle.addEventListener('click', () => { triggerVibration(VIBRATE_BUTTON_PRESS); toggleMute(); }); // Added vibration
    }
    if (btnVibrationToggle) {
        btnVibrationToggle.addEventListener('click', () => { triggerVibration(VIBRATE_BUTTON_PRESS); toggleVibration(); }); // Added vibration
    }

    // --- Card Size Buttons ---
    if (btnCardSizeIncrease) {
        btnCardSizeIncrease.addEventListener('click', () => changeCardSize(true));
    } else {
        console.warn("Increase card size button not found.");
    }
    if (btnCardSizeDecrease) {
        btnCardSizeDecrease.addEventListener('click', () => changeCardSize(false));
    } else {
        console.warn("Decrease card size button not found.");
    }

    // ==========================================================================
    // Initial Setup on Load
    // ==========================================================================

    // Load saved preferences (optional - uncomment if needed)
    // isMuted = localStorage.getItem('soundMuted') === 'true';
    // vibrationsEnabled = localStorage.getItem('vibrationsEnabled') !== 'false'; // Default true if not set

    allScores = loadScores(); // Load high scores from storage
    updateSoundButtonVisuals(); // Set initial button states
    updateVibrationButtonVisuals();
    // Apply initial card size from default state
    applyCardSize(); // <<< Apply initial card size
    initializeGame(); // Start the game with default settings

}); // --- End of DOMContentLoaded listener ---
