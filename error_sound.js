// error_sound.js
function playErrorSound(errorSound) {
    if (errorSound === 'beep') {
        document.getElementById('error-sound-beep').play().catch(() => {});
    }
}