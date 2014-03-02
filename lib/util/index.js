'use strict';
var is = require('is-predicate');

exports.formatId = function(v) {
  v = v || new Date();

  var d = ['Hours', 'Minutes', 'Seconds', 'Milliseconds'].reduce(function(d, m) {
    var tmp = new Date(+d);
    tmp['set' + m](0);
    return tmp;
  }, new Date(+v));

  return +d;
};

exports.genId = function() {
  return exports.formatId();
};

exports.getIdRange = function(start, end) {
  if (is.not.date(start)) throw new TypeError('Expected `start` to be a date object');
  if (is.not.date(end)) throw new TypeError('Expected `end` to be a date object');

  var s = exports.formatId(start);
  var e = exports.formatId(end);
  return [s, e];
};

exports.debugLog = function(str) {
  if (process.env.NODE_DEBUG) console.log(str);
};
