'use strict';

const ffi = require('ffi-napi')
const ref = require('ref-napi')
const path = require('path')

function request({method, url, headers, body, proxy, lic}, callback) {
	try {
		const req = ffi.Library(path.join(__dirname , process.platform === 'darwin' ? 'qqR.dylib' : 'qqR.dll').replace('app.asar', 'app.asar.unpacked'), {
			InitRequest: ['char *', ['char *']],
			FreeString: ['void', ['void *']],
		})

		headers || (headers = {})
		if (typeof headers == 'object') headers = JSON.stringify(headers)

		body || (body = '')
		if (typeof body == 'object') body = JSON.stringify(body)

		proxy || (proxy = '')

		const parsedURL = new URL(url),
			parsedParams = {params: []}

		parsedURL.searchParams.forEach((value, key) => {
			parsedParams.params.push(`${key}=${value}`)
		})

		const _req = JSON.stringify({
			method: method.toUpperCase(),
			host: parsedURL.host,
			path: parsedURL.pathname,
			queryParams: JSON.stringify(parsedParams),
			headers: headers,
			body: body,
			proxy: proxy,
			lic
		})

		req.InitRequest.async(ref.allocCString(_req), (err, result) => {
			if (err) return callback(err);

			const response = JSON.parse(result.readCString())
			req.FreeString.async(result, (_err, _res) => (result = null))

			if (response.err) {
				return callback(response.err)
			} else {
				Object.keys(response.headers).forEach(key => {
					if (key != 'Set-Cookie') {
						response.headers[key.toLowerCase()] = response.headers[key][0]
						delete response.headers[key]
					} else {
						response.headers[key.toLowerCase()] = response.headers[key]
						delete response.headers[key]
					}
                })
				return callback(null, response)
			}
		})
	} catch (err) {
		return callback(err)
	}
}

module.exports = request