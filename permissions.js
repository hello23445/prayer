// permissions.js
async function getLocationName(lat, lng) {
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`);
        const data = await res.json();
        return data.address.city || data.address.town || data.address.village || 'Неизвестно';
    } catch (e) {
        console.error('Ошибка получения названия местоположения:', e);
        return 'Неизвестно';
    }
}

async function requestGeolocation() {
    return new Promise((resolve, reject) => {
        document.getElementById('geo-modal').style.display = 'flex';
        document.getElementById('geo-yes').onclick = async () => {
            document.getElementById('geo-modal').style.display = 'none';
            document.getElementById('location-info').textContent = 'Определение...';
            navigator.geolocation.getCurrentPosition(async pos => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                coordinates = { lat, lng };
                userLocationName = await getLocationName(lat, lng);
                calculatePrayerTimes(lat, lng);
                document.getElementById('location-info').textContent = userLocationName;
                resolve();
            }, err => {
                console.error(err);
                alert('Ошибка геолокации: ' + err.message);
                document.getElementById('location-info').textContent = 'Геолокация не разрешена';
                requestGeolocation().then(resolve, reject);
            });
        };
    });
}

async function requestMicrophonePermission() {
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