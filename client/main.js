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

      var el = barGraphs[i].querySelectorAll('.chart')[j];

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
