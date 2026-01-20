// error_sound.js
window.errorVolumeValue = 100; // Default

function playErrorSound(sound) {
  if (sound === 'none') return;
  const audio = document.getElementById(`error-sound-${sound}`);
  audio.volume = window.errorVolumeValue / 100; // Изменено на /100 для лучшей совместимости с мобильными устройствами (объем 0-1, шаг 1-5)
  audio.play().catch(error => {
    console.error('Ошибка воспроизведения звука:', error);
  });
}