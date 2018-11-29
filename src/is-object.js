// Okay so one of the stated objectives of `precise-json` is that
// `preciseJson.parse(preciseJson.stringify(x))` should be programmatically
// indistinguishable from `x` for all `x` where this round trip does
// not throw an exception.

// As part of this, we throw an exception if `x` is an object but does not
// have prototype `Object.prototype` or `Array.prototype`.

// But here's the interesting part: JavaScript objects' prototypes can be
// mutated, by assigning directly to `x.__proto__` or by using
// `Object.setPrototypeOf`. For example, we can take `x = []` and then
// do `Object.setPrototypeOf(x, Object.prototype)`. The resulting `x`
// does have prototype `Object.prototype`. However, *`x` is still detectably
// an array*. It has to be, because some parts of the JavaScript
// specification say that it still has to be *be* detectably an array despite
// the mutated prototype. For example, `Object.prototype.toString.call(x)`
// will still return "[object Array]", and `Array.isArray(x)` will still
// return `true`.

// So, just because `x` has prototype `Object.prototype` doesn't mean it's
// actually a "true", "plain" object. It could be an array with a mutated
// prototype.

// There are several other special kinds of JavaScript objects which can be
// distinguished in this way. Each special kind of object has a unique "tell"
// which we can test for. This includes arguments objects, Maps, RegExps, ...

// This method takes a value with prototype `Object.prototype` and tests that
// it is genuinely a "plain" object and not some other kind of object whose
// prototype has been mutated.

// Note: if there's a kind of object where it's impossible to programmatically
// make this distinction, then by definition we don't care!

const isArguments = require('is-arguments')
const isBigint = require('is-bigint')
const isBoolean = require('is-boolean-object')
const isDateObject = require('is-date-object')
const isNumberObject = require('is-number-object')
const isRegex = require('is-regex')
const isTypedArray = require('is-typed-array')
const isString = require('is-string')
const isSymbol = require('is-symbol')

const isMap = o => {
  try {
    Map.prototype.has.call(o, {})
  } catch (e) {
    return false
  }
  return true
}

const isWeakMap = o => {
  try {
    WeakMap.prototype.has.call(o, {})
  } catch (e) {
    return false
  }
  return true
}

const isSet = o => {
  try {
    Set.prototype.has.call(o, {})
  } catch (e) {
    return false
  }
  return true
}

const isWeakSet = o => {
  try {
    WeakSet.prototype.has.call(o, {})
  } catch (e) {
    return false
  }
  return true
}

const isTagged = o => Object.prototype.toString.call(o) !== '[object Object]'

module.exports = x =>
  !isArguments(x) &&
  !isBigint(x) &&
  !isBoolean(x) &&
  !isDateObject(x) &&
  !isMap(x) &&
  !isNumberObject(x) &&
  !isRegex(x) &&
  !isSet(x) &&
  !isString(x) &&
  !isSymbol(x) &&
  !isTypedArray(x) &&
  !isWeakMap(x) &&
  !isWeakSet(x) &&
  !isTagged(x)
