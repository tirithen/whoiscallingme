'use strict';

function NumberLookupSource(options) {
  options = options || {};
  this.cacheMaxAge = options.cacheMaxAge || 7 * 24 * 3600 * 1000; // Default to one week
}

NumberLookupSource.prototype._unableToParseResponseErrorMessage = 'Unable to parse response';

NumberLookupSource.prototype._createLookupURL = function (number) {
  return this.url.replace('{number}', number);
};

NumberLookupSource.prototype._createCacheKey = function (number) {
  return 'cache-' + this.constructor.name + '-' + number;
};

NumberLookupSource.prototype._getCachedResponse = function (number) {
  var response = JSON.parse(localStorage.getItem(this._createCacheKey(number)));

  if (response && response.date < Date.now() + this.cacheMaxAge) {
    response.source = this;
    response.number = number;

    return response;
  }
};

NumberLookupSource.prototype._setCachedResponse = function (response) {
  var data = JSON.stringify({
    result: response.result,
    date: Date.now()
  });

  localStorage.setItem(this._createCacheKey(response.number), data);
};

NumberLookupSource.prototype.lookup = function (number) {
  var self = this;

  return new Promise(function (resolve) {
    var response = self._getCachedResponse(number);

    if (response) {
      console.log('Cached response:', response);
      resolve(response);
    } else {
      var request = new XMLHttpRequest({ mozSystem: true });

      request.onload = function() {
        if (request.status === 200) {
          response = self._parseResponse(request.response);

          if (response) {
            response = {
              source: self,
              number: number,
              result: response
            };

            console.log('XHR response:', response);
            resolve(response);
            self._setCachedResponse(response);
          } else {
            console.error(new Error(self._unableToParseResponseErrorMessage));
            resolve();
          }
        } else {
          console.error(new Error('HTTP response status ' + request.status));
          resolve();
        }
      };

      request.open('GET', self._createLookupURL(number), true);
      request.send();

      console.log('Sending XHR request to: ' + self._createLookupURL(number));
    }
  });
};