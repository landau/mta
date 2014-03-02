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

exports.findById = function(id, cb) {
  db.find({ _id: id }, cb);
};

exports.findByRange = function(start, end, cb) {
  var range = util.getIdRange(start, end);

  // look up ids that are lte end date and gte start
  db.find({
    _id: {
      $lte: _.last(range),
      $gte: _.first(range)
    }
  }, cb);
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
