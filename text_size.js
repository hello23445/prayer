// text_size.js
function applyTextSize(size) {
    let base = '14px', prayer = '16px';
    if (size === 'medium') {
        base = '16px';
        prayer = '18px';
    } else if (size === 'large') {
        base = '18px';
        prayer = '20px';
    }
    document.documentElement.style.setProperty('--font-size-base', base);
    document.documentElement.style.setProperty('--font-size-prayer', prayer);
}