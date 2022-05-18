import AudioPlayer from "./module/AudioPlayer.js";

document.querySelector('title').innerText = chrome.i18n.getMessage('audioPageTitle');

window.resizeTo(0, 0);

let audio = new AudioPlayer();
audio.play();
setTimeout(function () {
    window.close();
}, 1000);

