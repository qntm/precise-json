// Given a number, return a Decimal instance which EXACTLY represents it

const Decimal = require('decimal.js')

const decodeFloat = require('./decode-float')

Decimal.set({
  precision: 10000
})

module.exports = number => {
  if (typeof number !== 'number') {
    throw Error('Cannot get a Decimal for a non-number')
  }

  if (!Number.isFinite(number)) {
    throw Error('Cannot get a Decimal for a non-finite number')
  }

  const { sign, exponent, mantissa } = decodeFloat(number)

  // Special cases for `exponent` 0 (subnormals)

  const one = new Decimal(-1).toPower(sign)
  const power = new Decimal(2).toPower((exponent === 0 ? 1 : exponent) - 1023)
  const fraction = new Decimal(mantissa).dividedBy(Math.pow(2, 52)).plus(exponent === 0 ? 0 : 1)

  return one.times(power).times(fraction)
}
