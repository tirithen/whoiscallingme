/* global NumberLookupSource */

'use strict';

function HittaSeNumberLookupSource(options) {
  // Run the parent constructor
  NumberLookupSource.call(this, options);

  // Setup parameters for this source
  this.url = 'http://external.api.hitta.se/autocomplete/v2/{number}?web=5';
  this.countryCodes = [ '+46' ];
  this.description = 'Swedish website hitta.se';
}

// Inherit from NumberLookupSource
HittaSeNumberLookupSource.prototype = Object.create(NumberLookupSource.prototype);
HittaSeNumberLookupSource.prototype.constructor = HittaSeNumberLookupSource;

HittaSeNumberLookupSource.prototype._parseResponse = function (response) {
  // Parse the response and return the result if successful
  try {
    if (typeof response !== 'object') {
      response = JSON.parse(response);
    }

    return response.web[0].name.replace(/^\s*\+?\d+\s+/, '');
  } catch (exception) {
    console.error(exception);
  }
};
