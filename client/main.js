/* global d3 */
/* global nv */
'use strict';

var _slice = [].slice;
var _ = require('lodash');
var aggregate = require('./aggregate');
var colors = require('./colors');
var statuses = require('./statuses');

var barGraphs = _slice.call(document.querySelectorAll('[data-graph=bar]'));
var data = barGraphs.map(_.compose(JSON.parse, _.property('data'), _.property('dataset')));


function makeKey(color, i) {
  var box = document.createElement('i');
  box.classList.add('box');
  box.style.backgroundColor = color;

  var text = document.createElement('span');
  text.innerText = statuses[i];
  text.style.display = 'inline-block';
  text.classList.add('text');

  var d = document.createElement('span');
  d.classList.add('key');
  d.appendChild(box);
  d.appendChild(text);

  return d;
}

var legend = colors.map(makeKey).reduce(function(frag, el) {
  frag.appendChild(el);
  return frag;
}, document.createDocumentFragment());

document.querySelector('[data-legend]').appendChild(legend);


function showNoData(el) {
  var nodata = document.createElement('h3');
  nodata.innerText = 'Not enough data';
  nodata.classList.add('no-data');

  _.toArray(el.querySelectorAll('.chart')).forEach(function (e) {
    el.removeChild(e);
  });
  el.appendChild(nodata);
}

_.each(data, function(_data, i) {
  var series = aggregate(_data);

  /*
  var charts = _.map(series, function() {
    var div = document.createElement('div');
    div.classList.add('chart');
    var svg = document.createElement('svg');
    svg.style.height = '150px';
    svg.style.width = '200px';
    div.appendChild(svg);
    //barGraphs[0].querySelector('.col-md-8').appendChild(div);
    return svg;
  });
  */

  var bar = barGraphs[i];
  var entries = series.Danbury.length;

  if (i === 0 && entries < 1) return showNoData(bar);
  if (i === 1 && entries < 2) return showNoData(bar);
  if (i === 2 && entries < 7) return showNoData(bar);
  if (i === 3 && entries < 8) return showNoData(bar);

  _.keys(series).forEach(function(k, j) {
    var s = series[k];

    nv.addGraph(function() {
      var chart = nv.models.pieChart()
        .x(_.property('label'))
        .y(_.property('value'))
        .color(colors)
        .tooltipContent(_.identity)
        .showLegend(false)
        .labelThreshold(0.05)
        .labelType('percent');

      var el = bar.querySelectorAll('.chart')[j];

      var text = document.createElement('div');
      text.innerText = k;
      text.style.textAlign = 'center';
      el.appendChild(text);

      d3.select(el.querySelector('svg'))
        .datum(s)
        .transition().duration(350)
        .call(chart);

      nv.utils.windowResize(chart.update);

      return chart;
    });
  });
});
