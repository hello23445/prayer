// error_sound.js
window.errorVolumeValue = 50; // default 0–500

function playErrorSound(sound) {
    if (!sound || sound === 'none') return;

    const audio = document.getElementById(`error-sound-${sound}`);
    if (!audio) {
        console.warn(`Звук error-sound-${sound} не найден`);
        return;
    }

    const volumeInput = document.getElementById('error-volume');

    let volumeValue = volumeInput
        ? parseInt(volumeInput.value, 10)
        : window.errorVolumeValue;

    // защита от NaN и мусора
    if (isNaN(volumeValue)) volumeValue = window.errorVolumeValue;

    // ограничение 0–500
    volumeValue = Math.max(0, Math.min(volumeValue, 500));

    // перевод в диапазон 0–1
    audio.volume = volumeValue / 500;

    // сбрасываем предыдущее воспроизведение
    audio.currentTime = 0;

    audio.play().catch(err => {
        console.error('Ошибка воспроизведения звука:', err);
    });
}
