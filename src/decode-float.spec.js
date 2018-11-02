/* eslint-env jest */

const decodeFloat = require('./decode-float')

describe('decode-float', () => {
  it('throws on a non-number', () => {
    expect(() => decodeFloat('asdf'))
      .toThrowError('Cannot get the sign, exponent and mantissa of a non-number')
  })

  it('throws on NaN', () => {
    expect(() => decodeFloat(NaN))
      .toThrowError('Will not attempt to get the sign, exponent and mantissa of NaN')
  })

  it('extracts 1 correctly', () => {
    expect(decodeFloat(1)).toEqual({ sign: 0, exponent: 0b01111111111, mantissa: 0b0000000000000000000000000000000000000000000000000000 })
  })

  it('handles decimals near 1 correctly', () => {
    expect(decodeFloat(1.0000000000000002)).toEqual({ sign: 0, exponent: 0b01111111111, mantissa: 0b0000000000000000000000000000000000000000000000000001 })
    expect(decodeFloat(1.0000000000000004)).toEqual({ sign: 0, exponent: 0b01111111111, mantissa: 0b0000000000000000000000000000000000000000000000000010 })
  })

  it('handles 2', () => {
    expect(decodeFloat(2)).toEqual({ sign: 0, exponent: 0b10000000000, mantissa: 0b0000000000000000000000000000000000000000000000000000 })
    expect(decodeFloat(-2)).toEqual({ sign: 1, exponent: 0b10000000000, mantissa: 0b0000000000000000000000000000000000000000000000000000 })
  })

  it('handles 1/3', () => {
    expect(decodeFloat(1 / 3)).toEqual({ sign: 0, exponent: 0b01111111101, mantissa: 0b0101010101010101010101010101010101010101010101010101 })
  })

  it('handles pi', () => {
    expect(decodeFloat(Math.PI)).toEqual({ sign: 0, exponent: 0b10000000000, mantissa: 0b1001001000011111101101010100010001000010110100011000 })
  })

  it('handles everything else', () => {
    expect(decodeFloat(3)).toEqual({ sign: 0, exponent: 0b10000000000, mantissa: 0b1000000000000000000000000000000000000000000000000000 })
    expect(decodeFloat(4)).toEqual({ sign: 0, exponent: 0b10000000001, mantissa: 0b0000000000000000000000000000000000000000000000000000 })
    expect(decodeFloat(5)).toEqual({ sign: 0, exponent: 0b10000000001, mantissa: 0b0100000000000000000000000000000000000000000000000000 })
    expect(decodeFloat(6)).toEqual({ sign: 0, exponent: 0b10000000001, mantissa: 0b1000000000000000000000000000000000000000000000000000 })
    expect(decodeFloat(23)).toEqual({ sign: 0, exponent: 0b10000000011, mantissa: 0b0111000000000000000000000000000000000000000000000000 })
    expect(decodeFloat(Number.MIN_VALUE)).toEqual({ sign: 0, exponent: 0b00000000000, mantissa: 0b0000000000000000000000000000000000000000000000000001 })
    expect(decodeFloat(2.2250738585072009e-308)).toEqual({ sign: 0, exponent: 0b00000000000, mantissa: 0b1111111111111111111111111111111111111111111111111111 })
    expect(decodeFloat(2.2250738585072014e-308)).toEqual({ sign: 0, exponent: 0b00000000001, mantissa: 0b0000000000000000000000000000000000000000000000000000 })
    expect(decodeFloat(Number.MAX_VALUE)).toEqual({ sign: 0, exponent: 0b11111111110, mantissa: 0b1111111111111111111111111111111111111111111111111111 })
    expect(decodeFloat(0)).toEqual({ sign: 0, exponent: 0b00000000000, mantissa: 0b0000000000000000000000000000000000000000000000000000 })
    expect(decodeFloat(-0)).toEqual({ sign: 1, exponent: 0b00000000000, mantissa: 0b0000000000000000000000000000000000000000000000000000 })
    expect(decodeFloat(Infinity)).toEqual({ sign: 0, exponent: 0b11111111111, mantissa: 0b0000000000000000000000000000000000000000000000000000 })
    expect(decodeFloat(-Infinity)).toEqual({ sign: 1, exponent: 0b11111111111, mantissa: 0b0000000000000000000000000000000000000000000000000000 })
    // Do not test NaN
  })
})
