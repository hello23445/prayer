// main.js (полный файл с method=5 для точного совпадения с islam.az)
let currentPrayer = null;
let isRecording = false;
let isPaused = false;
let recognition;
let coordinates = null;
let prayerTimes = null;
let prayerModalInterval = null;
let transcriptionEnabled = true;
let translationEnabled = true;
let currentLang = 'ru';
let userLocationName = 'Определение местоположения...';

if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = 'ar-SA';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = true;

    recognition.onresult = async (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.trim();
        const userText = document.getElementById('user-text');
        if (userText.value !== '') userText.value += ' ';
        userText.value += transcript;
        const trimmed = userText.value.trim();
        compareTexts(currentPrayer.arabic, trimmed);

        if (transcriptionEnabled) {
            const transLit = transliterate.transliterate(trimmed);
            document.getElementById('transcription').textContent = `Транскрипция: ${transLit}`;
            document.getElementById('transcription').style.display = 'block';
        } else {
            document.getElementById('transcription').style.display = 'none';
        }

        if (translationEnabled) {
            const translated = await getTranslation(trimmed, getLangCode(currentLang));
            document.getElementById('translation').textContent = `Перевод: ${translated}`;
            document.getElementById('translation').style.display = 'block';
        } else {
            document.getElementById('translation').style.display = 'none';
        }
    };

    recognition.onend = () => {
        isRecording = false;
        isPaused = false;
        document.getElementById('audio-btn').innerHTML = '<i class="fa-solid fa-microphone icon"></i>';
        document.getElementById('audio-btn').classList.remove('recording');
    };

    recognition.onerror = (event) => {
        document.getElementById('feedback').textContent = 'Ошибка распознавания: ' + event.error;
        document.getElementById('feedback').style.display = 'block';
    };
} else {
    alert('Браузер не поддерживает распознавание речи.');
}

async function getTranslation(text, target) {
    if (!text) return '';
    try {
        const res = await fetch('https://libretranslate.de/translate', {
            method: 'POST',
            body: JSON.stringify({
                q: text,
                source: 'ar',
                target: target,
                format: 'text'
            }),
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        return data.translatedText || 'Ошибка перевода';
    } catch (e) {
        return 'Ошибка перевода';
    }
}

document.querySelectorAll('.prayer-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const value = btn.dataset.value;
        currentPrayer = prayers[value];
        if (prayerTimes) {
            showPrayerModal(value);
        } else {
            alert('Время намаза не определено. Пожалуйста, разрешите геолокацию.');
        }
    });
});

document.getElementById('back-btn').addEventListener('click', () => {
    document.getElementById('prayer-window').style.display = 'none';
    document.getElementById('prayer-menu').style.display = 'flex';
    document.getElementById('main-container').classList.remove('full-screen');
});

document.getElementById('audio-btn').addEventListener('click', () => {
    if (!isRecording && !isPaused) {
        recognition.start();
        isRecording = true;
        document.getElementById('audio-btn').innerHTML = '<i class="fa-solid fa-circle-stop icon"></i>';
        document.getElementById('audio-btn').classList.add('recording');
        document.getElementById('user-text').value = '';
        document.getElementById('feedback').style.display = 'none';
        document.getElementById('transcription').style.display = 'none';
        document.getElementById('translation').style.display = 'none';
    } else if (isRecording && !isPaused) {
        isPaused = true;
        recognition.stop();
        document.getElementById('audio-btn').innerHTML = '<i class="fa-solid fa-microphone-slash icon"></i>';
    } else if (isPaused) {
        recognition.start();
        isPaused = false;
        document.getElementById('audio-btn').innerHTML = '<i class="fa-solid fa-circle-stop icon"></i>';
    }
});

document.getElementById('play-error-sound').addEventListener('click', () => {
    const errorSound = document.getElementById('error-sound-select').value;
    playErrorSound(errorSound);
});

