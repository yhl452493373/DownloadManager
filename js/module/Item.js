import Util from './Util.js'
import State from './State.js'
import DangerType from "./DangerType.js";
import InterruptReason from "./InterruptReason.js";
import DownloadItem from "./DownloadItem.js";

// noinspection DuplicatedCode,JSUnresolvedVariable,JSUnresolvedFunction
class Item {
    static showDetailStatus = [
        InterruptReason.NETWORK_DISCONNECTED,
        InterruptReason.NETWORK_FAILED,
        InterruptReason.NETWORK_INVALID_REQUEST,
        InterruptReason.NETWORK_SERVER_DOWN,
        InterruptReason.NETWORK_TIMEOUT
    ];

    /**
     * 构建函数
     * @param data {DownloadItem}
     */
    constructor(data) {
        this.data = data;
        this.dom = this.initDom();
    }

    /**
     *
     * @returns {HTMLElement}
     */
    initDom() {
        let item = document.createElement('div');
        item.instance = this;
        item.id = 'item_' + this.data.id;
        item.classList.add('item');
        if (!this.data.exists) {
            item.classList.add('not-exists');
        }
        item.innerHTML = `
        <div class="type">
            <img class="icon" src="${this.data.icon}" alt="">
        </div>
        <div class="info">
            <div class="name">
                <span class="filename">${this.data.simpleFilename}</span>
            </div>
            <div class="progress">
                <div class="total">
                    <div class="current" style="width: ${this.data.progress}"></div>
                </div>
            </div>
            <div class="status">
                <span class="state">${this.data.state}</span>
                <span class="speed">, ${this.data.speed} - </span>
                <span class="received">${this.data.received}</span>
                <span class="size">, ` + chrome.i18n.getMessage('total') + ` ${this.data.size}</span>            
                <span class="time">, ` + ` ${Util.remainingTime(this.data)}</span>            
            </div>
            <div class="danger hide">
                <span class="danger-type"></span>
            </div>
        </div>
        <div class="operation">
            <div class="event hide" title="` + chrome.i18n.getMessage('reDownload') + `">
                <i class="iconfont icon-refresh"></i>
            </div>
            <div class="event hide" title="` + chrome.i18n.getMessage('continueDownload') + `">
                <i class="iconfont icon-resume"></i>
            </div>
            <div class="event hide" title="` + chrome.i18n.getMessage('pauseDownload') + `">
                <i class="iconfont icon-pause"></i>
            </div>     
            <div class="event hide" title="` + chrome.i18n.getMessage('openFile') + `">
                <i class="iconfont icon-open"></i>
            </div>
            <div class="event" title="` + chrome.i18n.getMessage('deleteHistory') + `">
                <i class="iconfont icon-delete"></i>
            </div>
            <div class="event hide" title="` + chrome.i18n.getMessage('cancelDownload') + `">
                <span class="reject">` + chrome.i18n.getMessage('cancel') + `</span>
            </div>
            <div class="event hide" title="` + chrome.i18n.getMessage('saveFile') + `">
                <span class="accept">` + chrome.i18n.getMessage('accept') + `</span>
            </div>
        </div>
          `;
        if (!this.data.exists) {
            //以下用于去除下载完成后的进度条
            Util.getElement('.name', item).style.marginTop = '4px';
            Util.getElement('.progress', item).style.display = 'none';
            Util.getElement('.status', item).style.marginTop = '-12px';
        }
        return item;
    };

    /**
     *
     * @return {HTMLElement}
     */
    render() {
        let render = this.initRender();
        if (this.data.state === State.pause) {
            return render.pause();
        } else if (this.data.state === State.interrupted) {
            return render.interrupted(this.data.error);
        } else if (this.data.state === State.complete) {
            return render.completed();
        } else if (this.data.state === State.in_progress) {
            if (this.data.danger !== DangerType.safe && this.data.danger !== DangerType.accepted) {
                return render.danger();
            } else if (this.data.progress === '100%' && this.data.totalBytes > 0) {
                return render.pending();
            } else if (this.data.paused && this.data.canResume) {
                return render.pause();
            } else if (this.data.paused && !this.data.canResume) {
                return render.interrupted(this.data.error);
            }
            return render.downloading();
        }
    };

