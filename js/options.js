//标题
document.querySelector('title').innerText = chrome.i18n.getMessage('options');

//图标颜色
document.querySelector('#iconType').innerText = chrome.i18n.getMessage('iconType') + ":";
document.querySelector('#iconAuto').innerText = chrome.i18n.getMessage('iconAuto');
document.querySelector('#iconDark').innerText = chrome.i18n.getMessage('iconDark');
document.querySelector('#iconLight').innerText = chrome.i18n.getMessage('iconLight');

//下载通知：
document.querySelector('#downloadNotice').innerText = chrome.i18n.getMessage('downloadNotice') + ":";
document.querySelector('#noticeOff').innerText = chrome.i18n.getMessage('noticeOff');
document.querySelector('#downloadStart').innerText = chrome.i18n.getMessage('startNotice');
document.querySelector('#downloadComplete').innerText = chrome.i18n.getMessage('completeNotice');
document.querySelector('#downloadDanger').innerText = chrome.i18n.getMessage('dangerNotice');

//下载提示音
document.querySelector('#downloadSound').innerText = chrome.i18n.getMessage('downloadSound') + ":";
document.querySelector('#soundOff').innerText = chrome.i18n.getMessage('soundOff');
document.querySelector('#soundOn').innerText = chrome.i18n.getMessage('soundOn');

//自动继续下载
document.querySelector('#downloadAutoResume').innerText = chrome.i18n.getMessage('downloadAutoResume') + ":";
document.querySelector('#downloadAutoResumeOff').innerText = chrome.i18n.getMessage('downloadAutoResumeOff');
document.querySelector('#downloadAutoResumeOn').innerText = chrome.i18n.getMessage('downloadAutoResumeOn');


//配置
chrome.storage.sync.get(
    {
        iconType: 'auto',
        downloadSound: 'off',
        downloadNotice: 'off',
        downloadAutoResume: 'off'
    }, function (obj) {
        document.querySelector("input[name=iconType][value=" + obj.iconType + "]").click();
        document.querySelector("input[name=downloadSound][value=" + obj.downloadSound + "]").click();
        document.querySelector("input[name=downloadAutoResume][value=" + obj.downloadAutoResume + "]").click();
        if (typeof obj.downloadNotice === "string" || obj.downloadNotice.length === 0)
            document.querySelector("input[name=downloadNotice][value=off]").click();
        else if (Array.isArray(obj.downloadNotice)) {
            if (obj.downloadNotice.length > 0)
                obj.downloadNotice.forEach(function (value) {
                    document.querySelector("input[name=downloadNotice][value=" + value + "]").click();
                });
        }
    }
);

//图标
document.querySelectorAll("input[name=iconType]").forEach(function (input) {
    input.onchange = function () {
        let iconType = this.value;
        let icon = '/img/icon_gray.png';
        if (iconType === 'dark') {
            icon = '/img/icon_gray.png';
        } else if (iconType === 'light') {
            icon = '/img/icon_light.png';
        } else {
            if (isDark()) {
                icon = '/img/icon_light.png';
            } else {
                icon = '/img/icon_gray.png';
            }
        }
        chrome.storage.sync.set(
            {
                iconType: iconType
            }
        );
        chrome.runtime.sendMessage({
            method: 'changeIcon',
            data: icon
        });
    };
});


//提示音
document.querySelectorAll("input[name=downloadSound]").forEach(function (input) {
    input.onchange = function () {
        let downloadSound = this.value;
        chrome.storage.sync.set(
            {
                downloadSound: downloadSound
            }
        );
        chrome.runtime.sendMessage({
            method: 'changeSound',
            data: downloadSound
        });
    };
});

//通知
let notices = [];
document.querySelectorAll("input[name=downloadNotice]").forEach(function (input) {
    input.onchange = function () {
        notices = [];
        if (this.value === 'off') {
            notices = [];
            this.checked = true;
            document.querySelectorAll("input[name=downloadNotice]").forEach(function (input) {
                if (input.value !== 'off'){
                    input.checked = false;
                }
            });
        } else {
            document.querySelectorAll("input[name=downloadNotice]").forEach(function (input) {
                if (input.value === 'off'){
                    input.checked = false;
                }
                if (input.checked){
                    notices.push(input.value);
                }
            });
            if (notices.length === 0){
                document.querySelector("input[name=downloadNotice][value=off]").checked = true;
            }
        }
        chrome.storage.sync.set(
            {
                downloadNotice: notices
            }
        );
        chrome.runtime.sendMessage({
            method: 'changeNotice',
            data: notices
        });
    };
});


//自动继续
document.querySelectorAll("input[name=downloadAutoResume]").forEach(function (input) {
    input.onchange = function () {
        let downloadAutoResume = this.value;
        chrome.storage.sync.set(
            {
                downloadAutoResume: downloadAutoResume
            }
        );
        chrome.runtime.sendMessage({
            method: 'changeAutoResume',
            data: downloadAutoResume
        });
    };
});

//是否深色模式
function isDark() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
}
