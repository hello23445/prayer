// error_sound.js
window.errorVolumeValue = 50; // Default

function playErrorSound(sound) {
  if (sound === 'none') return;
  const audio = document.getElementById(`error-sound-${sound}`);
  audio.volume = window.errorVolumeValue / 100; // Volume 0-1
  audio.play().catch(error => {
    console.error('Ошибка воспроизведения звука:', error);
  });
}