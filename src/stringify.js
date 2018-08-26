// Stringify a thingum

const getExactDecimal = require('./get-exact-decimal')

const stringify = value => {
  const type = typeof value
  if (type === 'undefined') {
    throw Error('Cannot stringify `undefined`')
  }

  if (type === 'boolean') {
    // Booleans can't have extra properties added as far as I know...
    return JSON.stringify(value)
  }

  if (type === 'number') {
    // Numbers can't have extra properties added as far as I know...
    return Object.is(-0, value) ? '-0' : getExactDecimal(value).toFixed()
  }

  if (type === 'string') {
    // Strings can't have extra properties added as far as I know...
    return JSON.stringify(value)
  }

  if (type === 'symbol') {
    throw Error('Cannot stringify a Symbol')
  }

  if (type === 'function') {
    throw Error('Cannot stringify a Function')
  }

  if (type === 'object') {
    if (value === null) {
      return JSON.stringify(value)
    }

    const proto = Object.getPrototypeOf(value)
    if (proto === Array.prototype) {
      const keys = {}
      Object.keys(value).forEach(key => {
        keys[key] = true
      })

      let stringifiedElements = []
      for (let i = 0; i < value.length; i++) {
        stringifiedElements.push(stringify(value[i]))
        if (i in keys) {
          delete keys[i]
        } else {
          throw Error('This should be impossible')
        }
      }

      // That should be all of them
      if (Object.keys(keys).length > 0) {
        throw Error(`Array has an extra key: ${Object.keys(keys)[0]}`)
      }

      return '[' + stringifiedElements.join(',') + ']'
    }

    if (proto === Object.prototype) {
      const ownPropertySymbols = Object.getOwnPropertySymbols(value)
      if (ownPropertySymbols.length > 0) {
        throw Error(`Can't stringify an object with symbol property ${String(ownPropertySymbols[0])}`)
      }

      return '{' + Object.getOwnPropertyNames(value).map(ownPropertyName => {
        const ownPropertyDescriptor = Object.getOwnPropertyDescriptor(value, ownPropertyName)
        if (ownPropertyDescriptor.writable !== true) {
          throw Error(`Can't stringify an object with read-only property ${ownPropertyName}`)
        }
        if (ownPropertyDescriptor.get !== undefined) {
          throw Error(`Can't stringify an object with getter property ${ownPropertyName}`)
        }
        if (ownPropertyDescriptor.set !== undefined) {
          throw Error(`Can't stringify an object with setter property ${ownPropertyName}`)
        }
        if (ownPropertyDescriptor.configurable !== true) {
          throw Error(`Can't stringify an object with non-configurable property ${ownPropertyName}`)
        }
        if (ownPropertyDescriptor.enumerable !== true) {
          throw Error(`Can't stringify an object with non-enumerable property ${ownPropertyName}`)
        }

        return stringify(ownPropertyName) + ':' + stringify(ownPropertyDescriptor.value)
      }).join(',') + '}'
    }

    throw Error(`Can't stringify object with prototype ${proto}`)
  }

  throw Error(`This should be impossible: Unrecognised type: ${type}`)
}

module.exports = stringify
