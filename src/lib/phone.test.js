import test from 'node:test'
import assert from 'node:assert/strict'
import { parsePhoneValue, formatPhoneWithCountryCode } from './phone.js'

test('parses local numbers into a country-code-prefixed value', () => {
  assert.deepEqual(parsePhoneValue('9876543210', '+91'), {
    countryCode: '+91',
    phoneNumber: '9876543210',
  })
})

test('preserves existing international numbers and keeps the country code', () => {
  assert.deepEqual(parsePhoneValue('+44 20 1234 5678', '+91'), {
    countryCode: '+44',
    phoneNumber: '20 1234 5678',
  })
})

test('formats values for storage and display with a country code', () => {
  assert.equal(formatPhoneWithCountryCode('9876543210', '+91'), '+91 9876543210')
  assert.equal(formatPhoneWithCountryCode('+44 20 1234 5678', '+44'), '+44 20 1234 5678')
})
