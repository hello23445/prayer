// error_sound.js
window.errorVolumeValue = 50; // Default
window.errorSoundLoaded = false;

// Загружаем звук при инициализации
function preloadErrorSound() {
  const audio = document.getElementById('error-sound-beep');
  if (audio && !window.errorSoundLoaded) {
    audio.addEventListener('canplaythrough', () => {
      window.errorSoundLoaded = true;
    }, { once: true });
    audio.load();
  }
}

function playErrorSound(sound) {
  if (sound === 'none') return;

  const audio = document.getElementById(`error-sound-${sound}`);
  if (!audio) return;
  
  // Получаем текущее значение громкости из input
  const volumeInput = document.getElementById('error-volume');
  const volumeValue = volumeInput ? parseInt(volumeInput.value) : window.errorVolumeValue;
  
  // Преобразуем значение 0-500 в диапазон 0-1 для audio.volume
  audio.volume = Math.min(volumeValue / 500, 1);
  
  // Остановим все текущие воспроизведения
  audio.currentTime = 0;
  
  // Пытаемся воспроизвести звук
  const playPromise = audio.play();
  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        // Автозапуск разрешен
      })
      .catch(error => {
        console.error('Ошибка воспроизведения звука:', error);
        // На iOS может потребоваться пользовательское действие
      });
  }
}
function showToast(text, ms = 10500) {
    const div = document.createElement('div');
    div.textContent = text;
    div.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #333;
        color: #fff;
        padding: 10px 14px;
        border-radius: 8px;
        z-index: 9999;
        font-size: 14px;
    `;
    document.body.appendChild(div);

    setTimeout(() => div.remove(), ms);
}
