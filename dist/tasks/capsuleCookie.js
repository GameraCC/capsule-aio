const psl = require('psl')

/**
 * @typedef {Object} Cookie
 * 
 * @property {string} name - Name of the cookie
 * @property {string} value - Value of the cookie
 * @property {string} domain - Domain of the cookie
 * @property {string} path - Path of the cookie
 * @property {?number} expires - Unix timestamp of cookie expiry
 * @property {number} size - Length of the cookie name and value
 * @property {boolean} httpOnly - Whether or not the cookie is able to be accessed by the document.cookie API
 * @property {boolean} secure - Whether or not the cookie is restricted to requests using the HTTPS protocol 
 * @property {boolean} session - Whether or not the cookie is a session cookie, with an expiry defined by the browser
 * @property {'Strict' | 'Lax' | 'None'} sameSite - Defines the cross origin request behaviour of the cookie
 */

 /**
  * CookieJar class, used to handle cookies
  * 
  * Cookie addition and deletion should be handled
  * by a qq-request wrapper, passing the qq-request
  * wrapper into the cookie jar, and utilising the
  * getHeader function upon sending a request, and
  * the addCookies function upon request response
  * 
  * When accessing the cookieJar of the class,
  * cookies that have been expired are not
  * garbage collected by default, you must call
  * the getHeader method for cookies to be
  * garbage collected based upon their expiry
  * 
  * May encounter problems with adding ip address
  * cookies to cookieJar, and fetching cookie
  * headers with ip addresses
  * 
  * Samesite cookie attribute is extracted from
  * cookies for more accurate puppeteer porting,
  * but is ignored in the cookieJar handling as
  * CSRF is not a big deal
  */
class CookieJar {
    constructor() {
        /**
         * Contains the property name to be appended to a cookie object,
         * the regex to evaluate a cookie attribute with to extract the
         * attribute's value and the corresponding value's match index
         */
        this.regexes = [
            {
                name: 'domain',
                literal: /(^domain)(=)(.*)/i,
                index: 3
            },
            {
                name: 'path',
                literal: /(^path)(=)(.*)/i,
                index: 3
            },
            {
                name: 'expires',
                literal: /(^expires)(=)(.*)/i,
                index: 3
            },
            {
                name: 'maxAge',
                literal: /(^max-age)(=)(.*)/i,
                index: 3
            },
            {
                name: 'httpOnly',
                literal: /(^httponly)/i,
                index: 0
            },
            {
                name: 'secure',
                literal: /(^secure)/i,
                index: 0
            },
            {
                name: 'sameSite',
                literal: /(^samesite)(=)(.*)/i,
                index: 3
            }
        ]


        /**
         * @type {Cookie[]}
         */
        this.cookieJar = []
    }

    /**
     * Returns a generalized version of the domain used to compare cookie domains with site urls
     * 
     * @param {string} domain - Domain to be generalized
     * @returns {string} - The generalized domain
     */
    canonicalDomain = (domain) => {
        if (domain === null) return null
        else {
            domain = domain.trim().replace(/^\./, "")
            return domain.toLowerCase()
        }
    }

    /**
     * Gets the public suffix which is the shortest domain name a cookie can be set upon
     * 
     * @param {string} domain - Domain to get public suffix of
     * @returns {string} - The public suffix
     */
    getPublicSuffix = (domain) => {
        const pubSuf = psl.get(this.canonicalDomain(domain))
        return pubSuf
    }

