const stringify = require('./stringify')
const parse = require('./parse')

describe('stringify', () => {
  it('works normally', () => {
    expect(stringify({a: [null, 7, true, 'b']})).toBe('{"a":[null,7,true,"b"]}')
  })

  it('MDN basics', () => {
    expect(stringify({})).toBe('{}')
    expect(stringify(true)).toBe('true')
    expect(stringify('foo')).toBe('"foo"')
    expect(stringify([1, 'false', false])).toBe('[1,"false",false]')
    expect(stringify([null])).toBe('[null]')
    expect(stringify({x: 5})).toBe('{"x":5}')
    expect(stringify({x: 5, y: 6})).toBe('{"x":5,"y":6}')
  })

  it('handles numbers correctly', () => {
    expect(stringify(-0)).toBe('-0')
    expect(stringify(0.1)).toBe('0.1000000000000000055511151231257827021181583404541015625')
    expect(stringify({a: 90071992547409904})).toBe('{"a":90071992547409904}')
  })

  it('dislikes string properties of arrays', () => {
    const a = ['foo', 'bar']
    a.baz = 'quux'
    expect(() => stringify(a)).toThrow()
  })

  it('ignores toJSON', () => {
    const a = {
      toJSON: () => 'aaa'
    }
    expect(() => stringify(a)).toThrow() // function property cannot be stringified

    const b = Object.create(a)
    expect(() => stringify(b)).toThrow() // object whose prototype is not Object cannot be stringified
  })

  it('throws on non-enumerable properties', () => {
    expect(() => stringify(Object.create(Object.prototype, {
      x: {
        value: 'x',
        enumerable: false
      }
    }))).toThrowError('Can\'t stringify an object with read-only property x')
  })

  describe('fails on various things', () => {
    const values = [
      Object.create(null, {}), // wrong prototype (can't be stringified either)
      function () {},
      () => {},
      [,,,,4],
      new Number(3),
      new String('false'),
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
      {[Symbol('foo')]: 'foo'},
      {[Symbol.for('foo')]: 'foo'},
      new Set([1]),
      new Map([[1, 2]]),
      new WeakSet([{a: 1}]),
      new WeakMap([[{a: 1}, 2]]),
      new Int8Array([1]),
      new Int16Array([1]),
      new Int32Array([1]),
      new Uint8Array([1]),
      new Uint8ClampedArray([1]),
      new Uint16Array([1]),
      new Uint32Array([1]),
      new Float32Array([1]),
      new Float64Array([1])
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
