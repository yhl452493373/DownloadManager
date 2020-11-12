import {Enum} from "./Enum.js";

class DangerType extends Enum {

    static file = new DangerType("file", chrome.i18n.getMessage('fileDanger'));

    static  url = new DangerType('url', chrome.i18n.getMessage('urlDanger'));

    static content = new DangerType('content', chrome.i18n.getMessage('contentDanger'));

    static uncommon = new DangerType('uncommon', chrome.i18n.getMessage('uncommonDanger'));

    static host = new DangerType('host', chrome.i18n.getMessage('hostDanger'));

    static unwanted = new DangerType('unwanted', chrome.i18n.getMessage('unwantedDanger'));

    static safe = new DangerType('safe', chrome.i18n.getMessage('safeDanger'));

    static accepted = new DangerType('accepted', chrome.i18n.getMessage('acceptedDanger'));
}

export {DangerType}