    /**
     * Converts a split cookie array to a parsed cookie object
     * 
     * @param {string} array - Array to parse
     * @param {String | Object} url - Url cookie was set from
     * @returns {Cookie | undefined} - Parsed cookie object
     */
    convertCookieArrayToObject(array, url) {
        const cookie = {}

        // Get the name and value of the cookie, should always exist otherwise is an invalid cookie
        cookie.name = array[0].split(/=/)[0]
        cookie.value = array[0].split(/=(.+)/)[1]
        if (cookie.value === undefined) cookie.value = ''
        delete array[0]
 
        // Check for attributes on the cookie, append any found attributes to the cookie cookieect
        array.forEach(attribute => {
            const match = this.regexes.find(regex => regex.literal.test(attribute))
            if (match) cookie[match.name] = match.literal.exec(attribute)[match.index]
        })

        // Set default domain and paths if not present
        if (!cookie.domain) cookie.domain = url.host
        if (!cookie.path) cookie.path = url.pathname

        // Parse cookie expiry, max age expiry has precedence over the cookie expires attribute
        if (cookie.expires && !cookie.maxAge) cookie.expires = new Date(cookie.expires).getTime()
        else if (cookie.maxAge) cookie.expires = Date.now() + parseInt(cookie.maxAge) * 1000, delete cookie.maxAge
        else cookie.session = true
        

        // Convert regex string values into boolean values
        for (const bool of ['secure', 'httpOnly']) {
            cookie[bool] = cookie[bool] ? true : false
        }

        // Convert sameSite value to start with upper case, and default to 'Lax' if not present
        if (!cookie.sameSite) cookie.sameSite = 'Lax'
        else if (cookie.sameSite.charAt(0) === cookie.sameSite.charAt(0).toLowerCase()) cookie.sameSite = cookie.sameSite.charAt(0).toUpperCase() + cookie.sameSite.slice(1)

        // Set the size parameter of the cookie, used in puppeteer
        cookie.size = cookie.name.length + cookie.value && cookie.value.length

        // Get public suffixes of site and cookie
        const siteUrlPublicSuffix = this.getPublicSuffix(url.host)
        const cookiePublicSuffix = this.getPublicSuffix(cookie.domain)

        // Convert example.com -> .example.com
        if (cookie.domain === cookiePublicSuffix) cookie.domain = `.${cookie.domain}`

        // Security overrides

        // @TODO A site can not set a cookie for a subdomain except with a prefix of '.'

        // A site can not set a cookie for a domain different than it's own registered domain
        if (siteUrlPublicSuffix !== cookiePublicSuffix) {
            console.log(`[WARNING] Cookie Security Override, Site With Public Suffix ${siteUrlPublicSuffix} Can Not Set Cookie With Public Suffix ${cookiePublicSuffix}, Cookie Array: ${JSON.stringify(array)}, URL: ${url.href}`)
            return undefined
        }
        // A site can not set a cookie for a subdomain except with a prefix of '.'
        if (!cookie.domain.startsWith('.') && cookie.domain !== url.host) {
            console.log(`[WARNING] Cookie Security Override, Site With Domain ${url.host} Can Not Set A Cookie For Domain ${cookie.domain}, Cookie Array: ${JSON.stringify(array)}, URL: ${url.href}`)
            return undefined
        }
        // A non secure url can not set a secure cookie
        if (url.protocol !== 'https:' && cookie.secure) {
            console.log(`[WARNING] Cookie Security Override, A Non Secure Resource Can Not Set A Secure Cookie, Cookie Array: ${JSON.stringify(array)}, URL: ${url.href}`)
            return undefined
        }
        // A cookie can not be sent cross site to unsecure protocols
        if (cookie.sameSite === 'None' && !cookie.secure) {
            console.log(`[WARNING] Cookie Security Override, A Cross Site Available Cookie Must Be Secure, Cookie Array: ${JSON.stringify(array)}, URL: ${url.href}`)
            return undefined
        }
        // A cookie with the __Host- prefix must have the secure attribute, be sent from a secure resource, must not include the domain attribute and the path should be '/'
        if (cookie.name.startsWith('__Host-') && (!cookie.secure || url.protocol !== 'https:' || cookie.domain !== url.host || cookie.path !== '/')) {
            console.log(`[WARNING] Cookie Security Override, Cookie With '__Host-' Prefix Must Follow Prefix Security Guidelines, Cookie Array: ${JSON.stringify(array)}, URL: ${url.href}`)
            return undefined
        }
        // A cookie with the __Secure- prefix must have the secure attribute and be sent from a secure resource
        if (cookie.name.startsWith('__Secure-') && (!cookie.secure || url.protocol !== 'https:')) {
            console.log(`[WARNING] Cookie Security Override, Cookie With '__Secure-' Prefix Must Follow Prefix Security Guidelines, Cookie Array: ${JSON.stringify(array)}, URL: ${url.href}`)
            return undefined
        }

        return cookie
    }

    /**
     * Parses a cookie
     * 
     * @param {string} cookie - Cookie to be parsed
     * @param {String | Object} url - Url cookie was set from
     * @returns {Cookie | undefined} - Parsed cookie object
     */
    parseCookie(cookie, url) {
        cookie = cookie.split(/; |;/)
        return this.convertCookieArrayToObject(cookie, url)

    }

    /**
     * Adds cookies given an array of cookie names and values
     * 
     * @param {Array.<string>} array - Array of cookie names and values
     * @param {String | Object} url - Url cookie was set from
     */
    addCookies(array, url) {
        const _url = typeof url === URL ? url : new URL(url)
        array.forEach(cookie => {
            try {
                const parsedCookie = this.parseCookie(cookie, _url)

                if (parsedCookie) {
                    // Check if a cookie with the same name already exists
                    const i = this.cookieJar.findIndex(cookie => cookie.name === parsedCookie.name)

                    // If a cookie with the same name exists, remove it from the cookieJar
                    i > -1 && this.cookieJar.splice(i, 1)

                    this.cookieJar.push(parsedCookie)
                    return
                }
            } catch (err) {
                console.log(`[WARNING] Error Parsing Cookie Into CookieJar, Cookie: ${cookie}, Error: ${err}`)
            }
        })
    }

