'use strict';

function NumberLookupService(options) {
  this.sources = options.sources.map(function (Constructor) {
    return new Constructor();
  });
}

NumberLookupService.prototype.lookup = function (number) {
  var self = this;

  return new Promise(function (resolve) {
    var promises = self.sources.map(function (source) {
      return source.lookup(number);
    });

    Promise.all(promises).then(function (results) {
      results = results.filter(function (result) { return !!result; });
      resolve(results);
    });
  });
};