const randomNum = () => Math.floor(Math.random() * (235 - 52 + 1) + 52);

const randomRGB = () => `rgb(${randomNum()}, ${randomNum()}, ${randomNum()})`;

const getActiveTab = (callback) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs[0] === undefined) {
            console.debug("No active tab")
            return;
        }
        const url = new URL(tabs[0].url);
        const hostname = url.hostname;
        callback(hostname,tabs);
    });
}

const getCurrentTime = () => {
    dt = Date.now();
    const currentTime = Math.round(dt / 60000) * 60000;
    return currentTime;
}

const getHostname = (url) => {
    if (url === undefined) {
        return "";
    }
    const urlObj = new URL(url);
    return urlObj.hostname;
}

const getHostnameCurrentUsage = (hostname,processor,dataStore,callback) => {
    const cutoffTime = processor.getCutoffTime(24 * 30);
    dataStore.getUsageData(function (result) {
        let usageDataGlobal = result.usageData || {};
        const processedData = processor.processData(usageDataGlobal, cutoffTime);
        const timeSpent = processedData[hostname];
        callback(timeSpent);    
    });
}