const strictParseFloat = require('./strict-parse-float')

const { MonoParser, resolve, seq, fixed, or, unicode, wseq } = require('green-parse')

// This object parses JSON strings.
module.exports = MonoParser(resolve({
  topValue: matchers => seq([matchers.WHITESPACE, matchers.value, matchers.WHITESPACE])
    .map(([space1, object, space2]) => object),

  object: matchers => or([
    matchers.fullobject,
    matchers.emptyobject
  ]),

  emptyobject: matchers => wseq([
    fixed('{'),
    fixed('}')
  ], matchers.WHITESPACE)
    .map(() => ({})),

  fullobject: matchers => wseq([
    fixed('{'),
    matchers.keyvalue.wplus(seq([matchers.WHITESPACE, fixed(','), matchers.WHITESPACE])),
    fixed('}')
  ], matchers.WHITESPACE)
    .map(([open, keyvalues, close]) => {
      const obj = {}
      keyvalues.forEach(({ key, value }) => {
        if (key in obj) {
          throw Error(`Duplicate key ${key}`)
        }
        obj[key] = value
      })
      return obj
    }),

  keyvalue: matchers => wseq([matchers.string, fixed(':'), matchers.value], matchers.WHITESPACE)
    .map(([key, colon, value]) => ({ key, value })),

  array: matchers => or([
    matchers.fullarray,
    matchers.emptyarray
  ]),

  emptyarray: matchers => wseq([
    fixed('['),
    fixed(']')
  ], matchers.WHITESPACE)
    .map(() => []),

  fullarray: matchers => wseq([
    fixed('['),
    matchers.value.wplus(seq([matchers.WHITESPACE, fixed(','), matchers.WHITESPACE])),
    fixed(']')
  ], matchers.WHITESPACE)
    .map(([open, array, closed]) => array),

  value: matchers => or([
    matchers.object,
    matchers.array,
    matchers.string,
    matchers.number,
    fixed('true').map(() => true),
    fixed('false').map(() => false),
    fixed('null').map(() => null)
  ]),

  string: matchers => seq([
    fixed('"'),
    matchers.char.star().map(chars => chars.join('')),
    fixed('"')
  ])
    .map(([open, string, close]) => string),

  'char': matchers => or([
    unicode.filter(match =>
      match !== '"' &&
      match !== '\\' &&
      match.charCodeAt(0) > 0x1F // U+007F DEL is not considered a control character!
    ),
    fixed('\\"').map(() => '"'),
    fixed('\\\\').map(() => '\\'),
    fixed('\\/').map(() => '/'),
    fixed('\\b').map(() => '\x08'),
    fixed('\\f').map(() => '\f'),
    fixed('\\n').map(() => '\n'),
    fixed('\\r').map(() => '\r'),
    fixed('\\t').map(() => '\t'),
    seq([
      fixed('\\u'),
      or('0123456789abcdefABCDEF'.split('').map(fixed)),
      or('0123456789abcdefABCDEF'.split('').map(fixed)),
      or('0123456789abcdefABCDEF'.split('').map(fixed)),
      or('0123456789abcdefABCDEF'.split('').map(fixed))
    ])
      .map(([u, digit1, digit2, digit3, digit4]) =>
        String.fromCharCode(Number.parseInt(digit1 + digit2 + digit3 + digit4, 0x10))
      )
  ]),

  WHITESPACE: matchers => or([fixed(' '), fixed('\n'), fixed('\r'), fixed('\t')]).star(),

  number: matchers => seq([
    fixed('-').maybe(),
    or([
      fixed('0'),
      seq([
        or('123456789'.split('').map(fixed)),
        or('0123456789'.split('').map(fixed)).star().map(digits => digits.join(''))
      ]).map(([nonzerodigit, digits]) => nonzerodigit + digits)
    ]),
    seq([
      fixed('.'),
      or('0123456789'.split('').map(fixed)).plus().map(digits => digits.join(''))
    ]).map(([dot, digits]) => dot + digits).maybe(),
    seq([
      or([fixed('e'), fixed('E')]),
      or([fixed('-'), fixed('+'), fixed('')]),
      or('0123456789'.split('').map(fixed)).plus().map(digits => digits.join(''))
    ]).map(([exponent, sign, digits]) => exponent + sign + digits).maybe()
  ])
    .map(([sign, integer, decimal, exponent]) => sign + integer + decimal + exponent)
    .map(numberLiteral => {
      try {
        return strictParseFloat(numberLiteral)
      } catch (e) {
        return null
      }
    })
    .filter(number => number !== null)
}).topValue)
