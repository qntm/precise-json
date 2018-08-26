const Decimal = require('decimal.js')

const getExactDecimal = require('./get-exact-decimal')

Decimal.set({
  precision: 10000
})

module.exports = string => {
  if (typeof string !== 'string') {
    throw Error('Cannot parse a non-string')
  }

  const decimal = new Decimal(string) // This will be precise
  const number = decimal.toNumber() // This may have lost some precision and could even be infinite. How can we tell?

  if (!Number.isFinite(number)) {
    // `number` cannot be NaN but in any case this condition would catch this
    throw Error(`Number ${string} is too large to be precisely represented as a JavaScript number`)
  }

  const decimal2 = getExactDecimal(number)
  if (!decimal2.equals(decimal)) {
    throw Error(`Number ${string} cannot be precisely represented as a JavaScript number; the closest we can get is ${decimal2.toFixed()}`)
  }

  return number
}
