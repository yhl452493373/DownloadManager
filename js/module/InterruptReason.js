import {Enum} from "./Enum.js";

class InterruptReason extends Enum {
    // noinspection JSUnusedGlobalSymbols
    static FILE_FAILED = new Enum("FILE_FAILED");
    // noinspection JSUnusedGlobalSymbols
    static FILE_ACCESS_DENIED = new Enum("FILE_ACCESS_DENIED");
    // noinspection JSUnusedGlobalSymbols
    static FILE_NO_SPACE = new Enum("FILE_NO_SPACE");
    // noinspection JSUnusedGlobalSymbols
    static FILE_NAME_TOO_LONG = new Enum("FILE_NAME_TOO_LONG");
    // noinspection JSUnusedGlobalSymbols
    static FILE_TOO_LARGE = new Enum("FILE_TOO_LARGE");
    // noinspection JSUnusedGlobalSymbols
    static FILE_VIRUS_INFECTED = new Enum("FILE_VIRUS_INFECTED");
    // noinspection JSUnusedGlobalSymbols
    static FILE_TRANSIENT_ERROR = new Enum("FILE_TRANSIENT_ERROR");
    // noinspection JSUnusedGlobalSymbols
    static FILE_BLOCKED = new Enum("FILE_BLOCKED");
    // noinspection JSUnusedGlobalSymbols
    static FILE_SECURITY_CHECK_FAILED = new Enum("FILE_SECURITY_CHECK_FAILED");
    // noinspection JSUnusedGlobalSymbols
    static FILE_TOO_SHORT = new Enum("FILE_TOO_SHORT");
    // noinspection JSUnusedGlobalSymbols
    static FILE_HASH_MISMATCH = new Enum("FILE_HASH_MISMATCH");
    // noinspection JSUnusedGlobalSymbols
    static FILE_SAME_AS_SOURCE = new Enum("FILE_SAME_AS_SOURCE");
    // noinspection JSUnusedGlobalSymbols
    static NETWORK_FAILED = new Enum("NETWORK_FAILED");
    // noinspection JSUnusedGlobalSymbols
    static NETWORK_TIMEOUT = new Enum("NETWORK_TIMEOUT");
    // noinspection JSUnusedGlobalSymbols
    static NETWORK_DISCONNECTED = new Enum("NETWORK_DISCONNECTED");
    // noinspection JSUnusedGlobalSymbols
    static NETWORK_SERVER_DOWN = new Enum("NETWORK_SERVER_DOWN");
    // noinspection JSUnusedGlobalSymbols
    static NETWORK_INVALID_REQUEST = new Enum("NETWORK_INVALID_REQUEST");
    // noinspection JSUnusedGlobalSymbols
    static SERVER_FAILED = new Enum("SERVER_FAILED");
    // noinspection JSUnusedGlobalSymbols
    static SERVER_NO_RANGE = new Enum("SERVER_NO_RANGE");
    // noinspection JSUnusedGlobalSymbols
    static SERVER_BAD_CONTENT = new Enum("SERVER_BAD_CONTENT");
    // noinspection JSUnusedGlobalSymbols
    static SERVER_UNAUTHORIZED = new Enum("SERVER_UNAUTHORIZED");
    // noinspection JSUnusedGlobalSymbols
    static SERVER_CERT_PROBLEM = new Enum("SERVER_CERT_PROBLEM");
    // noinspection JSUnusedGlobalSymbols
    static SERVER_FORBIDDEN = new Enum("SERVER_FORBIDDEN");
    // noinspection JSUnusedGlobalSymbols
    static SERVER_UNREACHABLE = new Enum("SERVER_UNREACHABLE");
    // noinspection JSUnusedGlobalSymbols
    static SERVER_CONTENT_LENGTH_MISMATCH = new Enum("SERVER_CONTENT_LENGTH_MISMATCH");
    // noinspection JSUnusedGlobalSymbols
    static SERVER_CROSS_ORIGIN_REDIRECT = new Enum("SERVER_CROSS_ORIGIN_REDIRECT");
    // noinspection JSUnusedGlobalSymbols
    static USER_CANCELED = new Enum("USER_CANCELED");
    // noinspection JSUnusedGlobalSymbols
    static USER_SHUTDOWN = new Enum("USER_SHUTDOWN");
    // noinspection JSUnusedGlobalSymbols
    static CRASH = new Enum("CRASH");
}

export {InterruptReason}