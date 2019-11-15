document.querySelector('title').innerText = chrome.i18n.getMessage('options');
document.querySelector('#iconType').innerText = chrome.i18n.getMessage('iconType') + ":";
document.querySelector('#iconAuto').innerText = chrome.i18n.getMessage('iconAuto');
document.querySelector('#iconDark').innerText = chrome.i18n.getMessage('iconDark');
document.querySelector('#iconLight').innerText = chrome.i18n.getMessage('iconLight');
document.querySelector('#downloadSound').innerText = chrome.i18n.getMessage('downloadSound') + ":";
document.querySelector('#soundOff').innerText = chrome.i18n.getMessage('soundOff');
document.querySelector('#soundOn').innerText = chrome.i18n.getMessage('soundOn');
document.querySelector('#downloadNotice').innerText = chrome.i18n.getMessage('downloadNotice') + ":";
document.querySelector('#noticeOff').innerText = chrome.i18n.getMessage('noticeOff');
document.querySelector('#downloadStart').innerText = chrome.i18n.getMessage('startNotice');
document.querySelector('#downloadComplete').innerText = chrome.i18n.getMessage('completeNotice');
document.querySelector('#downloadDanger').innerText = chrome.i18n.getMessage('dangerNotice');

chrome.storage.sync.get(
    {
        iconType: 'auto',
        downloadSound: 'off',
        downloadNotice: 'off'
    }, function (obj) {
        document.querySelector("input[name=iconType][value=" + obj.iconType + "]").click();
        document.querySelector("input[name=downloadSound][value=" + obj.downloadSound + "]").click();
        if (typeof obj.downloadNotice === "string")
            document.querySelector("input[name=downloadNotice][value=" + obj.downloadNotice + "]").click();
        else if (Array.isArray(obj.downloadNotice)) {
            obj.downloadNotice.forEach(function (value) {
                document.querySelector("input[name=downloadNotice][value=" + value + "]").click();
            });
        }
    }
);

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
            }, function () {
            }
        );
        chrome.runtime.sendMessage({
            method: 'changeIcon',
            data: icon
        }, function () {
        });
    };
});


document.querySelectorAll("input[name=downloadSound]").forEach(function (input) {
    input.onchange = function () {
        let downloadSound = this.value;
        chrome.storage.sync.set(
            {
                downloadSound: downloadSound
            }, function () {
            }
        );
        chrome.runtime.sendMessage({
            method: 'changeSound',
            data: downloadSound
        }, function () {
        });
    };
});

let notices = [];
document.querySelectorAll("input[name=downloadNotice]").forEach(function (input) {
    input.onchange = function () {
        notices = [];
        if (this.value === 'off') {
            notices = [];
            document.querySelectorAll("input[name=downloadNotice]").forEach(function (input) {
                if (input.value !== 'off')
                    input.checked = false;
            });
        } else {
            document.querySelectorAll("input[name=downloadNotice]").forEach(function (input) {
                if (input.value === 'off')
                    input.checked = false;
                if (input.checked)
                    notices.push(input.value);
            });
            if (notices.length === 0)
                document.querySelector("input[name=downloadNotice][value=off]").checked = true;
        }
        console.log(notices);
        chrome.storage.sync.set(
            {
                downloadNotice: notices
            }, function () {
            }
        );
        chrome.runtime.sendMessage({
            method: 'changeNotice',
            data: notices
        }, function () {
        });
    };
})
;

//是否深色模式
function isDark() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
}
