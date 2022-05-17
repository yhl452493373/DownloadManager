import Util from "./module/Util.js";
import Item from "./module/Item.js";
import State from "./module/State.js";
import DownloadItem from "./module/DownloadItem.js";
import DownloadDelta from "./module/DownloadDelta.js";
import RuntimeError from "./module/RuntimeError.js";
// noinspection SpellCheckingInspection
import Toastify from "../plugin/toastify/toastify.js";
import $ from "./module/jquery.min.js";

/**
 * 右键菜单中点击的下载项id,点击后赋值，使用后置为null
 * @type {number|null}
 */
let clickedItemId;

/**
 *
 * 更新下载项图标
 *
 * @param data {{id:number,icon:string?}}
 */
function updateIcon(data) {
    if (data.hasOwnProperty('id') && Util.emptyString(data.id))
        return;
    let id = data.id;
    if (data.hasOwnProperty('icon')) {
        let item = document.querySelector('#item_' + id);
        if (item != null)
            item.querySelector('img.icon').src = data.icon;
    } else {
        chrome.runtime.sendMessage({
            method: 'cacheIcon',
            data: id
        });
    }
}

/**
 *
 * 更新下载项进度条
 *
 * @param downloadItem {DownloadItem} 下载项列表
 */
function updateProgress(downloadItem) {
    let item = Item.of(downloadItem.id);
    if (item != null)
        item.updateProgress(downloadItem);
}

/**
 *
 * @param downloadDelta {DownloadDelta}
 */
function downloadComplete(downloadDelta) {
    let item = Item.of(downloadDelta.id);
    if (item != null) {
        item.downloadComplete(downloadDelta);
    }
}

/**
 *
 * @param downloadItem {DownloadItem}
 */
function createDownloadItem(downloadItem) {
    let item = Item.of(downloadItem.id);
    if (item == null) {
        item = new Item(downloadItem).render();
        let body = Util.getElement('#body');
        Util.getElement('#empty').style.display = 'none';
        Util.getElement('.operation .icon-delete', item).parentNode.title = chrome.i18n.getMessage('cancelDownload');
        if (body.childNodes.length === 0) {
            body.appendChild(item);
        } else {
            body.insertBefore(item, body.childNodes[0]);
        }
    }
    updateIcon(downloadItem);
}

/**
 *
 * @param id {number}
 */
function eraseDownloadItem(id) {
    let item = Item.of(id);
    if (item != null)
        item.eraseDownloadItem();
    chrome.runtime.sendMessage({
        method: 'deleteIconCache',
        data: id
    });
}

/**
 *
 * @param downloadDelta {DownloadDelta}
 */
function cancelDownloadItem(downloadDelta) {
    let item = Item.of(downloadDelta.id);
    if (item != null)
        item.cancelDownloadItem(downloadDelta);
}

/**
 *
 * @param id
 */
function pauseDownloadItem(id) {
    let item = Item.of(id);
    if (item != null)
        item.pauseDownloadItem();
}

function downloadItem(urls) {
    let allPass = true;
    let firstDuration = 2000;
    if (urls.trim() === '') {
        Toastify({
            text: chrome.i18n.getMessage('urlInCorrect'),
            duration: firstDuration,
            gravity: "top", // `top` or `bottom`
            position: "right", // `left`, `center` or `right`
            className: "customize-toastify",
            stopOnFocus: false, // Prevents dismissing of toast on hover
            onClick: function () {
            } // Callback after click
        }).showToast();
        return;
    }
    urls = urls.split("\n");
    let maxToastDuration = firstDuration + (urls.length - 1) * 500;
    urls.forEach((url, index) => {
        if (url.indexOf('http://') !== 0 && url.indexOf('https://') !== 0) {
            Toastify({
                text: url + '<br>' + chrome.i18n.getMessage('urlInCorrect') + ',' + chrome.i18n.getMessage('onlyProtocol'),
                duration: maxToastDuration - index * 500,
                gravity: "top", // `top` or `bottom`
                position: "right", // `left`, `center` or `right`
                className: "customize-toastify",
                stopOnFocus: false // Prevents dismissing of toast on hover
            }).showToast();
            allPass = false;
            return false;
        }
    });
    if (allPass) {
        $('#cancelNewDownload').click();
        $('#newDownloadUrl').val('');
        Toastify({
            text: chrome.i18n.getMessage('startDownloading'),
            duration: maxToastDuration + 500,
            gravity: "top", // `top` or `bottom`
            position: "right", // `left`, `center` or `right`
            className: "customize-toastify",
            stopOnFocus: false, // Prevents dismissing of toast on hover
            onClick: function () {
            } // Callback after click
        }).showToast();
        let timer = setTimeout(() => {
            clearTimeout(timer);
            downloadStart(urls, 0, maxToastDuration);
        }, 500);
    }
}

