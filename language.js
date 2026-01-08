// language.js
// language.js (обновлённый — убраны вызовы loadVoices)
// Use existing global if present to avoid redeclaration errors
window.currentLang = window.currentLang || 'ru';

const langNames = {
    'ru': { 'ru': 'Русский', 'en': 'Russian', 'az': 'Rus dili' },
    'az': { 'ru': 'Азербайджанский', 'en': 'Azerbaijani', 'az': 'Azərbaycan dili' },
    'en': { 'ru': 'Английский', 'en': 'English', 'az': 'Ingilis dili' }
};

function getLangCode(lang) {
    const codes = { ru: 'ru', az: 'az', en: 'en' };
    return codes[lang];
}

function applyLang(lang) {
    currentLang = lang;
    const t = translations[lang];
    document.getElementById('title').textContent = t.title;
    updatePrayerButtons();
    document.getElementById('user-text').placeholder = t.userTextPlaceholder;
    document.getElementById('settings-title').textContent = t.settingsTitle;
    document.getElementById('theme-label').textContent = t.themeLabel;
    const themeSelect = document.getElementById('theme-select');
    themeSelect.options[0].textContent = t.systemTheme;
    themeSelect.options[1].textContent = t.lightTheme;
    themeSelect.options[2].textContent = t.darkTheme;
    document.getElementById('lang-label').textContent = t.langLabel;
    document.getElementById('error-sound-label').textContent = t.errorSoundLabel;
    const errorSoundSelect = document.getElementById('error-sound-select');
    errorSoundSelect.options[0].textContent = t.noneSound;
    errorSoundSelect.options[1].textContent = t.beepSound;
    errorSoundSelect.options[2].textContent = t.buzzSound;
    document.getElementById('transcription-toggle-label').textContent = t.transcriptionToggle;
    document.getElementById('translation-toggle-label').textContent = t.translationToggle;
    document.getElementById('save-settings').textContent = t.saveSettings;

    // Обновление селекта языка
    const langSelect = document.getElementById('lang-select');
    Array.from(langSelect.options).forEach(option => {
        const val = option.value;
        const native = langNames[val][val];
        if (val === lang) {
            option.textContent = native;
        } else {
            const trans = langNames[val][lang];
            option.textContent = `${native} (${trans})`;
        }
    });

    updateTranscriptionAndTranslation();
}

function updatePrayerButtons() {
    document.querySelectorAll('.prayer-btn').forEach(btn => {
        btn.textContent = translations[currentLang][btn.dataset.value];
    });
}