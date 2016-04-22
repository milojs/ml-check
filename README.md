# ml-check
An isomorphic, runtime, type checking utility that can be used on the server or in the client.
It is used in the reactive framework [milojs](https://github.com/milojs/milo)

[![Build Status](https://travis-ci.org/milojs/ml-check.svg?branch=master)](https://travis-ci.org/milojs/ml-check)
[![npm version](https://badge.fury.io/js/ml-check.svg)](https://badge.fury.io/js/ml-check)
[![Test Coverage](https://codeclimate.com/github/milojs/ml-check/badges/coverage.svg)](https://codeclimate.com/github/milojs/ml-check/coverage)


Check is a module for parameters checking extracted from [Meteor](http://docs.meteor.com/) framework.

It allows to both document and to check parameter types in your function making code both readable and stable.


### Usage
```
var check = milo.check
    , Match = check.Match;

function My(name, obj, cb) {
    // if any of checks fail an error will be thrown
    check(name, String);
    check(obj, Match.ObjectIncluding({ options: Object }));
    check(cb, Function);

    // ... your code
}
```
See [Meteor docs](http://docs.meteor.com/#match) to see how it works


### Patterns

All patterns and functions described in Meteor docs work.

Unlike in Meteor, Object pattern matches instance of any class, not only plain object.

In addition to patterns described in Meteor docs the following patterns are implemented

Match.__ObjectHash__(_pattern_)

Matches an object where all properties match a given pattern

Match.__Subclass__(_constructor_ [, _matchThisClassToo_])

Matches a class that is a subclass of a given class. If the second parameter is true, it will also match the class itself.

Without this pattern to check if _MySubclass_ is a subclass of _MyClass_ you would have to use

```
check(MySubclass, Match.Where(function() {
   return MySubclass.prototype instanceof MyClass;
});
```


Things we explicitly do NOT support:
- heterogenous arrays
