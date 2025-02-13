let timerInterval;
let workTime = 25; // 默认工作时间25分钟
let shortBreakTime = 5; // 默认短休息时间5分钟
let longBreakTime = 15; // 默认长休息时间15分钟
let longBreakInterval = 4; // 默认每4个番茄周期进行一次长休息
let timeLeft = 0;
let isWorking = true;
let isPaused = false;
let pomodoroCount = 0; // 番茄计数

// 添加状态管理对象
let timerState = {
    timeLeft: 0,
    isWorking: true,
    isPaused: false,
    pomodoroCount: 0
};

// 更新图标badge显示
function updateBadge() {
    const minutes = Math.floor(timerState.timeLeft / 60);
    const seconds = timerState.timeLeft % 60;
    const display = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    // 设置badge背景色
    chrome.action.setBadgeBackgroundColor({
        color: timerState.isWorking ? '#ff0000' : '#00ff00'
    });
    
    // 设置badge文本
    chrome.action.setBadgeText({
        text: timerState.isPaused ? '⏸' : display
    });
}

// 更新显示和状态
function updateDisplay() {
    const minutes = Math.floor(timerState.timeLeft / 60);
    const seconds = timerState.timeLeft % 60;
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // 更新badge
    updateBadge();
    
    // 向popup发送更新消息
    chrome.runtime.sendMessage({
        command: 'update',
        time: timeString,
        status: timerState.isWorking ? chrome.i18n.getMessage("work") : chrome.i18n.getMessage("break"),
        isPaused: timerState.isPaused
    });
    
    return timeString;
}

function startTimer() {
    if (timerState.isPaused) {
        timerState.isPaused = false;
    } else {
        if (timerState.isWorking) {
            timerState.timeLeft = workTime * 60;
        } else {
            timerState.pomodoroCount++;
            if (timerState.pomodoroCount % longBreakInterval === 0) {
                timerState.timeLeft = longBreakTime * 60;
            } else {
                timerState.timeLeft = shortBreakTime * 60;
            }
        }
    }

    // 保存当前状态
    saveState();

    timerInterval = setInterval(() => {
        if (!timerState.isPaused) {
            timerState.timeLeft--;
            updateDisplay();
            
            if (timerState.timeLeft <= 0) {
                clearInterval(timerInterval);
                
                // 播放提示音
                const audio = new Audio('notification.mp3');
                audio.play();
                
                // 发送通知
                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: 'icon128.png',
                    title: chrome.i18n.getMessage("appName"),
                    message: timerState.isWorking ? 
                        chrome.i18n.getMessage("workTimeEnd") : 
                        chrome.i18n.getMessage("breakTimeEnd")
                });

                timerState.isWorking = !timerState.isWorking;
                saveState();
                
                if(timerState.isWorking) {
                    startTimer();
                } else {
                    if (timerState.pomodoroCount % longBreakInterval === 0) {
                        timerState.timeLeft = longBreakTime * 60;
                    } else {
                        timerState.timeLeft = shortBreakTime * 60;
                    }
                    startTimer();
                }
            }
        }
    }, 1000);
}

function pauseTimer() {
    timerState.isPaused = true;
    clearInterval(timerInterval);
    updateDisplay();
    saveState();
}

function resetTimer() {
    clearInterval(timerInterval);
    timerState = {
        timeLeft: workTime * 60,
        isWorking: true,
        isPaused: false,
        pomodoroCount: 0
    };
    updateDisplay();
    saveState();
}

// 保存状态到storage
function saveState() {
    chrome.storage.local.set({
        timerState: timerState,
        workTime: workTime,
        shortBreakTime: shortBreakTime,
        longBreakTime: longBreakTime,
        longBreakInterval: longBreakInterval
    });
}

// 恢复状态
function restoreState() {
    chrome.storage.local.get({
        timerState: null,
        workTime: 25,
        shortBreakTime: 5,
        longBreakTime: 15,
        longBreakInterval: 4
    }, (items) => {
        workTime = items.workTime;
        shortBreakTime = items.shortBreakTime;
        longBreakTime = items.longBreakTime;
        longBreakInterval = items.longBreakInterval;
        
        if (items.timerState) {
            timerState = items.timerState;
            if (!timerState.isPaused && timerState.timeLeft > 0) {
                startTimer();
            }
        } else {
            resetTimer();
        }
        updateDisplay();
    });
}

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.command === 'getState') {
        // popup打开时请求状态
        sendResponse({
            time: updateDisplay(),
            status: timerState.isWorking ? chrome.i18n.getMessage("work") : chrome.i18n.getMessage("break"),
            isPaused: timerState.isPaused
        });
    } else if (message.command === 'start') {
        startTimer();
    } else if (message.command === 'pause') {
        pauseTimer();
    } else if (message.command === 'reset') {
        resetTimer();
    }
});

// 插件安装或更新时初始化
chrome.runtime.onInstalled.addListener(restoreState);

// 浏览器启动时恢复状态
chrome.runtime.onStartup.addListener(restoreState);
