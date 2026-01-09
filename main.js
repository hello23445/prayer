// main.js
let currentPrayer = null;
let isRecording = false;
let isPaused = false;
let recognition;
let coordinates = null;
let prayerTimes = null;
let prayerModalInterval = null;
let transcriptionEnabled = true;
let translationEnabled = true;
let transcriptionLang = 'latin';
let currentLang = 'ru';
let userLocationName = 'Определение местоположения...';
let reminders = JSON.parse(localStorage.getItem('reminders')) || {};
let asrMethod = 'standard'; // default
const cyrillicMap = {
    'ﺍ': 'а', 'ﺀ': 'ъ', 'ﺏ': 'б', 'ﺕ': 'т', 'ﺙ': 'с', 'ﺝ': 'дж', 'ﺡ': 'х', 'ﺥ': 'х', 'ﺩ': 'д', 'ﺫ': 'з',
    'ﺭ': 'р', 'ﺯ': 'з', 'ﺱ': 'с', 'ﺵ': 'ш', 'ﺹ': 'с', 'ﺽ': 'д', 'ﻁ': 'т', 'ﻅ': 'з', 'ﻉ': '', 'ﻍ': 'г',
    'ﻑ': 'ф', 'ﻕ': 'к', 'ﻙ': 'к', 'ﻝ': 'л', 'ﻡ': 'м', 'ﻥ': 'н', 'ﻩ': 'х', 'ﻭ': 'в', 'ﻱ': 'й'
    // Add more if needed, normalize to base letters
};
function cyrillicTransliterate(text, variant = 'ru') {
    // For Kazakh, perhaps adjust some, but use same for now
    return text.split('').map(char => cyrillicMap[char] || char).join('');
}
if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = 'ar-SA';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = true;
    recognition.onresult = async (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.trim();
        if (!/[\u0600-\u06FF]/.test(transcript)) {
            playErrorSound(document.getElementById('error-sound-select').value);
            const correction = translations[currentLang].speakArabic;
            const u = new SpeechSynthesisUtterance(correction);
            u.lang = getLangCode(currentLang);
            speechSynthesis.speak(u);
            return;
        }
        const history = document.getElementById('history');
        const segmentDiv = document.createElement('div');
        segmentDiv.className = 'segment';
        const textP = document.createElement('p');
        textP.textContent = transcript;
        segmentDiv.appendChild(textP);
        if (transcriptionEnabled) {
            let transLit;
            if (transcriptionLang === 'latin') {
                transLit = transliterate.transliterate(transcript);
            } else {
                transLit = cyrillicTransliterate(transcript, transcriptionLang === 'cyrillic-kz' ? 'kz' : 'ru');
            }
            const transP = document.createElement('p');
            transP.textContent = `Транскрипция: ${transLit}`;
            segmentDiv.appendChild(transP);
        }
        if (translationEnabled) {
            const translated = await getTranslation(transcript, getLangCode(currentLang));
            const translP = document.createElement('p');
            translP.textContent = `Перевод: ${translated}`;
            segmentDiv.appendChild(translP);
        }
        history.appendChild(segmentDiv);
        const userText = document.getElementById('user-text');
        userText.value = ''; // Clear current
        const fullText = Array.from(history.querySelectorAll('.segment p:first-child')).map(p => p.textContent).join(' ');
        compareTexts(currentPrayer.arabic, fullText);
    };
    recognition.onend = () => {
        if (!isPaused) {
            isRecording = false;
            document.getElementById('audio-btn').innerHTML = '<i class="fa-solid fa-microphone icon"></i>';
            document.getElementById('audio-btn').classList.remove('recording');
            document.getElementById('stop-btn').style.display = 'none';
            document.getElementById('back-btn').disabled = false;
        }
    };
    recognition.onerror = (event) => {
        if (event.error !== 'audio-capture') {
            document.getElementById('feedback').textContent = 'Ошибка распознавания: ' + event.error;
            document.getElementById('feedback').style.display = 'block';
        }
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
    if (isRecording || isPaused) return; // Запретить выход
    document.getElementById('prayer-window').style.display = 'none';
    document.getElementById('prayer-menu').style.display = 'flex';
    document.getElementById('main-container').classList.remove('full-screen');
    document.getElementById('history').innerHTML = '';
    document.getElementById('user-text').value = '';
    document.getElementById('feedback').style.display = 'none';
    document.getElementById('open-settings').style.display = 'block'; // Show settings in main menu
    document.getElementById('prayer-menu').style.display = 'flex'; // Show main menu
    document.getElementById('location-info').style.display = 'block'; // Show location back
});
document.getElementById('audio-btn').addEventListener('click', () => {
    if (!isRecording && !isPaused) {
        recognition.start();
        isRecording = true;
        isPaused = false;
        document.getElementById('audio-btn').innerHTML = '<i class="fa-solid fa-microphone-slash icon"></i>';
        document.getElementById('audio-btn').classList.add('recording');
        document.getElementById('stop-btn').style.display = 'inline-block';
        document.getElementById('back-btn').disabled = true;
    } else if (isPaused) {
        recognition.start();
        isPaused = false;
        document.getElementById('audio-btn').innerHTML = '<i class="fa-solid fa-microphone-slash icon"></i>';
    } else {
        recognition.stop();
        isPaused = true;
        document.getElementById('audio-btn').innerHTML = '<i class="fa-solid fa-microphone icon"></i>';
    }
});
document.getElementById('stop-btn').addEventListener('click', () => {
    recognition.abort();
    isRecording = false;
    isPaused = false;
    document.getElementById('audio-btn').innerHTML = '<i class="fa-solid fa-microphone icon"></i>';
    document.getElementById('audio-btn').classList.remove('recording');
    document.getElementById('stop-btn').style.display = 'none';
    document.getElementById('back-btn').disabled = false;
});
function compareTexts(original, user) {
    const originalWords = original.split(/\s+/);
    const userWords = user.split(/\s+/);
    let feedback = '';
    let perfect = true;
    for (let i = 0; i < userWords.length; i++) {
        if (userWords[i] !== originalWords[i]) {
            feedback += `${translations[currentLang].feedbackError}: ${userWords[i]}<br>`;
            perfect = false;
            playErrorSound(document.getElementById('error-sound-select').value);
        }
    }
    document.getElementById('feedback').innerHTML = feedback || (perfect ? translations[currentLang].feedbackPerfect : '');
    document.getElementById('feedback').style.display = 'block';
}
async function calculatePrayerTimes(lat, lng) {
    try {
        const school = asrMethod === 'hanafi' ? 1 : 0;
        const res = await fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=0&school=${school}`);
        const data = await res.json();
        if (data.code === 200) {
            const timings = data.data.timings;
            prayerTimes = {
                fajr: new Date(`${new Date().toISOString().split('T')[0]}T${timings.Fajr}:00`),
                dhuhr: new Date(`${new Date().toISOString().split('T')[0]}T${timings.Dhuhr}:00`),
                asr: new Date(`${new Date().toISOString().split('T')[0]}T${timings.Asr}:00`),
                maghrib: new Date(`${new Date().toISOString().split('T')[0]}T${timings.Maghrib}:00`),
                isha: new Date(`${new Date().toISOString().split('T')[0]}T${timings.Isha}:00`)
            };
            document.getElementById('location-info').innerHTML = `<i class="fa-solid fa-location-arrow fa-2xs icon"></i> ${userLocationName}`;
            updatePrayerButtons();
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
    document.getElementById('modal-prayer-name').textContent = `${name} (${hhmm})`;
    document.getElementById('prayer-time').textContent = ` (${hhmm})`;
    updateRemainingTime(value);
    prayerModalInterval = setInterval(() => updateRemainingTime(value), 1000);
    const remainingMin = (time - new Date()) / 60000;
    document.getElementById('reminder-select').disabled = remainingMin < 10;
    if (value === 'asr') {
        document.getElementById('asr-method-container').style.display = 'block';
        document.getElementById('asr-method-select-modal').value = asrMethod;
        document.getElementById('asr-method-select-modal').addEventListener('change', (e) => {
            asrMethod = e.target.value;
            calculatePrayerTimes(coordinates.lat, coordinates.lng);
        });
    } else {
        document.getElementById('asr-method-container').style.display = 'none';
    }
    document.getElementById('prayer-modal').style.display = 'flex';
    updateRemindersList(value);
    document.getElementById('modal-back').onclick = () => {
        clearInterval(prayerModalInterval);
        document.getElementById('prayer-modal').style.display = 'none';
    };
    document.getElementById('continue-btn').onclick = () => {
        const reminder = document.getElementById('reminder-select').value;
        if (reminder) {
            reminders[value] = reminder;
            localStorage.setItem('reminders', JSON.stringify(reminders));
        }
        clearInterval(prayerModalInterval);
        document.getElementById('prayer-modal').style.display = 'none';
        if (reminder && Notification.permission === 'granted') {
            let remindTime;
            if (reminder === 'next') {
                // Calculate next prayer time
                const prayerOrder = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
                const currentIndex = prayerOrder.indexOf(value);
                const nextValue = prayerOrder[(currentIndex + 1) % prayerOrder.length];
                remindTime = prayerTimes[nextValue];
                if (nextValue === 'fajr') {
                    remindTime.setDate(remindTime.getDate() + 1);
                }
            } else {
                remindTime = new Date(time.getTime() - reminder * 60000);
            }
            const delay = remindTime - new Date();
            if (delay > 0) {
                setTimeout(() => {
                    new Notification(`Время для намаза ${name} скоро!`, {
                        body: `Осталось ${reminder === 'next' ? 'до следующего' : reminder} минут`
                    });
                }, delay);
            }
        }
        document.getElementById('prayer-name').textContent = name;
        document.getElementById('prayer-window').style.display = 'block';
        document.getElementById('main-container').classList.add('full-screen');
        document.getElementById('user-text').value = '';
        document.getElementById('feedback').style.display = 'none';
        // Hide all unnecessary elements
        document.getElementById('location-info').style.display = 'none';
        document.getElementById('title').style.display = 'none';
        document.getElementById('open-settings').style.display = 'none';
        document.getElementById('prayer-menu').style.display = 'none';
    };
}
function updateRemainingTime(value) {
    const t = translations[currentLang];
    let time = prayerTimes[value];
    let remainingMs = time - new Date();
    let text = `До Намаза ${t[value]} осталось `;
    if (remainingMs <= 0) {
        time = new Date(time.getTime() + 24 * 60 * 60 * 1000);
        remainingMs = time - new Date();
        text = `${t.nextSamePrayer} ${t[value]}: `;
    }
    const hours = Math.floor(remainingMs / 3600000);
    remainingMs %= 3600000;
    const mins = Math.floor(remainingMs / 60000);
    const secs = Math.floor((remainingMs % 60000) / 1000);
    let timeText = '';
    if (hours > 0) {
        timeText = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else if (mins > 0) {
        timeText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
        timeText = `${secs} секунд`;
    }
    document.getElementById('remaining-time').textContent = text + timeText;
}
function updateRemindersList(value) {
    const list = document.getElementById('reminders-list');
    list.innerHTML = '<h3 id="reminders-title">' + translations[currentLang].remindersTitle + '</h3>';
    Object.keys(reminders).forEach(key => {
        const p = document.createElement('p');
        p.textContent = `${translations[currentLang][key]}: ${reminders[key]} минут раньше`;
        list.appendChild(p);
    });
}
window.addEventListener('load', () => {
    document.getElementById('location-info').textContent = userLocationName;
    loadSettings();
    document.getElementById('preloader').style.display = 'none';
    document.getElementById('main-container').style.display = 'flex';
    initPermissions();
});