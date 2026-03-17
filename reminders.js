// reminders.js
const GAS_URL = 'https://script.google.com/macros/s/AKfycbxHdZJ1gjETwoJl_trU-ZK1tr2rdkMPjBzQsKbk0Av3QiUobWnuiSFvLAqU9WN_-5Q1LQ/exec';

// Токен Telegram-бота (можно задать через localStorage под ключом "telegramBotToken")
const TELEGRAM_BOT_TOKEN = (() => {
    const settings = JSON.parse(localStorage.getItem('namazSettings')) || {};
    return settings.telegramBotToken || '8447574793:AAEY_QlEAQsBbI5Hsaygdb5Oe-KrisG9vg8';
})();

// Лимит на изменение напоминаний (5 минут)
const REMINDER_RATE_LIMIT = 5 * 60 * 1000;

// Получить Telegram ID пользователя
function getTelegramId() {
    if (window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
        return window.Telegram.WebApp.initDataUnsafe.user.id;
    }
    // Если нет реального ID, используем тестовый
    return localStorage.getItem('testTelegramId') || '6434781065';
}

// Получить все напоминания для пользователя из localStorage
function getAllReminders() {
    const reminders = localStorage.getItem('prayerReminders');
    return reminders ? JSON.parse(reminders) : {};
}

// Сохранить напоминания в localStorage
function saveReminders(reminders) {
    localStorage.setItem('prayerReminders', JSON.stringify(reminders));
}

// Проверить, можно ли изменить напоминание (rate limiting)
function canChangeReminder(prayerName) {
    const lastChange = localStorage.getItem('lastReminderChange_' + prayerName);
    if (!lastChange) return true;
    
    const timeSinceLastChange = Date.now() - parseInt(lastChange);
    return timeSinceLastChange >= REMINDER_RATE_LIMIT;
}

// Обновить время последнего изменения напоминания
function updateReminderChangeTime(prayerName) {
    localStorage.setItem('lastReminderChange_' + prayerName, Date.now().toString());
}

// Показать модальное окно с сообщением
function showModalMessage(message) {
    const isDark = document.body.classList.contains('dark');

    const modal = document.createElement('div');
    modal.className = `modal-message${isDark ? ' dark' : ''}`;

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-message__content';

    const messageEl = document.createElement('p');
    messageEl.textContent = message;
    messageEl.className = 'modal-message__text';

    const okBtn = document.createElement('button');
    okBtn.textContent = translations[currentLang]?.ok || 'OK';
    okBtn.className = 'modal-message__button';

    okBtn.onclick = () => {
        if (modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
    };

    modalContent.appendChild(messageEl);
    modalContent.appendChild(okBtn);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}

// Добавить напоминание
async function addReminder(prayerName, minutesBefore) {
    const telegramId = getTelegramId();
    const reminders = getAllReminders();
    
    // Проверяем, есть ли уже напоминание для этого намаза
    if (reminders[prayerName]) {
        console.warn(`Напоминание для ${prayerName} уже существует`);
        return false;
    }
    
    // Проверяем, включены ли уведомления
    const settings = JSON.parse(localStorage.getItem('namazSettings')) || {};
    if (!settings.notificationsEnabled) {
        console.warn('Уведомления отключены');
        return false;
    }
    
    // Вычисляем время напоминания
    const prayerTime = prayerTimes[prayerName.toLowerCase()];
    if (!prayerTime) {
        console.error(`Время намаза для ${prayerName} не найдено`);
        return false;
    }
    
    const remindAtTime = new Date(prayerTime.getTime() - minutesBefore * 60000);
    const remindAtStr = formatDateTime(remindAtTime);
    
    // Добавляем напоминание
    reminders[prayerName] = {
        minutesBefore: minutesBefore,
        remindAt: remindAtStr,
        createdAt: new Date().toISOString()
    };
    
    saveReminders(reminders);
    
    // Показываем прелоадер
    const preloader = document.getElementById('preloader');
    if (preloader) preloader.style.display = 'flex';
    
    try {
        const lang = currentLang || 'ru';
        const t = translations[lang];
        const prayerNameDisplay = t[prayerName.toLowerCase()] || prayerName;
        
        // Отправляем запрос в GAS
        const payload = {
            action: 'add',
            telegramId: telegramId,
            prayerName: prayerName,
            minutesBefore: minutesBefore,
            lang: lang,
            remindAt: remindAtStr
        };
        
        await fetch(GAS_URL, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8'
            },
            body: JSON.stringify(payload)
        });
        
        // Отправляем уведомление в Telegram если опция включена
        if (settings.reminderNotificationEnabled) {
            const message = `✅ ${t.reminderSet}\n${prayerNameDisplay} на ${minutesBefore} ${minutesBefore === 1 ? 'минуту' : 'минут'} раньше`;
            await sendTelegramNotification(telegramId, message);
        }
        
        console.log(`Напоминание добавлено: ${prayerName}, за ${minutesBefore} минут`);
        return true;
    } catch (err) {
        console.error('Ошибка при добавлении напоминания:', err);
        return false;
    } finally {
        // Скрываем прелоадер
        if (preloader) preloader.style.display = 'none';
    }
}

