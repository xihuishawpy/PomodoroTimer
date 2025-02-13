function setLocale() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.textContent = chrome.i18n.getMessage(key);
    });
}

document.addEventListener('DOMContentLoaded', setLocale);
