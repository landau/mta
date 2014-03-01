'use strict';

var request = require('request');
var xml2json = require('xml2json');
var _ = require('lodash');
var is = require('is-predicate');
var LRU = require('lru-cache');
var cache = LRU({
  max: 1,
  maxAge: 1e3 * 60 // 1 min
});

var lines = require('../../test/fixtures/one.json');

function genLine(data) {
  return _.pick(data, 'name', 'status');
}

function genMetroNorth(data) {
  try {
    return data.service.MetroNorth.line.map(genLine);
  } catch(e) {
    return [];
  }
}

// this function should only be used to store a result every minute
// This should store in to mongo
function getData(cb) {
  var data = cache.get('data');

  if (is.exists(data)) {
    return process.nextTick(function() {
      cb(null, data);
    });
  }

  request.get({
    url: exports._url
  }, function (err, result) {
    if (err) return cb(err);

    try {
      var data = JSON.parse(xml2json.toJson(result.body));
      data = genMetroNorth(data);
      cache.set('data', data);
      cb(null, data);
    } catch(e) {
      cb(e);
    }
  });
}

exports._url = 'http://web.mta.info/status/serviceStatus.txt';
exports._cache = cache;
exports.getData = getData;
