// support.js
// Функция для открытия ссылки в Telegram
function openTelegramLink(url) {
    if (window.tg) {
        window.tg.openTelegramLink(url);
    } else {
        window.open(url);
    }
}

// Инициализация кнопок поддержки
function initSupportButtons() {
    const supportServiceBtn = document.getElementById('support-service-btn');
    const suggestIdeaBtn = document.getElementById('suggest-idea-btn');
    const askQuestionBtn = document.getElementById('ask-question-btn');

    if (supportServiceBtn) {
        supportServiceBtn.addEventListener('click', () => {
            const url = `https://t.me/QuranAppSupport_bot?start=support_${currentLang}`;
            openTelegramLink(url);
        });
    }

    if (suggestIdeaBtn) {
        suggestIdeaBtn.addEventListener('click', () => {
            const url = `https://t.me/QuranAppSupport_bot?start=idea__${currentLang}`;
            openTelegramLink(url);
        });
    }

    if (askQuestionBtn) {
        askQuestionBtn.addEventListener('click', () => {
            const url = `https://t.me/QuranAppSupport_bot?start=ask__${currentLang}`;
            openTelegramLink(url);
        });
    }
}

// Сброс цветов кнопок
function initResetColorButtons() {
    const resetButtonColorBtn = document.getElementById('reset-button-color');
    const resetButtonTextColorBtn = document.getElementById('reset-button-text-color');
    const buttonColorInput = document.getElementById('button-color-input');
    const buttonTextColorInput = document.getElementById('button-text-color-input');
    const resetConfirmModal = document.getElementById('reset-confirm-modal');
    const resetConfirmYes = document.getElementById('reset-confirm-yes');
    const resetConfirmNo = document.getElementById('reset-confirm-no');
    let resetType = null;

    function showResetConfirm(type) {
        resetType = type;
        resetConfirmModal.style.display = 'flex';
    }

    function hideResetConfirm() {
        resetConfirmModal.style.display = 'none';
        resetType = null;
    }

    if (resetButtonColorBtn && buttonColorInput) {
        resetButtonColorBtn.addEventListener('click', () => {
            showResetConfirm('color');
        });
    }

    if (resetButtonTextColorBtn && buttonTextColorInput) {
        resetButtonTextColorBtn.addEventListener('click', () => {
            showResetConfirm('textColor');
        });
    }

    if (resetConfirmYes) {
        resetConfirmYes.addEventListener('click', () => {
            if (resetType === 'color') {
                buttonColorInput.value = '#0088cc';
                buttonColorInput.dispatchEvent(new Event('change'));
            } else if (resetType === 'textColor') {
                buttonTextColorInput.value = '#ffffff';
                buttonTextColorInput.dispatchEvent(new Event('change'));
            }
            hideResetConfirm();
        });
    }

    if (resetConfirmNo) {
        resetConfirmNo.addEventListener('click', hideResetConfirm);
    }
}

// Консоль приложения
let consoleMessages = [];
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;
const originalInfo = console.info;

function captureConsole() {
    console.log = function(...args) {
        originalLog(...args);
        const message = args.map(arg => {
            try {
                return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
            } catch (e) {
                return String(arg);
            }
        }).join(' ');
        consoleMessages.push({
            type: 'log',
            message: message,
            time: new Date().toLocaleTimeString()
        });
        updateConsoleDisplay();
    };

    console.error = function(...args) {
        originalError(...args);
        const message = args.map(arg => {
            try {
                return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
            } catch (e) {
                return String(arg);
            }
        }).join(' ');
        consoleMessages.push({
            type: 'error',
            message: message,
            time: new Date().toLocaleTimeString()
        });
        updateConsoleDisplay();
    };

    console.warn = function(...args) {
        originalWarn(...args);
        const message = args.map(arg => {
            try {
                return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
            } catch (e) {
                return String(arg);
            }
        }).join(' ');
        consoleMessages.push({
            type: 'warn',
            message: message,
            time: new Date().toLocaleTimeString()
        });
        updateConsoleDisplay();
    };

    console.info = function(...args) {
        originalInfo(...args);
        const message = args.map(arg => {
            try {
                return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
            } catch (e) {
                return String(arg);
            }
        }).join(' ');
        consoleMessages.push({
            type: 'info',
            message: message,
            time: new Date().toLocaleTimeString()
        });
        updateConsoleDisplay();
    };
}

