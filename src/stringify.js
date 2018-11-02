// Stringify a thingum

const getExactDecimal = require('./get-exact-decimal')

const validatePropertyDescriptor = (propertyName, propertyDescriptor) => {
  // A property descriptor is either a data descriptor or an accessor descriptor.
  // Every property descriptor has the following two properties:
  if (propertyDescriptor.configurable !== true) {
    throw Error(`Can't stringify a value with non-configurable property ${stringify(propertyName)}`)
  }

  if (propertyDescriptor.enumerable !== true) {
    throw Error(`Can't stringify a value with non-enumerable property ${stringify(propertyName)}`)
  }

  // An accessor descriptor also has these two properties:
  if ('get' in propertyDescriptor || 'set' in propertyDescriptor) {
    throw Error(`Can't stringify a value with accessor property ${stringify(propertyName)}`)
  }

  // A data descriptor instead also has a `value` and this:
  if (propertyDescriptor.writable !== true) {
    throw Error(`Can't stringify a value with read-only property ${stringify(propertyName)}`)
  }

  // Otherwise OK
}

const stringify = value => {
  const type = typeof value
  if (type === 'undefined') {
    throw Error('Can\'t stringify `undefined`')
  }

  if (type === 'boolean') {
    // Booleans can't have extra properties added as far as I know...
    return JSON.stringify(value)
  }

  if (type === 'number') {
    // Numbers can't have extra properties added as far as I know...
    // A `Decimal` instance with value -0 doesn't preserve the leading unary minus
    // sign on `toFixed` for some reason
    return Object.is(-0, value) ? '-0' : getExactDecimal(value).toFixed()
  }

  if (type === 'string') {
    // Strings can't have extra properties added as far as I know...
    return JSON.stringify(value)
  }

  if (type === 'symbol') {
    throw Error('Can\'t stringify a Symbol')
  }

  if (type === 'function') {
    throw Error('Can\'t stringify a Function')
  }

  /* istanbul ignore else */
  if (type === 'object') {
    if (value === null) {
      return JSON.stringify(value)
    }

    if (!Object.isExtensible(value)) {
      throw Error(`Can't stringify a non-extensible object`)
    }

    const ownPropertySymbols = Object.getOwnPropertySymbols(value)
    if (ownPropertySymbols.length > 0) {
      throw Error(`Can't stringify a value with symbol property ${String(ownPropertySymbols[0])}`)
    }

    if (Array.isArray(value)) {
      const expected = {}
      Object.getOwnPropertyNames(value).forEach(ownPropertyName => {
        expected[ownPropertyName] = true
      })

      const stringifiedElements = []
      for (let ownPropertyName = 0; ownPropertyName < value.length; ownPropertyName++) {
        const ownPropertyDescriptor = Object.getOwnPropertyDescriptor(value, ownPropertyName)
        if (ownPropertyDescriptor === undefined) {
          throw Error(`Can't stringify array with missing entry: ${stringify(ownPropertyName)}`)
        }

        validatePropertyDescriptor(ownPropertyName, ownPropertyDescriptor)

        stringifiedElements.push(stringify(ownPropertyDescriptor.value))
        delete expected[ownPropertyName]
      }

      delete expected.length

      // That should be all of them
      if (Object.keys(expected).length > 0) {
        const ownPropertyName = Object.keys(expected)[0]
        throw Error(`Can't stringify array with extra property: ${stringify(ownPropertyName)}`)
      }

      return '[' + stringifiedElements.join(',') + ']'
    }

    const proto = Object.getPrototypeOf(value)

    if (proto === Object.prototype) {
      const ownPropertyNames = Object.getOwnPropertyNames(value)

      const stringifiedProperties = []
      for (let i = 0; i < ownPropertyNames.length; i++) {
        const ownPropertyName = ownPropertyNames[i]
        const ownPropertyDescriptor = Object.getOwnPropertyDescriptor(value, ownPropertyName)

        validatePropertyDescriptor(ownPropertyName, ownPropertyDescriptor)

        stringifiedProperties.push(stringify(ownPropertyName) + ':' + stringify(ownPropertyDescriptor.value))
      }

      return '{' + stringifiedProperties.join(',') + '}'
    }

    throw Error(`Can't stringify object with prototype ${proto}`)
  }

  /* istanbul ignore next */
  throw Error(`This should be impossible: Unrecognised type: ${type}`)
}

module.exports = stringify
