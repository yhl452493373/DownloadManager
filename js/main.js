import {Util} from "./module/Util.js";
import {Item} from "./module/Item.js";
import {StringDelta} from "./module/StringDelta.js";
import {BooleanDelta} from "./module/BooleanDelta.js";
import {DoubleDelta} from "./module/DoubleDelta.js";
import {State} from "./module/State.js";
import $ from "./module/jquery.min.js";

/**
 *
 * 更新下载项图标
 *
 * @param data {{
          id:number,
          url:string,
          finalUrl:string,
          referrer:string,
          filename:string,
          incognito:boolean,
          danger:string,
          mime:string,
          startTime:string,
          endTime:string,
          estimatedEndTime:string,
          state:string,
          paused:boolean,
          canResume:boolean,
          error:string,
          bytesReceived:number,
          totalBytes:number,
          fileSize:number,
          exists:boolean
 * }}
 */
const updateIcon = function (data) {
    if (data.id == null)
        return;
    let id = data.id;
    if (data.hasOwnProperty('icon')) {
        document.querySelector('#item_' + id).querySelector('img.icon').src = data.icon;
    } else {
        chrome.runtime.sendMessage({
            method: 'cacheIcon',
            data: id
        }, function () {

        });
    }
};

/**
 *
 * 更新下载项进度条
 *
 * @param dataList {Array<{
          id:number,
          url:string,
          finalUrl:string,
          referrer:string,
          filename:string,
          incognito:boolean,
          danger:string,
          mime:string,
          startTime:string,
          endTime:string,
          estimatedEndTime:string,
          state:string,
          paused:boolean,
          canResume:boolean,
          error:string,
          bytesReceived:number,
          totalBytes:number,
          fileSize:number,
          exists:boolean
 * }>}
 */
const updateProgress = function (dataList) {
    dataList.forEach(function (data) {
        let item = Item.of(data.id);
        item.updateProgress(data);
    });
};

/**
 *
 * @param data {{
          id:number,
          url:string,
          finalUrl:string,
          referrer:string,
          filename:string,
          incognito:boolean,
          danger:string,
          mime:string,
          startTime:string,
          endTime:string,
          estimatedEndTime:string,
          state:string,
          paused:boolean,
          canResume:boolean,
          error:string,
          bytesReceived:number,
          totalBytes:number,
          fileSize:number,
          exists:boolean
 * }}
 */
const updateFilename = function (data) {
    if (data == null)
        return;
    let item = Item.of(data.id);
    item.updateFilename(Util.filename(data.filename));
};

/**
 *
 * @param downloadDelta {{
         id:number,
         url:StringDelta,
         finalUrl:StringDelta,
         filename:StringDelta,
         danger:StringDelta,
         mime:StringDelta,
         startTime:StringDelta,
         endTime:StringDelta,
         state:StringDelta,
         canResume:BooleanDelta,
         paused:BooleanDelta,
         error:StringDelta,
         totalBytes:DoubleDelta,
         fileSize:DoubleDelta,
         exists:BooleanDelta
 * }}
 */
const downloadComplete = function (downloadDelta) {
    let item = Item.of(downloadDelta.id);
    let data = Util.convertDelta(downloadDelta);
    if (data == null)
        return;
    item.downloadComplete(data);
};

/**
 *
 * @param data {{
          id:number,
          url:string,
          finalUrl:string,
          referrer:string,
          filename:string,
          incognito:boolean,
          danger:string,
          mime:string,
          startTime:string,
          endTime:string,
          estimatedEndTime:string,
          state:string,
          paused:boolean,
          canResume:boolean,
          error:string,
          bytesReceived:number,
          totalBytes:number,
          fileSize:number,
          exists:boolean
 * }}
 */
const createDownloadItem = function (data) {
    let item = new Item(data).render();
    let body = Util.getElement('#body');
    Util.getElement('.operation .icon-delete', item).parentNode.title = "取消下载";
    if (body.childNodes.length === 0) {
        body.appendChild(item);
    } else {
        body.insertBefore(item, body.childNodes[0]);
    }
    updateIcon(data);
};

