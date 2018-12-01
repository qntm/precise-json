/* eslint-env jest */
/* global BigInt */

const isObject = require('./is-object')

describe('is-object', () => {
  it('accepts objects', () => {
    expect(isObject({})).toBe(true)
  })

  describe('rejects all kinds of frauds', () => {
    const candidateGetters = [
      () => (function () { return arguments })(),
      () => BigInt(42),
      () => Object(BigInt(42)),
      () => false,

      // eslint-disable-next-line no-new-wrappers
      () => new Boolean(false),

      () => new Date(),
      () => 42,

      // eslint-disable-next-line no-new-wrappers
      () => new Number(42),

      () => /forty-two/,
      () => new RegExp('forty-two'),
      () => new Float32Array([42]),
      () => new Float64Array([42]),
      () => new Int8Array([42]),
      () => new Int16Array([42]),
      () => new Int32Array([42]),
      () => new Uint8Array([42]),
      () => new Uint8ClampedArray([42]),
      () => new Uint16Array([42]),
      () => new Uint32Array([42]),
      () => 'forty-two',

      // eslint-disable-next-line no-new-wrappers
      () => new String('forty-two'),

      () => Symbol('forty-two'),
      () => new Set([1]),
      () => new Map([[1, 2]]),
      () => new WeakSet([{ a: 1 }]),
      () => new WeakMap([[{ a: 1 }, 2]]),

      () => new Error()
    ]

    candidateGetters.forEach((candidateGetter, i) => {
      const candidate = candidateGetter()

      let candidateName
      try {
        candidateName = String(candidate)
      } catch (e) {
        candidateName = 'candidate #' + String(i)
      }

      it(`rejects ${candidateName}`, () => {
        expect(isObject(candidate)).toBe(false)
      })

      const candidate2 = candidateGetter()

      // eslint-disable-next-line no-proto
      candidate2.__proto__ = Object.prototype

      it(`rejects ${candidateName} after assigning to candidate.__proto__`, () => {
        expect(isObject(candidate2)).toBe(false)
      })

      const candidate3 = candidateGetter()
      Object.setPrototypeOf(candidate3, Object.prototype)
      it(`rejects ${candidateName} after using Object.setPrototypeOf`, () => {
        expect(isObject(candidate3)).toBe(false)
      })
    })
  })
})
