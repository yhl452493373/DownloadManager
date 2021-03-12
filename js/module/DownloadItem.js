/**
 * @class 下载项数据结构
 */

import Util from './Util.js'
import State from './State.js'
import DangerType from "./DangerType.js";
import InterruptReason from "./InterruptReason.js";

class DownloadItem {
    /**
     * @type number
     */
    id;

    /**
     * The identifier for the extension that initiated this download if this download was initiated by an extension. Does not change once it is set.
     * @type string optional
     */
    byExtensionId;

    /**
     * The localized name of the extension that initiated this download if this download was initiated by an extension. May change if the extension changes its name or if the user changes their locale.
     * @type string optional
     */
    byExtensionName;

    /**
     * @type string
     */
    url;

    /**
     * @type string
     */
    referrer;

    /**
     * @type string
     */
    filename;

    /**
     * The absolute URL that this download is being made from, after all redirects.
     * type string
     */
    finalUrl;

    /**
     * False if this download is recorded in the history, true if it is not recorded.
     * @type boolean
     */
    incognito;

    /**
     * @type DangerType
     */
    danger;

    /**
     * @type string
     */
    mime;

    /**
     * @type string
     */
    startTime;

    /**
     * @type string
     */
    endTime;

    /**
     * @type string
     */
    estimatedEndTime;

    /**
     * @type State
     */
    state;

    /**
     * @type boolean
     */
    paused;

    /**
     * @type boolean
     */
    canResume;

    /**
     * @type InterruptReason
     */
    error;

    /**
     * @type number
     */
    bytesReceived;

    /**
     * @type number
     */
    totalBytes;

    /**
     * @type number
     */
    fileSize;

    /**
     * @type boolean
     */
    exists;

    /**
     * @type string
     */
    speed;

    /**
     * @type string
     */
    progress;

    /**
     * @type string
     */
    simpleFilename;

    /**
     * @type string
     */
    received;

    /**
     * @type string
     */
    size;

    /**
     * @type string
     */
    icon;

    /**
     * @type number
     */
    lastBytesReceived;

    constructor(file, lastBytesReceived) {
        this.init(file, lastBytesReceived);
    }

    /**
     * 根据chrome的file对象初始化本类中的属性
     *
     * @param file {{
     *    id:number,
     *    byExtensionId:string,
     *    byExtensionName:string,
     *    url:string,
     *    referrer:string,
     *    filename:string,
     *    incognito:boolean,
     *    danger:string,
     *    mime:string,
     *    startTime:string,
     *    endTime:string,
     *    estimatedEndTime:string,
     *    state:string,
     *    paused:boolean,
     *    canResume:boolean,
     *    error:string,
     *    bytesReceived:number,
     *    totalBytes:number,
     *    fileSize:number,
     *    exists:boolean,
     *    lastBytesReceived:number
     * }}
     * @param [lastBytesReceived] number 上次计算下载速度时的接收字节数
     */
    init(file, lastBytesReceived) {
        this.id = file.id;
        this.byExtensionId = file.byExtensionId;
        this.byExtensionName = file.byExtensionName;
        this.url = file.url;
        this.referrer = file.referrer;
        this.filename = file.filename;
        this.incognito = file.incognito;
        this.danger = DangerType.toEnum(file.danger);
        this.mime = file.mime;
        this.startTime = file.startTime;
        this.endTime = file.endTime;
        this.estimatedEndTime = file.estimatedEndTime;
        this.state = State.toEnum(file.state);
        this.paused = file.paused;
        this.canResume = file.canResume;
        this.error = InterruptReason.toEnum(file.error);
        this.bytesReceived = file.bytesReceived;
        this.totalBytes = file.totalBytes;
        this.fileSize = file.fileSize
        this.exists = file.exists;
        this.lastBytesReceived = file.lastBytesReceived || lastBytesReceived;

        this.speed = Util.speed(this);
        this.progress = Util.progress(this.bytesReceived, this.totalBytes);
        this.simpleFilename = Util.filename(this.filename);
        this.received = Util.received(this);
        this.size = Util.formatBytes(file.totalBytes <= 0 ? file.bytesReceived : file.totalBytes);
    }

    getSimpleFilename() {
        this.simpleFilename = Util.filename(this.filename);
    }
}

export default DownloadItem