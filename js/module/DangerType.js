import { Enum } from "./Enum.js";

class DangerType extends Enum {
    // noinspection JSUnusedGlobalSymbols
    static file = new Enum("file", chrome.i18n.getMessage('fileDanger'));
    // noinspection JSUnusedGlobalSymbols
    static url = new Enum('url', chrome.i18n.getMessage('urlDanger'));
    // noinspection JSUnusedGlobalSymbols
    static content = new Enum('content', chrome.i18n.getMessage('contentDanger'));
    // noinspection JSUnusedGlobalSymbols
    static uncommon = new Enum('uncommon', chrome.i18n.getMessage('uncommonDanger'));
    // noinspection JSUnusedGlobalSymbols
    static host = new Enum('host', chrome.i18n.getMessage('hostDanger'));
    // noinspection JSUnusedGlobalSymbols
    static unwanted = new Enum('unwanted', chrome.i18n.getMessage('unwantedDanger'));
    // noinspection JSUnusedGlobalSymbols
    static safe = new Enum('safe', chrome.i18n.getMessage('safeDanger'));
    // noinspection JSUnusedGlobalSymbols
    static accepted = new Enum('accepted', chrome.i18n.getMessage('acceptedDanger'));
}

export { DangerType };