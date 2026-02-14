// DOM Elements
const screens = {
    wait: document.getElementById('phase-wait'),
    countdown: document.getElementById('phase-countdown'),
    action: document.getElementById('phase-action'),
    reveal: document.getElementById('phase-reveal')
};
const startBtn = document.getElementById('start-btn');
const countdownText = document.getElementById('countdown-text');
const statusText = document.getElementById('status-text');

// Game State
let currentScore = 0;
const MAX_SCORE = 1000; // Total shakes/force needed to reach 100%
let isActive = false;
let lastUpdate = 0;

// Phase Transitions
function switchScreen(screenName) {
    Object.values(screens).forEach(s => {
        s.classList.remove('active');
        setTimeout(() => s.classList.add('hidden'), 400); // Wait for fade out
    });
    
    setTimeout(() => {
        screens[screenName].classList.remove('hidden');
        // Force reflow
        void screens[screenName].offsetWidth;
        screens[screenName].classList.add('active');
    }, 400);
}

// 1. Initialization & iOS Permissions
startBtn.addEventListener('click', async () => {
    // Request permission for iOS devices
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
        try {
            const permission = await DeviceMotionEvent.requestPermission();
            if (permission !== 'granted') {
                alert('Motion permission is required to play!');
                return;
            }
        } catch (error) {
            console.error(error);
        }
    }
    
    // In a real app, you would emit a "Ready" signal to your partner here
    // For now, we proceed immediately to countdown
    startCountdown();
});

// 2. The Countdown
function startCountdown() {
    switchScreen('countdown');
    let count = 3;
    
    const interval = setInterval(() => {
        count--;
        if (count > 0) {
            countdownText.innerText = count;
        } else if (count === 0) {
            countdownText.innerText = "GO!";
        } else {
            clearInterval(interval);
            startGame();
        }
    }, 1000);
}

// 3. The Action Mechanics
function startGame() {
    switchScreen('action');
    isActive = true;
    window.addEventListener('devicemotion', handleMotion);
    
    // MOCK: Simulate partner shaking (Remove when using real-time DB)
    setInterval(() => {
        if(isActive && currentScore < MAX_SCORE) {
            addScore(Math.random() * 15); 
        }
    }, 500);
}

function handleMotion(event) {
    if (!isActive) return;

    // Calculate G-Force magnitude
    const acc = event.accelerationIncludingGravity;
    if (!acc.x) return; // Fallback if hardware unsupported
    
    // Magnitude formula: sqrt(x^2 + y^2 + z^2) - gravity
    const magnitude = Math.sqrt(acc.x ** 2 + acc.y ** 2 + acc.z ** 2);
    const shakeForce = Math.abs(magnitude - 9.81); 

    // Threshold to filter out slight movements
    if (shakeForce > 3) {
        addScore(shakeForce);
        
        // --- REAL-TIME SYNC INTEGRATION POINT ---
        // TODO: socket.emit('shake', shakeForce) OR supabase.from('room').update(...)
    }
}

function addScore(amount) {
    currentScore += amount;
    if (currentScore >= MAX_SCORE) {
        currentScore = MAX_SCORE;
        endGame();
    }
    updateUI();
}

function updateUI() {
    const percentage = (currentScore / MAX_SCORE) * 100;
    
    // Update CSS Variables for seamless animation
    document.documentElement.style.setProperty('--meter-fill', `${percentage}%`);
    document.documentElement.style.setProperty('--heart-scale', 1 + (percentage / 100)); // Scales up to 2x

    // Haptics & Visual Feedback based on intensity
    if (Date.now() - lastUpdate > 100) { // Throttle feedback
        if (percentage > 80) {
            triggerVibration([50, 50]); // Fast heartbeat
            statusText.innerText = "ALMOST THERE!";
            document.body.classList.add('shake-effect');
        } else if (percentage > 40) {
            triggerVibration([30]);
            statusText.innerText = "GO GO GO!";
        }
        setTimeout(() => document.body.classList.remove('shake-effect'), 200);
        lastUpdate = Date.now();
    }
}

function triggerVibration(pattern) {
    if (navigator.vibrate) {
        navigator.vibrate(pattern);
    }
}

// 4. The Reveal
function endGame() {
    isActive = false;
    window.removeEventListener('devicemotion', handleMotion);
    
    // Haptic climax
    triggerVibration([100, 50, 100, 50, 500]);
    
    switchScreen('reveal');
    triggerConfetti();
}

function triggerConfetti() {
    const duration = 3000;
    const end = Date.now() + duration;

    (function frame() {
        confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#FF007F', '#7000FF']
        });
        confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#FF007F', '#7000FF']
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
}