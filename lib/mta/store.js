'use strict';

var db = require('../db').coll;
var _ = require('lodash');
var is = require('is-predicate');
var moment = require('moment');
var getData = require('./mta').getData;

/*
{
  date: '12/6/2013',
  state: [state1, state2]
}
*/

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

  db.update({ _id: state._id }, { $push: { items: item } }, cb);
}

var isInit = false;

function init(cb) {
  if (isInit) return process.nextTick(cb);

  // Find todays result
  var id = moment().format('M/D/YYYY');

  db.find({ _id: id}, function(err, results) {
    if (err) return cb(new Error('Unable to init state'));

    // no result exists for today
    if (!results.lenght) {
      return getData(function(err, lines) {
        if (err) return cb(new Error('Unable to init state'));

        var initialState = {
          _id: id,
          lines: lines
        };

        insert(initialState, function(err) {
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

exports.store = function(id, cb) {

  init(function(err, didInit) {
    if (err) throw err;
    if (didInit) return process.nextTick(cb);

    getData(function(err, lines) {

      if (err) return cb(err);

      // Date is different than current state need to add new "row"
      if (is.not.equal(state._id, id)) {
        return insert({
          _id: id,
          lines: lines
        }, cb);
      }

      update(lines, cb);
    });
  });
};

exports.poll = function(cb) {
  // only store if state has changed
  var id = moment().format('M/D/YYYY');

  exports.store(id, function(err) {
    setTimeout(exports.poll, 1e3 * 60);
  });
};
