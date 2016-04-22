'use strict';

var _ = require('protojs')
    , assert = require('assert')
    , check = require('../lib/check')
    , Match = check.Match;

describe('check module', function() {
    function Test(){}
    var notDefined
        , nullVar = null
        , obj = {prop: 'test'}
        , arr = [1, 2, 3]
        , func = function(){}
        , myDate = new Date()
        , testInst = new Test();


    var toTest = [
        [func, Function, 'function'],
        [myDate, Date, 'constructor'],
        ['test', String, 'string'],
        [8.5, Number, 'number'],
        [NaN, Number, 'NaN number'],
        [Infinity, Number, 'Infinity number'],
        [obj, Object, 'object'],
        [false, Boolean, 'boolean'],
        [4, Match.Integer, 'Match.Integer'],
        ['validIdentifier345', Match.IdentifierString, 'Match.IdentifierString'],
        [notDefined, undefined, 'undefined'],
        [nullVar, null, 'null'],
        [arr, Array, 'Array']
    ];
    var failValues = [
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        String,
        undefined,
        undefined
    ];

    it('should match.test for different data types', function() {
        toTest.forEach(function(val, i) {
            assert(Match.test(val[0], val[1]), 'match.test ' + val[2]);
            assert.notEqual(Match.test(val[0], failValues[i]), 'match.test fails ' + val[2]);
        });

        assert.notEqual(Match.test(obj, testInst), 'fail match with non plain object');
        assert.notEqual(Match.test(obj, Match.Integer), 'fail match with Match.Integer');
        assert.notEqual(Match.test(obj, Match.IdentifierString), 'fail match with identifier');
        assert.throws(
            function () { check(null, Object); }, 
            'check null does not match Object'
        );
        assert.throws(
            function () { check(123, 123); }, 
            'check bad pattern throws'
        );
        assert.throws(
            function () { check({1:1, 2:2, length: 2}, Array); }, 
            'check pseudo array fails'
        );
    });

    it('should check test for different data types', function() {
        toTest.forEach(function(val, i) {
            assert.doesNotThrow(function() {
                check(val[0], val[1]);
            }, 'check ' + val[2]);
            assert.throws(function() {
                check(failValues[i], val[1]);
            }, 'check ' + val[2]);
        });
    });

    it('should match.test and check using Match.Any pattern', function() {
        toTest.forEach(function(val) {
            assert(Match.test(val[0], Match.Any), 
                'match.test ' + val[2] + ' with Match.Any');
            assert.doesNotThrow(
                function() {check(val[0], Match.Any)}, 
                'check ' + val[2] + ' with Match.Any'
            );
        });
    });

    it('should match.test and check using Match.Optional pattern', function () {
        toTest.forEach(function (val) {
            assert(Match.test(val[0], Match.Optional(val[1])), 
                'match.test ' + val[2] + ' with Match.Optional');
            assert(Match.test(notDefined, Match.Optional(val[1])), 
                'match.test ' + val[2] + ' with Match.Optional');

            assert.doesNotThrow(
                function () { check(val[0], Match.Optional(val[1])); }, 
                'check ' + val[2] + ' with Match.Optional'
            );
            assert.doesNotThrow(
                function () { check(notDefined, Match.Optional(val[1])); },
                'check an undefined against a string'
            );
        });
        assert.notEqual(Match.test(34, Match.Optional(String)),
                'match.test number with Match.Optional string');
        assert.doesNotThrow(
            function () { check(func, Match.Optional(Function)); }, 
            'check function with with Match.Optional'
        );
        assert.throws(
            function () { check(34, Match.Optional(String)); },
            'check a number against a string'
        );
    });

    it('should match.test and check using Array [pattern]', function() {
        assert(Match.test(['test1', 'test2', 'test3'], [String]), 
            'match.test array of strings with Array [pattern]');
        assert.doesNotThrow(
            function () { check(['test1', 'test2', 'test3'], [String]); }, 
            'check array of strings with Array [pattern]'
        );
        assert.notEqual(Match.test(['test1', 'test2', 34], [String]),
            'match.test array of strings with Array [pattern] fails');
        assert.throws(
            function () { check(['test1', 'test2', 34], [String]); }, 
            'check array of strings with Array [pattern] throws'
        );
        assert.throws(
            function () { check(['test1', 'test2', 34], []); }, 
            'check array with bad array pattern throws'
        );
        assert.throws(
            function () { Match.test([1, 2, 3], []); }, 
            'match.test array with bad array pattern throws'
        );
        assert.notEqual(
            Match.test({}, [String]), 
            'match.test array with bad array pattern throws'
        );
    });

    it('should match.test and check using Object {key: pattern}', function () {
        assert(Match.test({key1: 'test', key2: 6}, {key1: String, key2: Match.Integer}), 
            'match.test array of strings with Object {key: pattern}');
        assert.doesNotThrow(
            function () { check({key1: 'test', key2: 6}, {key1: String, key2: Match.Integer}); }, 
            'check array of strings with Object {key: pattern}'
        );
        assert.notEqual(Match.test({key1: 'test'}, {key1: String, key2: Match.Integer}),
            'match.test array of strings with Object {key: pattern} fails');
        assert.throws(
            function () { check({key1: 'test'}, {key1: String, key2: Match.Integer}); }, 
            'check array of strings with Object {key: pattern} throws'
        );
        assert(Match.test({key1: 'test', key2: 'test'}, {key1: String, key2: Match.Optional(String)}), 
            'match.test array of strings with one being optional');
        assert(Match.test({key1: 'test'}, {key1: String, key2: Match.Optional(String)}), 
            'match.test array of strings with one being optional and that value missing');
    });

    it('should match.test and check using Match.ObjectIncluding', function() {
        assert(
            Match.test({key1: 'test', key2: 6, key3:null, key4: ['hello']}, Match.ObjectIncluding({key1: String, key2: Match.Integer})), 
            'match.test array of strings with ObjectIncluding'
        );
        assert.doesNotThrow(
            function () {
                check({key1: 'test', key2: 6, key3:null, key4: ['hello']}, Match.ObjectIncluding({key1: String, key2: Match.Integer}));
            }, 
            'check array of strings with ObjectIncluding'
        );
        assert.notEqual(
            Match.test({key1: 'test', key3:null, key4: ['hello']}, Match.ObjectIncluding({key1: String, key2: Match.Integer})), 
            'match.test array of strings with ObjectIncluding fails'
        );
        assert.throws(
            function () {
                check({key1: 'test', key3:null, key4: ['hello']}, Match.ObjectIncluding({key1: String, key2: Match.Integer}));
            }, 
            'check array of strings with ObjectIncluding throws'
        );
    });

    it('should match.test and check using Match.OneOf', function() {
        assert(Match.test('test', Match.OneOf(null, Number, String)),
            'match.test string against number of types');
        assert.notEqual(Match.test([], Match.OneOf(null, Number, String)),
            'match.test array against number of types fails');
        assert.doesNotThrow(
            function() { check('test', Match.OneOf(null, Number, String)) },
            'check string against number of types');
        assert.throws(
            function() { check([], Match.OneOf(null, Number, String)) },
            'check array against number of types fails');
        assert.throws(
            function() { check([], Match.OneOf()) },
            'OneOf needs something passed');
    });

    it('should match.test and check using Match.Where', function() {
        var NonEmptyString = Match.Where(function (x) {
            check(x, String);
            return x.length > 0;
        });
        assert(Match.test('test', NonEmptyString),
            'match.test string against Match.Where');
        assert.notEqual(Match.test('', NonEmptyString),
            'match.test array against Match.Where fails');
        assert.doesNotThrow(
            function() { check('test', NonEmptyString) },
            'check string against Match.Where');
        assert.throws(
            function() { check('', NonEmptyString) },
            'check array against Match.Where throws');
    });

    it('should match.test and check with Match.ObjectHash pattern', function() {
        var objPass = { prop1: function() {}, prop2: function() {} };
        var objFail = { prop1: function() {}, prop2: 'test' };

        assert(Match.test(objPass, Match.ObjectHash(Function)),
            'match.test object against Match.ObjectHash');
        assert.notEqual(Match.test(objFail, Match.ObjectHash(Function)),
            'match.test object against Match.ObjectHash fails');
        assert.doesNotThrow(function() {
            check(objPass, Match.ObjectHash(Function));
        }, 'should NOT throw if all properties of object are Functions');
        assert.throws(function() {
            check(objFail, Match.ObjectHash(Function));
        }, 'should fail if one property is a string');
        assert.throws(function() {
            check({}, Match.ObjectHash(Function));
        }, 'should fail as empty object');
    });

    it('should match.test and check using Match.Subclass', function() {
        var Parent = function(name) { this.name = name; };
        var Child = _.createSubclass(Parent, 'Child', true);
        
        assert(Match.test(Child, Match.Subclass(Parent)),
            'match.test instance with Match.Subclass including superclass');
        assert.notEqual(Match.test(Child, Match.Subclass(Array)),
            'match.test instance with Match.Subclass including superclass fails');
        assert.doesNotThrow(function() { 
            check(Child, Match.Subclass(Parent)) 
        }, 'check instance with Match.Subclass including superclass');
        assert.doesNotThrow(function() { 
            check(Child, Match.Subclass(Child, true)) 
        }, 'check instance with Match.Subclass and match class itself');
        assert.throws(function() { 
            check(Child, Match.Subclass(Array)) 
        }, 'check instance with Match.Subclass including superclass throws');
    });

    it('should be able to be disabled', function () {
        check.disabled = true;
        assert.doesNotThrow(function() {
            check(1, String);
        }, 'check is disabled');
    });
});
