import {Enum} from "./Enum.js";

class DangerType extends Enum {
    // noinspection JSUnusedGlobalSymbols
    static file = new Enum("file", "这种类型的文件可能会损害您的计算机");
    // noinspection JSUnusedGlobalSymbols
    static  url = new Enum('url', '下载项的 URL 已知是恶意的');
    // noinspection JSUnusedGlobalSymbols
    static content = new Enum('content', '已下载的文件已知是恶意的');
    // noinspection JSUnusedGlobalSymbols
    static uncommon = new Enum('uncommon', '下载项的 URL 不常见，可能有风险');
    // noinspection JSUnusedGlobalSymbols
    static host = new Enum('host', '下载项来自已知发布恶意软件的主机，可能有风险');
    // noinspection JSUnusedGlobalSymbols
    static unwanted = new Enum('unwanted', '下载项可能不是所需要的或者不安全，例如它可能会更改浏览器或计算机设置');
    // noinspection JSUnusedGlobalSymbols
    static safe = new Enum('safe', '下载项对用户的计算机没有已知风险');
    // noinspection JSUnusedGlobalSymbols
    static accepted = new Enum('accepted', '用户已经接受了有风险的下载');
}

export {DangerType}