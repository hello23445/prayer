// transcription.js
// Ensure globals exist without redeclaring
window.transcriptionEnabled = window.transcriptionEnabled !== undefined ? window.transcriptionEnabled : true;
window.translationEnabled = window.translationEnabled !== undefined ? window.translationEnabled : true;

function updateToggleIcons() {
    document.getElementById('transcription-toggle').querySelector('i').className = window.transcriptionEnabled ? 'fa-solid fa-toggle-on' : 'fa-solid fa-toggle-off';
    document.getElementById('translation-toggle').querySelector('i').className = window.translationEnabled ? 'fa-solid fa-toggle-on' : 'fa-solid fa-toggle-off';
}

function updateTranscriptionAndTranslation() {
    // Not used for dynamic, but for toggle update
}