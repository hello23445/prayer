// language.js
window.currentLang = window.currentLang || 'ru';
const langNames = {
    'ru': { 'ru': 'Русский', 'en': 'Russian', 'az': 'Rus dili' },
    'az': { 'ru': 'Азербайджанский', 'en': 'Azerbaijani', 'az': 'Azərbaycan dili' },
    'en': { 'ru': 'Английский', 'en': 'English', 'az': 'Ingilis dili' }
};
const months = {
    ru: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
    az: ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avqust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
};
function getLangCode(lang) {
    const codes = { ru: 'ru', az: 'az', en: 'en' };
    return codes[lang];
}
function applyLang(lang) {
    currentLang = lang;
    const t = translations[lang];
    document.title = t.title || 'Намаз';
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
    }
    const transcriptionToggleLabelEl = document.getElementById('transcription-toggle-label');
    if (transcriptionToggleLabelEl) transcriptionToggleLabelEl.textContent = t.transcriptionToggle;
    const translationToggleLabelEl = document.getElementById('translation-toggle-label');
    if (translationToggleLabelEl) translationToggleLabelEl.textContent = t.translationToggle;
    const mainButtonToggleLabelEl = document.getElementById('main-button-toggle-label');
    if (mainButtonToggleLabelEl) mainButtonToggleLabelEl.textContent = t.addMainButton;
    const whereShowLabelEl = document.getElementById('where-show-label');
    if (whereShowLabelEl) whereShowLabelEl.textContent = t.whereShowMainButton;
    const whereShowSelect = document.getElementById('where-show-select');
    if (whereShowSelect) {
        whereShowSelect.options[0].textContent = t.inMainMenu;
        whereShowSelect.options[1].textContent = t.inSettings;
        whereShowSelect.options[2].textContent = t.inBoth;
    }
    const onPressLabelEl = document.getElementById('on-press-label');
    if (onPressLabelEl) onPressLabelEl.textContent = t.onMainButtonPress;
    const onPressSelect = document.getElementById('on-press-select');
    if (onPressSelect) {
        onPressSelect.options[0].textContent = t.openMainMenu;
        onPressSelect.options[1].textContent = t.openSettings;
        onPressSelect.options[2].textContent = t.goNextPrayer;
    }
    const saveSettingsEl = document.getElementById('save-settings');
    if (saveSettingsEl) saveSettingsEl.textContent = t.saveSettings;
    const geoPromptEl = document.getElementById('geo-prompt');
    if (geoPromptEl) geoPromptEl.textContent = t.geoPrompt;
    const micPromptEl = document.getElementById('mic-prompt');
    if (micPromptEl) micPromptEl.textContent = t.micPrompt;
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
    if (document.getElementById('mic-volume-label')) document.getElementById('mic-volume-label').textContent = t.micVolumeLabel;
    if (document.getElementById('test-mic')) document.getElementById('test-mic').textContent = t.testMic;
    if (document.getElementById('continue-btn')) document.getElementById('continue-btn').textContent = t.continueBtn;
    if (document.getElementById('geo-yes')) document.getElementById('geo-yes').textContent = t.allowBtn;
    if (document.getElementById('mic-yes')) document.getElementById('mic-yes').textContent = t.allowBtn;
    if (document.getElementById('error-volume-label')) document.getElementById('error-volume-label').textContent = t.errorVolumeLabel;
    updateTranscriptionAndTranslation();
    updateDateDisplay();
    updateButtonTitles();
    // Update view mode
    const viewModeLabelEl = document.getElementById('view-mode-label');
    if (viewModeLabelEl) viewModeLabelEl.textContent = t.viewModeLabel;
    const viewModeSelect = document.getElementById('view-mode-select');
    if (viewModeSelect) {
        viewModeSelect.options[0].textContent = t.normalView;
        viewModeSelect.options[1].textContent = t.fullscreenView;
    }
    // Update section headings
    const languageSectionEl = document.getElementById('language-section');
    if (languageSectionEl) languageSectionEl.textContent = t.languageSection;
    const volumeSectionEl = document.getElementById('volume-section');
    if (volumeSectionEl) volumeSectionEl.textContent = t.volumeSection;
    const otherParamsSectionEl = document.getElementById('other-params-section');
    if (otherParamsSectionEl) otherParamsSectionEl.textContent = t.otherParamsSection;
    const appViewSectionEl = document.getElementById('app-view-section');
    if (appViewSectionEl) appViewSectionEl.textContent = t.appViewSection;
    if (!window.Telegram?.WebApp) {
        document.getElementById('view-mode-label').textContent = t.viewDisabled;
        document.getElementById('view-mode-select').disabled = true;
    }
    
    // Update button color labels
    const buttonColorLabel = document.getElementById('button-color-label');
    if (buttonColorLabel) buttonColorLabel.textContent = t.buttonColorLabel;
    const buttonTextColorLabel = document.getElementById('button-text-color-label');
    if (buttonTextColorLabel) buttonTextColorLabel.textContent = t.buttonTextColorLabel;
    
    manageMainButton(); // Update Main Button text on lang change
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
async function updateLocationDisplay() {
    if (coordinates) {
        userLocationName = await getLocationName(coordinates.lat, coordinates.lng);
        const t = translations[currentLang];
        document.getElementById('location-info').innerHTML = `<i class="fa-solid fa-location-arrow fa-2xs icon"></i> ${userLocationName}`;
    }
}
function updateDateDisplay() {
    const date = new Date();
    const day = date.getDate();
    const monthIndex = date.getMonth();
    const year = date.getFullYear();
    const monthName = months[currentLang][monthIndex];
    const dateStr = `${day} ${monthName} ${year}`;
    document.getElementById('date-info').textContent = dateStr;
}
function updateButtonTitles() {
    const t = translations[currentLang];
    // ... (остальные кнопки без изменений)
    const updateLocationBtn = document.getElementById('update-location');
    if (updateLocationBtn) updateLocationBtn.title = t.updateLocationTitle;
    const closeLocationModalBtn = document.getElementById('close-location-modal');
    if (closeLocationModalBtn) closeLocationModalBtn.title = t.closeLocationModalTitle;
    document.querySelectorAll('button').forEach(btn => {
        const id = btn.id;
        if (id === 'open-settings') {
            btn.title = t.openSettingsTitle;
        } else if (id === 'back-btn') {
            btn.title = t.backBtnTitle;
        } else if (id === 'audio-btn') {
            btn.title = t.audioBtnTitle;
        } else if (id === 'stop-btn') {
            btn.title = t.stopBtnTitle;
        } else if (id === 'close-settings') {
            btn.title = t.closeSettingsTitle;
        } else if (id === 'play-error-sound') {
            btn.title = t.playErrorSoundTitle;
        } else if (id === 'test-mic') {
            btn.title = t.testMicTitle;
        } else if (id === 'geo-yes') {
            btn.title = t.geoYesTitle;
        } else if (id === 'mic-yes') {
            btn.title = t.micYesTitle;
        } else if (id === 'modal-back') {
            btn.title = t.modalBackTitle;
        } else if (id === 'continue-btn') {
            btn.title = t.continueBtnTitle;
        } else if (btn.classList.contains('prayer-btn')) {
            const value = btn.dataset.value;
            btn.title = t[value + 'Title'];
        }
    });
}