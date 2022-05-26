import IconType from "./module/IconType.js";
import Util from "./module/Util.js";

document.querySelector('title').innerText = chrome.i18n.getMessage('darkmodePageTitle');

window.resizeTo(0, 0);

let isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
console.log(1)
await Util.sendMessage({
    method: 'changeActionIcon',
    data: isDarkMode ? IconType.light.toString() : IconType.dark.toString()
});
console.log(2)
window.close();
