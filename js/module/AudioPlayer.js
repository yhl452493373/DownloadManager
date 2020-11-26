import Util from "./Util.js";

// noinspection JSIgnoredPromiseFromCall
class AudioPlayer {
    /**
     * 下载完成的声音文件路径
     * @type {string}
     */
    #audioFile = '/audio/download-complete.wav';

    /**
     * 创建下载完成的声音对象
     * @type {HTMLAudioElement}
     */
    #audio = null;

    /**
     * 音频文件路径
     * @param audioFileUrl {string?}
     */
    constructor(audioFileUrl) {
        if (!Util.emptyString(audioFileUrl))
            this.#audioFile = audioFileUrl;
        this.#audio = new Audio(this.#audioFile);
    }

    /**
     * 播放音频
     */
    play() {
        this.#audio.play();
    }
}

export default AudioPlayer;