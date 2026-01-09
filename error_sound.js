// error_sound.js
function playErrorSound(errorSound) {
    if (errorSound !== 'none') {
        const audio = document.getElementById(`error-sound-${errorSound}`);
        audio.play();
        let plays = 0;
        const playLong = () => {
            if (plays < 0) { // Play 3 times for long
                plays++;
                audio.play();
            }
        };
        audio.addEventListener('ended', playLong);
    }
}