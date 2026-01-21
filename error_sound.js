// error_sound.js
window.errorVolumeValue = 50; // Default

function playErrorSound(sound) {
  if (sound === 'none') return;
  const lang = localStorage.getItem('lang1');
  showToast(
      lang === 'ru' ? 'Загрузка аудио...' :
      lang === 'az' ? 'Audio yüklənir...' :
      'Loading the audio...'
  );


  const audio = document.getElementById(`error-sound-${sound}`);
  
  // Получаем текущее значение громкости из input
  const volumeInput = document.getElementById('error-volume');
  const volumeValue = volumeInput ? parseInt(volumeInput.value) : window.errorVolumeValue;
  
  // Преобразуем значение 0-500 в диапазон 0-1 для audio.volume
  audio.volume = Math.min(volumeValue / 500, 1);
  
  // Остановим все текущие воспроизведения
  audio.currentTime = 0;
  audio.play().catch(error => {
    console.error('Ошибка воспроизведения звука:', error);
  });
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
