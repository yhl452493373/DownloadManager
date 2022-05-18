import IconType from "./module/IconType.js";

let isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
chrome.runtime.sendMessage({
    method: 'changeActionIcon',
    data: isDarkMode ? IconType.light.toString() : IconType.dark.toString()
}, response => {
    window.close();
});
