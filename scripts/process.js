class Processor {
    processData(data, cutoffTime) {
        var processedData = {};
        for (const [ts, val] of Object.entries(data)) {
            if (ts > cutoffTime) {
                for (let [hostname, timeSpent] of Object.entries(val)) {
                    if (hostname === "laagjcbeephlhghblacnfjilfhfajlnp") {
                        hostname = "TimeTrackr-Extension";
                    }
                    processedData[hostname] = processedData[hostname] || 0;
                    processedData[hostname] += timeSpent;
                }
            }
        }
        for (const [hostname, timeSpent] of Object.entries(processedData)) {
            processedData[hostname] = processedData[hostname] / (60 * 1000);
        }
        return processedData;
    }

    getCutoffTime(hours) {
        var hourago = Date.now() - (hours * 1000 * 60 * 60);
        const currentTime = Math.round(hourago / 60000) * 60000;
        return currentTime;
    }
}