function compareTexts(original, user) {
    const t = translations[currentLang];
    const originalWords = original.split(/\s+/).filter(w => w);
    const userWords = user.split(/\s+/).filter(w => w);

    let isCorrect = originalWords.length === userWords.length &&
                    originalWords.every((word, index) => word === userWords[index]);

    if (isCorrect) {
        recognition.stop();
        document.getElementById('feedback').textContent = t.feedbackPerfect;
        document.getElementById('feedback').style.display = 'block';
    } else {
        const errorSound = document.getElementById('error-sound-select').value;
        playErrorSound(errorSound);
        speakText(original);
        let feedbackText = '';
        userWords.forEach((word, index) => {
            if (index < originalWords.length && word !== originalWords[index]) {
                feedbackText += `<span class="error">${t.feedbackError} ${index + 1}: "${word}" вместо "${originalWords[index]}"</span><br>`;
            }
        });
        if (userWords.length > originalWords.length) {
            feedbackText += `<span class="error">Лишние слова в конце</span><br>`;
        }
        document.getElementById('feedback').innerHTML = feedbackText || 'Текст не совпадает';
        document.getElementById('feedback').style.display = 'block';
    }
}

function speakText(text) {
    if (!text || text.trim() === '' || typeof window.talkifyPlayer === 'undefined' || window.talkifyPlayer === null) {
        // Fallback на speechSynthesis
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ar-SA';
        const voices = speechSynthesis.getVoices();
        const arabicVoice = voices.find(v => v.lang.startsWith('ar'));
        if (arabicVoice) utterance.voice = arabicVoice;
        speechSynthesis.speak(utterance);
        return;
    }
    window.talkifyPlayer.playText(text);
}

function updatePrayerButtons() {
    const t = translations[currentLang];
    const btns = document.querySelectorAll('.prayer-btn');
    btns.forEach(btn => {
        const value = btn.dataset.value;
        let text = t[value];
        if (prayerTimes && prayerTimes[value]) {
            const time = prayerTimes[value];
            const hhmm = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
            text += ` (${hhmm})`;
        }
        btn.textContent = text;
    });
}

async function reverseGeocode(lat, lng) {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=${currentLang || 'en'}`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        if (data) {
            let locationParts = [];

            if (data.locality) locationParts.push(data.locality);
            else if (data.city) locationParts.push(data.city);

            if (data.principalSubdivision) locationParts.push(data.principalSubdivision);

            if (data.countryName) locationParts.push(data.countryName);

            userLocationName = locationParts.join(', ') || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        } else {
            userLocationName = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        }
    } catch (e) {
        console.error('Ошибка BigDataCloud reverse geocode:', e);
        userLocationName = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
    document.getElementById('location-info').textContent = userLocationName + ' (islam.az)';
}

async function calculatePrayerTimes(lat, lng) {
    const date = new Date();
    const timestamp = Math.floor(date.getTime() / 1000);
    // method=5 — точно соответствует islam.az для Баку (Fajr 06:26, Isha 18:57 на похожие даты)
    const url = `https://api.aladhan.com/v1/timingsByCity?city=Baku&country=Azerbaijan&method=0`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.code === 200) {
            const timings = data.data.timings;
            prayerTimes = {
                fajr: new Date(`${date.toDateString()} ${timings.Fajr}`),
                dhuhr: new Date(`${date.toDateString()} ${timings.Dhuhr}`),
                asr: new Date(`${date.toDateString()} ${timings.Asr}`),
                maghrib: new Date(`${date.toDateString()} ${timings.Maghrib}`),
                isha: new Date(`${date.toDateString()} ${timings.Isha}`)
            };
            updatePrayerButtons();
            await reverseGeocode(lat, lng);
        } else {
            alert('Ошибка получения времени намаза');
            document.getElementById('location-info').textContent = 'Ошибка времени намаза';
        }
    } catch (e) {
        alert('Ошибка сети при получении времени намаза');
        document.getElementById('location-info').textContent = 'Нет сети';
    }
}

