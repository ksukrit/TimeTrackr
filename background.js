let activeTabHostname;
let usageData = {};
let tabStartTime = {};
// move to using imports in the future
importScripts("scripts/storage.js", "scripts/process.js", "scripts/utility.js");
var dataStore = new DataStore();
var processor = new Processor();

function startTrackingTab(hostname) {
    enforceLimit(hostname);
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

        if (durationInSeconds > 60) {
            saveUsageData();
        }
        activeTabHostname = undefined;
    }
}

function enforceLimit(hostname) {
    dataStore.getLimitData(function (result) {
        let timeLimitData = result.limitData;
        if (timeLimitData[hostname] !== undefined) {
            const cutoffTime = processor.getCutoffTime(24 * 30);
            dataStore.getUsageData(function (result) {
                let usageDataGlobal = result.usageData || {};
                const processedData = processor.processData(usageDataGlobal, cutoffTime);
                const timeSpent = processedData[hostname];
                console.log("Time limit is " + timeLimitData[hostname] + " and time spent is " + timeSpent)
                if (timeSpent > timeLimitData[hostname]) {
                    getActiveTab(function (currentTabHostname,tabs) {
                        if (currentTabHostname === undefined) {
                            return;
                        }

                        if (currentTabHostname === hostname) {
                            chrome.tabs.update(tabs[0].id, { url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" });
                        }
                    });
                }
            });
        }
    });
}

function saveUsageData() {
    let ts = getCurrentTime();
    dataStore.getUsageData(function (result) {
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
        dataStore.updateUsageData(usageDataGlobal);
        usageData = {};

        dataStore.getMemoryUse('usageData', function (bytesInUse) {
            console.log("Memory usage: " + bytesInUse);
            if (bytesInUse > 3 * 1024 * 1024) {
                cleanupData();
            }
        });

        if (prevHostname !== "") {
            startTrackingTab(prevHostname);
        }
    });
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
    dataStore.getUsageData(function (result) {
        let usageDataGlobal = result.usageData || {};
        for (const [ts, val] of Object.entries(usageDataGlobal)) {
            if (ts < cutoffTime) {
                delete usageDataGlobal[ts];
            }
        }
        dataStore.updateUsageData(usageDataGlobal);
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