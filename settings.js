// settings.js
const mainContainer = document.getElementById('main-container');
const settingsDiv = document.getElementById('settings');
const openSettingsBtn = document.getElementById('open-settings');
const closeSettingsBtn = document.getElementById('close-settings');
const asrMethodSelect = document.getElementById('asr-method-select');
const langSelectEl = document.getElementById('lang-select');
const themeSelect = document.getElementById('theme-select');
const transcriptionLangSelectEl = document.getElementById('transcription-lang-select');
const errorSoundSelect = document.getElementById('error-sound-select');
const playErrorSoundBtn = document.getElementById('play-error-sound');
const micVolume = document.getElementById('mic-volume');
const errorVolume = document.getElementById('error-volume');
if (openSettingsBtn && mainContainer && settingsDiv) {
    openSettingsBtn.addEventListener('click', () => {
        mainContainer.style.display = 'none';
        settingsDiv.style.display = 'block';
    });
}
if (closeSettingsBtn && mainContainer && settingsDiv) {
    closeSettingsBtn.addEventListener('click', () => {
        mainContainer.style.display = 'flex';
        settingsDiv.style.display = 'none';
        saveSettings();
        stopMicTest();
        document.getElementById('test-mic').textContent = translations[currentLang].testMic;
    });
}
if (playErrorSoundBtn) {
    playErrorSoundBtn.addEventListener('click', () => {
        const errorSound = document.getElementById('error-sound-select').value;
        playErrorSound(errorSound);
    });
}
if (asrMethodSelect) {
    asrMethodSelect.addEventListener('change', (e) => {
        asrMethod = e.target.value;
        if (coordinates) {
            calculatePrayerTimes(coordinates.lat, coordinates.lng);
        }
        document.getElementById('asr-method-select-modal').value = asrMethod;
        saveSettings();
    });
}
if (langSelectEl) {
    langSelectEl.addEventListener('change', (e) => {
        applyLang(e.target.value);
        saveSettings();
    });
}
if (themeSelect) {
    themeSelect.addEventListener('change', (e) => {
        applyTheme(e.target.value);
        saveSettings();
    });
}
if (transcriptionLangSelectEl) {
    transcriptionLangSelectEl.addEventListener('change', (e) => {
        transcriptionLang = e.target.value;
        saveSettings();
    });
}
if (errorSoundSelect) {
    errorSoundSelect.addEventListener('change', (e) => {
        saveSettings();
    });
}
const transToggle = document.getElementById('transcription-toggle');
const translToggle = document.getElementById('translation-toggle');
if (transToggle) {
    transToggle.addEventListener('click', () => {
        transcriptionEnabled = !transcriptionEnabled;
        updateToggleIcons();
        saveSettings();
    });
}
if (translToggle) {
    translToggle.addEventListener('click', () => {
        translationEnabled = !translationEnabled;
        updateToggleIcons();
        saveSettings();
    });
}
function saveSettings() {
    const settings = {
        theme: (document.getElementById('theme-select') ? document.getElementById('theme-select').value : 'system'),
        lang: (document.getElementById('lang-select') ? document.getElementById('lang-select').value : 'ru'),
        transcriptionLang: (document.getElementById('transcription-lang-select') ? document.getElementById('transcription-lang-select').value : 'latin'),
        errorSound: (document.getElementById('error-sound-select') ? document.getElementById('error-sound-select').value : 'beep'),
        micVolume: (document.getElementById('mic-volume') ? document.getElementById('mic-volume').value : 100),
        errorVolume: (document.getElementById('error-volume') ? document.getElementById('error-volume').value : 100),
        transcriptionEnabled,
        translationEnabled,
        asrMethod: (document.getElementById('asr-method-select') ? document.getElementById('asr-method-select').value : 'standard')
    };
    localStorage.setItem('namazSettings', JSON.stringify(settings));
    updateErrorSoundOptions(settings.errorVolume);
}
function loadSettings() {
    const saved = localStorage.getItem('namazSettings');
    if (saved) {
        const settings = JSON.parse(saved);
        const themeSel = document.getElementById('theme-select');
        const langSel = document.getElementById('lang-select');
        const transcriptionLangSel = document.getElementById('transcription-lang-select');
        const errorSel = document.getElementById('error-sound-select');
        const asrSel = document.getElementById('asr-method-select');
        const micVol = document.getElementById('mic-volume');
        const errorVol = document.getElementById('error-volume');
        if (themeSel) themeSel.value = settings.theme || 'system';
        applyTheme(settings.theme || 'system');
        if (langSel) langSel.value = settings.lang || 'ru';
        applyLang(settings.lang || 'ru');
        if (transcriptionLangSel) transcriptionLangSel.value = settings.transcriptionLang || 'latin';
        transcriptionLang = settings.transcriptionLang || 'latin';
        if (errorSel) errorSel.value = settings.errorSound || 'none'; // Default off
        if (asrSel) asrSel.value = settings.asrMethod || 'standard';
        asrMethod = settings.asrMethod || 'standard';
        if (micVol) micVol.value = settings.micVolume || 100;
        document.getElementById('mic-volume-shower').value = micVol.value;
        if (errorVol) errorVol.value = settings.errorVolume || 100;
        document.getElementById('error-volume-shower').value = errorVol.value;
        transcriptionEnabled = settings.transcriptionEnabled !== undefined ? settings.transcriptionEnabled : true;
        translationEnabled = settings.translationEnabled !== undefined ? settings.translationEnabled : true;
        updateToggleIcons();
        updateErrorSoundOptions(settings.errorVolume);
        localStorage.setItem('lang1', document.getElementById('lang-select').value);
        if (errorSoundSelect.value === 'none'){
            document.getElementById('play-error-sound').disabled = true
            document.getElementById('error-volume-shower').disabled = true;
            errorSoundSelect.value = 'none';
            range.disabled = true
        }
        else{
            document.getElementById('play-error-sound').disabled = false;
            document.getElementById('error-volume-shower').disabled = false;
            this.value = 'beep';
            range.disabled = false;
        }
    } else {
        applyTheme('system');
        applyLang('ru');
        transcriptionEnabled = true;
        translationEnabled = true;
        updateToggleIcons();
        updateErrorSoundOptions(100);
    }
}
function updateErrorSoundOptions(volume) {
    const errorSoundSelect = document.getElementById('error-sound-select');
    const t = translations[currentLang];
    if (volume == 0) {
        errorSoundSelect.options[0].textContent = t.noneSound;
    } else {
        errorSoundSelect.options[1].textContent = t.beepSound;
    }
}
let audioStream = null;
let analyser = null;
let gainNode = null;
let rafId = null;
async function startMicTest() {
    if (audioStream) return;
    try {
        audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const context = new AudioContext();
        const source = context.createMediaStreamSource(audioStream);
        gainNode = context.createGain();
        gainNode.gain.value = document.getElementById('mic-volume').value / 100;
        source.connect(gainNode);
        analyser = context.createAnalyser();
        analyser.fftSize = 256;
        gainNode.connect(analyser);
        drawLevel();
    } catch (err) {
        console.error('Ошибка доступа к микрофону', err);
    }
}
function drawLevel() {
    if (!analyser) return;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
    const avg = sum / bufferLength;
    const percent = Math.min(100, (avg / 255) * 300); // усиление для видимости
    document.getElementById('level-bar').style.width = percent + '%';
    rafId = requestAnimationFrame(drawLevel);
}
function stopMicTest() {
    if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
        audioStream = null;
    }
    if (rafId) cancelAnimationFrame(rafId);
    document.getElementById('level-bar').style.width = '0%';
}
// События
document.getElementById('test-mic').addEventListener('click', () => {
    const btn = document.getElementById('test-mic');
    if (audioStream) {
        stopMicTest();
        btn.textContent = translations[currentLang].testMic;
    } else {
        startMicTest();
        btn.textContent = translations[currentLang].testMicStop;
    }
});
document.getElementById('mic-volume').addEventListener('input', e => {
    if (gainNode) gainNode.gain.value = e.target.value / 100;
});
micVolume.addEventListener('input', () => {
    document.getElementById('mic-volume-shower').value = micVolume.value;
    saveSettings();
});

document.getElementById('mic-volume-shower').addEventListener('input', () => {
    document.getElementById('mic-volume').value = document.getElementById('mic-volume-shower').value;
});

document.getElementById('mic-volume-shower').addEventListener('change', () => {
    if (document.getElementById('mic-volume-shower').value === '') {
        document.getElementById('mic-volume').value = 100;
        document.getElementById('mic-volume-shower').value = 100;
    }
});
errorVolume.addEventListener('input', () => {
    saveSettings();
    document.getElementById('error-volume-shower').value = errorVolume.value
});
const btn = document.getElementById('play-error-sound');

const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        if (mutation.attributeName === 'disabled') {
            console.log('disabled изменён:', btn.disabled);

            if (btn.disabled) {
                btn.style.background = 'gray';
            } else {
                btn.style.background = '';
            }
        }
    });
});

observer.observe(btn, {
    attributes: true,
    attributeFilter: ['disabled']
});