/**
 * 开始下载
 * @param urls 下载地址列表
 * @param index 下载索引
 * @param  maxToastDuration toast最大时常
 */
function downloadStart(urls, index = 0, maxToastDuration) {
    if (index === urls.length)
        return;
    let url = urls[index];
    chrome.downloads.download({
        url: url,
        // filename:'',
        // conflictAction:()=>{},
        // saveAs:true,
    }, downloadId => {
        if (chrome.runtime.lastError) {
            let runtimeError = RuntimeError.valueOfCode(chrome.runtime.lastError.message);
            Toastify({
                text: url + '<br>' + runtimeError || chrome.runtime.lastError.message,
                duration: maxToastDuration - index * 500,
                gravity: "top", // `top` or `bottom`
                position: "right", // `left`, `center` or `right`
                className: "customize-toastify",
                stopOnFocus: false, // Prevents dismissing of toast on hover
                onClick: function () {
                } // Callback after click
            }).showToast();
        } else {
            Toastify({
                text: chrome.i18n.getMessage('createDownloadSuccess'),
                duration: maxToastDuration - index * 500,
                gravity: "top", // `top` or `bottom`
                position: "right", // `left`, `center` or `right`
                className: "customize-toastify",
                stopOnFocus: false, // Prevents dismissing of toast on hover
                onClick: function () {
                } // Callback after click
            }).showToast();
        }
        downloadStart(urls, ++index, maxToastDuration);
    });
}

chrome.runtime.onMessage.addListener((request, sender, response) => {
    if (request.method === 'updateProgress') {
        request.data.forEach(downloadItem => {
            //此处的downloadItem为background传递过来的downloadItem，为一个json格式数据，需要转为DownloadItem对象
            updateProgress(new DownloadItem(downloadItem, downloadItem.lastBytesReceived));
        });
        Util.responseMessage(response);
    } else if (request.method === 'downloadComplete') {
        //此处的request.data为background传递过来的downloadDelta，为一个json格式数据，需要转为DownloadDelta对象
        downloadComplete(new DownloadDelta(request.data));
        Util.responseMessage(response);
    } else if (request.method === 'createDownloadItem') {
        //此处的request.data为background传递过来的downloadItem，为一个json格式数据，需要转为DownloadItem对象
        createDownloadItem(new DownloadItem(request.data));
        Util.responseMessage(response);
    } else if (request.method === 'updateIcon') {
        updateIcon(request.data);
        Util.responseMessage(response);
    } else if (request.method === 'eraseDownloadItem') {
        eraseDownloadItem(request.data);
        Util.responseMessage(response);
    } else if (request.method === 'pauseDownloadItem') {
        pauseDownloadItem(request.data);
        Util.responseMessage(response);
    } else if (request.method === 'cancelDownloadItem') {
        //此处的request.data为background传递过来的downloadDelta，为一个json格式数据，需要转为DownloadDelta对象
        cancelDownloadItem(new DownloadDelta(request.data));
        Util.responseMessage(response);
    } else {
        Util.responseMessage(response);
    }
});

/**
 * 打开主页面时,将所有项都列出来,并按顺序倒序排列
 */
chrome.downloads.search({orderBy: ["-startTime"]}, results => {
    if (results.length > 0)
        Util.getElement('#empty').style.display = 'none';
    results.forEach(result => {
        if (Util.emptyString(result.filename))
            return;
        let downloadItem = new DownloadItem(result);
        let item = new Item(downloadItem).render();
        Util.getElement('#body').appendChild(item);
        updateIcon({
            id: downloadItem.id
        });
    });
});

/**
 * 获取每个下载条目的下载文件id
 * @param target {Node|HTMLElement|EventTarget}
 * @return {number|null}
 */
function getDownloadItemId(target) {
    let id = $(target).closest('.item').attr('id');
    return Number(id.replace('item_', ''));
}

/**
 * 复制文本到剪贴板
 * @param text {string|number} 文本内容
 */
