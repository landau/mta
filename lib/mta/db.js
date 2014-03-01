'use strict';

var _ = require('lodash');

// should probably store id as time in minutes since the updates are 1 minute
// however if there are no changes in the sched, it should not store again, but i need to know
// how many hits.

// Maybe time diffs are better!
// so, each day gets an entry containing something like
// so for a day, we can generaate an up to the minute/hour/monthly set at req time
// cache in lru

// this means we need to store the current timestamp in memory to see if we should store again
// we should store if
//   day is not the same as last
//   state has changed
// So, in memory, we should store some object that represents
// the current day and it's state


function get(query, opts, cb) {

}


exports.getDay = function(date, cb) {
  // get all entries for today starting at midnight to date given
};

exports.getWeek = function(date, cb) {
  // get all days of this date week starting on monday
  // this should probably
};

exports.getMonth = function(date, cb) {
  // get all days in this date month
};

exports.getYear = function(date, cb) {
  // should return all n day entries over the passed year
  // convert to
};
