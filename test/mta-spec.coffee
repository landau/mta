'use strict';

chai = require 'chai'
should = chai.should();
request = require 'superagent'
nock = require 'nock'
moment = require 'moment'

_ = require 'lodash'

mta = require '../lib/mta/mta'
store = require('../lib/mta/store').store
state = require('../lib/mta/store')._state

fs = require 'fs'
path = require 'path'
xml = fs.readFileSync path.join(__dirname, 'fixtures/one.xml'), 'utf8'
json = require './fixtures/one.json'

process.env.NODE_ENV = 'test';
process.env.MONGO_DB = 'test';
db = require('../lib/db').coll;

describe 'MTA', ->
  before ->
    nock('http://web.mta.info')
      .get('/status/serviceStatus.txt')
      .reply(200, xml)

  after ->
    nock.restore();
    db.remove();

  describe 'mta', ->
    before ->
      mta._cache.reset()

    after ->
      db.remove();
      mta._cache.reset()

    it 'should respond with data', (done)->
      mta.getData (err, data) ->
        should.not.exist err
        data.should.be.instanceof Array
        _.first(data).status.should.equal 'GOOD SERVICE'
        done()

    it 'should get data from cache', (done)->
      mta._cache.set('data', 'foo')

      mta.getData (err, data) ->
        should.not.exist err
        data.should.equal 'foo'
        done()

  describe 'store', ->
    id = moment().format 'M/D/YYYY'

    before (done)->
      mta._cache.reset()
      db.remove(done);

    it 'should insert an initial value', (done)->
      store id, (err)->
        should.not.exist err
        db.find { _id: id }, (err, results)->
          should.not.exist err

          result = _.first results
          should.exist result
          result._id.should.equal id
          result.items.length.should.equal 1

          done()

    it 'should not update if id is the same', (done)->
      store id, (err)->
        should.not.exist err
        db.find { _id: id }, (err, results)->
          results.length.should.equal 1
          result = _.first results
          should.exist result
          result._id.should.equal id
          result.items.length.should.equal 1
          done(err)

    it 'should create a new entry for a new id', (done)->
      _id = 'foo'
      store _id, (err)->
        should.not.exist err
        db.find {}, (err, results)->

          should.not.exist err
          results.length.should.equal 2
          done(err)
