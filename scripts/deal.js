function startCountdown() {
    const timerElement = document.getElementById('time-left');

    function updateCountdown() {
        const now = new Date();
        const midnight = new Date();
        midnight.setHours(24, 0, 0, 0); // Set the time to midnight

        const timeRemaining = midnight - now;

        if (timeRemaining <= 0) {
            timerElement.textContent = "00:00:00"; // Set to 0 when the day ends
            clearInterval(interval); // Stop the interval when the day ends
            return;
        }

        const hours = Math.floor((timeRemaining / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((timeRemaining / (1000 * 60)) % 60);
        const seconds = Math.floor((timeRemaining / 1000) % 60);

        // Format the time to always show two digits
        timerElement.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    // Update the countdown every second
    const interval = setInterval(updateCountdown, 1000);

    // Run the countdown immediately without waiting for the first interval
    updateCountdown();
}

// Start the countdown when the page loads
document.addEventListener('DOMContentLoaded', startCountdown);

