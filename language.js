// language.js
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
    const titleEl = document.getElementById('title');
    if (titleEl) titleEl.textContent = t.title;
    updatePrayerButtons();
    const userTextEl = document.getElementById('user-text');
    if (userTextEl) userTextEl.placeholder = t.userTextPlaceholder;
    const settingsTitleEl = document.getElementById('settings-title');
    if (settingsTitleEl) settingsTitleEl.textContent = t.settingsTitle;
    const themeLabelEl = document.getElementById('theme-label');
    if (themeLabelEl) themeLabelEl.textContent = t.themeLabel;
    const themeSelect = document.getElementById('theme-select');
    if (themeSelect) {
        themeSelect.options[0].textContent = t.systemTheme;
        themeSelect.options[1].textContent = t.lightTheme;
        themeSelect.options[2].textContent = t.darkTheme;
    }
    const langLabelEl = document.getElementById('lang-label');
    if (langLabelEl) langLabelEl.textContent = t.langLabel;
    const transcriptionLangLabelEl = document.getElementById('transcription-lang-label');
    if (transcriptionLangLabelEl) transcriptionLangLabelEl.textContent = t.transcriptionLangLabel;
    const transcriptionLangSelect = document.getElementById('transcription-lang-select');
    if (transcriptionLangSelect) {
        transcriptionLangSelect.options[0].textContent = t.latinScript;
        transcriptionLangSelect.options[1].textContent = t.cyrillicRuScript;
        transcriptionLangSelect.options[2].textContent = t.cyrillicKzScript;
    }
    const errorSoundLabelEl = document.getElementById('error-sound-label');
    if (errorSoundLabelEl) errorSoundLabelEl.textContent = t.errorSoundLabel;
    const errorSoundSelect = document.getElementById('error-sound-select');
    if (errorSoundSelect) {
        errorSoundSelect.options[0].textContent = t.noneSound;
        errorSoundSelect.options[1].textContent = t.beepSound;
        errorSoundSelect.options[2].textContent = t.buzzSound;
    }
    const transcriptionToggleLabelEl = document.getElementById('transcription-toggle-label');
    if (transcriptionToggleLabelEl) transcriptionToggleLabelEl.textContent = t.transcriptionToggle;
    const translationToggleLabelEl = document.getElementById('translation-toggle-label');
    if (translationToggleLabelEl) translationToggleLabelEl.textContent = t.translationToggle;
    const saveSettingsEl = document.getElementById('save-settings');
    if (saveSettingsEl) saveSettingsEl.textContent = t.saveSettings;
    const geoPromptEl = document.getElementById('geo-prompt');
    if (geoPromptEl) geoPromptEl.textContent = t.geoPrompt;
    const notifyPromptEl = document.getElementById('notify-prompt');
    if (notifyPromptEl) notifyPromptEl.textContent = t.notifyPrompt;
    const micPromptEl = document.getElementById('mic-prompt');
    if (micPromptEl) micPromptEl.textContent = t.micPrompt;
    const reminderLabelEl = document.getElementById('reminder-label');
    if (reminderLabelEl) reminderLabelEl.textContent = t.reminderLabel;
    const remindersTitleEl = document.getElementById('reminders-title');
    if (remindersTitleEl) remindersTitleEl.textContent = t.remindersTitle;
    const asrMethodLabelEl = document.getElementById('asr-method-label');
    if (asrMethodLabelEl) asrMethodLabelEl.textContent = t.asrMethodLabel;
    const asrMethodLabelModalEl = document.getElementById('asr-method-label-modal');
    if (asrMethodLabelModalEl) asrMethodLabelModalEl.textContent = t.asrMethodLabel;
    const asrMethodSelect = document.getElementById('asr-method-select');
    if (asrMethodSelect) {
        asrMethodSelect.options[0].textContent = t.hanafiMethod;
        asrMethodSelect.options[1].textContent = t.standardMethod;
    }
    const asrMethodSelectModal = document.getElementById('asr-method-select-modal');
    if (asrMethodSelectModal) {
        asrMethodSelectModal.options[0].textContent = t.hanafiMethod;
        asrMethodSelectModal.options[1].textContent = t.standardMethod;
    }
    const langSelect = document.getElementById('lang-select');
    if (langSelect) {
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
    }
    updateTranscriptionAndTranslation();
}
function updatePrayerButtons() {
    document.querySelectorAll('.prayer-btn').forEach(btn => {
        const value = btn.dataset.value;
        let text = translations[currentLang][value];
        if (prayerTimes && prayerTimes[value]) {
            const time = prayerTimes[value];
            const hhmm = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
            text += ` (${hhmm})`;
        }
        btn.textContent = text;
    });
}