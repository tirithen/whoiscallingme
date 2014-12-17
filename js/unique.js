'use strict';

function unique(array) { // jshint ignore:line
  return array.sort().filter(function(value, index) {
    return index === array.indexOf(value);
  });
}
