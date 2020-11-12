import {Enum} from "./Enum.js";

class State extends Enum {

    static in_progress = new State('in_progress', chrome.i18n.getMessage('inProgress'));

    static interrupted = new State('interrupted', chrome.i18n.getMessage('interrupted'));

    static complete = new State('complete', chrome.i18n.getMessage('complete'));

    static pause = new State('pause', chrome.i18n.getMessage('pause'));

    static pending = new State('pending', chrome.i18n.getMessage('pending'));
}

export {State}