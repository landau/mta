// lib/index
'use strict';


// graphcs
// stream graph for current day
// aggregate over time
// - 1 day should return status of every 30 min
// - 1 hour should every 1 min


// Backend
// Convert a polling service for storing data on mongo on Dig Ocean
// Dig ocean app must read in data from mongo
// and respond with it


var express = require('express');
var http = require('http');
var path = require('path');
var createDomain = require('domain').createDomain;
var mta = require('./mta');
var async = require('async');
var _ = require('lodash');

var app = express();

app.use(function(req, res, next) {
  var d = createDomain();
  d.add(req);
  d.add(res);

  d.on('error', function(req, res, err) {
    // log error
    res.statusCode = 500;
    res.end(500);
  }.bind(d, req, res));

  d.run(next);
});

app.set('env', process.env.NODE_ENV);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(express.compress());
app.use(express.favicon());
//app.use(express.bodyParser());
app.use(express.json());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, '..', '/public')));
app.use(app.router);
app.use(express.errorHandler());


app.get('/', function(req, res, next) {
  var now = new Date();

  var calls = _.transform(['Day', 'Week', 'Last30', 'LastYear'], function(acc, val) {
    acc[val.toLowerCase()] = function cb(done) {
      mta.db['get' + val](now, done);
    };
  }, {});

  async.parallel(calls, function (err, results) {
    if (err) next(err);

    res.render('index', {
      isProd: process.env.NODE_ENV === 'production',
      data: results
    });
  });
});


app.get('/_now', function(req, res, next) {
  mta.getData(function(err, lines) {
    if (err) {
      res.statusCode = 500;
      return res.send(err.message);
    }
    res.json(lines);
  });
});

app.get('/today.json', function(req, res, next) {
  mta.db.getDay(new Date(), function(err, results) {
    if (err) {
      res.statusCode = 500;
      return res.send(err.message);
    }

    res.json(results);
  });
});

app.get('/week.json', function(req, res, next) {
  mta.db.getWeek(new Date(), function(err, results) {
    if (err) {
      res.statusCode = 500;
      return res.send(err.message);
    }

    res.json(results);
  });
});

app.get('/month.json', function(req, res, next) {
  mta.db.getLast30(new Date(), function(err, results) {
    if (err) {
      res.statusCode = 500;
      return res.send(err.message);
    }

    res.json(results);
  });
});

app.get('/year.json', function(req, res, next) {
  mta.db.getLastYear(new Date(), function(err, results) {
    if (err) {
      res.statusCode = 500;
      return res.send(err.message);
    }

    res.json(results);
  });
});

app.use(function(err, req, res, /* jshint unused: false */next) {
  res.send(500);
});

var server = http.createServer(app);
module.exports = {
  app: app,
  sever: server,
  start: function (port) {
    mta.init(function() {
      server.listen(port || 1337, function() {
        console.log('Server started on ' + (port || 1337));
      });
    });
  }
};