function copyToClipboard(text) {
    let input = document.createElement('input');
    input.value = text;
    input.style.position = 'fixed';
    input.style.left = '-999999999px';
    document.body.appendChild(input);
    input.select(); // 选择对象
    document.execCommand("Copy"); // 执行浏览器复制命令
    input.remove();
}

$(document).on('dblclick', '.item > .type, .item > .info', e => {
    chrome.downloads.open(getDownloadItemId(e.target));
}).on('click', '.event .icon-delete, .event .reject', e => {
    let id = getDownloadItemId(e.target);
    chrome.downloads.search({id: id, state: State.in_progress.code}, results => {
        if (results.length > 0) {
            chrome.downloads.cancel(id);
        } else {
            chrome.downloads.erase({
                id: id
            });
        }
        chrome.runtime.sendMessage({
            method: 'changeActionIcon',
            data: id
        });
    });
}).on('click', '.event .icon-resume', e => {
    let id = getDownloadItemId(e.target);
    chrome.downloads.search({id: id}, results => {
        if (results.length === 1) {
            if (results[0].paused) {
                chrome.downloads.resume(id);
            }
        }
    });
}).on('click', '.event .icon-pause', e => {
    let id = getDownloadItemId(e.target);
    chrome.downloads.search({id: id}, function (results) {
        if (results.length === 1) {
            chrome.downloads.pause(id);
        }
    });
}).on('click', '.event .icon-refresh', e => {
    let id = getDownloadItemId(e.target);
    chrome.downloads.search({id: id}, results => {
        if (results.length > 0) {
            chrome.downloads.erase({
                id: id
            }, () => {
                chrome.downloads.download({url: results[0].url});
            });
        }
    });
}).on('click', '.event .icon-open', e => {
    chrome.downloads.open(getDownloadItemId(e.target));
}).on('click', '.event .accept', function (e) {
    chrome.downloads.acceptDanger(getDownloadItemId(e.target));
}).on('click', '.open-download-folder', e => {
    chrome.downloads.showDefaultFolder();
}).on('click', '.clear-download-item', e => {
    chrome.runtime.sendMessage({
        method: 'alsoDeleteFileState'
    }, response => {
        if (response === 'on') {
            chrome.downloads.search({}, results => {
                results.forEach(result => {
                    //不在下载中，则清空
                    if (State.valueOf(result.state) === State.in_progress)
                        return;
                    chrome.downloads.removeFile(result.id, function () {
                        //防止删除的文件未完成，扩展程序管理中报chrome.runtime.lastError
                        if (chrome.runtime.lastError) {
                            //报错为文件已被删除时，直接清除下载项
                            if (chrome.runtime.lastError.message === 'Download file already deleted') {
                                eraseDownloadItem(result.id);
                            }
                            chrome.downloads.erase({
                                id: result.id
                            });
                        }
                    });
                });
            });
        } else {
            chrome.downloads.search({}, results => {
                results.forEach(result => {
                    chrome.downloads.erase({id: result.id});
                });
            });
        }
    });
}).on('input', '.search-text', e => {
    let name = e.target.value;
    if (Util.emptyString(name)) {
        Util.getElementAll('.item').forEach(item => {
            item.classList.remove('hide');
        });
        return;
    }
    chrome.downloads.search({}, results => {
        let ids = [];
        results.forEach(result => {
            if (Util.filename(result.filename.toUpperCase()).indexOf(name.toUpperCase()) !== -1) {
                ids.push('item_' + result.id);
            }
        });
        Util.getElementAll('.item').forEach(item => {
            let id = item.id;
            if (ids.indexOf(id) === -1) {
                item.classList.add('hide');
            } else {
                item.classList.remove('hide');
            }
        });
    });
}).on('click', '.new-download', function () {
    $('.popup-modal').addClass('show');
    $('#newDownloadUrl').focus();
}).on('click', '#startNewDownload', function () {
    downloadItem($('#newDownloadUrl').val().trim());
}).on('click', '#cancelNewDownload', function () {
    $('.popup-modal').removeClass('show');
});