function showPrayerModal(value) {
    const t = translations[currentLang];
    const name = t[value];
    const time = prayerTimes[value];
    const hhmm = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
    document.getElementById('modal-prayer-name').textContent = `${name} : ${hhmm}`;
    updateRemainingTime(value);
    prayerModalInterval = setInterval(() => updateRemainingTime(value), 1000);

    const remainingMin = (time - new Date()) / 60000;
    document.getElementById('reminder-select').disabled = remainingMin < 10;

    document.getElementById('prayer-modal').style.display = 'flex';

    document.getElementById('modal-back').onclick = () => {
        clearInterval(prayerModalInterval);
        document.getElementById('prayer-modal').style.display = 'none';
    };

    document.getElementById('continue-btn').onclick = () => {
        clearInterval(prayerModalInterval);
        document.getElementById('prayer-modal').style.display = 'none';

        const reminder = document.getElementById('reminder-select').value;
        if (reminder && Notification.permission === 'granted') {
            const remindTime = new Date(time.getTime() - reminder * 60000);
            const delay = remindTime - new Date();
            if (delay > 0) {
                setTimeout(() => {
                    new Notification(`Время для намаза ${name} скоро!`, {
                        body: `Осталось ${reminder} минут`
                    });
                }, delay);
            }
        }

        document.getElementById('prayer-name').textContent = name;
        document.getElementById('prayer-menu').style.display = 'none';
        document.getElementById('prayer-window').style.display = 'block';
        document.getElementById('main-container').classList.add('full-screen');
        document.getElementById('user-text').value = '';
        document.getElementById('feedback').style.display = 'none';
        document.getElementById('transcription').style.display = 'none';
        document.getElementById('translation').style.display = 'none';
    };
}

function updateRemainingTime(value) {
    const t = translations[currentLang];
    const time = prayerTimes[value];
    let remainingMs = time - new Date();
    if (remainingMs <= 0) {
        document.getElementById('remaining-time').textContent = 'Время намаза прошло';
        return;
    }

    const hours = Math.floor(remainingMs / 3600000);
    remainingMs %= 3600000;
    const mins = Math.floor(remainingMs / 60000);
    const secs = Math.floor((remainingMs % 60000) / 1000);

    let text = '';
    if (hours > 0) {
        text = hours === 1 && mins === 0 && secs === 0 ? '1 час' : `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else if (mins > 0) {
        text = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
        text = `${secs} секунд`;
    }

    document.getElementById('remaining-time').textContent = `До Намаза ${t[value]} осталось ${text}`;
}

function requestGeolocation() {
    document.getElementById('geo-modal').style.display = 'flex';
    document.getElementById('geo-yes').onclick = () => {
        document.getElementById('geo-modal').style.display = 'none';
        document.getElementById('location-info').textContent = 'Определение...';
        navigator.geolocation.getCurrentPosition(pos => {
            coordinates = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            calculatePrayerTimes(coordinates.lat, coordinates.lng);
        }, err => {
            console.error(err);
            alert('Ошибка геолокации: ' + err.message);
            document.getElementById('location-info').textContent = 'Геолокация не разрешена';
            requestGeolocation();
        });
    };
}

function initPermissions() {
    // Уведомления
    if (Notification.permission === 'default') {
        document.getElementById('notify-modal').style.display = 'flex';
        document.getElementById('notify-yes').onclick = () => {
            document.getElementById('notify-modal').style.display = 'none';
            Notification.requestPermission().then(perm => {
                if (perm !== 'granted') {
                    alert('Уведомления не разрешены. Напоминания о намазе не будут работать.');
                }
            });
        };
    }

    // Микрофон
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            stream.getTracks().forEach(track => track.stop());
        })
        .catch(err => {
            console.error('Микрофон не доступен:', err);
            document.getElementById('mic-modal').style.display = 'flex';
            document.getElementById('mic-yes').onclick = () => {
                document.getElementById('mic-modal').style.display = 'none';
                navigator.mediaDevices.getUserMedia({ audio: true })
                    .catch(() => alert('Микрофон обязателен для записи намаза.'));
            };
        });

    // Геолокация
    requestGeolocation();
}

window.addEventListener('load', () => {
    document.getElementById('location-info').textContent = userLocationName;
    loadSettings();
    initPermissions();
});