    /**
     * Compares a cookie domain to a site domain
     * 
     * @param {string} cookieDomain - Cookie domain attribute value
     * @param {string} siteDomain - Site host
     * @returns {boolean} - Whether the cookie domain has the ability to access the site domain
     */
    cookieDomainCanAccessSite(cookieDomain, siteDomain) {
        const generalizedCookieDomain = this.canonicalDomain(cookieDomain)
        const generalizedSiteDomain = this.canonicalDomain(siteDomain)

        // Domain matches if identical
        if (generalizedSiteDomain === generalizedCookieDomain) return true

        // Domain matches if the following 3 conditions are true

        // Cookie domain is a suffix of the site domain
        const i = generalizedSiteDomain.indexOf(generalizedCookieDomain)
        if (i <= 0) return false // The cookie domain must be a suffix of the site domain

        // Check if it the suffix is proper
        if (generalizedSiteDomain.length !== generalizedCookieDomain.length + i) return false // There must not be anything preceeding the cookie domain suffix in the site domain

        // The last character of the site domain that is not in the domain string is a "."
        if (generalizedSiteDomain.substr(i - 1, 1) !== '.') return false

        // The string is a host name, not an ip address
        if (/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(siteDomain)) return false

        return true
        
        
    }

    /**
     * Gets the cookie header required to send cookies in a request given a URL
     * 
     * @param {string} url - Url requesting the cookie header
     * @returns {string | undefined} - The cookie header, or undefined if no cookies are available for the given parameters
     */
    getHeader(url) {
        const _url = typeof url === URL ? url : new URL(url)

        // Filter unexpired cookies
        const unexpiredFiltered = this.cookieJar.filter(cookie => cookie.session || Date.now() < cookie.expires)

        // Update cookieJar with the filtered unexpired cookies
        this.cookieJar = unexpiredFiltered

        // Filter cookies that have a domain and path attribute valid for use on this site url
        const domainPathFiltered = this.cookieJar.filter(cookie => _url.pathname.startsWith(cookie.path) && this.cookieDomainCanAccessSite(cookie.domain, _url.host)) // Add cookie domain

        // Serialize cookie haeder
        const cookieHeader = domainPathFiltered.reduce((acc, cur) => (acc.push(`${cur.name}=${cur.value}`), acc), []).join('; ')
        
        return cookieHeader || undefined
    }

    /**
     * Deletes cookies given an array containing their names
     * 
     * @param {Array.<string>} - Array of cookie names to be deleted
     * @param {boolean} - Whether or not deleting the cookies was successful
     */
    deleteCookies(cookieNames) {
        const filtered = this.cookieJar.filter(cookie => !cookieNames.includes(cookie.name))
        this.cookieJar = filtered || {}
        return true
    }

    /**
     * Deletes all cookies except cookies whose name's match an inputted array of cookie names
     * 
     * Clears the cookieJar if no cookies matched the names of the cookies passed
     * 
     * @param {Array.<string>} cookieNames - Array of cookie names to not be deleted
     * @returns {boolean} - Whether or not deleting all cookies, except the ones specified was successful
     */
    deleteCookiesExcept(cookieNames) {
        const filtered = this.cookieJar.filter(cookie => cookieNames.includes(cookie.name))
        this.cookieJar = filtered || {}
        return true
    }

    /**
     * Gets the value of a specific cookie given it's name
     * 
     * @param {string} name - Name of the cookie whose value is to be fetched
     * @returns {string | undefined} - Value of the cookie, or undefined if not found
     */
    getCookieValue(name) {
        const cookie = this.cookieJar.find(cookie => cookie.name === name)
        return cookie && cookie.value
    }

    /**
     * Clears all the cookies in the cookieJar
     * 
     * @returns {boolean} - Whether or not clearing the cookieJar was successful
     */
    clearCookies() {
        this.cookieJar = []
        return true
    }

    /**
     * Gets the current amount of cookies in the cookieJar
     * 
     * @returns {number} - Amount of cookies in the cookieJar
     */
    amount() {
        return this.cookieJar.length
    }

    /**
     * Imports cookies from cookies exported from the CookieJar browser extension
     * 
     * @param {Array.<Object>} cookies - CookieJar extension exported cookies to be imported
     * @returns {boolean} - Whether or not importing cookies from the browser extension was succesful
     */
    importCookiesFromBrowserExtension(cookies) {
        try {
            cookies.forEach(_cookie => {
                const cookie = {
                    name: _cookie.name,
                    value: _cookie.value,
                    domain: _cookie.domain,
                    path: _cookie.path,
                    size: _cookie.name.length + _cookie.value.length,
                    httpOnly: _cookie.httpOnly,
                    secure: _cookie.secure,
                    session: _cookie.session,
                    sameSite: undefined,
                }
    
                this.cookieJar.push(cookie)
            })

            return true    
        } catch (err) {
            console.error(err)
            return false
        }
    }


}

module.exports = CookieJar