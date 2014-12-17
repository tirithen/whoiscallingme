'use strict';

var callLogs = {};

callLogs.sort = function (logs) {
  (logs || callLogs.logs).sort(function (logA, logB) {
    if (logA.date.getTime() < logB.date.getTime()) {
      return -1;
    } else if (logA.date.getTime() > logB.date.getTime()) {
      return 1;
    }

    return 0;
  });

  return logs;
};

callLogs.logs = (function () {
  var logs = localStorage.getItem('logs');

  if (logs) {
    logs = JSON.parse(logs);

    logs = logs.map(function (log) {
      return {
        number: log.number,
        date: new Date(log.date)
      };
    });

    logs = callLogs.sort(logs);

    return logs;
  } else {
    return [];
  }
}());

callLogs.log = function (number) {
  callLogs.logs.push({
    number: number,
    date: new Date()
  });

  callLogs.sort();

  localStorage.setItem('logs', JSON.stringify(callLogs.logs));
};
