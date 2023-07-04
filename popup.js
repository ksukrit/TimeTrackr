var processor = new Processor();
var dataStore = new DataStore();
// write convertToCSV function
function convertToCSV(data) {
  const cutoffTime = processor.getCutoffTime(24*30);
  const processedData = processor.processData(data, cutoffTime);
  const csv = [];
  csv.push(['Hostname', 'Time Spent (minutes)']);
  for (const [hostname, timeSpent] of Object.entries(processedData)) {
    csv.push([hostname, timeSpent]);
  }
  return csv.join('\n');
}


document.addEventListener('DOMContentLoaded', function () {
  const viewTimeButton = document.getElementById('viewTimeButton');
  const resetButton = document.getElementById('resetButton');
  const csvButton = document.getElementById('csvButton');
  const limitButton = document.getElementById('addLimit');

  resetButton.addEventListener('click', function () {
    dataStore.clearStorage();
  });

  csvButton.addEventListener('click', function () {
    dataStore.getMemoryUse('usageData', function (result) { console.log(result) });
    dataStore.getUsageData(function (result) {
      const usageData = result.usageData;
      const csv = convertToCSV(usageData);
      const blob = new Blob([csv], { type: 'text/csv' });
      alert("We are working on this feature")
      const url = URL.createObjectURL(blob);
      // chrome.downloads.download({
      //   url: url,
      //   filename: 'usageData.csv'
      // });
    });
  });


  viewTimeButton.addEventListener('click', function () {
    chrome.tabs.create({ url: 'graph.html' });
  });

  // check if current tab is already limited if yes flip the button to remove limit
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const url = new URL(tabs[0].url);
    const hostname = url.hostname;
    dataStore.getLimitData(function (result) {
      console.log("Checking if current tab is limited")
      console.log(hostname)
      console.log(result)
      var limitData = result.limitData;
      if (limitData[hostname] !== undefined) {
        limitButton.innerHTML = "Remove Limit";
      }
    });
  });


  limitButton.addEventListener('click', function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const url = new URL(tabs[0].url);
      const hostname = url.hostname;
      dataStore.getLimitData(function (result) {
        let ld = result.limitData;
        if (ld[hostname] !== undefined) {
          delete ld[hostname];
          limitButton.innerHTML = "Add Time Limit";
        } else {
          ld[hostname] = 30;
          limitButton.innerHTML = "Remove Limit";
        }
        dataStore.updateLimitData(ld);
      });
    });
  });
});
