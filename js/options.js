document.querySelector('title').innerText = chrome.i18n.getMessage('options');
document.querySelector('#lightIconText').innerText = chrome.i18n.getMessage('lightIcon');
document.querySelector('#downloadNoticeText').innerText = chrome.i18n.getMessage('downloadNotice');

chrome.storage.sync.get(
    {
        lightIcon: false,
        downloadNotice: false
    }, function (obj) {
        document.querySelector("#lightIcon").checked = obj.lightIcon;
        document.querySelector("#downloadNotice").checked = obj.downloadNotice;
    }
);

document.querySelector("#lightIcon").onchange = function () {
    let checked = this.checked;
    let icon = '/img/icon_gray.png';
    if (checked)
        icon = '/img/icon_light.png';
    chrome.storage.sync.set(
        {
            lightIcon: checked
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