    initRender() {
        let item = this.dom;
        let data = this.data;
        return {
            completed: function () {
                Util.getElement('.info .status', item).classList.remove('hide');
                Util.getElement('.info .danger', item).classList.add('hide');
                Util.getElement('.status .speed', item).remove();
                Util.getElement('.status .received', item).remove();
                Util.getElement('.status .time', item).innerText = ', ' + Util.formatDate(data.endTime);
                Util.getElement('.status .time', item).classList.remove('hide');
                if (data.exists) {
                    Util.getElement('.status .state', item).innerText = State.complete;
                    Util.getElement('.operation .icon-open', item).parentNode.classList.remove('hide');
                    Util.getElement('.operation .icon-refresh', item).parentNode.classList.add('hide');
                } else {
                    Util.getElement('.status .state', item).innerText = State.deleted;
                    Util.getElement('.operation .icon-open', item).parentNode.classList.add('hide');
                    Util.getElement('.operation .icon-refresh', item).parentNode.classList.remove('hide');
                }
                Util.getElement('.operation .icon-pause', item).parentNode.classList.add('hide');
                Util.getElement('.operation .icon-resume', item).parentNode.classList.add('hide');
                Util.getElement('.operation .icon-delete', item).parentNode.classList.remove('hide');
                Util.getElement('.operation .accept', item).parentNode.classList.add('hide');
                Util.getElement('.operation .reject', item).parentNode.classList.add('hide');

                //以下用于去除下载完成后的进度条
                Util.getElement('.name', item).style.marginTop = '4px';
                Util.getElement('.progress', item).style.display = 'none';
                Util.getElement('.status', item).style.marginTop = '-12px';
                return item;
            },
            downloading: function () {
                Util.getElement('.status .time', item).innerText = ', ' + Util.remainingTime(data);
                Util.getElement('.status .time', item).classList.remove('hide');
                Util.getElement('.info .status', item).classList.remove('hide');
                Util.getElement('.info .danger', item).classList.add('hide');
                Util.getElement('.status .state', item).innerText = State.in_progress;
                Util.getElement('.operation .icon-refresh', item).parentNode.classList.add('hide');
                Util.getElement('.operation .icon-pause', item).parentNode.classList.remove('hide');
                Util.getElement('.operation .icon-resume', item).parentNode.classList.add('hide');
                Util.getElement('.operation .icon-open', item).parentNode.classList.add('hide');
                Util.getElement('.operation .icon-delete', item).parentNode.classList.remove('hide');
                Util.getElement('.operation .accept', item).parentNode.classList.add('hide');
                Util.getElement('.operation .reject', item).parentNode.classList.add('hide');
                return item;
            },
            pending: function () {
                Util.getElement('.status .time', item).innerText = ', ' + Util.remainingTime(data);
                Util.getElement('.status .time', item).classList.remove('hide');
                Util.getElement('.info .status', item).classList.remove('hide');
                Util.getElement('.info .danger', item).classList.add('hide');
                Util.getElement('.status .state', item).innerText = State.pending;
                Util.getElement('.status .speed', item).classList.add('hide');
                Util.getElement('.status .received', item).classList.add('hide');
                Util.getElement('.operation .icon-refresh', item).parentNode.classList.remove('hide');
                Util.getElement('.operation .icon-pause', item).parentNode.classList.add('hide');
                Util.getElement('.operation .icon-resume', item).parentNode.classList.add('hide');
                Util.getElement('.operation .icon-open', item).parentNode.classList.add('hide');
                Util.getElement('.operation .icon-delete', item).parentNode.classList.remove('hide');
                Util.getElement('.operation .accept', item).parentNode.classList.add('hide');
                Util.getElement('.operation .reject', item).parentNode.classList.add('hide');
                return item;
            },
            pause: function () {
                Util.getElement('.status .time', item).innerText = ', ' + Util.formatDate(data.startTime);
                Util.getElement('.info .status', item).classList.remove('hide');
                Util.getElement('.info .danger', item).classList.add('hide');
                Util.getElement('.status .state', item).innerText = State.pause;
                Util.getElement('.operation .icon-refresh', item).parentNode.classList.add('hide');
                Util.getElement('.operation .icon-pause', item).parentNode.classList.add('hide');
                Util.getElement('.operation .icon-resume', item).parentNode.classList.remove('hide');
                Util.getElement('.operation .icon-open', item).parentNode.classList.add('hide');
                Util.getElement('.operation .icon-delete', item).parentNode.classList.remove('hide');
                Util.getElement('.operation .accept', item).parentNode.classList.add('hide');
                Util.getElement('.operation .reject', item).parentNode.classList.add('hide');
                return item;
            },
            /**
             *
             * @param error {InterruptReason}
             * @return {HTMLElement}
             */
            interrupted: function (error) {
                Util.getElement('.status .time', item).classList.add('hide');
                Util.getElement('.status .time', item).innerText = ', ' + Util.formatDate(data.startTime);
                Util.getElement('.info .status', item).classList.remove('hide');
                Util.getElement('.info .size', item).classList.add('hide');
                Util.getElement('.info .danger', item).classList.add('hide');
                Util.getElement('.status .state', item).innerText = State.interrupted;
                Util.getElement('.status .speed', item).remove();
                Util.getElement('.status .received', item).remove();
                Util.getElement('.operation .icon-refresh', item).parentNode.classList.remove('hide');
                Util.getElement('.operation .icon-pause', item).parentNode.classList.add('hide');
                Util.getElement('.operation .icon-resume', item).parentNode.classList.add('hide');
                Util.getElement('.operation .icon-open', item).parentNode.classList.add('hide');
                Util.getElement('.operation .icon-delete', item).parentNode.classList.remove('hide');
                Util.getElement('.operation .accept', item).parentNode.classList.add('hide');
                Util.getElement('.operation .reject', item).parentNode.classList.add('hide');
                if (Item.showDetailStatus.indexOf(error) !== -1) {
                    Util.getElement('.status .state', item).innerText = chrome.i18n.getMessage('downloadFailed') + ': ' + error;
                }
                item.classList.add('not-exists');
                Util.getElement('.name', item).style.marginTop = '4px';
                Util.getElement('.progress', item).style.display = 'none';
                Util.getElement('.status', item).style.marginTop = '-12px';
                return item;
            },
            danger: function () {
                Util.getElement('.status .time', item).classList.add('hide');
                Util.getElement('.status .time', item).innerText = ', ' + Util.remainingTime(data);
                Util.getElement('.info .danger .danger-type', item).innerText = data.danger;
                Util.getElement('.info .status', item).classList.add('hide');
                Util.getElement('.info .danger', item).classList.remove('hide');
                Util.getElement('.operation .icon-refresh', item).parentNode.classList.add('hide');
                Util.getElement('.operation .icon-pause', item).parentNode.classList.add('hide');
                Util.getElement('.operation .icon-resume', item).parentNode.classList.add('hide');
                Util.getElement('.operation .icon-open', item).parentNode.classList.add('hide');
                Util.getElement('.operation .icon-delete', item).parentNode.classList.add('hide');
                Util.getElement('.operation .accept', item).parentNode.classList.remove('hide');
                Util.getElement('.operation .reject', item).parentNode.classList.remove('hide');
                return item;
            }
        };
    }

