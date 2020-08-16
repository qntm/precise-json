const {
  seq,
  or,
  UNICODE,
  resolve,
  map,
  star,
  filter
} = require('green-parse')

const strictParseFloat = require('./strict-parse-float')

const json = resolve(ref => ({
  topvalue: map(
    seq([ref('ws'), ref('value'), ref('ws')]),
    ([space1, value, space2]) => value
  ),

  value: or([
    ref('object'),
    ref('array'),
    ref('string'),
    ref('number'),
    ref('true'),
    ref('false'),
    ref('null')
  ]),

  object: map(
    seq(['{', ref('ws'), ref('keyvalues'), '}']),
    ([open, space1, keyvalues, close]) => {
      const obj = {}
      keyvalues.forEach(([key, value]) => {
        if (key in obj) {
          throw Error(`Duplicate key ${key}`)
        }
        obj[key] = value
      })
      return obj
    }
  ),

  keyvalues: star(
    ref('keyvalue'),
    seq([',', ref('ws')])
  ),

  keyvalue: map(
    seq([ref('string'), ref('ws'), ':', ref('ws'), ref('value'), ref('ws')]),
    ([key, space1, colon, space2, value, space3]) => [key, value]
  ),

  array: map(
    seq(['[', ref('ws'), ref('arrayvalues'), ']']),
    ([open, space1, values, close]) => values
  ),

  arrayvalues: star(
    ref('arrayvalue'),
    seq([',', ref('ws')])
  ),

  arrayvalue: map(
    seq([ref('value'), ref('ws')]),
    ([value, space]) => value
  ),

  string: map(
    seq(['"', star(ref('char')), '"']),
    ([open, chars, close]) => chars.join('')
  ),

  char: or([
    filter(UNICODE, match =>
      match !== '"' &&
      match !== '\\' &&
      match.charCodeAt(0) > 0x1F // U+007F DEL is not considered a control character!
    ),
    map('\\"', () => '"'),
    map('\\\\', () => '\\'),
    map('\\/', () => '/'),
    map('\\b', () => '\x08'),
    map('\\f', () => '\f'),
    map('\\n', () => '\n'),
    map('\\r', () => '\r'),
    map('\\t', () => '\t'),
    map(
      /^\\u([0-9a-fA-F]{4})/,
      result => String.fromCharCode(Number.parseInt(result[1], 0x10))
    )
  ]),

  number: filter(
    map(
      /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][-+]?[0-9]+)?/,
      ([numberLiteral]) => {
        try {
          return strictParseFloat(numberLiteral)
        } catch (e) {
          return null
        }
      }
    ),
    number => number !== null
  ),

  true: map('true', () => true),

  false: map('false', () => false),

  null: map('null', () => null),

  ws: /^[ \n\r\t]*/
}))

module.exports = str => {
  if (typeof str !== 'string') {
    throw Error(`Can't parse non-string ${str}`)
  }

  return json.topvalue.parse1(str)
}
