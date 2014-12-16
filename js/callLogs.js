'use strict';

var callLogs = {
  logs: (function () {
    var logs = localStorage.getItem('logs');

    if (logs) {
      return JSON.parse(logs);
    } else {
      return [];
    }
  }()),
  log: function (number) {
    callLogs.logs.push({
      number: number,
      date: new Date()
    });

    localStorage.setItem('logs', JSON.stringify(callLogs.logs));
  }
};