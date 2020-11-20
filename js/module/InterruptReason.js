import Enum from "./Enum.js";

class InterruptReason extends Enum {
    static FILE_FAILED = new InterruptReason("FILE_FAILED");

    static FILE_ACCESS_DENIED = new InterruptReason("FILE_ACCESS_DENIED");

    static FILE_NO_SPACE = new InterruptReason("FILE_NO_SPACE");

    static FILE_NAME_TOO_LONG = new InterruptReason("FILE_NAME_TOO_LONG");

    static FILE_TOO_LARGE = new InterruptReason("FILE_TOO_LARGE");

    static FILE_VIRUS_INFECTED = new InterruptReason("FILE_VIRUS_INFECTED");

    static FILE_TRANSIENT_ERROR = new InterruptReason("FILE_TRANSIENT_ERROR");

    static FILE_BLOCKED = new InterruptReason("FILE_BLOCKED");

    static FILE_SECURITY_CHECK_FAILED = new InterruptReason("FILE_SECURITY_CHECK_FAILED");

    static FILE_TOO_SHORT = new InterruptReason("FILE_TOO_SHORT");

    static FILE_HASH_MISMATCH = new InterruptReason("FILE_HASH_MISMATCH");

    static FILE_SAME_AS_SOURCE = new InterruptReason("FILE_SAME_AS_SOURCE");

    static NETWORK_FAILED = new InterruptReason("NETWORK_FAILED", chrome.i18n.getMessage('networkFailed'));

    static NETWORK_TIMEOUT = new InterruptReason("NETWORK_TIMEOUT", chrome.i18n.getMessage('networkTimeout'));

    static NETWORK_DISCONNECTED = new InterruptReason("NETWORK_DISCONNECTED", chrome.i18n.getMessage('networkDisconnected'));

    static NETWORK_SERVER_DOWN = new InterruptReason("NETWORK_SERVER_DOWN", chrome.i18n.getMessage('networkServerDown'));

    static NETWORK_INVALID_REQUEST = new InterruptReason("NETWORK_INVALID_REQUEST", chrome.i18n.getMessage('networkInvalidRequest'));

    static SERVER_FAILED = new InterruptReason("SERVER_FAILED");

    static SERVER_NO_RANGE = new InterruptReason("SERVER_NO_RANGE");

    static SERVER_BAD_CONTENT = new InterruptReason("SERVER_BAD_CONTENT");

    static SERVER_UNAUTHORIZED = new InterruptReason("SERVER_UNAUTHORIZED");

    static SERVER_CERT_PROBLEM = new InterruptReason("SERVER_CERT_PROBLEM");

    static SERVER_FORBIDDEN = new InterruptReason("SERVER_FORBIDDEN");

    static SERVER_UNREACHABLE = new InterruptReason("SERVER_UNREACHABLE");

    static SERVER_CONTENT_LENGTH_MISMATCH = new InterruptReason("SERVER_CONTENT_LENGTH_MISMATCH");

    static SERVER_CROSS_ORIGIN_REDIRECT = new InterruptReason("SERVER_CROSS_ORIGIN_REDIRECT");

    static USER_CANCELED = new InterruptReason("USER_CANCELED", chrome.i18n.getMessage('userCanceled'));

    static USER_SHUTDOWN = new InterruptReason("USER_SHUTDOWN");

    static CRASH = new InterruptReason("CRASH");
}

export default InterruptReason