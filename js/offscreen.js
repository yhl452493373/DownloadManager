// 构建音频对象
const audio = new Audio('/audio/download-complete.wav')

/**
 * 获取图标类型
 */
function detectIconType() {
    let isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    // 发送消息改变图标
    chrome.runtime.sendMessage({
        method: 'changeActionIcon',
        data: isDarkMode ? 'light' : 'dark'
    });
}

/**
 * 播放音频
 */
function playSound() {
    audio.play();
}

/**
 * 接收消息来调用对应方法
 */
chrome.runtime.onMessage.addListener((message, sender, response) => {
    if (message.method === 'detectIconType') {
        detectIconType();
    } else if (message.method === 'playSound') {
        playSound();
    }
});

// 页面打开时，检测一次图标类型
detectIconType();

// offscreen保活心跳定时器 - 每45秒发送一次（小于Chrome的60秒回收阈值）
setInterval(() => {
    chrome.runtime.sendMessage({type: 'HEARTBEAT'});
}, 45000);