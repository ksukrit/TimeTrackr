class DataStore {
    getUsageData(callback) {
        chrome.storage.local.get('usageData', function (result) {
            if (result !== undefined && callback !== undefined) {
                callback(result)
            }
        });
    }

    updateUsageData(data) {
        console.log("Updating usage data")
        chrome.storage.local.set({ 'usageData': data });
    }

    getMemoryUse(name, callback) {
        chrome.storage.local.getBytesInUse(name, callback);
    };

    clearStorage(){
        chrome.storage.local.clear();
        chrome.runtime.reload();
    }
}