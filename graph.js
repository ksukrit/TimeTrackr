let processedData1Hr;
let processedData24Hr;
let processedData7Days;
let chart;
var processor = new Processor();

function getUsageData(callback) {
  chrome.storage.local.get('usageData', function (result) {
    if (result !== undefined) {
      callback(result)
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  getUsageData(function (result) {
    const usageData = result.usageData;
    const cutoffTime1Hr = processor.getCutoffTime(1);
    const cutoffTime24Hr = processor.getCutoffTime(24);
    const cutoffTime7Days = processor.getCutoffTime(24 * 7);

    processedData1Hr = processor.processData(usageData, cutoffTime1Hr);
    processedData24Hr = processor.processData(usageData, cutoffTime24Hr);
    processedData7Days = processor.processData(usageData, cutoffTime7Days);

    const ctx = document.getElementById('myChart').getContext('2d');
    updateTotalTime(processedData1Hr);
    document.getElementById('1hour').style.backgroundColor = "#4CAF50";
    document.getElementById('24hour').style.backgroundColor = "#008CBA";
    document.getElementById('7day').style.backgroundColor = "#008CBA";
    const randomColors = Object.keys(processedData1Hr).map(randomRGB);
    chart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: Object.keys(processedData1Hr),
        datasets: [{
          label: 'Time spent in minutes',
          data: Object.values(processedData1Hr),
          backgroundColor: randomColors,
          borderColor: "#fff",
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        title: {
          display: true,
          text: 'Time spent in minutes'
        }
      }
    });


  });
});


function updateTotalTime(processedData) {
  let total = 0;
  for (const [hostname, timeSpent] of Object.entries(processedData)) {
    total += timeSpent;
  }

  document.getElementById('totalTime').innerHTML = "Total time spent browsing : " + Math.round(total) + " minutes";
}

document.getElementById('1hour').addEventListener('click', function () {
  chart.data.labels = Object.keys(processedData1Hr);
  chart.data.datasets[0].data = Object.values(processedData1Hr);
  chart.update();
  updateTotalTime(processedData1Hr);

  document.getElementById('1hour').style.backgroundColor = "#4CAF50";
  document.getElementById('24hour').style.backgroundColor = "#008CBA";
  document.getElementById('7day').style.backgroundColor = "#008CBA";
});

document.getElementById('24hour').addEventListener('click', function () {
  chart.data.labels = Object.keys(processedData24Hr);
  chart.data.datasets[0].data = Object.values(processedData24Hr);
  chart.update();
  updateTotalTime(processedData24Hr);

  document.getElementById('24hour').style.backgroundColor = "#4CAF50";
  document.getElementById('1hour').style.backgroundColor = "#008CBA";
  document.getElementById('7day').style.backgroundColor = "#008CBA";
});

document.getElementById('7day').addEventListener('click', function () {
  chart.data.labels = Object.keys(processedData7Days);
  chart.data.datasets[0].data = Object.values(processedData7Days);
  chart.update();
  updateTotalTime(processedData7Days);

  document.getElementById('7day').style.backgroundColor = "#4CAF50";
  document.getElementById('1hour').style.backgroundColor = "#008CBA";
  document.getElementById('24hour').style.backgroundColor = "#008CBA";
});
