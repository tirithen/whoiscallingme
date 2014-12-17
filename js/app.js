/* global
  RSVP,
  NumberLookupService,
  ContactsNumberLookupSource,
  HittaSeNumberLookupSource,
  VemRingdeSeNumberLookupSource,
  callLogs,
  unique
*/

window.Promise = RSVP.Promise;

window.addEventListener('DOMContentLoaded', function() {

  // We'll ask the browser to use strict code to help us catch errors earlier.
  // https://developer.mozilla.org/Web/JavaScript/Reference/Functions_and_function_scope/Strict_mode
  'use strict';

  var translate = navigator.mozL10n.get;

  var lock;
  if (navigator.requestWakeLock) {
    lock = navigator.requestWakeLock('cpu');
  }

  // Create the number lookup service and pass constructors for all avaliable sources
  var numberLookupService = new NumberLookupService({
    sources: [
      ContactsNumberLookupSource,
      HittaSeNumberLookupSource,
      VemRingdeSeNumberLookupSource
    ]
  });

  function start() {
    var searchTimer;
    var numberSearchView = document.querySelector('#number-search-view');
    var numberSearchField = document.querySelector('#number-search-field');
    var numberSearchError = document.querySelector('#number-search-error');
    var numberSearchQuery = document.querySelector('#number-search-query');
    var numberSearchErrorQuery = document.querySelector('#number-search-error-query');
    var numberSearchResult = document.querySelector('#number-search-result');
    var numberSearchResultList = document.querySelector('#number-search-result ul');
    var numberSearchResultListItemTemplate = numberSearchResultList.querySelector('li');
    var callLogsList = document.querySelector('#call-logs-view .content ul');
    var callLogsListItemTemplate = callLogsList.querySelector('li');
    var views = document.querySelectorAll('.view');

    function setAccordionHeight() {
      var headerHeight = document.querySelector('.view h1').scrollHeight;

      Array.prototype.forEach.call(views, function (view) {
        if (view.classList.contains('active')) {
          view.style.height = view.scrollHeight + 'px';
        } else {
          view.style.height = headerHeight + 'px';
        }
      });
    }

    function openViewByElement(element) {
      while (element.parentElement && !element.classList.contains('view')) {
        element = element.parentElement;
      }

      if (element.classList.contains('view')) {
        Array.prototype.forEach.call(views, function (view) {
          view.classList.remove('active');
        });

        element.classList.add('active');
      }

      setAccordionHeight();
    }

    Array.prototype.forEach.call(views, function (view) {
      view.querySelector('h1').addEventListener('click', function (event) {
        openViewByElement(event.target);
      });
    });

    function lookup(number, callback) {
      number = number.replace(/[\s\-]+/, '');

      numberSearchError.style.display = 'none';
      numberSearchResult.style.display = 'none';

      numberSearchQuery.textContent = number;
      numberSearchQuery.href = 'tel:' + number;

      numberLookupService.lookup(number).then(function (results) {
        if (results && results.length > 0) {
          numberSearchResultList.innerHTML = '';

          results.forEach(function (result) {
            var listItem = document.createElement('li');
            listItem.innerHTML = numberSearchResultListItemTemplate;
            var valueElements = listItem.querySelectorAll('.info, .source');
            valueElements[0].textContent = result.result;
            valueElements[1].textContent = result.source.description;
            numberSearchResultList.appendChild(listItem);
          });

          numberSearchResult.style.display = 'block';

          if (callback instanceof Function) {
            callback(results);
          }
        } else {
          numberSearchErrorQuery.textContent = number;
          numberSearchErrorQuery.href = 'tel:' + number;
          numberSearchError.style.display = 'block';
        }

        setAccordionHeight();
      });
    }

    function renderSearchResult() {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(function () {
        if (numberSearchField.value) {
          lookup(numberSearchField.value);
        }
      }, 300);
    }

    function renderCallLogs() {
      var logListItem;
      var sameNumberCount = 1;
      var nextNumberCount = 1;
      var lastDate;

      callLogsList.innerHTML = '';

      callLogs.logs.reverse().forEach(function (log, index) {
        var logDateString = log.date.toLocaleDateString();
        var logDateElement;

        if (logDateString !== lastDate) {
          logDateElement = document.createElement('li');
          logDateElement.classList.add('divider-heading');
          logDateElement.textContent = logDateString;
          callLogsList.appendChild(logDateElement);
          lastDate = logDateString;
        }

        if (index > 0 && callLogs.logs[index - 1].number === log.number) {
          sameNumberCount += 1;
        } else {
          logListItem = document.createElement('li');
          callLogsList.appendChild(logListItem);

          (function (logListItem, nextNumberCount) {
            numberLookupService.lookup(log.number).then(function (responses) {
              var info = unique(responses.map(function (response) {
                return response.result;
              })).join(', ');

              logListItem.innerHTML = callLogsListItemTemplate;
              var valueElements = logListItem.querySelectorAll('.number, .info, .count, .time');

              valueElements[0].textContent = info ? info : translate('unknown_number');
              valueElements[1].textContent = log.number;
              valueElements[3].textContent = log.date.toLocaleTimeString();

              if (nextNumberCount > 1) { // Add count to previous item
                valueElements[2].textContent = ' (' + nextNumberCount + ')';
              }

            });
          } (logListItem, nextNumberCount));

          logListItem.addEventListener('click', function () {
            numberSearchField.value = log.number;
            lookup(numberSearchField.value);
            openViewByElement(numberSearchView);
          });

          callLogsList.appendChild(logListItem);

          nextNumberCount = sameNumberCount;
          sameNumberCount = 1;
        }
      });

      setAccordionHeight();
    }

    // Hide elements
    numberSearchError.style.display = 'none';
    numberSearchResult.style.display = 'none';

    // Save templates
    numberSearchResultListItemTemplate.parentNode.removeChild(numberSearchResultListItemTemplate);
    numberSearchResultListItemTemplate = numberSearchResultListItemTemplate.innerHTML;

    callLogsListItemTemplate.parentNode.removeChild(callLogsListItemTemplate);
    callLogsListItemTemplate = callLogsListItemTemplate.innerHTML;

    renderCallLogs();

    if (window.navigator.mozTelephony) {
      window.navigator.mozTelephony.addEventListener('incoming', function (event) {
        callLogs.log(event.call.number);

        renderCallLogs();

        lookup(event.call.number, function (responses) {
          var info = unique(responses.map(function (response) {
            return response.result;
          })).join(', ');

          navigator.mozNotification.createNotification(
            translate('app_title'),
            info,
            window.location.href.replace('index.html', '') + '/img/icons/icon.svg'
          ).show();
        });
      });
    }

    numberSearchField.addEventListener('keyup', renderSearchResult);
    numberSearchField.addEventListener('change', renderSearchResult);

    if (numberSearchField.value) {
      lookup(numberSearchField.value);
    }

    window.addEventListener('resize', setAccordionHeight);
    setAccordionHeight();
  }

  // We want to wait until the localisations library has loaded all the strings.
  // So we'll tell it to var us know once it's ready.
  navigator.mozL10n.once(start);
});