/**
 *
 * @param id {number}
 */
const eraseDownloadItem = function (id) {
    let item = Item.of(id);
    item.eraseDownloadItem();
    chrome.runtime.sendMessage({
        method: 'deleteIconCache',
        data: id
    });
};

const cancelDownloadItem = function (id) {
    let item = Item.of(id);
    item.cancelDownloadItem();
};

const pauseDownloadItem = function (id) {
    let item = Item.of(id);
    item.pauseDownloadItem();
};

chrome.runtime.onMessage.addListener(function (request) {
    if (request.method === 'updateProgress') {
        updateProgress(request.data);
    } else if (request.method === 'downloadComplete') {
        downloadComplete(request.data);
    } else if (request.method === 'updateFilename') {
        updateFilename(request.data);
    } else if (request.method === 'createDownloadItem') {
        createDownloadItem(request.data);
    } else if (request.method === 'updateIcon') {
        updateIcon(request.data);
    } else if (request.method === 'eraseDownloadItem') {
        eraseDownloadItem(request.data);
    }
});

chrome.downloads.search({
    orderBy: ["-startTime"]
}, function (results) {
    results.forEach(function (result) {
        if (Util.emptyString(result.filename))
            return;
        let item = new Item(result).render();
        Util.getElement('#body').appendChild(item);
        updateIcon(result);
    });
});

/**
 * 获取每个下载条目的下载文件id
 * @param target {Node|HTMLElement|EventTarget}
 * @return {number|null}
 */
const getDownloadItemId = function (target) {
    let id = $(target).closest('.item').attr('id');
    return Number(id.replace('item_', ''));
};

/**
 * 复制文本到剪贴板
 * @param text {string|number} 文本内容
 */
const copyToClipboard = function (text) {
    let input = document.createElement('input');
    input.value = text;
    input.style.position = 'fixed';
    input.style.left = '-999999999px';
    document.body.appendChild(input);
    input.select(); // 选择对象
    document.execCommand("Copy"); // 执行浏览器复制命令
    input.remove();
};

$(document).on('click', '.event .icon-delete', function (e) {
    let id = getDownloadItemId(e.target);
    chrome.downloads.search({
        id: id,
        state: State.in_progress.code
    }, function (results) {
        if (results.length > 0) {
            chrome.downloads.cancel(id, function () {
                cancelDownloadItem(id);
            });
        } else {
            chrome.downloads.erase({
                id: id
            }, function () {

            });
        }
    });
}).on('click', '.event .icon-resume', function (e) {
    let id = getDownloadItemId(e.target);
    chrome.downloads.search({
        id: id
    }, function (results) {
        if (results.length > 0) {
            if (results[0].paused) {
                chrome.downloads.resume(id, function () {
                    let item = Item.of(id);
                    item.resumeDownloadItem();
                    chrome.runtime.sendMessage({
                        method: 'pullProgress'
                    });
                });
            }
        }
    });
}).on('click', '.event .icon-pause', function (e) {
    let id = getDownloadItemId(e.target);
    chrome.downloads.search({
        id: id
    }, function (results) {
        if (results.length > 0) {
            chrome.downloads.pause(id, function () {
                pauseDownloadItem(id);
            });
        }
    });
}).on('click', '.event .icon-refresh', function (e) {
    let id = getDownloadItemId(e.target);
    chrome.downloads.search({
        id: id
    }, function (results) {
        if (results.length > 0) {
            let url = results[0].url;
            chrome.downloads.download({url: url}, function () {
                chrome.downloads.erase({
                    id: id
                }, function () {
                });
            });
        }
    });
}).on('click', '.event .icon-open', function (e) {
    chrome.downloads.open(getDownloadItemId(e.target));
}).on('click', '.open-download-folder', function (e) {
    chrome.downloads.showDefaultFolder();
}).on('click', '.clear-download-item', function (e) {
    chrome.downloads.search({}, function (results) {
        results.forEach(function (result) {
            chrome.downloads.erase({id: result.id}, function (erasedIds) {
                eraseDownloadItem(erasedIds[0]);
            });
        });
    });
}).on('input', '.search-text', function () {
    let name = this.value;
    if (Util.emptyString(name)) {
        Util.getElementAll('.item').forEach(function (node) {
            node.classList.remove('hide');
        });
        return;
    }
    chrome.downloads.search({}, function (results) {
        let ids = [];
        results.forEach(function (result) {
            if (Util.filename(result.filename.toUpperCase()).indexOf(name.toUpperCase()) !== -1) {
                ids.push('item_' + result.id);
            }
        });
        Util.getElementAll('.item').forEach(function (node) {
            let id = node.id;
            if (ids.indexOf(id) === -1) {
                node.classList.add('hide');
            } else {
                node.classList.remove('hide');
            }
        });
    });
});

