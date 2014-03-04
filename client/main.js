/* global Rickshaw */
'use strict';

/*
var graph = new Rickshaw.Graph({
  element: document.querySelector("#chart"),
  width: 235,
  height: 85,
  renderer: 'bar',
  */
var tst = [
  {
    data: [ { x: 0, y: 40 }, { x: 1, y: 49 }, { x: 2, y: 38 }, { x: 3, y: 30 }, { x: 4, y: 32 } ],
    color: '#4682b4'
  }, {
    data: [ { x: 0, y: 20 }, { x: 1, y: 24 }, { x: 2, y: 19 }, { x: 3, y: 15 }, { x: 4, y: 16 } ],
    color: '#9cc1e0'
  }];

var _slice = [].slice;
var _ = require('lodash');

function isGoodService(status) {
  return status === 'GOOD SERVICE';
}

// TODO there is also SERVICE CHANGE, PLANNED WORK

var barGraphs = _slice.call(document.querySelectorAll('[data-graph=bar]'));
var data = barGraphs.map(function(el) {
  return JSON.parse(el.dataset.data);
});

var todayData = data[0];
var todayAggregate = todayData.reduce(function(acc, d) {
  d.items.forEach(function(item) {
    item.lines.forEach(function(line) {
      var lineObj = acc[line.name];
      if (!lineObj) lineObj = acc[line.name] = { good: 0, delay: 0 };

      var prop = isGoodService(line.status) ? 'good' : 'delay';

      lineObj[prop] += 1;
    });
  });

  return acc;
}, {});

//console.log(todayAggregate);
var MAX_HEIGHT = 200;

var series = Object.keys(todayAggregate).map(function(key, i) {
  var line = todayAggregate[key];

  var total = line.good + line.delay;
  var height = MAX_HEIGHT;
  var diff = height / total;

  return [
    { x: i, y: diff * line.good },
    { x: i, y: diff * line.delay }
  ];
}).reduce(function(acc, seq, i) {

  acc[0].data.push(seq[0]);
  acc[1].data.push(seq[1]);
  return acc;
}, [{ data: [], color: 'steelblue' }, { data: [], color: 'lightblue' }]);
console.log(series, tst);

var graph = new Rickshaw.Graph({
  element: barGraphs[0].querySelector('.chart'),
  width: 400,
  height: MAX_HEIGHT,
  renderer: 'bar',
  series: series
});

graph.render();
console.log(1e9);
