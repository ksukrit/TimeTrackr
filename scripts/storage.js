class DataStore {
    getUsageData(callback) {
        chrome.storage.local.get('usageData', function (result) {
            if (result !== undefined && callback !== undefined) {
                callback(result)
            }
        });
    }

    getMemoryUse(name, callback) {
        chrome.storage.local.getBytesInUse(name, callback);
    };

    clearStorage(){
        chrome.storage.local.clear();
        chrome.runtime.reload();
    }
}