// Удалить напоминание
async function deleteReminder(prayerName) {
    const telegramId = getTelegramId();
    const reminders = getAllReminders();
    
    if (!reminders[prayerName]) {
        console.warn(`Напоминание для ${prayerName} не найдено`);
        return false;
    }
    
    delete reminders[prayerName];
    saveReminders(reminders);
    
    // Показываем прелоадер
    const preloader = document.getElementById('preloader');
    if (preloader) preloader.style.display = 'flex';
    
    try {
        const payload = {
            action: 'delete',
            telegramId: telegramId,
            prayerName: prayerName
        };
        
        await fetch(GAS_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8'
            },
            body: JSON.stringify(payload)
        });
        
        console.log(`Напоминание удалено: ${prayerName}`);
        return true;
    } catch (err) {
        console.error('Ошибка при удалении напоминания:', err);
        return false;
    } finally {
        // Скрываем прелоадер
        if (preloader) preloader.style.display = 'none';
    }
}

// Удалить все напоминания
async function removeAllReminders() {
    const telegramId = getTelegramId();
    const reminders = getAllReminders();
    
    if (Object.keys(reminders).length === 0) {
        console.log('Нет напоминаний для удаления');
        return true;
    }
    
    try {
        const payload = {
            action: 'delete',
            telegramId: telegramId
        };
        
        await fetch(GAS_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8'
            },
            body: JSON.stringify(payload)
        });
        
        localStorage.removeItem('prayerReminders');
        console.log('Все напоминания удалены');
        return true;
    } catch (err) {
        console.error('Ошибка при удалении всех напоминаний:', err);
        return false;
    }
}

// Отправить уведомление в Telegram (через бота)
async function sendTelegramNotification(telegramId, message) {
    try {
        // Если токен бота задан, отправляем уведомление через Telegram Bot API
        if (TELEGRAM_BOT_TOKEN) {
            await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: telegramId,
                    text: message
                })
            });
            return true;
        }

        // Если токена нет — логируем для отладки
        console.log(`Telegram notification (ID: ${telegramId}): ${message}`);
        return true;
    } catch (err) {
        console.error('Ошибка при отправке уведомления:', err);
        return false;
    }
}

// Отправить запрос на выполнение напоминаний в GAS (для уведомлений)
async function triggerGasReminders() {
    try {
        const settings = JSON.parse(localStorage.getItem('namazSettings')) || {};
        
        // Отправляем запрос только если включена опция "Уведомления для напоминаний"
        if (settings.reminderNotificationsEnabled) {
            const payload = {
                action: 'trigger',
                timestamp: new Date().toISOString()
            };
            
            await fetch(GAS_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8'
                },
                body: JSON.stringify(payload)
            });
            
            console.log('Запрос на выполнение напоминаний отправлен');
        }
    } catch (err) {
        console.error('Ошибка при отправке запроса напоминаний:', err);
    }
}

