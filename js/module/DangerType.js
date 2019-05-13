import {Enum} from "./Enum.js";

class DangerType extends Enum {
    // noinspection JSUnusedGlobalSymbols
    static file = new Enum("file", "文件");
    // noinspection JSUnusedGlobalSymbols
    static  url = new Enum('url', '网址');
    // noinspection JSUnusedGlobalSymbols
    static content = new Enum('content', '内容');
    // noinspection JSUnusedGlobalSymbols
    static uncommon = new Enum('uncommon', '罕见');
    // noinspection JSUnusedGlobalSymbols
    static host = new Enum('host', '主机');
    // noinspection JSUnusedGlobalSymbols
    static unwanted = new Enum('unwanted', '多余');
    // noinspection JSUnusedGlobalSymbols
    static safe = new Enum('safe', '安全');
    // noinspection JSUnusedGlobalSymbols
    static accepted = new Enum('accepted', '认可');
}

export {DangerType}