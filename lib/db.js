'use strict';
var mongojs = require('mongojs');
var dbName = process.env.MONGO_DB || 'development';
var db = exports.db = mongojs(dbName);
exports.coll = db.collection('mta');