function updateConsoleDisplay() {
    const consoleOutput = document.getElementById('console-output');
    const consoleStatus = document.getElementById('console-status');
    
    if (!consoleOutput) return;

    const errorCount = consoleMessages.filter(msg => msg.type === 'error').length;
    const t = translations[currentLang] || {};
    
    if (consoleStatus) {
        consoleStatus.textContent = `${t.problemsDetected || 'Problems detected:'} ${errorCount}`;
    }

    consoleOutput.innerHTML = consoleMessages.map(msg => {
        let color = '#ecf0f1';
        let typeLabel = '';
        
        if (msg.type === 'error') {
            color = '#ff4444';
            typeLabel = t.consoleError || 'ERROR';
        } else if (msg.type === 'warn') {
            color = '#ffbb33';
            typeLabel = t.consoleWarn || 'WARN';
        } else if (msg.type === 'info') {
            color = '#00aaf0';
            typeLabel = t.consoleInfo || 'INFO';
        } else {
            typeLabel = t.consoleLog || 'LOG';
        }
        
        return `<div style="color: ${color}; margin: 2px 0;">
            [${msg.time}] [${typeLabel}] ${msg.message}
        </div>`;
    }).join('');

    if (consoleOutput.parentElement) {
        consoleOutput.parentElement.scrollTop = consoleOutput.parentElement.scrollHeight;
    }
}

function initConsoleModal() {
    const openConsoleBtn = document.getElementById('open-console-btn');
    const consoleModal = document.getElementById('console-modal');
    const clearConsoleBtn = document.getElementById('clear-console-btn');
    const consoleBackBtn = document.getElementById('console-back-btn');

    if (openConsoleBtn) {
        openConsoleBtn.addEventListener('click', () => {
            if (consoleModal) {
                // Сохраняем позицию прокрутки перед открытием консоли
                const settingsContent = document.getElementById('settings-content');
                if (settingsContent) {
                    window.lastSettingsScrollPosition = settingsContent.scrollTop;
                }
                consoleModal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
                currentView = 'console';
                manageMainButton();
                if (window.tg) {
                    window.tg.BackButton.show();
                    window.tg.SettingsButton.hide();
                }
                // Устанавливаем margin-top для header консоли в зависимости от viewMode
                const consoleHeader = document.querySelector('.console-header');
                const viewMode = JSON.parse(localStorage.getItem('namazSettings') || '{}').viewMode || 'normal';
                if (consoleHeader && viewMode === 'fullscreen') {
                    consoleHeader.style.marginTop = '30%';
                } else if (consoleHeader) {
                    consoleHeader.style.marginTop = '';
                }
                updateConsoleDisplay();
            }
        });
    }

    if (clearConsoleBtn) {
        clearConsoleBtn.addEventListener('click', () => {
            const clearConfirmModal = document.getElementById('clear-console-confirm-modal');
            if (clearConfirmModal) {
                clearConfirmModal.style.display = 'flex';
            }
        });
    }
    
    const clearConsoleConfirmYes = document.getElementById('clear-console-confirm-yes');
    const clearConsoleConfirmNo = document.getElementById('clear-console-confirm-no');
    
    if (clearConsoleConfirmYes) {
        clearConsoleConfirmYes.addEventListener('click', () => {
            consoleMessages = [];
            updateConsoleDisplay();
            const clearConfirmModal = document.getElementById('clear-console-confirm-modal');
            if (clearConfirmModal) {
                clearConfirmModal.style.display = 'none';
            }
        });
    }
    
    if (clearConsoleConfirmNo) {
        clearConsoleConfirmNo.addEventListener('click', () => {
            const clearConfirmModal = document.getElementById('clear-console-confirm-modal');
            if (clearConfirmModal) {
                clearConfirmModal.style.display = 'none';
            }
        });
    }

    if (consoleBackBtn) {
        consoleBackBtn.addEventListener('click', () => {
            if (consoleModal) {
                consoleModal.style.display = 'none';
                document.body.style.overflow = '';
                // Убираем margin-top с header консоли
                const consoleHeader = document.querySelector('.console-header');
                if (consoleHeader) {
                    consoleHeader.style.marginTop = '';
                }
                // Восстанавливаем прокрутку в настройках
                const settingsContent = document.getElementById('settings-content');
                if (settingsContent && window.lastSettingsScrollPosition !== undefined) {
                    setTimeout(() => {
                        settingsContent.scrollTop = window.lastSettingsScrollPosition;
                    }, 0);
                }
                currentView = 'settings';
                manageMainButton();
                if (window.tg) {
                    window.tg.BackButton.show();
                }
            }
        });
    }
}

