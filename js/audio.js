import AudioPlayer from "./module/AudioPlayer.js";

window.resizeTo(0, 0);

let audio = new AudioPlayer();

audio.play();

setTimeout(function () {
    window.close();
}, 1000);

