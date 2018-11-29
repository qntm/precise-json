/* eslint-env jest */

const stringify = require('./stringify')

describe('stringify', () => {
  it('works normally', () => {
    expect(stringify({ a: [null, 7, true, 'b'] })).toBe('{"a":[null,7,true,"b"]}')
  })

  it('MDN basics', () => {
    expect(stringify({})).toBe('{}')
    expect(stringify(true)).toBe('true')
    expect(stringify('foo')).toBe('"foo"')
    expect(stringify([1, 'false', false])).toBe('[1,"false",false]')
    expect(stringify([null])).toBe('[null]')
    expect(stringify({ x: 5 })).toBe('{"x":5}')
    expect(stringify({ x: 5, y: 6 })).toBe('{"x":5,"y":6}')
  })

  it('handles numbers correctly', () => {
    expect(stringify(-0)).toBe('-0')
    expect(stringify(0.1)).toBe('0.1000000000000000055511151231257827021181583404541015625')
    expect(stringify({ a: 90071992547409904 })).toBe('{"a":90071992547409904}')
  })

  it('dislikes string properties of arrays', () => {
    const a = ['foo', 'bar']
    a.baz = 'quux'
    expect(() => stringify(a)).toThrowError('Can\'t stringify array with extra property: "baz"')
  })

  it('throws on a sparse array', () => {
    // eslint-disable-next-line no-sparse-arrays
    expect(() => stringify([,,, 'asdf']))
      .toThrowError('Can\'t stringify array with missing entry: 0')

    // eslint-disable-next-line no-sparse-arrays
    expect(() => stringify([9, 10,, 11]))
      .toThrowError('Can\'t stringify array with missing entry: 2')
  })

  it('throws on an "imitation" array', () => {
    // Using `__proto__` is strongly deprecated but whatever
    const imitationArray = { __proto__: Array.prototype, length: 1, 0: 'a' }

    // This is how we previously tested for arrayness
    expect(Object.getPrototypeOf(imitationArray)).toBe(Array.prototype)

    // This is how we should always have performed this test
    expect(Array.isArray(imitationArray)).toBe(false)

    expect(() => stringify(imitationArray))
      .toThrowError('Can\'t stringify a non-array with prototype Array.prototype')
  })

  it('throws on non-extensible objects', () => {
    const closed = Object.preventExtensions({})
    expect(() => stringify(closed))
      .toThrowError('Can\'t stringify a non-extensible object')
  })

  it('ignores toJSON', () => {
    const a = {
      toJSON: () => 'aaa'
    }
    expect(() => stringify(a)).toThrowError('Can\'t stringify a Function') // function property cannot be stringified

    const b = Object.create(a)
    expect(() => stringify(b)).toThrow() // object whose prototype is not Object cannot be stringified
  })

  it('throws on non-enumerable properties', () => {
    expect(() => stringify(Object.create(Object.prototype, {
      x: {
        value: 'x',
        writable: true,
        configurable: true,
        enumerable: false
      }
    }))).toThrowError('Can\'t stringify a value with non-enumerable property "x"')
  })

  it('throws on read-only properties', () => {
    expect(() => stringify(Object.create(Object.prototype, {
      x: {
        value: 'x',
        writable: false,
        configurable: true,
        enumerable: true
      }
    }))).toThrowError('Can\'t stringify a value with read-only property "x"')
  })

  it('throws on accessor properties', () => {
    expect(() => stringify(Object.create(Object.prototype, {
      x: {
        configurable: true,
        enumerable: true,
        get: function () {
          return this.stored_x
        },
        set: function (x) {
          this.stored_x = x
        }
      }
    }))).toThrowError('Can\'t stringify a value with accessor property "x"')
  })

  it('throws if an array has a symbol property', () => {
    const arr = [5, 6, 7]
    arr[Symbol('boogida-WHAAAT')] = 8
    expect(() => stringify(arr))
      .toThrowError('Can\'t stringify a value with symbol property Symbol(boogida-WHAAAT)')
  })

  it('throws if an array has a non-configurable property', () => {
    const arr = [5, 6, 7]
    Object.defineProperty(arr, 1, {
      value: 6,
      writable: true,
      configurable: false,
      enumerable: true
    })

    expect(() => stringify(arr))
      .toThrowError('Can\'t stringify a value with non-configurable property 1')
  })

  it('throws on arguments objects, even "imitation" ones', () => {
    const x = (function () { return arguments }())
    expect(() => stringify(x))
      .toThrowError('Can\'t stringify a value with symbol property Symbol(Symbol.iterator)')
    expect(() => stringify(Object.setPrototypeOf(x, Object.prototype)))
      .toThrowError('Can\'t stringify a value with symbol property Symbol(Symbol.iterator)')
  })

  describe('fails on "imitation" POJSOs', () => {
    const cases = {
      // eslint-disable-next-line no-new-wrappers
      'boxed Boolean': new Boolean(),

      // eslint-disable-next-line no-new-wrappers
      'boxed number': new Number(),

      // eslint-disable-next-line no-new-wrappers
      'boxed string': new String(),

      'date object': new Date(),
      'regular expression': /a/,
      Int8Array: new Int8Array([]),
      Int16Array: new Int16Array([]),
      Int32Array: new Int32Array([]),
      Uint8Array: new Uint8Array([]),
      Uint8ClampedArray: new Uint8ClampedArray([]),
      Uint16Array: new Uint16Array([]),
      Uint32Array: new Uint32Array([]),
      Float32Array: new Float32Array([]),
      Float64Array: new Float64Array([]),
      set: new Set([1]),
      map: new Map([[1, 2]]),
      'weak set': new WeakSet([{ a: 1 }]),
      'weak map': new WeakMap([[{ a: 1 }, 2]])
    }

    Object.entries(cases).forEach(([key, value]) => {
      it(key, () => {
        expect(() => stringify(Object.setPrototypeOf(value, Object.prototype)))
          .toThrowError('Can\'t stringify a non-Plain Old JavaScript Object with prototype Object.prototype')
      })
    })

    it('fails on "imitation" POJSO array', () => {
      expect(() => stringify(Object.setPrototypeOf([], Object.prototype)))
        .toThrowError('Can\'t stringify a non-Plain Old JavaScript Object with prototype Object.prototype')
    })

    it('fails on "imitation" POJSO error', () => {
      expect(() => stringify(Object.setPrototypeOf(Error(), Object.prototype)))
        .toThrowError('Can\'t stringify a non-Plain Old JavaScript Object with prototype Object.prototype')
    })
  })

  describe('fails on various things', () => {
    const values = [
      Object.create(null, {}), // wrong prototype (can't be stringified either)
      Object.setPrototypeOf([], null),
      new (class extends Array {})(),
      function () {},
      () => {},

      // eslint-disable-next-line no-sparse-arrays
      [,,,, 4],

      // eslint-disable-next-line no-new-wrappers
      new Number(3),

      // eslint-disable-next-line no-new-wrappers
      new String('false'),

      // eslint-disable-next-line no-new-wrappers
      new Boolean(false),

      new Date(2006, 0, 2, 15, 4, 5),
      global,
      module,
      exports,
      require,
      undefined,
      Object,
      Array,
      Infinity,
      -Infinity,
      NaN,
      Symbol(''),
      Symbol('aa'),
      Symbol.for('foo'),
      { [Symbol('foo')]: 'foo' },
      { [Symbol.for('foo')]: 'foo' },
      new Set([1]),
      new Map([[1, 2]]),
      new WeakSet([{ a: 1 }]),
      new WeakMap([[{ a: 1 }, 2]]),
      new Int8Array([1]),
      new Int16Array([1]),
      new Int32Array([1]),
      new Uint8Array([1]),
      new Uint8ClampedArray([1]),
      new Uint16Array([1]),
      new Uint32Array([1]),
      new Float32Array([1]),
      new Float64Array([1]),
      Object(Symbol('aaa'))
    ]

    values.forEach((value, i) => {
      let testName
      try {
        testName = String(value)
      } catch (e) {
        testName = 'bad value #' + i
      }

      it('fails on ' + testName, () => {
        expect(() => stringify(value)).toThrow()
      })
    })
  })
})
