// voice.js
let currentVoice = null;
let voices = [];
function loadVoices(lang) {
    voices = speechSynthesis.getVoices();
    const voiceSelect = document.getElementById('voice-select');
    if (voiceSelect) {
        voiceSelect.innerHTML = '';
        const filteredVoices = voices.filter(voice => voice.lang.startsWith('ar'));
        if (filteredVoices.length === 0) {
            const option = document.createElement('option');
            option.textContent = 'Арабские голоса недоступны';
            voiceSelect.appendChild(option);
        } else {
            filteredVoices.forEach(voice => {
                const option = document.createElement('option');
                option.value = voice.name;
                option.textContent = `${voice.name} (${voice.lang})`;
                voiceSelect.appendChild(option);
            });
            currentVoice = filteredVoices[0];
            voiceSelect.value = currentVoice.name;
        }
    }
}
speechSynthesis.onvoiceschanged = () => loadVoices(currentLang);