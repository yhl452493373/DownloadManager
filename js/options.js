document.querySelector('title').innerText = chrome.i18n.getMessage('options');
document.querySelector('#downloadNoticeText').innerText = chrome.i18n.getMessage('downloadNotice');

chrome.storage.sync.get(
    {
        downloadNotice: false
    }, function (obj) {
        document.querySelector("#downloadNotice").checked = obj.downloadNotice;
    }
);

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