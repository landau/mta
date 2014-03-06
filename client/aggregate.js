'use strict';
var MAX_HEIGHT = 200;

var _ = require('lodash');
var createAggr = require('./create-aggr');

function add(a, b) {
  return a + b;
}

function sum(values) {
  return values.reduce(add, 0);
}

function iterator(acc, obj, key) {
  var total = sum(_.values(obj));
  var height = MAX_HEIGHT;
  var diff = height / total;

  acc[key] = _.map(obj, function map(v, k) {
    return { label: k, value: v * diff };
  });
  
}

function aggregate(series) {
  var obj = createAggr(series);
  return _.transform(obj, iterator, {});
}

module.exports = aggregate;
