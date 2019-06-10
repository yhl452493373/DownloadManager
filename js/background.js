import {State} from "./module/State.js";
import {Util} from "./module/Util.js";
import {DangerType} from "./module/DangerType.js";

let intervalId = -1;
let downLoadingFiles = [], iconCache = {};
if (chrome.downloads && chrome.downloads.setShelfEnabled)
    chrome.downloads.setShelfEnabled(false);

chrome.runtime.onMessage.addListener(function (request) {
    if (request.method === 'pullProgress') {
        pullProgress();
    } else if (request.method === 'cacheIcon') {
        cacheIcon(request.data);
    } else if (request.method === 'deleteIconCache') {
        delete iconCache[request.data];
    }
});

chrome.downloads.onCreated.addListener(function (downloadItem) {
    downLoadingFiles.push(downloadItem);
});

chrome.downloads.onChanged.addListener(function (downloadDelta) {
    if (!iconCache.hasOwnProperty(downloadDelta.id) || Util.emptyString(iconCache[downloadDelta.id].icon)) {
        cacheIcon(downloadDelta.id);
    }
    if (downloadDelta.danger && downloadDelta.danger.current !== DangerType.safe.code && downloadDelta.danger.current !== DangerType.accepted.code) {
        cacheIcon(downloadDelta.id, false, function (cachedIcon) {
            chrome.notifications.getPermissionLevel(function (level) {
                if (level === 'granted') {
                    chrome.downloads.search({id: downloadDelta.id}, arr => {
                        if (Array.isArray(arr) && arr.length > 0) {
                            chrome.notifications.create('danger-' + downloadDelta.id, {
                                type: 'basic',
                                title: chrome.i18n.getMessage('safetyWaring'),
                                message: Util.filename(arr[0].filename),
                                contextMessage: DangerType.valueOf(downloadDelta.danger.current).name,
                                iconUrl: cachedIcon.icon || '../img/icon_green.png',
                                isClickable: true
                            }, notificationId => {

                            });

                        }
                    });
                }
            });
            pullProgress();
            chrome.browserAction.setBadgeText({
                text: downLoadingFiles.length + ''
            });
            let downloadItem = downLoadingFiles.find(downloadItem => downloadItem.id === downloadDelta.id);
            if (downloadItem == null)
                return;
            downloadItem.filename = downloadDelta.filename.current;
            chrome.runtime.sendMessage({
                method: 'createDownloadItem',
                data: downloadItem
            });
        });
    } else {
        if (downloadDelta.filename && downloadDelta.filename.current) {
            pullProgress();
            chrome.browserAction.setBadgeText({
                text: downLoadingFiles.length + ''
            });
            let downloadItem = downLoadingFiles.find(downloadItem => downloadItem.id === downloadDelta.id);
            if (downloadItem == null)
                return;
            downloadItem.filename = downloadDelta.filename.current;
            chrome.runtime.sendMessage({
                method: 'createDownloadItem',
                data: downloadItem
            });

            chrome.notifications.create('start-' + downloadDelta.id, {
                type: 'basic',
                title: chrome.i18n.getMessage('downloadStart'),
                message: chrome.i18n.getMessage('downloadStart') + '：' + Util.filename(downloadDelta.filename.current),
                iconUrl: iconCache[downloadDelta.id] && iconCache[downloadDelta.id].icon || '../img/icon_green.png',
                isClickable: true
            }, notificationId => {

            });
        }

        if (downloadDelta.state && downloadDelta.state.current === State.complete.code) {
            //下载完成更新图标
            cacheIcon(downloadDelta.id, true, function (cachedIcon) {
                //发送文件下载完成请求
                chrome.runtime.sendMessage({
                    method: 'downloadComplete',
                    data: downloadDelta
                });
                chrome.notifications.getPermissionLevel(function (level) {
                    if (level === 'granted') {
                        chrome.downloads.search({id: downloadDelta.id}, results => {
                            if (Array.isArray(results) && results.length > 0) {
                                chrome.notifications.create('complete-' + downloadDelta.id, {
                                    type: 'basic',
                                    title: chrome.i18n.getMessage('downloadComplete'),
                                    message: results[0].filename,
                                    iconUrl: cachedIcon.icon || '../img/icon_green.png',
                                    buttons: [{
                                        title: chrome.i18n.getMessage('open'),
                                    }, {
                                        title: chrome.i18n.getMessage('openFolder'),
                                    }],
                                    isClickable: true
                                }, notificationId => {

                                });

                            }
                        });

                    }
                });
            });
        }

        if (downloadDelta.state && downloadDelta.state.current === State.interrupted.code) {
            //下载页面取消下载
            chrome.runtime.sendMessage({
                method: 'cancelDownloadItem',
                data: downloadDelta.id
            });
        }

        if (downloadDelta.paused) {
            //下载页面暂停,恢复下载
            if (downloadDelta.paused.current) {
                if (downloadDelta.canResume.current) {
                    //从下载变为暂停,并且可以恢复
                    chrome.runtime.sendMessage({
                        method: 'pauseDownloadItem',
                        data: downloadDelta.id
                    });
                } else {
                    //从下载变为暂停,并且不可恢复
                    chrome.runtime.sendMessage({
                        method: 'cancelDownloadItem',
                        data: downloadDelta.id
                    });
                }
            } else {
                //从暂停变为下载,并且之前状态指明可以回复
                if (downloadDelta.canResume.previous) {
                    pullProgress();
                } else {
                    //从下暂停变为下载,并且之前状态指明不可恢复
                    chrome.runtime.sendMessage({
                        method: 'cancelDownloadItem',
                        data: downloadDelta.id
                    });
                }
            }
        }

        if (downloadDelta.exists && !downloadDelta.exists.current) {
            //文件不存在
            chrome.downloads.erase({
                id: downloadDelta.id
            }, function () {

            });
        }

        if (downloadDelta.danger && downloadDelta.danger.current !== DangerType.safe.code && downloadDelta.danger.current !== DangerType.accepted.code) {
            chrome.notifications.getPermissionLevel(function (level) {
                if (level === 'granted') {
                    chrome.downloads.search({id: downloadDelta.id}, results => {
                        if (results.length > 0) {
                            chrome.notifications.create('danger-' + downloadDelta.id, {
                                type: 'basic',
                                title: chrome.i18n.getMessage('safetyWaring'),
                                message: Util.filename(results[0].filename),
                                contextMessage: DangerType.valueOf(downloadDelta.danger.current).name,
                                iconUrl: iconCache[downloadDelta.id] || '../img/icon_green.png',
                                isClickable: true
                            }, notificationId => {

                            });

                        }
                    });
                }
            });
        }
    }
});

