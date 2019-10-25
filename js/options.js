document.querySelector('title').innerText = chrome.i18n.getMessage('options');
document.querySelector('#iconType').innerText = chrome.i18n.getMessage('iconType');
document.querySelector('#iconDark').innerText = chrome.i18n.getMessage('iconDark');
document.querySelector('#iconLight').innerText = chrome.i18n.getMessage('iconLight');
document.querySelector('#iconAuto').innerText = chrome.i18n.getMessage('iconAuto');
document.querySelector('#downloadNoticeText').innerText = chrome.i18n.getMessage('downloadNotice');

chrome.storage.sync.get(
    {
        iconType: 'dark',
        downloadNotice: false
    }, function (obj) {
        document.querySelector("input[name=iconType][value=" + obj.iconType + "]").checked = true;
        document.querySelector("#downloadNotice").checked = obj.downloadNotice;
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
                chrome.browserAction.setIcon({path: icon});
            }
        );
        chrome.runtime.sendMessage({
            method: 'changeIcon',
            data: icon
        }, function () {

        });
    };
});

document.querySelector("#downloadNotice").onchange = function () {
    let checked = this.checked;
    chrome.storage.sync.set(
        {
            downloadNotice: checked
        }, function () {

        }
    );
    chrome.runtime.sendMessage({
        method: 'changeNotice',
        data: checked
    }, function () {

    });
};

//是否深色模式
function isDark() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
}
