/**
 * Client Login Process:
 *
 * Stage 1
 * 1. Electron checks if bind is present in local store. If so, go to Stage 2.
 * 2. Electron opens the login window with text input and submit button. This is an unbound key situation.
 * 3. User types license key and presses submit. Key is sent back to Electron main process (Emp).
 * 4. Emp calls login module from /dist/ folder in main thread with the license key as parameter.
 * 5. Login module generates a public/private key pair (the password for the private key is their license key) for the user.
 * 6. Login module posts license key & pub key to /v1/key/bind. Exception go to E1.
 * 7. Server returns http 200 & CapsuleAIO public key. Key is now bound to client.
 * 8. CapsuleAIO public key & license key are put in store.
 *
 * Stage 2
 * 1. Bind (CapsuleAIO Public Key) & License Key (lickey) is read from store.
 * 2. Iat is generated. (iat is unix timestamp in seconds).
 * 3. KeyObject is formed { lic, iat }
 * 4. Use crypto to create a sha256 signature of KeyObject (sig) using their private key.
 * 5. Use CapsuleAIO public key to encrypt licKey (encLicKey).
 * 6. AuthObject is formed { auth: encLicKey, sig }
 * 7. AuthObject is querystringified and used to post to websocket, ex:
 *  wss://s.capsuleaio.com/v2/?auth=bFMuMTL2UveqqvIStiUTY%2BCqETKKbf88SKPrz04eh5M6CoYhZiJ3Hru1zW1FT7hTsVk7%2B8eSaSUFLaiFy55qq7kHhTKBerQ963q16AQ9F2ClDjHwvPdOPmT67%2FIqh4zX8247dUyxaLLeQgCegK7%2FNxbuHqzXOph5OPSB3iTZYt4kgCuQr4xfvJ4DFXEpsEZr8X6PoyJfZ8z7RwDydEmx2PyaDR04DNYKlXpPy1eLPKaK2OX7lSBpSFr0DB3NeQKHwTo0pAVFPjxplCaRf8GZtzPXwSHCM20o5NPMbmT9sIh%2FG4xkVoSo0qt%2FyoiC787NbUDfZGQQLZrMYVBK35nQUZ%2ByAL9HsMz9rApc3FMtlc1tuohO5eVVWcKj9Ovb25njVjxurxcwABuid1MIS6G0BShj0AJ1xQYTlISVuUpwgPww7yiJKsYBEbxj5Bxbn8%2FEzh40qqwDKozJuY5F08F6CORmdNluCyaDWpZKHVtu%2BDNO%2BVIWtzFtFC1ep0XEEf2VgGFOPHGB4iwNQmO0uI%2Fog7liK%2B1rBKhS31qKdTcDoV1EM1qkOfR%2BZ%2FpVjJSEBkpxl3mq2fzdw5GBF7Z%2BZEWIty3G0ph8n9tnIIgebVV%2BsVCv3rMSMsYKklwbz9FMmbK%2BPGd7UWORDn%2B6OQQCCa8MWKkeKDp1GCNQzGu2bHpMCXM%3D&sig=FnhAAs8pbGXT3iCWLDRR6ce%2F4XDpPzvToWaLYM0bKoNSCfSU46vDqOprv8OwjllNmUTe9d6adt%2B9dTqL1UjqRW0fvCxH2ufViMUQuD3f23WcNhoZnVb02w4hbtWcOdGYHGqFcw1rxbYFcudvMqSNPTHZFQHGcASAOla5DKavKiHIvWbghJ0VQ5LZhLYXRMWvgK4Bi4uwoCHYxBfg7p8UYWY1bPpHCi4PAOpz9jhw3su9S0K0flw5ktpGmqk00PR3W66Zv%2BXMuB0dDpsPumVW5OHNEDCUiEa%2FmYLyeKm%2BbZw8pSh3aB303u0hQPyWanXGR7abe4lQP%2FriJ3K9OBt7BmW0Awxc7ggfwB6Lj9%2Bsb5i9eeK6yN5qIQcwFTXbYYDmTGuB4ru1%2BtHjC957Q1Yzgl5gFgR%2Fj%2BTevKhBbBvURuQlzvCxOFt2x2VEp7g5aPohAfbTKJ%2BH%2F4rL71Z6crzLDPyXL36O2uKOIhPpmtqpXE1Ewk6qNyzUoQy3RKdMFSQyhyLoUqHl5RvxakzNZP6wOg1q113CByqjWHkYmifB9a5oXeH7tuaR9msMTSsYEhL4iN4K1c6Q6BtAIaQ8RE3CAj1BjxrzKx4xJofg3owjcCroNV5%2B2rL2RojZGZFfQfVfi8MY7qXq52Pw6oUm8HgsycFlTjoOzH95zVt7sn%2FGSMA%3D
 *  Exception go to E2.
 * 8. Websocket is returned to main thread by login module.
 * 9. Websocket can now be accessed by electron windows.
 *
 *
 * Exceptions:
 * E1: The key is currently bound to another client.
 * E2: The key is currently bound to another ip, iat was not recent, or key/bind was invalid.
 *  1. Login module throws an exception.
 *  2. Bind is cleared from store.
 *  3. Emp returns exception message back to login window.
 *  4. Login window displays exception to user.
 *  5. User can reset key from dash and try again.
 *
 */

