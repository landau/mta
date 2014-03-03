'use strict';

chai = require 'chai'
should = chai.should();
request = require 'superagent'
nock = require 'nock'
async = require 'async'

_ = require 'lodash'

mta = require '../lib/mta/mta'
store = require('../lib/mta/store').store
state = require('../lib/mta/store')._state
genId = require('../lib/util').genId
mtaDb = require '../lib/mta/db'
util =  require '../lib/util'

fs = require 'fs'
path = require 'path'
xml = fs.readFileSync path.join(__dirname, 'fixtures/one.xml'), 'utf8'
json = require './fixtures/one.json'

db = require('../lib/db').coll;

describe 'MTA', ->
  before (done)->
    nock('http://web.mta.info')
      .get('/status/serviceStatus.txt')
      .reply(200, xml)
    db.remove {}, done


  after (done)->
    nock.restore();
    db.remove {}, done

  describe 'mta', ->
    before ->
      mta._cache.reset()

    after (done)->
      mta._cache.reset()
      db.remove {}, done

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
    id = genId()

    before (done)->
      mta._cache.reset()
      db.remove {}, done

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

  describe 'db', ->
    beforeEach (done)->
      db.remove {}, done

    describe '#findById', ->
      id = genId();

      beforeEach (done)->
        db.insert { _id: id}, done

      it 'should get a result by id', (done)->
        mtaDb.findById id, (err, results)->
          should.not.exist err
          results.length.should.equal 1
          done()


    describe '#findByRange', ->
      id = genId();

      id2 = new Date();
      id2.setDate id2.getDate() - 1
      id2 = util.formatId id2

      id3 = new Date();
      id3.setDate id3.getDate() - 2
      id3 = util.formatId id3

      ids = [id, id2, id3].map (v)-> return _id: v


      before (done)->
        db.remove {}, done

      it 'should get a result by range', (done)->
        db.insert ids, ->
          mtaDb.findByRange (new Date(id3)), (new Date(id)), (err, results)->
            should.not.exist err
            results.length.should.equal 3
            done()
