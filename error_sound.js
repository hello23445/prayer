// error_sound.js
function playErrorSound(errorSound) {
    const audio = document.getElementById('error-sound-beep');
    const volume = document.getElementById('error-volume').value / 500;
    if (errorSound === 'beep' && volume > 0) {
        audio.volume = volume;
        audio.play().catch(() => {});
    }
}