//右键菜单事件
$(document).on('contextmenu', '#body .item', e => {
    //显示蒙版层
    $('.modal').show();
    //获取下载文件id
    clickedItemId = getDownloadItemId(e.target);
    let $contextmenu = $(".contextmenu");

    let item = Item.of(clickedItemId);
    if (item != null)
        if (item.data.state !== State.complete) {
            $contextmenu.find('.open-file').hide();
            $contextmenu.find('.open-file-folder').hide();
        } else {
            $contextmenu.find('.open-file').show();
            $contextmenu.find('.open-file-folder').show();
        }

    // 获取窗口尺寸
    let winWidth = $(document).width();
    let winHeight = $(document).height();
    // 鼠标点击位置坐标
    let mouseX = e.pageX;
    let mouseY = e.pageY;
    // ul标签的宽高
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
    // 阻止浏览器默认的右键菜单事件
    return false;
}).on('click', '.contextmenu .open-file', e => {
    chrome.downloads.open(clickedItemId);
    clickedItemId = null;
}).on('click', '.contextmenu .open-file-folder', e => {
    chrome.downloads.show(clickedItemId);
    clickedItemId = null;
}).on('click', '.contextmenu .copy-filename', e => {
    chrome.downloads.search({id: clickedItemId}, results => {
        if (results.length > 0) {
            let filename = Util.filename(results[0].filename);
            copyToClipboard(filename);
        }
    });
    clickedItemId = null;
}).on('click', '.contextmenu .copy-download-url', e => {
    chrome.downloads.search({id: clickedItemId}, results => {
        if (results.length > 0) {
            copyToClipboard(results[0].finalUrl || results[0].url);
        }
    });
    clickedItemId = null;
}).on('click', '.contextmenu .re-download', e => {
    chrome.downloads.search({id: clickedItemId}, results => {
        if (results.length > 0) {
            let data = results[0];
            chrome.downloads.erase({
                id: data.id
            }, () => {
                chrome.downloads.download({url: data.url});
            });
        }
    });
    clickedItemId = null;
}).on('click', '.contextmenu .delete-file', e => {
    chrome.downloads.search({id: clickedItemId}, results => {
        if (results.length > 0) {
            let data = results[0];
            if (data.state !== State.complete.code) {
                chrome.downloads.erase({
                    id: data.id
                });
            } else {
                chrome.downloads.removeFile(data.id);
            }
        }
    });
    clickedItemId = null;
}).on('click', e => {
    // 点击之后，右键菜单隐藏
    $(".contextmenu").hide();
    $('.modal').hide();
});

$('title').text(chrome.i18n.getMessage('extName'));
$('#openFile').text(chrome.i18n.getMessage('openFile'));
$('#openFileFolder').text(chrome.i18n.getMessage('openFileFolder'));
$('#copyFilename').text(chrome.i18n.getMessage('copyFilename'));
$('#copyDownloadUrl').text(chrome.i18n.getMessage('copyDownloadUrl'));
$('#reDownload').text(chrome.i18n.getMessage('reDownload'));
$('#deleteFile').text(chrome.i18n.getMessage('deleteFile'));
$('#search').attr('placeholder', chrome.i18n.getMessage('search'));
$('#openDownloadFolder').attr('title', chrome.i18n.getMessage('openDownloadFolder'));
// noinspection JSJQueryEfficiency
$('#downloadFolder').text(chrome.i18n.getMessage('downloadFolder'));
$('#clearAllHistory').attr('title', chrome.i18n.getMessage('clearAllHistory'));
$('#clear').text(chrome.i18n.getMessage('clear'));
$('#empty').text(chrome.i18n.getMessage('empty'));
$('#newDownload').attr('title', chrome.i18n.getMessage('newDownload'));
$('#new').text(chrome.i18n.getMessage('new'));
// noinspection JSJQueryEfficiency
$('#popupTitle').text(chrome.i18n.getMessage('newDownloadTitle'));
// noinspection JSJQueryEfficiency
$('#newDownloadUrl').attr('placeholder', chrome.i18n.getMessage('newDownloadUrl'));
$('#startNewDownload').text(chrome.i18n.getMessage('startNewDownload'));
// noinspection JSJQueryEfficiency
$('#cancelNewDownload').text(chrome.i18n.getMessage('cancelNewDownload'));

if (chrome.i18n.getUILanguage().indexOf('en') === 0) {
    // noinspection JSStringConcatenationToES6Template
    $('#downloadFolder').addClass('en-download-folder');
}

//如果是edge，则配色尽量靠近edge
if (navigator.userAgent.indexOf('Edg/') !== -1)
    $('.header,.body,.contextmenu,.popup-modal').addClass('edge');