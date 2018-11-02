/* eslint-env jest */

const main = require('./main')

describe('main', () => {
  it('works', () => {
    expect(main.parse(main.stringify({ a: 0.1 }))).toEqual({ a: 0.1 })
  })
})
