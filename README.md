# precise-json

If we construct a JavaScript object like so:

```js
const obj = {a: 0.1}
```

then the actual numeric value of the `obj.a`, as seen and understood by the JavaScript programming language, is precisely

> 0.1000000000000000055511151231257827021181583404541015625

However, when we `JSON.stringify` this object:

```js
JSON.stringify(obj) // '{"a":0.1}'
```

we notice that, despite the fact that every JSON specification allows numbers to have arbitrary precision, quite a lot of information has been lost. A very similar problem affects large numbers:

```js
JSON.stringify({a: 90071992547409904}) // '{"a":90071992547409900}'
```

The purpose of `precise-json` is to prevent not only numerical information but any information of any kind from being lost, both at JSON stringification time and at JSON parsing time.

```js
import preciseJson from 'precise-json'

preciseJson.stringify({a: 0.1})
// '{"a":0.1000000000000000055511151231257827021181583404541015625}'
```

## preciseJson.stringify(value)

Works like `JSON.stringify(value)` (*q.v.*) but throws an exception if you attempt to stringify any of the following:

* `undefined`
* `Infinity`, `-Infinity` or `NaN`
* a symbol
* a function
* a sparse array (e.g. `[,,,4]`)
* an array with non-numeric keys (e.g. `const arr = []; arr.foo = 'bar'`)
* an object with
  * a symbol property
  * a read-only property
  * a getter or setter property
  * a non-configurable property
  * a non-enumerable property
* any object whose prototype is not `Array.prototype` or `Object.prototype`, such as
  * a `Date`
  * a boxed `String`, `Number` or `Boolean`
  * a `Map`, `Set`, `WeakMap` or `WeakSet`
  * any typed array

The idea is that any information which cannot be preserved in the JSON format and then theoretically read back by a JSON parser at the far end is not suitable for stringification. Contrast with `JSON.stringify`, which silently replaces unstringifiable values with `null`s and does other puzzling, ambiguating things.

Additionally,

* stringified numbers are output with the *complete* decimal expansion, regardless of how large or small they are, instead of being rounded/truncated
* the number `-0` is output complete with its leading minus sign.

This means that if the JSON parser at the far end is capable of losslessly parsing arbitrarily large integers and arbitrarily precise decimals and negative zero, it has the opportunity to do so. Remember, that parser need not be `JSON.parse`! It could, for example, be:

## preciseJson.parse(string)

This is much less likely to be useful to you, unless the JSON string which you are parsing was originally constructed by `preciseJson.stringify`.

As with `preciseJson.stringify`, the idea is to prevent information from being lost. `preciseJson.parse` works exactly like `JSON.parse` except that it throws an exception if it attempts to parse any of the following:

* a number which cannot be precisely represented as a JavaScript number
* an object with duplicate keys

This means that e.g. `preciseJson.parse('{"a":0.1}')` will fail. However, `preciseJson.parse('{"a":0.1000000000000000055511151231257827021181583404541015625}')` will work just fine, returning an object `{a: 0.1}`. Additionally, the ambiguity of '{"a":0,"a":1}' is now helpfully and permanently resolved in the way it should always have been: with an error.
