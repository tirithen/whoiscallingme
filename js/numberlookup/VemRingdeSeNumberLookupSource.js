/* global $, NumberLookupSource, unique */

'use strict';

function VemRingdeSeNumberLookupSource(options) {
  // Run the parent constructor
  NumberLookupSource.call(this, options);

  // Setup parameters for this source
  this.url = 'http://www.vemringde.se/?q={number}';
  this.countryCodes = [ '+46' ];
  this.description = 'Swedish website vemringde.se';
}

// Inherit from NumberLookupSource
VemRingdeSeNumberLookupSource.prototype = Object.create(NumberLookupSource.prototype);
VemRingdeSeNumberLookupSource.prototype.constructor = VemRingdeSeNumberLookupSource;

VemRingdeSeNumberLookupSource.prototype._parseResponse = function (response) {
  var body = '<div>' + response.replace(/^[\s\S]*<body.*?>|<\/body>[\s\S]*$/g, '') + '</div>';

  response = unique($(body).find('#calls ol.table .w40').map(function (index, element) {
    return element.textContent.trim();
  }).toArray()).join(', ');

  return response || undefined;
};
