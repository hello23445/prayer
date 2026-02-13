// error_sound.js
window.errorVolumeValue = 50; // Default
window.errorSoundLoaded = false;

// Загружаем звук асинхронно в фоне (не блокируя загрузку страницы)
async function preloadErrorSound() {
  const audio = document.getElementById('error-sound-beep');
  if (!audio || window.errorSoundLoaded) return;

  try {
    // Проверяем есть ли аудио в IndexedDB
    const cachedAudio = await getAudioFromCache('error-sound-beep');
    if (cachedAudio) {
      const blobUrl = URL.createObjectURL(cachedAudio);
      audio.src = blobUrl;
      window.errorSoundLoaded = true;
    } else {
      // Загружаем с сервера в фоне асинхронно
      fetch('https://www.soundjay.com/buttons/sounds/beep-05.mp3')
        .then(response => response.blob())
        .then(blob => {
          // Сохраняем в IndexedDB
          saveAudioToCache('error-sound-beep', blob);
          
          // Загружаем в audio элемент
          const blobUrl = URL.createObjectURL(blob);
          audio.src = blobUrl;
          window.errorSoundLoaded = true;
        })
        .catch(error => {
          console.warn('Error loading error sound:', error);
        });
    }
  } catch (error) {
    console.error('Error in preloadErrorSound:', error);
  }
}

// IndexedDB функции для кеширования аудио
function getAudioFromCache(key) {
  return new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open('audioCache', 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction('audio', 'readonly');
        const store = transaction.objectStore('audio');
        const getRequest = store.get(key);
        getRequest.onsuccess = () => resolve(getRequest.result?.blob || null);
        getRequest.onerror = () => reject(getRequest.error);
      };
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('audio')) {
          db.createObjectStore('audio');
        }
      };
    } catch (e) {
      resolve(null); // Если IndexedDB не доступна, возвращаем null
    }
  });
}

function saveAudioToCache(key, blob) {
  try {
    const request = indexedDB.open('audioCache', 1);
    request.onerror = () => console.warn('Failed to save audio to cache');
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction('audio', 'readwrite');
      const store = transaction.objectStore('audio');
      store.put({ blob }, key);
    };
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('audio')) {
        db.createObjectStore('audio');
      }
    };
  } catch (e) {
    console.warn('Could not use IndexedDB for audio caching:', e);
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
