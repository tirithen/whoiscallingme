/* global RSVP, NumberLookupService, ContactsNumberLookupSource, HittaSeNumberLookupSource, callLogs */

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
      HittaSeNumberLookupSource
    ]
  });

  function start() {
    var searchTimer;
    var numberSearchField = document.querySelector('#number-search-field');
    var numberSearchError = document.querySelector('#number-search-error');
    var numberSearchQuery = document.querySelector('#number-search-query');
    var numberSearchErrorQuery = document.querySelector('#number-search-error-query');
    var numberSearchResult = document.querySelector('#number-search-result');
    var numberSearchResultList = document.querySelector('#number-search-result ul');
    var numberSearchResultListItemTemplate = document.querySelector('#number-search-result ul li');

    function renderSearchResult() {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(function () {
        if (numberSearchField.value) {
          lookup(numberSearchField.value);
        }
      }, 300);
    }

    function renderCallLogs() {
      var callLogsList =  document.querySelector('#call-logs-view ul');
      var logListItem;
      var sameNumberCount = 0;

      callLogsList.innerHTML = '';

      callLogs.logs.reverse().forEach(function (log, index) {
        if (index > 0 && callLogs.logs[index - 1].number === log.number) {
          sameNumberCount += 1;
        } else {
          if (sameNumberCount > 1) {
            logListItem.textContent += ' (' + sameNumberCount + ')';
          }

          sameNumberCount = 1;
          logListItem = document.createElement('li');

          (function (logListItem) {
            numberLookupService.lookup(log.number).then(function (responses) {
              var message = responses.map(function (response) {
                return response.result;
              }).join(', ');
              logListItem.textContent = log.number + ': ' + message;
            });
          }(logListItem));

          logListItem.addEventListener('click', function () {
            numberSearchField.value = log.number;
            lookup(numberSearchField.value);
          });

          callLogsList.appendChild(logListItem);
        }
      });

      setAccordionHeight();
    }

    renderCallLogs();

    // Hide elements
    numberSearchError.style.display = 'none';
    numberSearchResult.style.display = 'none';

    // Save templates
    numberSearchResultListItemTemplate.parentNode.removeChild(numberSearchResultListItemTemplate);
    numberSearchResultListItemTemplate = numberSearchResultListItemTemplate.innerHTML;

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
            var valueElements = listItem.querySelectorAll('span, small');
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

    if (window.navigator.mozTelephony) {
      window.navigator.mozTelephony.addEventListener('incoming', function (event) {
        callLogs.log(event.call.number);

        renderCallLogs();

        lookup(event.call.number, function (responses) {
          var message = responses.map(function (response) {
            return response.result;
          }).join(', ');

          navigator.mozNotification.createNotification(
            translate('app_title'),
            message,
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
  }

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

  Array.prototype.forEach.call(views, function (view) {
    view.addEventListener('click', function (event) {
      var target = event.target;

      while (target.parentElement && !target.classList.contains('view')) {
        target = target.parentElement;
      }

      if (target.classList.contains('view')) {
        Array.prototype.forEach.call(views, function (view) {
          view.classList.remove('active');
        });

        target.classList.add('active');
      }

      setAccordionHeight();
    });
  });

  window.addEventListener('resize', setAccordionHeight);
  setAccordionHeight();

  // We want to wait until the localisations library has loaded all the strings.
  // So we'll tell it to var us know once it's ready.
  navigator.mozL10n.once(start);
});
