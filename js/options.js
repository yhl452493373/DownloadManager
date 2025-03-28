import IconType from "./module/IconType.js";
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
document.querySelector('#iconProgress').innerText = chrome.i18n.getMessage('showProgressOnIcon') + ':';
document.querySelector('#iconProgressOff').innerText = chrome.i18n.getMessage('showProgressOnIconOff');
document.querySelector('#iconProgressOn').innerText = chrome.i18n.getMessage('showProgressOnIconOn');

const cloudData = await Util.getCloudStorage({
    iconType: IconType.auto.toString(),
    downloadSound: 'off',
    downloadNotice: 'off',
    alsoDeleteFile: 'off',
    iconProgress: 'off'
});

document.querySelector("input[name=iconType][value=" + cloudData.iconType + "]").click();
document.querySelector("input[name=downloadSound][value=" + cloudData.downloadSound + "]").click();
document.querySelector("input[name=alsoDeleteFile][value=" + cloudData.alsoDeleteFile + "]").click();
document.querySelector("input[name=iconProgress][value=" + cloudData.iconProgress + "]").click();
if (typeof cloudData.downloadNotice === "string" || cloudData.downloadNotice.length === 0)
    document.querySelector("input[name=downloadNotice][value=off]").click();
else if (Array.isArray(cloudData.downloadNotice)) {
    if (cloudData.downloadNotice.length > 0) {
        cloudData.downloadNotice.forEach(value => {
            document.querySelector("input[name=downloadNotice][value=" + value + "]").click();
        });
    }
}

document.querySelectorAll("input[name=iconType]").forEach(input => {
    input.onchange = async function () {
        let isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
        let iconType = this.value;
        await Util.setCloudStorage({
            iconType: iconType
        });

        await Util.setLocalStorage({
            iconType: iconType
        });

        await Util.sendMessage({
            method: 'changeActionIcon',
            data: iconType !== IconType.auto.toString() ? iconType : isDarkMode ? IconType.light.toString() : IconType.dark.toString()
        });
    };
});

document.querySelectorAll("input[name=downloadSound]").forEach(input => {
    input.onchange = async function () {
        let downloadSound = this.value;
        await Util.setCloudStorage({
            downloadSound: downloadSound
        });
        await Util.setLocalStorage({
            downloadSound: downloadSound
        });
        await Util.sendMessage({
            method: 'changeSound',
            data: downloadSound
        });
    };
});

let notices = [];
document.querySelectorAll("input[name=downloadNotice]").forEach(input => {
    input.onchange = async function () {
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
        await Util.setCloudStorage({
            downloadNotice: notices
        });
        await Util.setLocalStorage({
            downloadNotice: notices
        });
        await Util.sendMessage({
            method: 'changeNotice',
            data: notices
        });
    };
});

document.querySelectorAll("input[name=alsoDeleteFile]").forEach(input => {
    input.onchange = async function () {
        let alsoDeleteFile = this.value;
        await Util.setCloudStorage({
            alsoDeleteFile: alsoDeleteFile
        });
        await Util.setLocalStorage({
            alsoDeleteFile: alsoDeleteFile
        });
        await Util.sendMessage({
            method: 'alsoDeleteFile',
            data: alsoDeleteFile
        });
    };
});

document.querySelectorAll("input[name=iconProgress]").forEach(input => {
    input.onchange = async function () {
        let iconProgress = this.value;
        await Util.setCloudStorage({
            iconProgress: iconProgress
        });
        await Util.setLocalStorage({
            iconProgress: iconProgress
        });
        await Util.sendMessage({
            method: 'iconProgress',
            data: iconProgress
        });
    };
});
