const workTimeInput = document.getElementById('workTime');
const shortBreakTimeInput = document.getElementById('shortBreakTime');
const longBreakTimeInput = document.getElementById('longBreakTime');
const saveButton = document.getElementById('save');
const resetButton = document.getElementById('resetSettings');

function saveOptions() {
  const workTime = parseInt(workTimeInput.value);
  const shortBreakTime = parseInt(shortBreakTimeInput.value);
  const longBreakTime = parseInt(longBreakTimeInput.value);

  chrome.storage.sync.set({
    workTime: workTime,
    shortBreakTime: shortBreakTime,
    longBreakTime: longBreakTime
  }, () => {
    // Update status to let user know options were saved.
    alert('设置已保存!');
  });
}

function restoreOptions() {
  chrome.storage.sync.get({
    workTime: 25,
    shortBreakTime: 5,
    longBreakTime: 15
  }, (items) => {
    workTimeInput.value = items.workTime;
    shortBreakTimeInput.value = items.shortBreakTime;
    longBreakTimeInput.value = items.longBreakTime;
  });
}

function resetOptions() {
    workTimeInput.value = 25;
    shortBreakTimeInput.value = 5;
    longBreakTimeInput.value = 15;
    saveOptions();
}

saveButton.addEventListener('click', saveOptions);
resetButton.addEventListener('click', resetOptions);
document.addEventListener('DOMContentLoaded', restoreOptions);
