// mta/index
'use strict';

var mta = require('./mta');
var store = require('./store');

exports.getData = mta.getData;
exports.init = function(cb) {
  store.init(function(err) {
    if (err) throw err;

    store.poll();
    cb();
  });
};

exports.db = require('./db');