    /**
     *
     * @param id {number}
     * @return {Item}
     */
    static of(id) {
        let div = Util.getElement('#item_' + id);
        return div == null ? null : div.instance;
    }

    /**
     *
     * @param data {DownloadItem}
     */
    updateProgress(data) {
        this.data = data;
        let div = Util.getElement('#item_' + this.data.id);
        if (div == null)
            return;
        Util.getElement('.progress .current', div).style.width = this.data.progress;
        if (this.data.danger !== DangerType.safe && this.data.danger !== DangerType.accepted) {
            Util.getElement('.info .danger .danger-type', div).innerText = this.data.danger.name;
            Util.getElement('.info .status', div).classList.add('hide');
            Util.getElement('.info .danger', div).classList.remove('hide');
            Util.getElement('.status .time', div).classList.add('hide');
            Util.getElement('.status .time', div).innerText = ',' + Util.remainingTime(this.data);
            Util.getElement('.operation .icon-refresh', div).parentNode.classList.add('hide');
            Util.getElement('.operation .icon-pause', div).parentNode.classList.add('hide');
            Util.getElement('.operation .icon-resume', div).parentNode.classList.add('hide');
            Util.getElement('.operation .icon-open', div).parentNode.classList.add('hide');
            Util.getElement('.operation .icon-delete', div).parentNode.classList.add('hide');
            Util.getElement('.operation .accept', div).parentNode.classList.remove('hide');
            Util.getElement('.operation .reject', div).parentNode.classList.remove('hide');
        } else {
            Util.getElement('.info .status', div).classList.remove('hide');
            Util.getElement('.info .danger', div).classList.add('hide');
            Util.getElement('.status .time', div).classList.remove('hide');
            Util.getElement('.status .time', div).innerText = ', ' + Util.remainingTime(this.data);
            if (this.data.progress === '100%') {
                this.refreshSize(this.data.id, div);
                Util.getElement('.operation .icon-refresh', div).parentNode.classList.add('hide');
                Util.getElement('.operation .icon-pause', div).parentNode.classList.remove('hide');
                Util.getElement('.operation .icon-resume', div).parentNode.classList.add('hide');
                Util.getElement('.operation .icon-open', div).parentNode.classList.add('hide');
                if (this.data.totalBytes <= 0) {
                    Util.getElement('.status .speed', div).classList.remove('hide');
                    Util.getElement('.status .received', div).classList.remove('hide');
                    Util.getElement('.status .state', div).innerText = State.in_progress.name;
                    Util.getElement('.status .speed', div).innerText = `, ${this.data.speed} -`;
                    Util.getElement('.status .received', div).innerText = this.data.received;
                } else {
                    Util.getElement('.status .state', div).innerText = State.pending.name;
                    Util.getElement('.status .speed', div).classList.add('hide');
                    Util.getElement('.status .received', div).classList.add('hide');
                }
            } else {
                Util.getElement('.status .speed', div).innerText = `, ${this.data.speed} -`;
                Util.getElement('.status .received', div).innerText = this.data.received;
                Util.getElement('.operation .icon-refresh', div).parentNode.classList.add('hide');
                Util.getElement('.operation .icon-pause', div).parentNode.classList.remove('hide');
                Util.getElement('.operation .icon-resume', div).parentNode.classList.add('hide');
                Util.getElement('.operation .icon-open', div).parentNode.classList.add('hide');
            }
            Util.getElement('.operation .icon-delete', div).parentNode.classList.remove('hide');
            Util.getElement('.operation .accept', div).parentNode.classList.add('hide');
            Util.getElement('.operation .reject', div).parentNode.classList.add('hide');
        }
    }

