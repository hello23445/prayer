// theme.js
function applyTheme(theme) {
    if (theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.body.className = prefersDark ? 'dark' : '';
    } else {
        document.body.className = theme;
    }
}
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
mediaQuery.addEventListener('change', () => {
    if (document.getElementById('theme-select').value === 'system') {
        applyTheme('system');
    }
});