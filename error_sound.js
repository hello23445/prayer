// error_sound.js
function playErrorSound(errorSound) {
    if (errorSound !== 'none') {
        document.getElementById(`error-sound-${errorSound}`).play();
    }
}