    /**
     *
     * @param id {number}
     * @param dom {HTMLDocument|Node}
     */
    refreshSize(id, dom) {
        chrome.downloads.search({id: id}, results => {
            //删除时会触发chrome.downloads.onChange，若文件已经删除，再去获取其大小会报错：downloadId错误，加入chrome.runtime.lastError进行容错处理
            if (!chrome.runtime.lastError) {
                if (Array.isArray(results) && results.length > 0) {
                    let data = new DownloadItem(results[0]);
                    Util.getElement('.status .size', dom).innerText = ', ' + chrome.i18n.getMessage('total') + ' ' + Util.formatBytes(data.totalBytes <= 0 ? data.bytesReceived : data.totalBytes);
                }
            }
        });
    }

    /**
     *
     * @param downloadDelta {DownloadDelta}
     */
    downloadComplete(downloadDelta) {
        let div = Util.getElement('#item_' + downloadDelta.id);
        this.refreshSize(downloadDelta.id, div);
        Util.getElement('.info .danger', div).classList.add('hide');
        Util.getElement('.info .status', div).classList.remove('hide');
        Util.getElement('.progress .current', div).style.width = '100%';
        Util.getElement('.status .state', div).innerText = State.complete.name;
        Util.getElement('.status .time', div).classList.remove('hide');
        Util.getElement('.status .time', div).innerText = ', ' + Util.formatDate(downloadDelta.endTime.current);
        Util.getElement('.status .speed', div).classList.add('hide');
        Util.getElement('.status .received', div).classList.add('hide');
        Util.getElement('.operation .icon-refresh', div).parentNode.classList.add('hide');
        Util.getElement('.operation .icon-pause', div).parentNode.classList.add('hide');
        Util.getElement('.operation .icon-resume', div).parentNode.classList.add('hide');
        Util.getElement('.operation .icon-open', div).parentNode.classList.remove('hide');
        Util.getElement('.operation .icon-delete', div).parentNode.title = chrome.i18n.getMessage('deleteHistory');
        Util.getElement('.operation .icon-delete', div).parentNode.classList.remove('hide');
        Util.getElement('.operation .accept', div).parentNode.classList.add('hide');
        Util.getElement('.operation .reject', div).parentNode.classList.add('hide');

        //以下用于去除下载完成后的进度条
        Util.getElement('.name', div).style.marginTop = '4px';
        Util.getElement('.progress', div).style.display = 'none';
        Util.getElement('.status', div).style.marginTop = '-12px';
    }

