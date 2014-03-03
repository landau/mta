'use strict';

var db = require('../db').coll;
var _ = require('lodash');
var is = require('is-predicate');
var genId = require('../util').genId;
var getData = require('./mta').getData;
var debugLog = require('../util').debugLog;

var state = {
  _id: null,
  lines: null
};

exports._state = state;


function insert(data, cb) {
  _.extend(state, data);

  var input = {
    _id: state._id,
    items: [{
      time: Date.now(),
      lines: state.lines
    }]
  };

  db.insert(input, cb);
}

function update(lines, cb) {
  // Only update if last state differs
  if (_.isEqual(state.lines, lines)) {
    return process.nextTick(function() {
      cb();
    });
  }

  var item = {
    time: Date.now(),
    lines: state.lines
  };

  debugLog('updating an existing value');
  db.update({ _id: state._id }, { $push: { items: item } }, cb);
}

var isInit = false;

function init(cb) {
  if (isInit) return process.nextTick(cb);

  // Find todays result
  var id = genId();

  db.find({ _id: id}, function(err, results) {
    if (err) debugLog(err);
    if (err) return cb(new Error('Unable to init state'));

    // no result exists for today
    if (!results.length) {
      return getData(function(err, lines) {
        if (err) return cb(new Error('Unable to init state'));

        var initialState = {
          _id: id,
          lines: lines
        };

        insert(initialState, function(err) {
          if (err) debugLog(err);
          if (err) return cb(new Error('Unable to init state'));

          isInit = true;
          cb(null, true);
        });
      });
    }

    var result = _.first(results);
    _.extend(state, {
      _id: id,
      lines: _.last(result.items).lines
    });

    cb(null, false);
  });
}

exports.init = function(cb) {
  exports.store(genId(), cb);
};

exports.store = function(id, cb) {

  debugLog('Storing...');
  init(function(err, didInit) {
    if (err) throw err;
    if (didInit) return process.nextTick(cb);

    getData(function(err, lines) {

      if (err) return cb(err);

      // Date is different than current state need to add new "row"
      if (is.not.equal(state._id, id)) {
        debugLog('storing a new value');
        return insert({
          _id: id,
          lines: lines
        }, cb);
      }

      update(lines, cb);
    });
  });
};

exports.poll = function() {
  // only store if state has changed
  var id = genId();

  debugLog('Polling...');
  exports.store(id, function(err) {
    setTimeout(exports.poll, 1e3 * 60);
  });
};
