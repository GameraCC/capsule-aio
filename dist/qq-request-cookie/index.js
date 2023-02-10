module.exports = qqRequest => {

    /**
     * Wraps qqRequest to add logging based on a queue, which logs on a time and size interval
     *
     * @function request
     *
     * @param {Object} args - Arguments to send a request
     * @param {string} args.url - Url to request
     * @param {"GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "CONNECT" | "OPTIONS" | "TRACE" | "HEAD"} args.method - HTTP request method to be used
     * @param {Object} args.headers - HTTP headers to be used
     * @param {?string | Object} args.body - HTTP body to be sent
     * @param {?string} args.proxy - Proxy to be used
     * @param {string} args.lic - License to be used
     * @param {?string} args.id - Id of task to be logged
     * @param {Boolean} args.log - Flag to determine whether or not request and response should be logged
     * @param {?Object} args.cookieJar - CookieJar to get header, and set cookies to, recommended not to specify if manually setting cookie header, or manually adding cookies from response
     */
    const request = ({ url, method, headers, body, proxy, lic, log, id, cookieJar }, callback) => {

        // Append cookie header to cookieJar
        if (cookieJar) {
            const cookieHeader = cookieJar.getHeader(url)
            headers = {
                ...(cookieHeader && {'cookie': cookieHeader}),
                ...headers
            }
        }


        qqRequest({url, method, headers, body, proxy, lic, log, id}, (err, res) => {
            // Add cookies to cookieJar
            if (cookieJar && res && res.headers && res.headers.hasOwnProperty('set-cookie')) cookieJar.addCookies(res.headers['set-cookie'], url)
            return callback(err, res)
        })
    }

    return request
}