// Форматировать дату и время в формат GAS
function formatDateTime(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Получить параметры значения селекта
function getReminderMinutes(value) {
    const minutesMap = {
        '180': { label: 'Напомнить на 3 часа раньше', minutes: 180 },
        '120': { label: 'Напомнить на 2 часа раньше', minutes: 120 },
        '60': { label: 'Напомнить на 1 час раньше', minutes: 60 },
        '30': { label: 'Напомнить на 30 минут раньше', minutes: 30 },
        '25': { label: 'Напомнить на 25 минут раньше', minutes: 25 },
        '15': { label: 'Напомнить на 15 минут раньше', minutes: 15 },
        'none': { label: 'Отключить напоминание', minutes: null }
    };
    return minutesMap[value];
}

// Инициализация экрана напоминаний
function initRemindersScreen() {
    const openRemindersBtn = document.getElementById('open-reminders');
    const closeRemindersBtn = document.getElementById('close-reminders');
    const remindersModal = document.getElementById('reminders-modal');
    
    if (openRemindersBtn) {
        openRemindersBtn.addEventListener('click', () => {
            if (remindersModal) {
                remindersModal.style.display = 'flex';
                showRemindersScreen();
                currentView = 'reminders';
                manageMainButton();
                
                if (window.tg) {
                    window.tg.BackButton.show();
                    window.tg.SettingsButton.hide();
                }
            }
        });
    }
    
    if (closeRemindersBtn) {
        closeRemindersBtn.addEventListener('click', () => {
            if (remindersModal) {
                remindersModal.style.display = 'none';
                currentView = 'main';
                manageMainButton();
                
                if (window.tg) {
                    window.tg.BackButton.hide();
                    window.tg.SettingsButton.show();
                }
            }
        });
    }
}

// Инициализация селектов напоминаний в модальном окне намаза
function initReminderSelect(prayerName) {
    const reminderSelect = document.getElementById('reminder-select');
    if (!reminderSelect) return;
    
    const t = translations[currentLang];
    
    // Очищаем предыдущие опции
    reminderSelect.innerHTML = '';
    
    // Получаем текущее напоминание для этого намаза
    const reminders = getAllReminders();
    const currentReminder = reminders[prayerName];
    
    // Добавляем опции
    const options = [
        { value: 'none', label: t.disableReminder || 'Отключить напоминание' },
        { value: '180', label: t.reminder3hours || 'Напомнить на 3 часа раньше' },
        { value: '120', label: t.reminder2hours || 'Напомнить на 2 часа раньше' },
        { value: '60', label: t.reminder1hour || 'Напомнить на 1 час раньше' },
        { value: '30', label: t.reminder30min || 'Напомнить на 30 минут раньше' },
        { value: '25', label: t.reminder25min || 'Напомнить на 25 минут раньше' },
        { value: '15', label: t.reminder15min || 'Напомнить на 15 минут раньше' }
    ];
    
    options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.label;
        reminderSelect.appendChild(option);
    });
    
    // Устанавливаем текущее значение
    if (currentReminder) {
        reminderSelect.value = currentReminder.minutesBefore.toString();
    } else {
        reminderSelect.value = 'none';
    }
    
    // Добавляем обработчик изменения
    reminderSelect.onchange = async (e) => {
        const selectedValue = e.target.value;
        
        // Проверяем rate limiting
        if (!canChangeReminder(prayerName)) {
            const remainingTime = Math.ceil((REMINDER_RATE_LIMIT - (Date.now() - parseInt(localStorage.getItem('lastReminderChange_' + prayerName)))) / 60000);
            const message = (t.reminderLimitWait || 'Подождите %s минут перед следующим изменением напоминания').replace('%s', remainingTime);
            showModalMessage(message);
            // Возвращаем селект к предыдущему значению
            if (currentReminder) {
                reminderSelect.value = currentReminder.minutesBefore.toString();
            } else {
                reminderSelect.value = 'none';
            }
            return;
        }
        
        // Проверяем, включены ли уведомления
        const settings = JSON.parse(localStorage.getItem('namazSettings')) || {};
        if (!settings.notificationsEnabled) {
            const t = translations[currentLang];
            showModalMessage(t.reminderNotificationsDisabled || 'Уведомления отключены. Напоминания не могут быть установлены.');
            reminderSelect.value = currentReminder ? currentReminder.minutesBefore.toString() : 'none';
            return;
        }
        
        // Обновляем время последнего изменения
        updateReminderChangeTime(prayerName);
        
        if (selectedValue === 'none') {
            // Удаляем напоминание если оно есть
            if (currentReminder) {
                await deleteReminder(prayerName);
            }
        } else {
            // Если есть существующее напоминание, сначала удаляем его
            if (currentReminder) {
                await deleteReminder(prayerName);
            }
            // Добавляем новое напоминание
            const minutes = parseInt(selectedValue);
            await addReminder(prayerName, minutes);
        }
    };
}

// Вызываем инициализацию при загрузке
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        // Инициализация больше не нужна, так как меню удалено
    }, 100);
});
// Инициализация больше не нужна, так как меню удалено