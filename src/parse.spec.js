/* eslint-env jest */

const fs = require('fs')
const path = require('path')

const parse = require('./parse')

describe('parse', () => {
  it('throws on a non-string', () => {
    expect(() => parse(89)).toThrowError('Can\'t parse non-string 89')
  })

  it('works...?', () => {
    expect(parse('1')).toBe(1)
    expect(() => parse('0.1')).toThrowError()
    expect(parse('-0.1000000000000000055511151231257827021181583404541015625')).toBe(-0.1000000000000000055511151231257827021181583404541015625)
    expect(parse('-0')).toBe(-0)
  })

  it('fails on unrepresentable numeric literals', () => {
    const strings = [
      '[123.456e-789]',
      '[0.4e00669999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999969999999006]',
      '-1e+9999',
      '1.5e+9999',
      '123123e100000',
      '-123123e100000'
    ]

    strings.forEach(string => {
      expect(() => parse(string)).toThrowError()
    })
  })

  it('fails on duplicate keys', () => {
    expect(() => parse('{"a":0,"a":1}')).toThrowError('Duplicate key a')

    // These removed from the corpus because parsing should fail
    expect(() => parse('{"a":1,"a":2}')).toThrowError('Duplicate key a')
    expect(() => parse('{"a":"b","a":"c"}')).toThrowError('Duplicate key a')
    expect(() => parse('{"a":1,"a":1}')).toThrowError('Duplicate key a')
    expect(() => parse('{"a":"b","a":"b"}')).toThrowError('Duplicate key a')
    expect(() => parse('{"a":0, "a":-0}')).toThrowError('Duplicate key a')
  })

  it('fails on poo', () => {
    expect(() => parse('{ "💩": 0, "\uD83D\uDCA9": 1 }')).toThrowError('Duplicate key 💩')
  })

  describe('file data tests', () => {
    const referenceImplementation = JSON.parse
    const newImplementation = parse

    const files = fs.readdirSync(path.join(__dirname, '..', 'data')).map(file => path.join('data', file))
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8')

      let referenceThrew = false
      let referenceParsedValue
      try {
        referenceParsedValue = referenceImplementation(content)
      } catch (e) {
        referenceThrew = true
      }

      it((referenceThrew ? 'fails to parse' : 'parses') + ' ' + file, () => {
        if (referenceThrew) {
          expect(() => newImplementation(content)).toThrow()
        } else {
          expect(newImplementation(content)).toEqual(referenceParsedValue)
        }
      })
    })
  })
})
