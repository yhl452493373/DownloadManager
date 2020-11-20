import Util from "./module/Util.js";

document.querySelector('title').innerText = chrome.i18n.getMessage('options');
document.querySelector('#iconType').innerText = chrome.i18n.getMessage('iconType') + ':';
document.querySelector('#iconAuto').innerText = chrome.i18n.getMessage('iconAuto');
document.querySelector('#iconDark').innerText = chrome.i18n.getMessage('iconDark');
document.querySelector('#iconLight').innerText = chrome.i18n.getMessage('iconLight');
document.querySelector('#downloadSound').innerText = chrome.i18n.getMessage('downloadSound') + ':';
document.querySelector('#soundOff').innerText = chrome.i18n.getMessage('soundOff');
document.querySelector('#soundOn').innerText = chrome.i18n.getMessage('soundOn');
document.querySelector('#downloadNotice').innerText = chrome.i18n.getMessage('downloadNotice') + ':';
document.querySelector('#noticeOff').innerText = chrome.i18n.getMessage('noticeOff');
document.querySelector('#downloadStart').innerText = chrome.i18n.getMessage('startNotice');
document.querySelector('#downloadComplete').innerText = chrome.i18n.getMessage('completeNotice');
document.querySelector('#downloadDanger').innerText = chrome.i18n.getMessage('dangerNotice');
document.querySelector('#alsoRemoveFile').innerText = chrome.i18n.getMessage('alsoRemoveFile') + ':';
document.querySelector('#removeFileOff').innerText = chrome.i18n.getMessage('removeFileOff');
document.querySelector('#removeFileOn').innerText = chrome.i18n.getMessage('removeFileOn');

chrome.storage.sync.get({
        iconType: 'auto',
        downloadSound: 'off',
        downloadNotice: 'off',
        alsoDeleteFile: 'off'
    }, obj => {
        document.querySelector("input[name=iconType][value=" + obj.iconType + "]").click();
        document.querySelector("input[name=downloadSound][value=" + obj.downloadSound + "]").click();
        document.querySelector("input[name=alsoDeleteFile][value=" + obj.alsoDeleteFile + "]").click();
        if (typeof obj.downloadNotice === "string" || obj.downloadNotice.length === 0)
            document.querySelector("input[name=downloadNotice][value=off]").click();
        else if (Array.isArray(obj.downloadNotice)) {
            if (obj.downloadNotice.length > 0)
                obj.downloadNotice.forEach(value => {
                    document.querySelector("input[name=downloadNotice][value=" + value + "]").click();
                });
        }
    }
);

document.querySelectorAll("input[name=iconType]").forEach(input => {
    input.onchange = function () {
        let iconType = this.value;
        let icon;
        if (iconType === 'dark') {
            icon = '/img/icon_gray.png';
        } else if (iconType === 'light') {
            icon = '/img/icon_light.png';
        } else {
            if (Util.isDark()) {
                icon = '/img/icon_light.png';
            } else {
                icon = '/img/icon_gray.png';
            }
        }
        chrome.storage.sync.set({
            iconType: iconType
        });
        chrome.runtime.sendMessage({
            method: 'changeActionIcon',
            data: icon
        });
    };
});


document.querySelectorAll("input[name=downloadSound]").forEach(input => {
    input.onchange = function () {
        let downloadSound = this.value;
        chrome.storage.sync.set({
            downloadSound: downloadSound
        });
        chrome.runtime.sendMessage({
            method: 'changeSound',
            data: downloadSound
        });
    };
});

let notices = [];
document.querySelectorAll("input[name=downloadNotice]").forEach(input => {
    input.onchange = function () {
        notices = [];
        if (this.value === 'off') {
            notices = [];
            this.checked = true;
            document.querySelectorAll("input[name=downloadNotice]").forEach(input => {
                if (input.value !== 'off')
                    input.checked = false;
            });
        } else {
            document.querySelectorAll("input[name=downloadNotice]").forEach(input => {
                if (input.value === 'off')
                    input.checked = false;
                if (input.checked)
                    notices.push(input.value);
            });
            if (notices.length === 0)
                document.querySelector("input[name=downloadNotice][value=off]").checked = true;
        }
        chrome.storage.sync.set(
            {
                downloadNotice: notices
            }, function () {
            }
        );
        chrome.runtime.sendMessage({
            method: 'changeNotice',
            data: notices
        });
    };
});

document.querySelectorAll("input[name=alsoDeleteFile]").forEach(input => {
    input.onchange = function () {
        let alsoDeleteFile = this.value;
        chrome.storage.sync.set({
            alsoDeleteFile: alsoDeleteFile
        });
        chrome.runtime.sendMessage({
            method: 'alsoDeleteFile',
            data: alsoDeleteFile
        });
    };
});
