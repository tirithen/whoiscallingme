/* global NumberLookupSource */

'use strict';

function ContactsNumberLookupSource(options) {
  NumberLookupSource.call(this, options);
  this.description = 'Contacts stored on your phone';
}

ContactsNumberLookupSource.prototype = Object.create(NumberLookupSource.prototype);
ContactsNumberLookupSource.prototype.constructor = ContactsNumberLookupSource;

ContactsNumberLookupSource.prototype._parseResponse = function (response) {
  return response && Array.isArray(response.name) ? response.name.join(' ') : undefined;
};

ContactsNumberLookupSource.prototype.lookup = function (number) {
  var self = this;

  return new Promise(function (resolve) {
    var filter = {
      filterBy: [ 'tel' ],
      filterValue: number,
      filterOp: 'match',
      filterLimit: 1
    };

    var request = window.navigator.mozContacts.find(filter);

    request.onsuccess = function (event) {
      var response = event.target.result;

      if (response && response.length > 0) {
        response = self._parseResponse(response[0]);
        if (response) {
          response = {
            source: self,
            number: number,
            result: response
          };

          console.log('ContactAPI response:', response);

          resolve(response);
        } else {
          console.error(new Error(self._unableToParseResponseErrorMessage));
          resolve();
        }
      } else {
        console.error(new Error(self._unableToParseResponseErrorMessage));
        resolve();
      }
    };

    request.onerror = function (event) {
      console.error(event.target.error);
      resolve();
    };
  });
};