import {DownloadItem} from "./DownloadItem.js";

class Util {
    static remainingTimeUnit = chrome.i18n.getMessage('remainingTimeUnit').split(",");

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
     * 格式化日期
     * @param date {string} 日期
     * @returns {string} 格式化后的日期
     */
    static formatDate(date) {
        if (!Date.hasOwnProperty('format')) {
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
                for (let k in o) {
                    if (new RegExp("(" + k + ")").test(fmt)) {
                        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
                    }
                }
                return fmt;
            };
        }
        return new Date(date).format('yyyy-MM-dd HH:mm:ss');
    }

    /**
     * 格式化字节数
     * @param bytes {number} 字节数，如1024
     * @returns {string} 如1MB
     */
    static formatBytes(bytes) {
        if (bytes < 1024) {
            return bytes + 'B';
        }
        let suffixes = 'KMGTPEZY';
        let mul = 1024;
        for (let i = 0; i < suffixes.length; ++i) {
            if (bytes < (1024 * mul)) {
                return (parseInt(bytes / mul) + '.' + parseInt(10 * ((bytes / mul) % 1)) +
                    suffixes[i] + 'B');
            }
            mul *= 1024;
        }
        return 'NaN';
    }

    /**
     * 格式化剩余时间
     * @param remainingTime {number} 剩余时间（秒），如36
     * @returns {string} 如 2分钟
     */
    static formatRemainingTime(remainingTime) {
        remainingTime = Math.ceil(remainingTime);
        let formatTime = [];
        for (let i = 0; i < Util.remainingTimeUnit.length; i++) {
            if (i === 0) {
                //对每分钟的60秒取余，剩下的就是不足1分钟的秒数
                formatTime.push(remainingTime % 60 + Util.remainingTimeUnit[i]);
                //除以每分的60秒后向下取整，则为总分钟数
                remainingTime = Math.floor(remainingTime / 60);
                if (remainingTime === 0)
                    break;
            } else if (i === 1) {
                //对每小时的60分钟取余，剩下的就是不足1小时的分钟数
                formatTime.push(remainingTime % 60 + Util.remainingTimeUnit[i]);
                //除以每小时的60分后向下取整，则为总小时数
                remainingTime = Math.floor(remainingTime / 60);
                if (remainingTime === 0)
                    break;
            } else if (i === 2) {
                //对每天的24小时取余，剩下的就是不足1天的小时
                formatTime.push(remainingTime % 24 + Util.remainingTimeUnit[i]);
                //除以每天的24小时后向下取整，则为天数
                remainingTime = Math.floor(remainingTime / 24)
                if (remainingTime === 0)
                    break;
                formatTime.push(remainingTime + Util.remainingTimeUnit[i + 1]);
            }
        }
        return formatTime.reverse().join("");
    }

    /**
     *
     * @param file {DownloadItem}
     * @returns {string}
     */
    static received(file) {
        let received = file.bytesReceived, finalReceived = Util.formatBytes(received), progress = file.progress;
        if (progress === '100%' && file.totalBytes !== -1) {
            finalReceived = null;
        }
        return finalReceived;
    }

    /**
     *
     * @param fullFilename {string} 包含了文件所在路径
     * @return {string}
     */
    static filename(fullFilename) {
        return fullFilename.substring(Math.max(fullFilename.lastIndexOf('\\'), fullFilename.lastIndexOf('/')) + 1)
    }

    /**
     * 判断字符串是否为空
     * @param string
     * @return {boolean}
     */
    static emptyString(string) {
        return string == null || String(string).trim() === '';
    }

    /**
     * 计算下载速度
     * @param downloadItem {DownloadItem} 当前接收字节数
     * @param lastBytes 上一次接收字节数
     * @return {string} 下载速度，如 1MB/S
     */
    static speed(downloadItem, lastBytes) {
        let speedBytes = 0;
        // 确定文件的总大小
        if (downloadItem.totalBytes !== 0) {
            if (downloadItem.estimatedEndTime) {
                let remainingTime = (new Date(downloadItem.estimatedEndTime) - new Date().getTime()) / 1000;
                if (!isNaN(remainingTime)) {
                    speedBytes = ((downloadItem.totalBytes - downloadItem.bytesReceived) / remainingTime).toFixed(0);
                }
            }
        } else {
            // 文件大小不确定
            speedBytes = downloadItem.bytesReceived - lastBytes;
        }
        return this.formatBytes(speedBytes) + '/s';
    }

    /**
     * 剩余下载时间
     * @param downloadItem {DownloadItem}
     */
    static remainingTime(downloadItem) {
        if (downloadItem.totalBytes !== 0) {
            if (downloadItem.estimatedEndTime) {
                let remainingTime = (new Date(downloadItem.estimatedEndTime) - new Date()) / 1000;
                if (!isNaN(remainingTime)) {
                    return chrome.i18n.getMessage('remaining') + this.formatRemainingTime(remainingTime / 1000)
                }
                return chrome.i18n.getMessage('remaining') + chrome.i18n.getMessage('unknown');
            } else {
                return chrome.i18n.getMessage('remaining') + chrome.i18n.getMessage('obtaining');
            }
        } else {
            // 文件大小不确定
            return chrome.i18n.getMessage('remaining') + chrome.i18n.getMessage('unknown');
        }
    }

    /**
     * 计算下载进度
     * @param currentBytes 当前接收字节数
     * @param totalBytes 总字节数
     * @return {string} 下载进度，如16.66%
     */
    static progress(currentBytes, totalBytes) {
        return (currentBytes / totalBytes).toFixed(4) * 100 + '%'
    }
}

export {Util}
