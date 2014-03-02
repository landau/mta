'use strict';

var _ = require('lodash');
var db = require('../db').coll;
var util = require('../util');

var ms = 1e3;
var sec = ms * 60;
var min = sec * 60;
var hour = min * 60;
var day = hour * 24;
var week = day * 7;
var month = day * 30;
var year = day * 365;

var api = exports;
var LRU = require('lru-cache');
var cache = LRU({
  max: 4,
  maxAge: 1e3 * 60 // 1 min
});

exports.findById = function(id, cb) {
  db.find({ _id: id }, function(err, results) {
  }, function (err, results) {
    if (err) return cb(err);
    cache.set(id, results);
    cb(null, results);
  });
};

exports.findByRange = function(start, end, cb) {
  var range = util.getIdRange(start, end);
  var key = JSON.stringify(range);

  // look up ids that are lte end date and gte start
  db.find({
    _id: {
      $lte: _.last(range),
      $gte: _.first(range)
    }
  }, function (err, results) {
    if (err) return cb(err);
    cache.set(key, results);
    cb(null, results);
  });
};

exports.getDay = function(date, cb) {
  var id = util.formatId(date);
  api.findById(id, cb);
};

exports.getWeek = function(date, cb) {
  var end = new Date();
  var start = new Date(Date.now() - week);
  api.findByRange(start, end, cb);
};

exports.getLast30 = function(date, cb) {
  var end = new Date();
  var start = new Date(Date.now() - month);
  api.findByRange(start, end, cb);
};

exports.getLastYear = function(date, cb) {
  var end = new Date();
  var start = new Date(Date.now() - year);
  api.findByRange(start, end, cb);
};
