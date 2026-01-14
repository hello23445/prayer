// permissions.js
async function getLocationName(lat, lng) {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=${getLangCode(currentLang)}`);
    const data = await response.json();
    if (!data.address) return 'Неизвестно';
    const fields = ['city', 'town', 'village', 'municipality', 'county', 'state'];
    for (const field of fields) {
        if (data.address[field]) {
            return data.address[field];
        }
    }
    return 'Неизвестно';
}
async function requestGeolocation() {
    const perm = await navigator.permissions.query({ name: 'geolocation' });
    if (perm.state === 'granted') {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(async pos => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                coordinates = { lat, lng };
                userLocationName = await getLocationName(lat, lng);
                calculatePrayerTimes(lat, lng);
                document.getElementById('location-info').innerHTML = `<i class="fa-solid fa-location-arrow fa-2xs icon"></i> ${userLocationName}`;
                resolve();
            }, err => {
                reject(err);
            });
        });
    }
    return new Promise((resolve, reject) => {
        const modal = document.getElementById('geo-modal');
        const locationInfo = document.getElementById('location-info');
        const yesBtn = document.getElementById('geo-yes');
        modal.style.display = 'flex';
        yesBtn.onclick = null; // убираем старые обработчики
        yesBtn.onclick = async () => {
            modal.style.display = 'none';
            locationInfo.textContent = 'Определение...';
            if (!navigator.geolocation) {
                alert('Геолокация не поддерживается вашим браузером.');
                locationInfo.textContent = 'Геолокация не поддерживается';
                reject(new Error('Geolocation not supported'));
                return;
            }
            navigator.geolocation.getCurrentPosition(async pos => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                coordinates = { lat, lng };
              
                // Получаем название города через Nominatim
                userLocationName = await getLocationName(lat, lng);
                // Здесь можно вызвать вашу функцию расчета намазов
                calculatePrayerTimes(lat, lng);
                locationInfo.innerHTML = `<i class="fa-solid fa-location-arrow fa-2xs icon"></i> ${userLocationName}`;
                resolve();
            }, err => {
                console.error(err);
                alert('Ошибка геолокации: ' + err.message);
                locationInfo.textContent = 'Геолокация не разрешена';
                // Рекурсивно пробуем снова
                requestGeolocation().then(resolve, reject);
            });
        };
    });
}
async function requestMicrophonePermission() {
    const perm = await navigator.permissions.query({ name: 'microphone' });
    if (perm.state === 'granted') {
        return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
        document.getElementById('mic-modal').style.display = 'flex';
        document.getElementById('mic-yes').onclick = () => {
            document.getElementById('mic-modal').style.display = 'none';
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(stream => {
                    stream.getTracks().forEach(track => track.stop());
                    resolve();
                })
                .catch(err => {
                    console.error('Микрофон не доступен:', err);
                    alert('Микрофон обязателен для записи намаза.');
                    requestMicrophonePermission().then(resolve, reject);
                });
        };
    });
}
async function requestNotificationPermission() {
    if (Notification.permission === 'granted') {
        return Promise.resolve();
    }
    if (Notification.permission !== 'default') return;
    return new Promise((resolve) => {
        document.getElementById('notify-modal').style.display = 'flex';
        document.getElementById('notify-yes').onclick = () => {
            document.getElementById('notify-modal').style.display = 'none';
            Notification.requestPermission().then(perm => {
                if (perm !== 'granted') {
                    alert('Уведомления не разрешены. Напоминания о намазе не будут работать.');
                }
                resolve();
            });
        };
    });
}
async function initPermissions() {
    await requestGeolocation();
    await requestMicrophonePermission();
    await requestNotificationPermission();
}