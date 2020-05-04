import { DangerType } from "./DangerType.js";
import { State } from "./State.js";
import { InterruptReason } from "./InterruptReason.js";
import { Item } from "./Item.js";

class Util {

    /**
     * 格式化日期
     * @param date {string} 日期
     * @returns {string} 格式化后的日期
     */
    static formatDate(date) {
        Date.prototype.format = function (fmt) {
            let o = {
                "M+": this.getMonth() + 1, //月份
                "d+": this.getDate(), //日
                "h+": this.getHours() % 12 === 0 ? 12 : this.getHours() % 12, //小时
                "H+": this.getHours(), //小时
                "m+": this.getMinutes(), //分
                "s+": this.getSeconds(), //秒
                "q+": Math.floor((this.getMonth() + 3) / 3), //季度
                "S": this.getMilliseconds() //毫秒
            };
            let week = {
                "0": "/u65e5",
                "1": "/u4e00",
                "2": "/u4e8c",
                "3": "/u4e09",
                "4": "/u56db",
                "5": "/u4e94",
                "6": "/u516d"
            };
            if (/(y+)/.test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
            }
            if (/(E+)/.test(fmt)) {
                fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "/u661f/u671f" : "/u5468") : "") + week[this.getDay() + ""]);
            }
            for (var k in o) {
                if (new RegExp("(" + k + ")").test(fmt)) {
                    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
                }
            }
            return fmt;
        };
        return new Date(date).format('yyyy-MM-dd HH:mm:ss');
    }

    static formatBytes(bytes) {
        if (bytes < 1024) {
            return bytes + 'B';
        }
        let prefixes = 'KMGTPEZY';
        let mul = 1024;
        for (let i = 0; i < prefixes.length; ++i) {
            if (bytes < (1024 * mul)) {
                return (parseInt(bytes / mul) + '.' + parseInt(10 * ((bytes / mul) % 1)) +
                    prefixes[i] + 'B');
            }
            mul *= 1024;
        }
        return '!!!';
    }

    /**
     * 处理chrome.downloads.search的result数据，把枚举字符串转换为枚举
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
     *
     * @return {{
          id:number,
          url:string,
          finalUrl:string,
          referrer:string,
          filename:string,
          incognito:boolean,
          danger:DangerType,
          mime:string,
          startTime:string,
          endTime:string,
          estimatedEndTime:string,
          state:State,
          paused:boolean,
          canResume:boolean,
          error:InterruptReason,
          bytesReceived:number,
          totalBytes:number,
          fileSize:number,
          exists:boolean
     * }}
     */
    static dataProcess(data) {
        if (data.totalBytes <= 0)
            data.totalBytes = -1;
        if (typeof data.state === 'string')
            data.state = State.valueOf(data.state);
        if (typeof data.danger === 'string')
            data.danger = DangerType.valueOf(data.danger);
        if (typeof data.error === 'string')
            data.error = InterruptReason.valueOf(data.error);
        if (data.canResume)
            // noinspection JSValidateTypes
            data.state = State.pause;
        // noinspection JSValidateTypes
        return data;
    }

    /**
     * 计算信息
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
     * }} chrome.downloads.search的回调中的参数的回调
     * @returns {{id: number,speed:string, icon: null, filename: string | *, size: string, received: *,  progress: string, state: string, exists:boolean}}
     */
    static calculate(data) {
        let filename = data.filename;
        let total = data.totalBytes === -1 ? data.bytesReceived : data.totalBytes, finalSize = Util.formatBytes(total);
        let received = data.bytesReceived, finalReceived = Util.formatBytes(received);
        let progress = (received / total).toFixed(4) * 100 + '%';
        if (progress === '100%' && data.totalBytes !== -1) {
            finalReceived = null;
        }
        let id = data.id;
        return {
            id: id,
            speed: '0B/s',
            icon: null,
            filename: this.filename(filename),
            size: finalSize,
            received: finalReceived,
            progress: progress,
            state: data.state,
            exists: data.state === State.interrupted ? false : data.exists
        };
    }

    /**
     *
     * @param fullFilename {string} 包含了文件所在路径
     * @return {string}
     */
    static filename(fullFilename) {
        return fullFilename.substring(Math.max(fullFilename.lastIndexOf('\\'), fullFilename.lastIndexOf('/')) + 1);
    }

    /**
     *
     * @param data {{id: number,speed:string, icon: null, filename: string | *, size: string, received: *,  progress: string, state: string, exists:boolean}}
     * @returns {HTMLElement}
     */
    static item(data) {
        let item = document.createElement('div');
        item.id = 'item_' + data.id;
        item.classList.add('item');
        if (!data.exists) {
            item.classList.add('not-exists');
        }
        item.innerHTML = `
        <div class="type">
            <img class="icon" src="${data.icon || 'img/icon_gray.png'}" alt="">
        </div>
        <div class="info">
            <div class="name">
                <span class="filename">${data.filename}</span>
            </div>
            <div class="progress">
                <div class="total">
                    <div class="current" style="width: ${data.progress}"></div>
                </div>
            </div>
            <div class="status">
                <span class="state">${data.state}</span>
                <span class="speed">, ${data.speed} - </span>
                <span class="received">${data.received}</span>
                <span class="size">, ${chrome.i18n.getMessage('total')} ${data.size}</span>            
            </div>
            <div class="danger hide">
                <span class="danger-type"></span>
            </div>
        </div>
        <div class="operation">
            <div class="event hide" title="${chrome.i18n.getMessage('reDownload')}">
                <i class="iconfont icon-refresh"></i>
            </div>
            <div class="event hide" title="${chrome.i18n.getMessage('continueDownload')}">
                <i class="iconfont icon-resume"></i>
            </div>
            <div class="event hide" title="${chrome.i18n.getMessage('pauseDownload')}">
                <i class="iconfont icon-pause"></i>
            </div>     
            <div class="event hide" title="${chrome.i18n.getMessage('openFile')}">
                <i class="iconfont icon-open"></i>
            </div>
            <div class="event" title="${chrome.i18n.getMessage('deleteHistory')}">
                <i class="iconfont icon-delete"></i>
            </div>
            <div class="event hide" title="${chrome.i18n.getMessage('cancelDownload')}">
                <span class="reject">${chrome.i18n.getMessage('cancel')}</span>
            </div>
            <div class="event hide" title="${chrome.i18n.getMessage('saveFile')}">
                <span class="accept">${chrome.i18n.getMessage('accept')}</span>
            </div>
        </div>
          `;
        if (!data.exists) {
            //以下用于去除下载完成后的进度条
            this.getElement('.name', item).style.marginTop = '4px';
            this.getElement('.progress', item).style.display = 'none';
            this.getElement('.status', item).style.marginTop = '-12px';
        }
        return item;
    }

    /**
     *
     * @param selector {string}
     * @param dom {HTMLElement}
     * @returns {HTMLElement|Node}
     */
    static getElement(selector, dom = null) {
        return !dom ? document.querySelector(selector) : dom.querySelector(selector);
    }

    /**
     *
     * @param selector {string}
     * @param dom {HTMLElement}
     * @returns {NodeListOf<E>}
     */
    static getElementAll(selector, dom = null) {
        return !dom ? document.querySelectorAll(selector) : dom.querySelectorAll(selector);
    }

    /**
     *
     * @param item {HTMLElement}
     * @return {{
               completed: (function(): HTMLElement),
               downloading: (function(): HTMLElement),
               pause: (function(): HTMLElement),
               interrupted: (function(): HTMLElement),
               pending: (function(): HTMLElement),
               danger: (function(): HTMLElement)
     * }}
     */
    static render(item) {
        let that = this;
        return {
            completed: function () {
                that.getElement('.info .status', item).classList.remove('hide');
                that.getElement('.info .danger', item).classList.add('hide');
                that.getElement('.status .speed', item).remove();
                that.getElement('.status .received', item).remove();
                let instance = item.instance;
                if (instance.data.exists) {
                    that.getElement('.operation .icon-open', item).parentNode.classList.remove('hide');
                    that.getElement('.operation .icon-refresh', item).parentNode.classList.add('hide');
                } else {
                    that.getElement('.operation .icon-open', item).parentNode.classList.add('hide');
                    that.getElement('.operation .icon-refresh', item).parentNode.classList.remove('hide');
                }
                that.getElement('.operation .icon-pause', item).parentNode.classList.add('hide');
                that.getElement('.operation .icon-resume', item).parentNode.classList.add('hide');
                that.getElement('.operation .icon-delete', item).parentNode.classList.remove('hide');
                that.getElement('.operation .accept', item).parentNode.classList.add('hide');
                that.getElement('.operation .reject', item).parentNode.classList.add('hide');

                //以下用于去除下载完成后的进度条
                that.getElement('.name', item).style.marginTop = '4px';
                that.getElement('.progress', item).style.display = 'none';
                that.getElement('.status', item).style.marginTop = '-12px';
                return item;
            },
            downloading: function () {
                that.getElement('.info .status', item).classList.remove('hide');
                that.getElement('.info .danger', item).classList.add('hide');
                that.getElement('.operation .icon-refresh', item).parentNode.classList.add('hide');
                that.getElement('.operation .icon-pause', item).parentNode.classList.remove('hide');
                that.getElement('.operation .icon-resume', item).parentNode.classList.add('hide');
                that.getElement('.operation .icon-open', item).parentNode.classList.add('hide');
                that.getElement('.operation .icon-delete', item).parentNode.classList.remove('hide');
                that.getElement('.operation .accept', item).parentNode.classList.add('hide');
                that.getElement('.operation .reject', item).parentNode.classList.add('hide');
                return item;
            },
            pending: function () {
                that.getElement('.info .status', item).classList.remove('hide');
                that.getElement('.info .danger', item).classList.add('hide');
                that.getElement('.status .state', item).innerText = State.pending.name;
                that.getElement('.status .speed', item).classList.add('hide');
                that.getElement('.status .received', item).classList.add('hide');
                that.getElement('.operation .icon-refresh', item).parentNode.classList.remove('hide');
                that.getElement('.operation .icon-pause', item).parentNode.classList.add('hide');
                that.getElement('.operation .icon-resume', item).parentNode.classList.add('hide');
                that.getElement('.operation .icon-open', item).parentNode.classList.add('hide');
                that.getElement('.operation .icon-delete', item).parentNode.classList.remove('hide');
                that.getElement('.operation .accept', item).parentNode.classList.add('hide');
                that.getElement('.operation .reject', item).parentNode.classList.add('hide');
                return item;
            },
            pause: function () {
                that.getElement('.info .status', item).classList.remove('hide');
                that.getElement('.info .danger', item).classList.add('hide');
                that.getElement('.operation .icon-refresh', item).parentNode.classList.add('hide');
                that.getElement('.operation .icon-pause', item).parentNode.classList.add('hide');
                that.getElement('.operation .icon-resume', item).parentNode.classList.remove('hide');
                that.getElement('.operation .icon-open', item).parentNode.classList.add('hide');
                that.getElement('.operation .icon-delete', item).parentNode.classList.remove('hide');
                that.getElement('.operation .accept', item).parentNode.classList.add('hide');
                that.getElement('.operation .reject', item).parentNode.classList.add('hide');
                return item;
            },
            interrupted: function () {
                that.getElement('.info .status', item).classList.remove('hide');
                that.getElement('.info .danger', item).classList.add('hide');
                that.getElement('.status .speed', item).remove();
                that.getElement('.status .received', item).remove();
                that.getElement('.operation .icon-refresh', item).parentNode.classList.remove('hide');
                that.getElement('.operation .icon-pause', item).parentNode.classList.add('hide');
                that.getElement('.operation .icon-resume', item).parentNode.classList.add('hide');
                that.getElement('.operation .icon-open', item).parentNode.classList.add('hide');
                that.getElement('.operation .icon-delete', item).parentNode.classList.remove('hide');
                that.getElement('.operation .accept', item).parentNode.classList.add('hide');
                that.getElement('.operation .reject', item).parentNode.classList.add('hide');
                return item;
            },
            danger: function () {
                let instance = item.instance;
                that.getElement('.info .danger .danger-type', item).innerText = instance.data.danger.name;
                that.getElement('.info .status', item).classList.add('hide');
                that.getElement('.info .danger', item).classList.remove('hide');
                that.getElement('.operation .icon-refresh', item).parentNode.classList.add('hide');
                that.getElement('.operation .icon-pause', item).parentNode.classList.add('hide');
                that.getElement('.operation .icon-resume', item).parentNode.classList.add('hide');
                that.getElement('.operation .icon-open', item).parentNode.classList.add('hide');
                that.getElement('.operation .icon-delete', item).parentNode.classList.add('hide');
                that.getElement('.operation .accept', item).parentNode.classList.remove('hide');
                that.getElement('.operation .reject', item).parentNode.classList.remove('hide');
                return item;
            }
        };
    }

    /**
     *
     * @param delta {{
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
     *
     * @return {{
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
    static convertDelta(delta) {
        let item = Item.of(delta.id);
        if (item == null) {
            // noinspection JSValidateTypes
            return null;
        }
        let data = item.data;
        for (let key in delta) {
            if (key === 'id')
                continue;
            if (delta.hasOwnProperty(key))
                data[key] = delta[key].current;
        }
        return data;
    }

    static emptyString(string) {
        return string == null || string.trim() === '';
    }
}

export { Util };
