chrome.storage.local.set({'isDarkMode': window.matchMedia("(prefers-color-scheme: dark)").matches}, () => {
    window.close();
});