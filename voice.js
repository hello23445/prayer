// voice.js
let currentVoice = null;
let voices = [];

// Массив для добавления кастомных арабских аудио (если нужно использовать внешние файлы)
// Пример: const customArabicVoices = [ { name: 'Custom Arabic 1', url: 'path/to/audio.mp3' } ];
// Пока используем системные голоса

function loadVoices(lang) {
    voices = speechSynthesis.getVoices();
    const voiceSelect = document.getElementById('voice-select');
    voiceSelect.innerHTML = '';
    const filteredVoices = voices.filter(voice => voice.lang.startsWith('ar'));
    if (filteredVoices.length === 0) {
        const option = document.createElement('option');
        option.textContent = 'Арабские голоса недоступны';
        voiceSelect.appendChild(option);
    } else {
        filteredVoices.forEach(voice => {
            const option = document.createElement('option');
            option.value = voice.name;
            option.textContent = `${voice.name} (${voice.lang})`;
            voiceSelect.appendChild(option);
        });
        currentVoice = filteredVoices[0];
        voiceSelect.value = currentVoice.name;
    }
}

speechSynthesis.onvoiceschanged = () => loadVoices(currentLang);

// Функция check() — будет вызвана, если геолокация получена
function check(position) {
    const latitude = position.coords.latitude;   // широта
    const longitude = position.coords.longitude; // долгота
    const accuracy = position.coords.accuracy;   // точность в метрах

    console.log("Широта:", latitude);
    console.log("Долгота:", longitude);
    console.log("Точность:", accuracy, "м");

    // Тут можно делать что угодно с координатами
}

document.getElementById('geo-yes2').addEventListener('click', () => {
    alert('1')
    // Запрос геолокации
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            alert('2')
            // Если координаты получены — вызываем check()
            check(pos);
        },
        (err) => {
            alert('3')
            console.error("Ошибка геолокации:", err.message);
        },
        {
            enableHighAccuracy: true,
            timeout: 1000,
        }
    );
})