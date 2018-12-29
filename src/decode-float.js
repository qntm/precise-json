// Get the sign, exponent and mantissa of a number

module.exports = number => {
  if (typeof number !== 'number') {
    throw Error('Cannot get the sign, exponent and mantissa of a non-number')
  }
  if (Number.isNaN(number)) {
    throw Error('Will not attempt to get the sign, exponent and mantissa of NaN')
  }

  const float64Array = new Float64Array([number])
  const uint8Array = new Uint8Array(float64Array.buffer)

  const sign =
    ((uint8Array[7] & 0b10000000) >> 7)

  const exponent =
    ((uint8Array[7] & 0b01111111) << 4) +
    ((uint8Array[6] & 0b11110000) >> 4)

  // Can't use bit shifts here because JS bitwise operations are 32-bit
  const mantissa =
    ((uint8Array[6] & 0b00001111) * Math.pow(1 << 8, 6)) +
    ((uint8Array[5] & 0b11111111) * Math.pow(1 << 8, 5)) +
    ((uint8Array[4] & 0b11111111) * Math.pow(1 << 8, 4)) +
    ((uint8Array[3] & 0b11111111) * Math.pow(1 << 8, 3)) +
    ((uint8Array[2] & 0b11111111) * Math.pow(1 << 8, 2)) +
    ((uint8Array[1] & 0b11111111) * Math.pow(1 << 8, 1)) +
    ((uint8Array[0] & 0b11111111) * Math.pow(1 << 8, 0))

  return { sign, exponent, mantissa }
}