chrome.downloads.onErased.addListener(function (id) {
    //发送消除下载请求
    chrome.runtime.sendMessage({
        method: 'eraseDownloadItem',
        data: id
    });
});

chrome.notifications.onClicked.addListener(notificationId => {
    if (notificationId.indexOf('danger') !== -1) {
        // 发送渲染有危险的条目请求
        let itemId = parseInt(id.substring(id.indexOf("-") + 1))
    }
    chrome.notifications.clear(notificationId);
});

chrome.notifications.onButtonClicked.addListener((id, index) => {
    chrome.notifications.clear(id);
    if (id.indexOf("complete") > -1) {
        if (index === 0) {
            chrome.downloads.open(parseInt(id.substring(id.indexOf("-") + 1)));
        } else if (index === 1) {
            chrome.downloads.show(parseInt(id.substring(id.indexOf("-") + 1)));
        }
    }
});

// chrome.downloads.onDeterminingFilename.addListener(function (downloadItem) {
//     //发送更新文件名请求
//     chrome.runtime.sendMessage({
//         method: 'updateFilename',
//         data: downloadItem
//     });
// });

/**
 * 缓存图标：如果图标已存在，则直接发送更新图标请求
 * 所有最终更新图标的请求都在这里发起
 *
 * @param id {number} 图标对应的下载对象id
 * @param force {boolean} 是否强制更新。用于下载完成后
 * @param callback {function}
 */
function cacheIcon(id, force = false, callback = null) {
    if (!force && iconCache.hasOwnProperty(id)) {
        chrome.runtime.sendMessage({
            method: 'updateIcon',
            data: iconCache[id]
        });
    } else {
        chrome.downloads.getFileIcon(id, {
            'size': 32
        }, function (icon) {
            if (icon) {
                iconCache[id] = {
                    id: id,
                    icon: icon
                };
                chrome.runtime.sendMessage({
                    method: 'updateIcon',
                    data: iconCache[id]
                });
                callback && callback(iconCache[id]);
            }
        });
    }
}

chrome.downloads.search({}, function (results) {
    results.forEach(function (result) {
        cacheIcon(result.id);
    })
});

/**
 * 循环读取文件下载进度
 */
function pullProgress() {
    if (intervalId === -1) {
        intervalId = window.setInterval(() => {
            chrome.downloads.search({
                state: State.in_progress.code,
                paused: false
            }, function (results) {
                downLoadingFiles = results;
                if (!results || results.length === 0) {
                    window.clearInterval(intervalId);
                    intervalId = -1;
                    //todo 这个方法无效
                    chrome.browserAction.setIcon({
                        path: '../img/icon_gray.png'
                    }, function () {
                        // body...
                    });
                    chrome.browserAction.setBadgeText({
                        text: ''
                    });
                    return;
                }
                chrome.browserAction.setBadgeText({
                    text: downLoadingFiles.length + ''
                });
                //todo 这个方法无效
                chrome.browserAction.setIcon({
                    path: '../img/icon_green.png'
                }, function () {
                    // body...
                });
                //发送更新文件进度请求
                chrome.runtime.sendMessage({
                    method: 'updateProgress',
                    data: downLoadingFiles
                });
            });
        }, 1000);
    }
}

pullProgress();

