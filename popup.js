var processor = new Processor();
var dataStore = new DataStore();

function convertToCSV(data) {
  const cutoffTime = processor.getCutoffTime(24 * 30);
  const processedData = processor.processData(data, cutoffTime);
  const sortedData = Object.entries(processedData).sort((a, b) => b[1] - a[1]);

  const csv = [];
  csv.push(['Website url', 'Time Spent (minutes)']);
  for (const [idx, data] of Object.entries(sortedData)) {
    csv.push([data[0], data[1]]);
  }
  return csv.join('\n');
}


document.addEventListener('DOMContentLoaded', function () {
  const viewTimeButton = document.getElementById('viewTimeButton');
  const resetButton = document.getElementById('resetButton');
  const csvButton = document.getElementById('csvButton');
  const limitButton = document.getElementById('addLimit');
  const usageText = document.getElementById('usage');
  const urlText = document.getElementById('website');
  const limitText = document.getElementById('limit');


  resetButton.addEventListener('click', function () {
    dataStore.clearStorage();
  });

  csvButton.addEventListener('click', function () {
    dataStore.getMemoryUse('usageData', function (result) { console.log(result) });
    dataStore.getUsageData(function (result) {
      const usageData = result.usageData;
      const csv = convertToCSV(usageData);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      chrome.downloads.download({
        url: url,
        filename: 'usageData.csv'
      });
    });
  });


  viewTimeButton.addEventListener('click', function () {
    chrome.tabs.create({ url: 'graph.html' });
  });

  getActiveTab(function (hostname, tabs) {
    dataStore.getLimitData(function (result) {
      console.log("Checking if current tab is limited")
      console.log(hostname)
      console.log(result)

      urlText.innerHTML = hostname;
      getHostnameCurrentUsage(hostname, processor, dataStore, function (currentUsage) {
        usageText.innerHTML = "Current usage: " + Math.round(currentUsage) + " minutes";
      });
      var limitData = result.limitData;
      if (limitData[hostname] !== undefined) {
        limitText.innerHTML = "Limit: " + limitData[hostname] + " minutes";
        limitButton.innerHTML = "Remove Limit";
      }
    });
  });

  limitButton.addEventListener('click', function () {
    getActiveTab(function (hostname, tabs) {
      // scope of optimization here as we are getting limit data twice
      dataStore.getLimitData(function (result) {
        let ld = result.limitData;
        if (ld[hostname] !== undefined) {
          delete ld[hostname];
          limitText.innerHTML = "Limit: No Limit";
          limitButton.innerHTML = "Add Time Limit";
        } else {
          ld[hostname] = 30;
          limitText.innerHTML = "Limit: " + ld[hostname] + " minutes";
          limitButton.innerHTML = "Remove Limit";
        }
        dataStore.updateLimitData(ld);
      });
    });
  });
});
