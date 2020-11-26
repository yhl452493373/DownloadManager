class AudioPlayer {
    /**
     * 下载完成的声音文件路径
     * @type {string}
     */
   wav = '/audio/download-complete.wav';

    /**
     * 创建下载完成的声音对象
     * @type {HTMLAudioElement}
     */
   audio = null;

   constructor() {
       this.audio = new Audio(this.wav);
   }

   play(){
       this.audio.play().then(r => {
           //todo something
       });
   }
}

export default AudioPlayer;