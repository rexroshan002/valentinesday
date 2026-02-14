document.getElementById('start-btn').addEventListener('click', function() {
    // Play a "vroom" sound effect if you have one
    const startScreen = document.getElementById('ignition-screen');
    const mainContent = document.getElementById('main-content');

    startScreen.style.transition = '0.5s';
    startScreen.style.opacity = '0';
    
    setTimeout(() => {
        startScreen.classList.add('hidden');
        mainContent.classList.remove('hidden');
    }, 500);
});

// Playful Loyalty "Bark"
const loyaltyCard = document.getElementById('loyalty-card');
loyaltyCard.addEventListener('click', () => {
    alert("WOOF! 🐕 Roshan says: I'm always by your side, Muskan!");
});

// Fun "Distance" Logic
// You can put your actual distance here
const distanceInKm = 1200; 
document.getElementById('miles').innerText = distanceInKm + " KM";
