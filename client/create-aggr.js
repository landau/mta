'use strict';

var _ = require('lodash');
var statuses = require('./statuses');

var defaultState = statuses.reduce(function (obj, str) {
  obj[str.toUpperCase()] = 0;
  return obj;
}, {});

function reduce(acc, d) {
  d.items.forEach(function(item) {
    item.lines.forEach(function(line) {
      var lineObj = acc[line.name];
      if (!lineObj) lineObj = acc[line.name] = _.defaults({}, defaultState);
      
      if (lineObj[line.status] == null) lineObj[line.status] = 0;

      lineObj[line.status] += 1;
    });
  });

  return acc;
}

function createAggr(arr) {
  return arr.reduce(reduce, {});
}

module.exports = createAggr;
