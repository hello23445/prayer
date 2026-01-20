// error_sound.js
window.errorVolumeValue = 100; // Default

function playErrorSound(sound) {
  if (sound === 'none') return;
  const audio = document.getElementById(`error-sound-${sound}`);
  audio.volume = window.errorVolumeValue / 500; // Since max 500, volume 0-1
  audio.play();
}