// transcription.js
// Ensure globals exist without redeclaring
window.transcriptionEnabled = window.transcriptionEnabled !== undefined ? window.transcriptionEnabled : true;
window.translationEnabled = window.translationEnabled !== undefined ? window.translationEnabled : true;
function updateToggleIcons() {
    const transIcon = document.querySelector('#transcription-toggle i');
    const translIcon = document.querySelector('#translation-toggle i');
    if (transIcon) {
        transIcon.className = transcriptionEnabled
            ? 'fa-solid fa-toggle-on icon'
            : 'fa-solid fa-toggle-off icon';
    }
    if (translIcon) {
        translIcon.className = translationEnabled
            ? 'fa-solid fa-toggle-on icon'
            : 'fa-solid fa-toggle-off icon';
    }
}
function updateTranscriptionAndTranslation() {
    // Not used for dynamic, but for toggle update
}