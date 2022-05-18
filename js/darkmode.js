import IconType from "./module/IconType.js";

document.querySelector('title').innerText = chrome.i18n.getMessage('darkmodePageTitle');

window.resizeTo(0, 0);

let isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
chrome.runtime.sendMessage({
    method: 'changeActionIcon',
    data: isDarkMode ? IconType.light.toString() : IconType.dark.toString()
}, response => {
    window.close();
});
