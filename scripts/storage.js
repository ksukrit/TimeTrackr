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

    getLimitData(callback) {
        chrome.storage.local.get('limitData', function (result) {
            if (result !== undefined && callback !== undefined) {
                callback(result)
            }
        });
    }

    updateLimitData(data) {
        console.log(data)
        chrome.storage.local.set({ 'limitData': data }, function () {
            console.log("Updated limit data callback")
            // check if data is updated
            chrome.storage.local.get('limitData', function (result) {
                console.log(result);
            });
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