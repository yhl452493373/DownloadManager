import {Enum} from "./Enum.js";

class State extends Enum {
    // noinspection JSUnusedGlobalSymbols
    static in_progress = new Enum('in_progress', '下载中');
    // noinspection JSUnusedGlobalSymbols
    static interrupted = new Enum('interrupted', '已取消');
    // noinspection JSUnusedGlobalSymbols
    static complete = new Enum('complete', '已完成');
    // noinspection JSUnusedGlobalSymbols
    static pause = new Enum('pause', '已暂停');
    // noinspection JSUnusedGlobalSymbols
    static pending = new Enum('pending', '处理中');
}

export {State}