// main_button.js
// Main Button Management for Telegram WebApp
let mainButtonEnabled = false;
let mainButtonLocation = 'main';
let mainButtonAction = 'main-menu';
let nextPrayerUpdateInterval = null;

// Prayer times object
const prayerNames = {
    fajr: { en: 'Fajr', ru: 'Фаджр', az: 'Sübh' },
    dhuhr: { en: 'Dhuhr', ru: 'Зухр', az: 'Zöhr' },
    asr: { en: 'Asr', ru: 'Аср', az: 'Əsr' },
    maghrib: { en: 'Maghrib', ru: 'Магриб', az: 'Məğrib' },
    isha: { en: 'Isha', ru: 'Иша', az: 'İşə' }
};

const prayerOrder = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

// Find next prayer and calculate time remaining
function getNextPrayer() {
    if (!prayerTimes) return null;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    // Check each prayer time
    for (let prayer of prayerOrder) {
        const prayerTimeObj = prayerTimes[prayer];
        
        if (!prayerTimeObj) continue;
        
        // Handle both string and Date formats
        let prayerHours, prayerMinutes;
        
        if (typeof prayerTimeObj === 'string') {
            // String format like "05:30"
            try {
                const [hours, minutes] = prayerTimeObj.split(':').map(Number);
                prayerHours = hours;
                prayerMinutes = minutes;
            } catch (e) {
                console.error('Error parsing prayer time string:', prayerTimeObj, e);
                continue;
            }
        } else if (prayerTimeObj instanceof Date) {
            // Date object format
            prayerHours = prayerTimeObj.getHours();
            prayerMinutes = prayerTimeObj.getMinutes();
        } else {
            console.warn('Unknown prayer time format:', prayer, prayerTimeObj);
            continue;
        }
        
        const prayerTime = prayerHours * 60 + prayerMinutes;
        const timeStr = `${String(prayerHours).padStart(2, '0')}:${String(prayerMinutes).padStart(2, '0')}`;

        if (prayerTime > currentTime) {
            const today = new Date();
            const timeObj = new Date(today.getFullYear(), today.getMonth(), today.getDate(), prayerHours, prayerMinutes);
            
            return {
                name: prayer,
                time: timeStr,
                timeObj: timeObj
            };
        }
    }

    // If no prayer found today, next is Fajr tomorrow
    const fajrTimeObj = prayerTimes.fajr;
    if (!fajrTimeObj) return null;
    
    let fajrTime = '';
    if (typeof fajrTimeObj === 'string') {
        fajrTime = fajrTimeObj;
    } else if (fajrTimeObj instanceof Date) {
        fajrTime = `${String(fajrTimeObj.getHours()).padStart(2, '0')}:${String(fajrTimeObj.getMinutes()).padStart(2, '0')}`;
    } else {
        return null;
    }
    
    return {
        name: 'fajr',
        time: fajrTime,
        isNext: true // Flag to indicate it's tomorrow
    };
}

// Format time remaining HH:MM:SS
function formatTimeRemaining(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Update main button text and appearance
function updateMainButton() {
    if (!window.Telegram || !window.Telegram.WebApp) return;

    const tg = window.Telegram.WebApp;

    if (!mainButtonEnabled) {
        tg.MainButton.hide();
        clearInterval(nextPrayerUpdateInterval);
        return;
    }
    
    let buttonText = '';

    switch (mainButtonAction) {
        case 'main-menu':
            buttonText = translations[currentLang].mainButtonTextMainMenu;
            break;
        case 'settings':
            buttonText = translations[currentLang].mainButtonTextSettings;
            break;
        case 'back':
            buttonText = translations[currentLang].mainButtonTextBack;
            break;
        case 'next-prayer':
            const nextPrayer = getNextPrayer();
            if (nextPrayer) {
                const prayerName = prayerNames[nextPrayer.name]?.[currentLang] || nextPrayer.name;
                const now = new Date();
                let prayerTimeObj;

                if (nextPrayer.isNext) {
                    // Tomorrow
                    const tomorrow = new Date(now);
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    if (!nextPrayer.time || typeof nextPrayer.time !== 'string') {
                        console.error('Invalid prayer time:', nextPrayer);
                        break;
                    }
                    const parts = nextPrayer.time.split(':');
                    if (parts.length !== 2) {
                        console.error('Invalid prayer time format:', nextPrayer.time);
                        break;
                    }
                    const [h, m] = parts.map(Number);
                    prayerTimeObj = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), h, m);
                } else {
                    prayerTimeObj = nextPrayer.timeObj;
                }

                const timeRemaining = formatTimeRemaining(prayerTimeObj - now);
                buttonText = `${prayerName}:${nextPrayer.time} (${timeRemaining})`;

                // Update every second
                if (nextPrayerUpdateInterval) {
                    clearInterval(nextPrayerUpdateInterval);
                }
                nextPrayerUpdateInterval = setInterval(() => {
                    updateMainButton();
                }, 1000);
            }
            break;
    }

    if (buttonText) {
        tg.MainButton.setText(buttonText);
        tg.MainButton.show();
    }
}

