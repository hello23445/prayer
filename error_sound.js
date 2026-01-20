// error_sound.js
window.errorVolumeValue = 50; // Default

function playErrorSound(sound) {
  if (sound === 'none') return;
  const audio = document.getElementById(`error-sound-${sound}`);
  
  // Получаем текущее значение громкости из input
  const volumeInput = document.getElementById('error-volume');
  const volumeValue = volumeInput ? parseInt(volumeInput.value) : window.errorVolumeValue;
  
  // Преобразуем значение 0-500 в диапазон 0-1 для audio.volume
  audio.volume = Math.min(volumeValue / 500, 1);
  audio.play().catch(error => {
    console.error('Ошибка воспроизведения звука:', error);
  });
}