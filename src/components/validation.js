export const alphaNumSpaceRegex = '^[a-zA-Z0-9 ]+$'

export const alphaNumDashRegex = '^[a-zA-Z0-9\\-]+$'

export const productRegex = '^[a-zA-Z0-9 +-]+$'

export const alphaNumRegex = '^[a-zA-Z0-9]+$'

export const numRegex = '^[0-9]+$'

export const cardNumberRegex = '^\\d{16}$|^3[47]\\d{13}$'

export const numDashRegex = '^[0-9\\-]+$'

export const emailRegex = '^([a-zA-Z0-9_\\-\\.]+)@([a-zA-Z0-9_\\-\\.]+)\\.([a-zA-Z]{2,5})$'

export const onInput = e => e.target.setCustomValidity('')

export const product = e => (e.target.validity.patternMismatch ? e.target.setCustomValidity('Invalid product') : e.target.setCustomValidity(''))

export const alphaNum = e => (e.target.validity.patternMismatch ? e.target.setCustomValidity('Alphanumeric characters only.') : e.target.setCustomValidity(''))

export const num = e => (e.target.validity.patternMismatch ? e.target.setCustomValidity('Numeric characters only.') : e.target.setCustomValidity(''))

export const zip = e => (e.target.validity.patternMismatch ? e.target.setCustomValidity('Invalid postal code.') : e.target.setCustomValidity(''))

export const phone = e => (e.target.validity.patternMismatch ? e.target.setCustomValidity('Invalid phone number.') : e.target.setCustomValidity(''))

export const email = e => (e.target.validity.patternMismatch ? e.target.setCustomValidity('Invalid email address.') : e.target.setCustomValidity(''))

export const cardNumber = e => (e.target.validity.patternMismatch ? e.target.setCustomValidity('Invalid card number.') : e.target.setCustomValidity(''))

export const securityCode = e => (e.target.validity.patternMismatch ? e.target.setCustomValidity('Invalid security code.') : e.target.setCustomValidity(''))

/* eslint-disable */
export const proxyPatternNonGlobal =
  /(?<host>(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])|(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])):(?<port>\d{1,5})(?<auth>:(?<username>.*):(?<password>.*)|)/
export const proxyPattern =
  /(?<host>(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])|(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])):(?<port>\d{1,5})(?<auth>:(?<username>.*):(?<password>.*)|)/g
/* eslint-enable */

/* eslint-disable */
export const accountPattern = /(?<email>([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})):(?<password>.*)/g
/* eslint-enable */

export const proxyFormat = (params) => {
  if (typeof(params) === 'undefined') return 'No Proxy'

  console.log('params', params)
  const { host, port, username, password } = params
  if (typeof(host) !== 'string' || typeof(port) === 'undefined') return 'No Proxy'

  else return [host, port, username, password].join(':')
} 

export const proxyComparer =
  ({ host: host1, port: port1, username: username1, password: password1 }) =>
  ({ host: host2, port: port2, username: username2, password: password2 }) =>
    `http://${username1}:${password1}@${host1.toLowerCase().trim()}:${port1.toLowerCase().trim()}` === `http://${username2}:${password2}@${host2.toLowerCase().trim()}:${port2.toLowerCase().trim()}`

export const accountComparer =
  ({ email: username1 }) =>
  ({ email: username2 }) =>
    username1.toLowerCase().trim() === username2.toLowerCase().trim()
