// error_sound.js
window.errorVolumeValue = 100; // Default

function playErrorSound(sound) {
  if (sound === 'none') return;
  const audio = document.getElementById(`error-sound-${sound}`);
  if (!audio) return;
  
  // Установка громкости (от 0 до 500, масштабируем до 0-1 для Web Audio API)
  const volume = Math.min(1, window.errorVolumeValue / 500);
  audio.volume = volume;
  
  // Простое воспроизведение с правильной громкостью
  audio.play().catch(err => console.error('Ошибка воспроизведения звука:', err));
}