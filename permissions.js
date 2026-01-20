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
async function requestGeolocation(force = false) {
    const savedCoords = localStorage.getItem('userCoordinates');
    const savedLocation = localStorage.getItem('userLocationName');
    if (savedCoords && savedLocation && !force) {
        coordinates = JSON.parse(savedCoords);
        userLocationName = savedLocation;
        document.getElementById('location-info').innerHTML = `<i class="fa-solid fa-location-arrow fa-2xs icon"></i> ${userLocationName}`;
        calculatePrayerTimes(coordinates.lat, coordinates.lng);
        return Promise.resolve();
    }
    const perm = await navigator.permissions.query({ name: 'geolocation' });
    if (perm.state === 'granted' && !force) {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(async pos => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                coordinates = { lat, lng };
                userLocationName = await getLocationName(lat, lng);
                localStorage.setItem('userCoordinates', JSON.stringify(coordinates));
                localStorage.setItem('userLocationName', userLocationName);
                calculatePrayerTimes(lat, lng);
                document.getElementById('location-info').innerHTML = `<i class="fa-solid fa-location-arrow fa-2xs icon"></i> ${userLocationName}`;
                document.getElementById('preloader').style.display = 'none';
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
                document.getElementById('preloader').style.display = 'none';
                reject(new Error('Geolocation not supported'));
                return;
            }
            navigator.geolocation.getCurrentPosition(async pos => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                coordinates = { lat, lng };
              
                // Получаем название города через Nominatim
                userLocationName = await getLocationName(lat, lng);
                localStorage.setItem('userCoordinates', JSON.stringify(coordinates));
                localStorage.setItem('userLocationName', userLocationName);
                // Здесь можно вызвать вашу функцию расчета намазов
                calculatePrayerTimes(lat, lng);
                locationInfo.innerHTML = `<i class="fa-solid fa-location-arrow fa-2xs icon"></i> ${userLocationName}`;
                document.getElementById('preloader').style.display = 'none';
                resolve();
            }, err => {
                console.error(err);
                locationInfo.textContent = 'Геолокация не разрешена';
                document.getElementById('preloader').style.display = 'none';
                
                // Создаем модальное окно об ошибке
                const errorModal = document.createElement('div');
                errorModal.id = 'geolocation-error-modal';
                errorModal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;';
                
                const errorContent = document.createElement('div');
                errorContent.style.cssText = 'background: white; padding: 30px; border-radius: 12px; text-align: center; max-width: 300px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);';
                
                const errorText = document.createElement('p');
                errorText.textContent = 'Включите разрешение на использование геолокации в настройках вашего устройства.';
                errorText.style.cssText = 'font-size: 16px; margin: 0; line-height: 1.5; color: #333;';
                
                errorContent.appendChild(errorText);
                errorModal.appendChild(errorContent);
                document.body.appendChild(errorModal);
                
                // Закрытие модального окна при клике на задний фон
                errorModal.addEventListener('click', (e) => {
                    if (e.target === errorModal) {
                        errorModal.remove();
                    }
                });
                
                // Закрытие через 5 секунд
                setTimeout(() => {
                    if (document.contains(errorModal)) {
                        errorModal.remove();
                    }
                }, 5000);
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
async function initPermissions() {
    await requestGeolocation();
    await requestMicrophonePermission();
    // Добавляем обработчик клика на location-info
    const locationInfo = document.getElementById('location-info');
    if (locationInfo) {
        locationInfo.addEventListener('click', (e) => {
            e.stopPropagation();
            const t = translations[currentLang];
            const locationModal = document.getElementById('location-modal');
            if (locationModal) {
                document.getElementById('current-location').textContent = userLocationName;
                document.getElementById('update-location').textContent = t.updateLocationBtn;
                document.getElementById('close-location-modal').textContent = t.backBtn;
                locationModal.style.display = 'flex';
            }
            if (window.tg) {
                window.tg.BackButton.show();
            }
        });
    }
    const updateLocationBtn = document.getElementById('update-location');
    if (updateLocationBtn) {
        updateLocationBtn.addEventListener('click', async () => {
            await requestGeolocation(true); // force update
            const locationModal = document.getElementById('location-modal');
            if (locationModal) {
                locationModal.style.display = 'none';
            }
        });
    }
    const closeLocationModalBtn = document.getElementById('close-location-modal');
    if (closeLocationModalBtn) {
        closeLocationModalBtn.addEventListener('click', () => {
            const locationModal = document.getElementById('location-modal');
            if (locationModal) {
                locationModal.style.display = 'none';
            }
        });
    }
}