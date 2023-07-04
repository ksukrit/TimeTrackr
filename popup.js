var processor = new Processor();
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
  resetButton.addEventListener('click', function () {
    chrome.storage.local.clear();
    chrome.runtime.reload();
  });

  const csvButton = document.getElementById('csvButton');
  csvButton.addEventListener('click', function () {
    chrome.storage.local.get('usageData', function (result) {
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
});
