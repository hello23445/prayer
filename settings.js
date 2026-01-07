// settings.js
const mainContainer = document.getElementById('main-container');
const settingsDiv = document.getElementById('settings');
const openSettingsBtn = document.getElementById('open-settings');
const closeSettingsBtn = document.getElementById('close-settings');
const saveSettingsBtn = document.getElementById('save-settings');

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
    });
}

if (saveSettingsBtn && mainContainer && settingsDiv) {
    saveSettingsBtn.addEventListener('click', () => {
        saveSettings();
        const langSelect = document.getElementById('lang-select');
        const themeSelect = document.getElementById('theme-select');
        if (langSelect) applyLang(langSelect.value);
        if (themeSelect) applyTheme(themeSelect.value);
        updateTranscriptionAndTranslation();
        mainContainer.style.display = 'flex';
        settingsDiv.style.display = 'none';
    });
}

const transToggle = document.getElementById('transcription-toggle');
const translToggle = document.getElementById('translation-toggle');
const langSelectEl = document.getElementById('lang-select');
if (transToggle) {
    transToggle.addEventListener('click', () => {
        transcriptionEnabled = !transcriptionEnabled;
        updateToggleIcons();
        updateTranscriptionAndTranslation();
    });
}
if (translToggle) {
    translToggle.addEventListener('click', () => {
        translationEnabled = !translationEnabled;
        updateToggleIcons();
        updateTranscriptionAndTranslation();
    });
}
if (langSelectEl) {
    langSelectEl.addEventListener('change', (e) => {
        applyLang(e.target.value);
    });
}

function saveSettings() {
    const settings = {
        theme: (document.getElementById('theme-select') ? document.getElementById('theme-select').value : 'system'),
        lang: (document.getElementById('lang-select') ? document.getElementById('lang-select').value : 'ru'),
        voice: (document.getElementById('voice-select') ? document.getElementById('voice-select').value : ''),
        errorSound: (document.getElementById('error-sound-select') ? document.getElementById('error-sound-select').value : 'beep'),
        transcriptionEnabled,
        translationEnabled
    };
    localStorage.setItem('namazSettings', JSON.stringify(settings));
}

function loadSettings() {
    const saved = localStorage.getItem('namazSettings');
    if (saved) {
        const settings = JSON.parse(saved);
        const themeSel = document.getElementById('theme-select');
        const langSel = document.getElementById('lang-select');
        const voiceSel = document.getElementById('voice-select');
        const errorSel = document.getElementById('error-sound-select');
        if (themeSel) themeSel.value = settings.theme || 'system';
        applyTheme(settings.theme || 'system');
        if (langSel) langSel.value = settings.lang || 'ru';
        applyLang(settings.lang || 'ru');
        if (voiceSel) voiceSel.value = settings.voice || '';
        if (settings.voice && typeof voices !== 'undefined') currentVoice = voices.find(v => v.name === settings.voice);
        if (errorSel) errorSel.value = settings.errorSound || 'beep';
        transcriptionEnabled = settings.transcriptionEnabled !== undefined ? settings.transcriptionEnabled : true;
        translationEnabled = settings.translationEnabled !== undefined ? settings.translationEnabled : true;
        updateToggleIcons();
    } else {
        applyTheme('system');
        applyLang('ru');
        transcriptionEnabled = true;
        translationEnabled = true;
        updateToggleIcons();
    }
}