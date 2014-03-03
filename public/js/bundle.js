(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

/*
var graph = new Rickshaw.Graph({
  element: document.querySelector("#chart"),
  width: 235,
  height: 85,
  renderer: 'bar',
  series: [
    {
      data: [ { x: 0, y: 40 }, { x: 1, y: 49 }, { x: 2, y: 38 }, { x: 3, y: 30 }, { x: 4, y: 32 } ],
      color: '#4682b4'
    }, {
      data: [ { x: 0, y: 20 }, { x: 1, y: 24 }, { x: 2, y: 19 }, { x: 3, y: 15 }, { x: 4, y: 16 } ],
      color: '#9cc1e0'
    }]
});
*/

var _slice = [].slice;

function isGoodService(status) {
  return status === 'GOOD SERVICE';
}

var barGraphs = _slice.call(document.querySelectorAll('[data-graph=bar]'));
var data = barGraphs.map(function(el) {
  return JSON.parse(el.dataset.data);
});

var todayData = data[0];
var todayAggregate = todayData.reduce(function(acc, d) {
  d.items.forEach(function(item) {
    item.lines.forEach(function(line) {
      var lineObj = acc[line.name];
      if (!lineObj) lineObj = acc[line.name] = { true: 0, false: 0 };

      lineObj[isGoodService(line.status)] += 1;
    });
  });

  return acc;
}, {});


console.log(todayAggregate);

},{}]},{},[1])