// Handle main button press
function onMainButtonPressed() {
    if (!window.Telegram || !window.Telegram.WebApp) return;

    const tg = window.Telegram.WebApp;
    const mainContainer = document.getElementById('main-container');
    const settingsDiv = document.getElementById('settings');
    const prayerWindow = document.getElementById('prayer-window');

    switch (mainButtonAction) {
        case 'main-menu':
            if (settingsDiv.style.display === 'block') {
                mainContainer.style.display = 'flex';
                settingsDiv.style.display = 'none';
                if (typeof saveSettings === 'function') saveSettings();
                if (typeof stopMicTest === 'function') stopMicTest();
                tg.BackButton.hide();
                tg.SettingsButton.show();
            } else if (prayerWindow.style.display === 'block') {
                prayerWindow.style.display = 'none';
                document.getElementById('prayer-menu').style.display = 'flex';
                document.getElementById('history').innerHTML = '';
                document.getElementById('user-text').value = '';
                document.getElementById('feedback').style.display = 'none';
                document.getElementById('open-settings').style.display = 'block';
                document.getElementById('location-info').style.display = 'block';
                document.getElementById('date-info').style.display = 'block';
                mainContainer.classList.remove('full-screen');
                tg.BackButton.hide();
                tg.SettingsButton.show();
            }
            break;

        case 'settings':
            if (mainContainer.style.display === 'flex' || prayerWindow.style.display === 'block') {
                mainContainer.style.display = 'none';
                settingsDiv.style.display = 'block';
                tg.BackButton.show();
                tg.SettingsButton.hide();
            }
            break;

        case 'back':
            if (prayerWindow.style.display === 'block') {
                prayerWindow.style.display = 'none';
                document.getElementById('prayer-menu').style.display = 'flex';
                document.getElementById('history').innerHTML = '';
                document.getElementById('user-text').value = '';
                document.getElementById('feedback').style.display = 'none';
                document.getElementById('open-settings').style.display = 'block';
                document.getElementById('location-info').style.display = 'block';
                document.getElementById('date-info').style.display = 'block';
                mainContainer.classList.remove('full-screen');
                tg.BackButton.hide();
                tg.SettingsButton.show();
            } else if (settingsDiv.style.display === 'block') {
                mainContainer.style.display = 'flex';
                settingsDiv.style.display = 'none';
                if (typeof saveSettings === 'function') saveSettings();
                if (typeof stopMicTest === 'function') stopMicTest();
                tg.BackButton.hide();
                tg.SettingsButton.show();
            }
            break;

        case 'next-prayer':
            const nextPrayer = getNextPrayer();
            if (nextPrayer && currentPrayer) {
                currentPrayer = words[nextPrayer.name.charAt(0).toUpperCase() + nextPrayer.name.slice(1)];
                if (prayerTimes) {
                    showPrayerModal(nextPrayer.name);
                }
            }
            break;
    }
}

// Setup main button event listener
function setupMainButton() {
    if (!window.Telegram || !window.Telegram.WebApp) return;

    const tg = window.Telegram.WebApp;
    
    // Listen for main button press
    tg.onEvent('mainButtonClicked', onMainButtonPressed);

    // Initial update
    updateMainButton();
}

// Initialize main button when page loads
document.addEventListener('DOMContentLoaded', () => {
    setupMainButton();
});





