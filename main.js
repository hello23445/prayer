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
let asrMethod = 'standard'; // default
let currentView = 'main'; // Global current view state
let previousViewBeforeModal = 'main'; // Отслеживаем, откуда открыли modal
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
        compareTexts(getOriginalArabic(currentPrayer), fullText);
    };
    recognition.onend = () => {
        if (!isPaused) {
            isRecording = false;
            document.getElementById('audio-btn').innerHTML = '<i class="fa-solid fa-microphone icon"></i>';
            document.getElementById('audio-btn').classList.remove('recording');
            document.getElementById('stop-btn').style.display = 'none';
            document.getElementById('back-btn').disabled = false;
            document.getElementById('back-btn').classList.remove('disabled');
            // Показываем кнопку Back в Telegram WebApp когда запись закончилась
            if (window.tg) {
                window.tg.BackButton.show();
            }
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
        currentPrayer = words[value.charAt(0).toUpperCase() + value.slice(1)];
        // Скрываем настройки если они открыты
        const settingsDiv = document.getElementById('settings');
        if (settingsDiv && settingsDiv.style.display === 'block') {
            settingsDiv.style.display = 'none';
            const mainContainer = document.getElementById('main-container');
            if (mainContainer) mainContainer.style.display = 'flex';
        }
        if (prayerTimes) {
            showPrayerModal(value);
        } else {
            alert('Время намаза не определено. Пожалуйста, разрешите геолокацию.');
        }
    });
});
document.getElementById('back-btn').addEventListener('click', handleBack);
function handleBack() {
    if (isRecording || isPaused) return; // Запретить выход
    // Скрываем окно молитвы
    document.getElementById('prayer-window').style.display = 'none';
    // Показываем главное меню
    document.getElementById('prayer-menu').style.display = 'flex';
    // Убираем полноэкранный режим
    document.getElementById('main-container').classList.remove('full-screen');
    // Очищаем историю и текст
    document.getElementById('history').innerHTML = '';
    document.getElementById('user-text').value = '';
    document.getElementById('feedback').style.display = 'none';
    // Показываем элементы главного меню
    document.getElementById('open-settings').style.display = 'block';
    document.getElementById('location-info').style.display = 'block';
    document.getElementById('date-info').style.display = 'block';
    // Обновляем текущий вид
    currentView = 'main';
    // Управляем главной кнопкой
    manageMainButton();
    // Скрываем кнопку Back и показываем кнопку Settings в Telegram WebApp
    if (window.tg) {
        window.tg.BackButton.hide();
        window.tg.SettingsButton.show();
    }
}
document.getElementById('audio-btn').addEventListener('click', () => {
    if (!isRecording && !isPaused) {
        recognition.start();
        isRecording = true;
        isPaused = false;
        document.getElementById('audio-btn').innerHTML = '<i class="fa-solid fa-microphone-slash icon"></i>';
        document.getElementById('audio-btn').classList.add('recording');
        document.getElementById('stop-btn').style.display = 'inline-block';
        document.getElementById('back-btn').disabled = true;
        document.getElementById('back-btn').classList.add('disabled');
        // Скрываем кнопку Back в Telegram WebApp при записи
        if (window.tg) {
            window.tg.BackButton.hide();
        }
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
    document.getElementById('back-btn').classList.remove('disabled');
    // Показываем кнопку Back в Telegram WebApp когда запись остановлена
    if (window.tg) {
        window.tg.BackButton.show();
    }
});
function getOriginalArabic(prayer) {
    return Object.values(prayer).map(wordObj => Object.values(wordObj).find(val => val.startsWith('word')) || '').join(' ');
}
function compareTexts(original, user) {
    const originalWords = original.split(/\s+/);
    const userWords = user.split(/\s+/);
    const prayerWords = Object.values(currentPrayer);
    let feedback = '';
    let perfect = true;
    let origIndex = 0;
    for (let i = 0; i < userWords.length; i++) {
        if (userWords[i] !== originalWords[origIndex]) {
            feedback += `${translations[currentLang].feedbackError}: ${userWords[i]}<br>`;
            perfect = false;
            playErrorSound(document.getElementById('error-sound-select').value);
        } else {
            // Check for skipped important words
            while (origIndex < originalWords.length && originalWords[origIndex] === userWords[i]) {
                origIndex++;
            }
        }
    }
    // Check for skipped important words at the end
    while (origIndex < originalWords.length) {
        const wordKey = Object.keys(prayerWords[origIndex])[0]; // Assuming word11 is the arabic key
        const status = prayerWords[origIndex][`${wordKey}_status`];
        if (status === 'important') {
            feedback += `${translations[currentLang].feedbackError}: Пропущено важное слово ${originalWords[origIndex]}<br>`;
            perfect = false;
            playErrorSound(document.getElementById('error-sound-select').value);
        }
        origIndex++;
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
    // Сохраняем текущий вид перед открытием modal
    previousViewBeforeModal = currentView;
    if (value === 'asr') {
        document.getElementById('asr-method-container').style.display = 'block';
        document.getElementById('asr-method-select-modal').value = asrMethod;
        const select = document.getElementById('asr-method-select-modal');
        select.removeEventListener('change', window.asrChangeHandler);
        window.asrChangeHandler = async (e) => {
            document.getElementById('preloader').style.display = 'flex';
            asrMethod = e.target.value;
            await calculatePrayerTimes(coordinates.lat, coordinates.lng);
            const time = prayerTimes['asr'];
            const hhmm = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
            document.getElementById('modal-prayer-name').textContent = `${t.asr} (${hhmm})`;
            updatePrayerButtons(); // обновить кнопки в главном меню
            document.getElementById('preloader').style.display = 'none';
            document.getElementById('asr-method-select').value = asrMethod;
        };
        select.addEventListener('change', window.asrChangeHandler);
    } else {
        document.getElementById('asr-method-container').style.display = 'none';
    }
    document.getElementById('prayer-modal').style.display = 'flex';
    currentView = 'prayer_modal';
    manageMainButton();
    // Показываем кнопку Back в Telegram WebApp для модального окна деталей намаза
    if (window.tg) {
        window.tg.BackButton.show();
        window.tg.SettingsButton.hide();
    }
    document.getElementById('modal-back').onclick = () => {
        clearInterval(prayerModalInterval);
        document.getElementById('prayer-modal').style.display = 'none';
        // Возвращаемся в предыдущее меню
        currentView = previousViewBeforeModal;
        // Если возвращаемся в main - показываем основное меню
        if (previousViewBeforeModal === 'main') {
            document.getElementById('prayer-menu').style.display = 'flex';
            document.getElementById('open-settings').style.display = 'block';
            document.getElementById('location-info').style.display = 'block';
            document.getElementById('date-info').style.display = 'block';
        }
        // Если возвращаемся в settings - показываем настройки
        else if (previousViewBeforeModal === 'settings') {
            document.getElementById('settings').style.display = 'block';
            document.getElementById('main-container').style.display = 'none';
        }
        manageMainButton();
        // Управляем кнопками Telegram WebApp в зависимости от того, куда вернулись
        if (window.tg) {
            if (previousViewBeforeModal === 'main') {
                window.tg.BackButton.hide();
                window.tg.SettingsButton.show();
            } else if (previousViewBeforeModal === 'settings') {
                window.tg.BackButton.show();
                window.tg.SettingsButton.hide();
            }
        }
    };
    document.getElementById('continue-btn').onclick = () => {
        removeSettings()
        clearInterval(prayerModalInterval);
        document.getElementById('prayer-modal').style.display = 'none';
        document.getElementById('prayer-name').textContent = name;
        document.getElementById('prayer-window').style.display = 'block';
        document.getElementById('main-container').classList.add('full-screen');
        document.getElementById('user-text').value = '';
        document.getElementById('feedback').style.display = 'none';
        // Hide all unnecessary elements
        document.getElementById('location-info').style.display = 'none';
        document.getElementById('open-settings').style.display = 'none';
        document.getElementById('prayer-menu').style.display = 'none';
        document.getElementById('date-info').style.display = 'none';
        // Применяем margin-top к header в зависимости от fullscreen режима
        const prayerWindow = document.getElementById('prayer-window');
        if (prayerWindow) {
            const fixedHeader = prayerWindow.querySelector('.fixed-header');
            if (fixedHeader) {
                const viewMode = localStorage.getItem('namazSettings') ? JSON.parse(localStorage.getItem('namazSettings')).viewMode : 'normal';
                fixedHeader.style.marginTop = (viewMode === 'fullscreen') ? '30%' : '2%';
            }
        }
        currentView = 'prayer';
        manageMainButton();
        // Показываем кнопку Back в Telegram WebApp
        if (window.tg) {
            window.tg.BackButton.show();
            // Скрываем кнопку Settings
            window.tg.SettingsButton.hide();
        }
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
function getNextPrayerInfo() {
    if (!prayerTimes) return { key: null, text: '' };
    const now = new Date();
    let nextKey = null;
    let minDiff = Infinity;
    Object.keys(prayerTimes).forEach(key => {
        let time = prayerTimes[key];
        let diff = time - now;
        if (diff < 0) {
            time = new Date(time.getTime() + 24 * 3600 * 1000);
            diff = time - now;
        }
        if (diff < minDiff) {
            minDiff = diff;
            nextKey = key;
        }
    });
    const name = translations[currentLang][nextKey];
    const time = prayerTimes[nextKey];
    const hhmm = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
    const hours = Math.floor(minDiff / 3600000);
    const mins = Math.floor((minDiff % 3600000) / 60000);
    const secs = Math.floor((minDiff % 60000) / 1000);
    const remaining = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    const text = `${name}:${hhmm}(${remaining})`;
    return { key: nextKey, text };
}
function manageMainButton() {
    if (!window.tg) return;
    const tg = window.tg;
    const settings = JSON.parse(localStorage.getItem('namazSettings')) || {};
    const mainButtonEnabled = settings.mainButtonEnabled || false;
    const whereShow = settings.whereShow || 'main';
    const onPress = settings.onPress || 'open_main';
    
    if (!mainButtonEnabled) {
        tg.MainButton.hide();
        return;
    }
    
    let show = false;
    
    // Показываем кнопку в зависимости от whereShow и currentView
    // Если выбрано "В главном меню" - показываем только в главном меню
    if (whereShow === 'main' && currentView === 'main') show = true;
    // Если выбрано "В настройках" - показываем только в настройках
    if (whereShow === 'settings' && currentView === 'settings') show = true;
    // Если выбрано "Обе" - показываем в главном меню и в настройках
    if (whereShow === 'both' && (currentView === 'main' || currentView === 'settings')) show = true;
    
    if (!show) {
        tg.MainButton.hide();
        return;
    }
    
    // Определяем текст кнопки и отключаем, если нужно
    let text = '';
    switch (onPress) {
        case 'open_main':
            text = translations[currentLang].returnToMainMenu;
            break;
        case 'open_settings':
            text = translations[currentLang].openSettings;
            break;
        case 'next_prayer':
            const nextInfo = getNextPrayerInfo();
            text = nextInfo.text;
            // Если нет следующего намаза - отключаем кнопку
            if (!nextInfo.key) {
                tg.MainButton.hide();
                return;
            }
            break;
    }
    
    tg.MainButton.setText(text);
    tg.MainButton.show();
    
    // Применяем цвета к кнопке если функция доступна
    if (typeof applyButtonColors === 'function') {
        applyButtonColors();
    }
}
window.addEventListener('load', () => {
    document.getElementById('location-info').textContent = userLocationName;
    loadSettings();
    const header2 = document.getElementById('header2');
    const viewMode = localStorage.getItem('namazSettings') ? JSON.parse(localStorage.getItem('namazSettings')).viewMode : 'normal';
    if (header2) {
        header2.style.marginTop = (viewMode === 'fullscreen') ? '30%' : '2%';
        document.querySelectorAll('.header22').forEach(el => {
            el.style.marginTop =
                (viewMode === 'fullscreen') ? '30%' : '2%';
        });

    }
    document.getElementById('preloader').style.display = 'none';
    document.getElementById('main-container').style.display = 'flex';
    initPermissions();
    currentView = 'main';
    manageMainButton();
    
    // Обновляем текст главной кнопки каждую секунду для опции "next_prayer"
    setInterval(() => {
        const settings = JSON.parse(localStorage.getItem('namazSettings')) || {};
        if (settings.mainButtonEnabled && settings.onPress === 'next_prayer') {
            manageMainButton();
        }
    }, 1000);
});
document.addEventListener('click', (e) => {
    const target = e.target;
    const tag = target.tagName.toLowerCase();

    // если клик по элементу с id="location-info" — ничего не делаем
    if (target.id === 'location-info') return;

    // Если клик НЕ по интерактивному элементу — убираем клавиатуру
    if (!['input','p', 'textarea', 'select', 'i', 'button', 'a', 'label'].includes(tag)) {
        document.activeElement?.blur();
    }
});
document.getElementById('update-location').addEventListener('click', async () => {
    // Показываем модальное окно с запросом разрешения на геолокацию
    const geoModal = document.getElementById('geo-modal');
    const yesBtn = document.getElementById('geo-yes');
    const locationModal = document.getElementById('location-modal');
    const preloader = document.getElementById('preloader');
    
    // Скрываем текущее модальное окно локации
    locationModal.style.display = 'none';
    
    // Показываем окно разрешения геолокации
    geoModal.style.display = 'flex';
    
    // Удаляем предыдущие обработчики
    yesBtn.onclick = null;
    
    // Добавляем обработчик для кнопки "Разрешить"
    yesBtn.onclick = async () => {
        geoModal.style.display = 'none';
        preloader.style.display = 'flex';
        
        // Запускаем запрос геолокации с force=true для обновления
        try {
            await requestGeolocation(true);
            // После успеха показываем модальное окно локации снова
            locationModal.style.display = 'flex';
        } catch (error) {
            console.error('Ошибка при определении локации:', error);
            locationModal.style.display = 'flex';
        }
    };
});
if (window.tg) {
    tg.onEvent('mainButtonClicked', () => {
        const settings = JSON.parse(localStorage.getItem('namazSettings')) || {};
        const onPress = settings.onPress || 'open_main';
        switch (onPress) {
            case 'open_main':
                // Переходим в главное меню, скрывая настройки если они открыты
                if (currentView === 'settings') {
                    const mainContainer = document.getElementById('main-container');
                    const settingsDiv = document.getElementById('settings');
                    mainContainer.style.display = 'flex';
                    settingsDiv.style.display = 'none';
                    currentView = 'main';
                }
                // Скрываем кнопку Back в Telegram
                if (window.tg) {
                    window.tg.BackButton.hide();
                }
                break;
            case 'open_settings':
                document.getElementById('open-settings').click();
                break;
            case 'next_prayer':
                // Показываем modal со следующим намазом БЕЗ скрытия главной кнопки
                const nextKey = getNextPrayerInfo().key;
                if (nextKey) showPrayerModal(nextKey);
                break;
        }
    });
}