    eraseDownloadItem() {
        let div = Util.getElement('#item_' + this.data.id);
        div.remove();
        if (Util.getElementAll('.item').length === 0) {
            Util.getElement('#empty').style.display = 'block';
        }
    }

    /**
     *
     * @param downloadDelta {DownloadDelta}
     */
    cancelDownloadItem(downloadDelta) {
        chrome.downloads.search({id: downloadDelta.id}, results => {
            if (results.length === 1) {
                let data = new DownloadItem(results[0]);
                let div = Util.getElement('#item_' + data.id);
                Util.getElement('.info .danger', div).classList.add('hide');
                Util.getElement('.info .size', div).classList.add('hide');
                Util.getElement('.info .status', div).classList.remove('hide');
                Util.getElement('.progress .current', div).style.width = '0%';
                Util.getElement('.status .time', div).classList.remove('hide');
                Util.getElement('.status .time', div).innerText = ', ' + Util.formatDate(data.endTime || data.startTime);
                Util.getElement('.status .speed', div).classList.add('hide');
                Util.getElement('.status .received', div).classList.add('hide');
                Util.getElement('.operation .icon-refresh', div).parentNode.classList.remove('hide');
                Util.getElement('.operation .icon-pause', div).parentNode.classList.add('hide');
                Util.getElement('.operation .icon-resume', div).parentNode.classList.add('hide');
                Util.getElement('.operation .icon-open', div).parentNode.classList.add('hide');
                Util.getElement('.operation .icon-delete', div).parentNode.title = chrome.i18n.getMessage('deleteHistory');
                Util.getElement('.operation .icon-delete', div).parentNode.classList.remove('hide');
                Util.getElement('.operation .accept', div).parentNode.classList.add('hide');
                Util.getElement('.operation .reject', div).parentNode.classList.add('hide');

                div.classList.add('not-exists');
                let error = InterruptReason.toEnum(downloadDelta.error.current);
                if (Item.showDetailStatus.indexOf(error) !== -1) {
                    Util.getElement('.status .time', div).classList.add('hide');
                    Util.getElement('.status .state', div).innerText = chrome.i18n.getMessage('downloadFailed') + ': ' + error;
                } else {
                    Util.getElement('.status .state', div).innerText = State.interrupted;
                }
                Util.getElement('.name', div).style.marginTop = '4px';
                Util.getElement('.progress', div).style.display = 'none';
                Util.getElement('.status', div).style.marginTop = '-12px';
            }
        });
    }

    pauseDownloadItem() {
        let div = Util.getElement('#item_' + this.data.id);
        Util.getElement('.status .time', div).classList.remove('hide');
        Util.getElement('.status .time', div).innerText = ', ' + Util.formatDate(this.data.startTime);
        Util.getElement('.status .state', div).innerText = State.pause.name;
        Util.getElement('.status .speed', div).innerText = `, 0B/s -`;
        Util.getElement('.operation .icon-refresh', div).parentNode.classList.add('hide');
        Util.getElement('.operation .icon-pause', div).parentNode.classList.add('hide');
        Util.getElement('.operation .icon-resume', div).parentNode.classList.remove('hide');
        Util.getElement('.operation .icon-open', div).parentNode.classList.add('hide');
        Util.getElement('.operation .icon-delete', div).parentNode.title = chrome.i18n.getMessage('cancelDownload');
    }

    resumeDownloadItem() {
        let div = Util.getElement('#item_' + this.data.id);
        Util.getElement('.status .state', div).innerText = State.in_progress.name;
        Util.getElement('.operation .icon-delete', div).parentNode.title = chrome.i18n.getMessage('cancelDownload');
    }
}

export default Item