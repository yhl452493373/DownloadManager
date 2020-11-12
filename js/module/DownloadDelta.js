/**
 * @class 下载项改变时的数据结构
 */

import {StringDelta} from "./StringDelta.js";
import {BooleanDelta} from "./BooleanDelta.js";
import {DoubleDelta} from "./DoubleDelta.js";

class DownloadDelta {
    /**
     * @type number
     */
    id;

    /**
     * @type StringDelta
     */
    url;

    /**
     * @type StringDelta
     */
    finalUrl;

    /**
     * @type StringDelta
     */
    filename;

    /**
     * @type StringDelta
     */
    danger;

    /**
     * @type StringDelta
     */
    mime;

    /**
     * @type StringDelta
     */
    startTime;

    /**
     * @type StringDelta
     */
    endTime;

    /**
     * @type StringDelta
     */
    state;

    /**
     * @type BooleanDelta
     */
    canResume;

    /**
     * @type BooleanDelta
     */
    paused;

    /**
     * @type StringDelta
     */
    error;

    /**
     * @type DoubleDelta
     */
    totalBytes;

    /**
     * @type DoubleDelta
     */
    fileSize;

    /**
     * @type BooleanDelta
     */
    exists;

    /**
     * 根据chrome的file对象初始化本类中的属性
     *
     * @param downloadDeltaInfo {{
     *    id: number,
     *    url: StringDelta,
     *    finalUrl: StringDelta,
     *    filename: StringDelta,
     *    danger: StringDelta,
     *    mime: StringDelta,
     *    startTime: StringDelta,
     *    endTime: StringDelta,
     *    state: StringDelta,
     *    canResume: BooleanDelta,
     *    paused: BooleanDelta,
     *    error: StringDelta,
     *    totalBytes: DoubleDelta,
     *    fileSize: DoubleDelta,
     *    exists: BooleanDelta
     * }|*}
     */
    constructor(downloadDeltaInfo) {
        this.id = downloadDeltaInfo.id;
        this.url = StringDelta.toDelta(downloadDeltaInfo.url);
        this.finalUrl = StringDelta.toDelta(downloadDeltaInfo.finalUrl);
        this.filename = StringDelta.toDelta(downloadDeltaInfo.filename);
        this.danger = StringDelta.toDelta(downloadDeltaInfo.danger);
        this.mime = StringDelta.toDelta(downloadDeltaInfo.mime);
        this.startTime = StringDelta.toDelta(downloadDeltaInfo.startTime)
        this.endTime = StringDelta.toDelta(downloadDeltaInfo.endTime);
        this.state = StringDelta.toDelta(downloadDeltaInfo.state);
        this.canResume = BooleanDelta.toDelta(downloadDeltaInfo.canResume);
        this.paused = BooleanDelta.toDelta(downloadDeltaInfo.paused);
        this.error = StringDelta.toDelta(downloadDeltaInfo.error);
        this.totalBytes = DoubleDelta.toDelta(downloadDeltaInfo.totalBytes);
        this.fileSize = DoubleDelta.toDelta(downloadDeltaInfo.fileSize);
        this.exists = BooleanDelta.toDelta(downloadDeltaInfo.exists);
    }
}

export {DownloadDelta}