// Инициализация функций обновления переводов
function updateSupportLabels() {
    const t = translations[currentLang];
    
    const consoleTitle = document.getElementById('console-title');
    if (consoleTitle) consoleTitle.textContent = '📋 ' + (t.consoleTitle || 'Console');

    const clearConsoleBtn = document.getElementById('clear-console-btn');
    if (clearConsoleBtn) clearConsoleBtn.textContent = t.clearConsole || 'Clear';

    const consoleBackBtn = document.getElementById('console-back-btn');
    if (consoleBackBtn) consoleBackBtn.textContent = t.backBtn2 || 'Back';

    const supportSectionEl = document.getElementById('support-section');
    if (supportSectionEl) supportSectionEl.textContent = t.support;

    const supportServiceBtn = document.getElementById('support-service-btn');
    if (supportServiceBtn) supportServiceBtn.textContent = `📞 ${t.supportService}`;

    const suggestIdeaBtn = document.getElementById('suggest-idea-btn');
    if (suggestIdeaBtn) suggestIdeaBtn.textContent = `💡 ${t.suggestIdea}`;

    const askQuestionBtn = document.getElementById('ask-question-btn');
    if (askQuestionBtn) askQuestionBtn.textContent = `❓ ${t.askQuestion}`;

    const openConsoleBtn = document.getElementById('open-console-btn');
    if (openConsoleBtn) openConsoleBtn.textContent = `🖥️ ${t.openConsole}`;

    // Обновляем модальное окно подтверждения сброса
    const resetConfirmTitle = document.getElementById('reset-confirm-title');
    if (resetConfirmTitle) resetConfirmTitle.textContent = t.resetConfirmTitle || 'Reset color?';

    const resetConfirmText = document.getElementById('reset-confirm-text');
    if (resetConfirmText) resetConfirmText.textContent = t.resetConfirmText || 'Are you sure?';

    const resetConfirmYes = document.getElementById('reset-confirm-yes');
    if (resetConfirmYes) resetConfirmYes.textContent = t.ok || 'OK';

    const resetConfirmNo = document.getElementById('reset-confirm-no');
    if (resetConfirmNo) resetConfirmNo.textContent = t.cancel || 'Cancel';

    // Обновляем модальное окно подтверждения очистки консоли
    const clearConsoleConfirmTitle = document.getElementById('clear-console-confirm-title');
    if (clearConsoleConfirmTitle) clearConsoleConfirmTitle.textContent = t.clearConsole || 'Clear console?';

    const clearConsoleConfirmText = document.getElementById('clear-console-confirm-text');
    if (clearConsoleConfirmText) clearConsoleConfirmText.textContent = t.clearConsoleConfirm || 'Are you sure?';

    const clearConsoleConfirmYes = document.getElementById('clear-console-confirm-yes');
    if (clearConsoleConfirmYes) clearConsoleConfirmYes.textContent = t.ok || 'OK';

    const clearConsoleConfirmNo = document.getElementById('clear-console-confirm-no');
    if (clearConsoleConfirmNo) clearConsoleConfirmNo.textContent = t.cancel || 'Cancel';

    // Обновляем кнопки сброса
    const resetButtonColorBtn = document.getElementById('reset-button-color');
    if (resetButtonColorBtn) resetButtonColorBtn.textContent = t.resetBtn || 'Reset';

    const resetButtonTextColorBtn = document.getElementById('reset-button-text-color');
    if (resetButtonTextColorBtn) resetButtonTextColorBtn.textContent = t.resetBtn || 'Reset';

    updateConsoleDisplay();
}

// Инициализация при загрузке
window.addEventListener('load', () => {
    captureConsole();
    initSupportButtons();
    initResetColorButtons();
    initConsoleModal();
    updateSupportLabels();
});
