const timerDisplay = document.getElementById('timer');
const statusDisplay = document.getElementById('status');
const startButton = document.getElementById('start');
const pauseButton = document.getElementById('pause');
const resetButton = document.getElementById('reset');

// popup打开时获取当前状态
chrome.runtime.sendMessage({ command: 'getState' }, (response) => {
    if (response) {
        timerDisplay.textContent = response.time;
        statusDisplay.textContent = response.status;
        updateButtons(response.isPaused);
    }
});

function updateButtons(isPaused) {
    startButton.style.display = isPaused ? 'inline-block' : 'none';
    pauseButton.style.display = isPaused ? 'none' : 'inline-block';
}

startButton.addEventListener('click', () => {
    chrome.runtime.sendMessage({ command: 'start' });
});

pauseButton.addEventListener('click', () => {
    chrome.runtime.sendMessage({ command: 'pause' });
});

resetButton.addEventListener('click', () => {
    chrome.runtime.sendMessage({ command: 'reset' });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.command === 'update') {
        timerDisplay.textContent = message.time;
        statusDisplay.textContent = message.status;
        updateButtons(message.isPaused);
    }
});