const crypto = require('crypto')
const qs = require('qs')
const axios = require('axios')

/**
 * 
 * @param {string} lic The user's license key
 * @returns The CapsuleAIO bind key in base64
 */
const auth_v1 = async lic => {
  /**
   * Generate public/private key pair
   */
  const { key, secret } = await genKey(lic)

  /**
   * Create Bind Object
   */
  const data = qs.stringify({
    lic,
    key,
  })

  /**
   * Create request data
   */
  const config = {
    method: 'post',
    url: 'https://api.capsuleaio.com/v1/key/bind',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data,
  }

  /**
   * Post to CapsuleAIO bind api
   */
  try {
    const response = await axios(config)
    const result = response.data

    // console.log('result: ', result)
    // console.log('CapsuleAIO public key: ', Buffer.from(result, 'base64').toString('ascii'))

    /**
     * Return the CapsuleAIO public key
     */
    return {
        capsuleKey: Buffer.from(result, 'base64').toString('ascii'),
        key,
        secret
    }

  } catch (err) {
    /**
     * TODO: Error Handling
     */
    console.log(err)
  }
}

/**
 * 
 * @param {string} key CapsuleAIO bind key
 * @param {string} licenseKey User's license key
 */
const auth_v2 = (key, secret, licenseKey) => {
  const iat = getIat()

  const keyObject = { lic: licenseKey, iat }

  // sign key object
  const signedLicenseKey = crypto
    .createSign('sha256')
    .update(JSON.stringify(keyObject))
    .sign({ key: secret, passphrase: licenseKey }, 'base64')

  // create data
  const data = JSON.stringify(keyObject)

  // encrypt data
  const encryptedLicenseKey = crypto.publicEncrypt({ key, oaepHash: 'sha256' }, Buffer.from(data))

  // make auth object
  const authObject = {
    auth: encryptedLicenseKey.toString('base64'),
    sig: signedLicenseKey,
  }

  const auth = qs.stringify(authObject)

  return `wss://s.capsuleaio.com/v2/?${auth}`
}

const genKey = passphrase =>
  new Promise(res =>
    crypto.generateKeyPair(
      'rsa',
      {
        modulusLength: 4096,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem',
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem',
          cipher: 'aes-256-cbc',
          passphrase,
        },
      },
      (err, key, secret) => {
        // Handle errors and use the generated key pair.

        // TODO: Error Handling

        // console.log('My Public key:', key)
        // console.log('My Private key:', secret)
        // console.log('My base64 Public Key:', Buffer.from(key).toString('base64'))
        // console.log('My base64 Private Key:', Buffer.from(secret).toString('base64'))

        return res({
          key: Buffer.from(key).toString('base64'),
          secret: Buffer.from(secret).toString('base64'),
        })
      },
    ),
  )

const getIat = () => Math.round(new Date().getTime() / 1000)

module.exports = {
  auth_v1,
  auth_v2
}