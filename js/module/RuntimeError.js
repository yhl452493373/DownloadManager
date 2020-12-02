import Enum from "./Enum.js";

class RuntimeError extends Enum {
    static INVALID_URL = new Enum('Invalid URL', chrome.i18n.getMessage('invalidUrl'));
}

export default RuntimeError;