// 鼠标右键事件
$(document).on('contextmenu', '#body .item', function (e) {
    //显示蒙版层
    $('.modal').show();
    //获取下载文件id
    let downloadId = getDownloadItemId(this);

    // 获取窗口尺寸
    let winWidth = $(document).width();
    let winHeight = $(document).height();
    // 鼠标点击位置坐标
    let mouseX = e.pageX;
    let mouseY = e.pageY;
    // ul标签的宽高
    let $contextmenu = $(".contextmenu");
    let menuWidth = $contextmenu.width();
    let menuHeight = $contextmenu.height();
    // 最小边缘margin(具体窗口边缘最小的距离)
    let minEdgeMargin = 10;
    let menuLeft, menuTop;
    // 以下判断用于检测ul标签出现的地方是否超出窗口范围
    // 第一种情况：右下角超出窗口
    if (mouseX + menuWidth + minEdgeMargin >= winWidth &&
        mouseY + menuHeight + minEdgeMargin >= winHeight) {
        menuLeft = mouseX - menuWidth - minEdgeMargin + "px";
        menuTop = mouseY - menuHeight - minEdgeMargin + "px";
    }
    // 第二种情况：右边超出窗口
    else if (mouseX + menuWidth + minEdgeMargin >= winWidth) {
        menuLeft = mouseX - menuWidth - minEdgeMargin + "px";
        menuTop = mouseY + minEdgeMargin + "px";
    }
    // 第三种情况：下边超出窗口
    else if (mouseY + menuHeight + minEdgeMargin >= winHeight) {
        menuLeft = mouseX + minEdgeMargin + "px";
        menuTop = mouseY - menuHeight - minEdgeMargin + "px";
    }
    // 其他情况：未超出窗口
    else {
        menuLeft = mouseX + minEdgeMargin + "px";
        menuTop = mouseY + minEdgeMargin + "px";
    }
    // ul菜单出现
    $contextmenu.css({
        "left": menuLeft,
        "top": menuTop
    }).show();

    $contextmenu.on('click', '.open-file', function () {
        chrome.downloads.open(downloadId);
    }).on('click', '.open-file-folder', function () {
        chrome.downloads.show(downloadId);
    }).on('click', '.copy-filename', function () {
        chrome.downloads.search({id: downloadId}, function (results) {
            if (results.length > 0) {
                let result = results[0];
                let filename = Util.filename(result.filename);
                copyToClipboard(filename);
            }
        });
    }).on('click', '.copy-download-url', function () {
        chrome.downloads.search({id: downloadId}, function (results) {
            if (results.length > 0) {
                let result = results[0];
                copyToClipboard(result.url);
            }
        });
    }).on('click', '.re-download', function () {
        chrome.downloads.search({
            id: downloadId
        }, function (results) {
            if (results.length > 0) {
                let url = results[0].url;
                chrome.downloads.download({url: url}, function () {
                    chrome.downloads.erase({
                        id: id
                    }, function () {
                    });
                });
            }
        });
    });
    // 阻止浏览器默认的右键菜单事件
    return false;
});

// 点击之后，右键菜单隐藏
$(document).on('click', function () {
    $(".contextmenu").hide();
    $('.modal').hide();
});
