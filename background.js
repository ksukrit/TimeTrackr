let activeTabHostname;
let usageData = {};
let tabStartTime = {};

function getCurrentTime() {
    dt = Date.now();
    const currentTime = Math.round(dt / 60000) * 60000;
    return currentTime;
}

function startTrackingTab(hostname) {
    activeTabHostname = hostname;
    tabStartTime[hostname] = Date.now();
    usageData[hostname] = usageData[hostname] || 0;
}

function stopTrackingTab(hostname) {
    if (tabStartTime[hostname] !== undefined) {
        const duration = Date.now() - tabStartTime[hostname];
        durationInSeconds = duration / 1000;
        console.log(`Used ${hostname} for ${durationInSeconds}s`);
        usageData[hostname] = usageData[hostname] || 0;
        usageData[hostname] += duration;
        console.log(usageData);

        if (durationInSeconds > 60) {
            saveUsageData();
        }
        activeTabHostname = undefined;
    }
}

function getUsageData(callback) {
    chrome.storage.local.get('usageData', function (result) {
        if (result !== undefined) {
            callback(result)
        }
    });
}

function saveUsageData() {
    console.log("Going to save usage data")
    let ts = getCurrentTime();
    getUsageData(function (result) {
        let usageDataGlobal = result.usageData || {};
        console.log(usageDataGlobal);
        let prevHostname = "";
        if (activeTabHostname !== undefined) {
            prevHostname = activeTabHostname;
            stopTrackingTab(activeTabHostname);
        }
        if (Object.keys(usageData).length === 0 && usageData.constructor === Object) {
            return;
        }

        if (usageData === {}) {
            return;
        }
        usageDataGlobal[ts] = usageData;
        chrome.storage.local.set({ 'usageData': usageDataGlobal });
        usageData = {};

        if (prevHostname !== "") {
            startTrackingTab(prevHostname);
        }
    });
}


function getHostname(url) {
    if (url === undefined) {
        return "";
    }
    const urlObj = new URL(url);
    return urlObj.hostname;
}

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (tab.url.startsWith("chrome://")) {
        return;
    }
    const hostname = getHostname(tab.url);
    if (activeTabHostname !== hostname && changeInfo.url) {
        console.log("Tab updated " + hostname);
        stopTrackingTab(activeTabHostname);
        startTrackingTab(hostname);
    }
});

chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
    const tab = removeInfo.tab;
    if ((tab && tab.url.startsWith("chrome://")) || !tab) {
        return;
    }
    const hostname = getHostname(tab.url);
    console.log("tab closed " + hostname)
    stopTrackingTab(hostname);
});

chrome.tabs.onActivated.addListener(function (activeInfo) {
    chrome.tabs.get(activeInfo.tabId, function (tab) {
        if ((tab && tab.url.startsWith("chrome://")) || !tab || tab.url === undefined || tab.url === "") {
            return;
        }
        console.log(activeInfo, tab)
        const hostname = getHostname(tab.url);
        if (activeTabHostname !== hostname) {
            stopTrackingTab(activeTabHostname);
            startTrackingTab(hostname);
        }
    });
});

function handleAbruptShutdown() {
    stopTrackingTab(activeTabHostname);
    saveUsageData();
}

function cleanupData() {
    const cutoffTime = getCurrentTime() - (1000 * 60 * 60 * 24 * 30);
    getUsageData(function (result) {
        let usageDataGlobal = result.usageData || {};
        for (const [ts, val] of Object.entries(usageDataGlobal)) {
            if (ts < cutoffTime) {
                delete usageDataGlobal[ts];
            }
        }
        chrome.storage.local.set({ 'usageData': usageDataGlobal });
    });
}

function startBackgroundScript() {
    console.log("Starting background script")
    setInterval(cleanupData, 1000 * 60 * 60 * 24);
}

setInterval(saveUsageData, 60000);


chrome.runtime.onSuspend.addListener(handleAbruptShutdown);
chrome.runtime.onUpdateAvailable.addListener(handleAbruptShutdown);
chrome.runtime.onConnect.addListener(startBackgroundScript);
// chrome.runtime.onInstalled.addListener(handleUpdate);