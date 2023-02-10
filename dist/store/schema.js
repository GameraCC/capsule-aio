const schema = {
  tasks: {
    type: 'object',
    description: 'Tasks object to hold tasks groups',
    required: ['groups'],
    default: {
      groups: [],
    },
    properties: {
      groups: {
        type: 'array',
        default: [],
        items: {
          type: 'object',
          description: 'A task group which holds an array of tasks',
          required: ['id', 'group_name', 'site'],
          properties: {
            id: {
              type: 'string',
              minLength: 1,
              maxLength: 128,
            },
            group_name: {
              type: 'string',
              minLength: 1,
              maxLength: 32,
            },
            site: {
              type: ['object', 'null'],
              required: ['label', 'value'],
              properties: {
                label: {
                  type: 'string',
                  maxLength: 255,
                },
                value: {
                  type: 'string',
                  maxLength: 255,
                },
              },
            },
            checkout_limit: {
              type: 'boolean',
            },
            checkout_limit_count: {
              type: 'integer',
            },
            tasks: {
              type: 'array',
              default: [],
              items: {
                type: 'object',
                required: ['id'],
                properties: {
                  id: {
                    type: 'string',
                    minLength: 1,
                    maxLength: 128,
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  billing: {
    type: 'object',
    description: 'Billing object to hold groups and other settings',
    required: ['profiles'],
    default: {},
    properties: {
      profiles: {
        type: 'array',
        default: [],
        items: {
          type: 'object',
          description: 'An array of billing profiles',
          required: ['id', 'profile_name'],
          properties: {
            id: {
              type: 'string',
              minLength: 1,
              maxLength: 128,
            },
            profile_name: {
              type: 'string',
              minLength: 1,
              maxLength: 32,
            },
            shipping_first_name: {
              type: 'string',
              maxLength: 255,
              default: '',
            },
            shipping_last_name: {
              type: 'string',
              maxLength: 255,
              default: '',
            },
            shipping_country: {
              type: ['object', 'null'],
              required: ['label', 'value'],
              properties: {
                label: {
                  type: 'string',
                  maxLength: 255,
                },
                value: {
                  type: 'string',
                  maxLength: 2,
                },
              },
            },
            shipping_address_line_1: {
              type: 'string',
              maxLength: 255,
              default: '',
            },
            shipping_address_line_2: {
              type: 'string',
              maxLength: 255,
              default: '',
            },
            shipping_city: {
              type: 'string',
              maxLength: 255,
              default: '',
            },
            shipping_state: {
              type: ['object', 'null'],
              required: ['label', 'value'],
              properties: {
                label: {
                  type: 'string',
                  maxLength: 255,
                },
                value: {
                  type: 'string',
                  maxLength: 2,
                },
              },
            },
            shipping_zip_code: {
              type: 'string',
              maxLength: 32,
              default: '',
            },
            billing_first_name: {
              type: 'string',
              maxLength: 255,
              default: '',
            },
            billing_last_name: {
              type: 'string',
              maxLength: 255,
              default: '',
            },
            billing_country: {
              type: ['object', 'null'],
              required: ['label', 'value'],
              properties: {
                label: {
                  type: 'string',
                  maxLength: 255,
                },
                value: {
                  type: 'string',
                  maxLength: 2,
                },
              },
            },
            billing_address_line_1: {
              type: 'string',
              maxLength: 255,
              default: '',
            },
            billing_address_line_2: {
              type: 'string',
              maxLength: 255,
              default: '',
            },
            billing_city: {
              type: 'string',
              maxLength: 255,
              default: '',
            },
            billing_state: {
              type: ['object', 'null'],
              required: ['label', 'value'],
              properties: {
                label: {
                  type: 'string',
                  maxLength: 255,
                },
                value: {
                  type: 'string',
                  maxLength: 2,
                },
              },
            },
            billing_zip_code: {
              type: 'string',
              maxLength: 32,
              default: '',
            },
            card_name: {
              type: 'string',
              default: '',
            },
            card_type: {
              type: 'string',
              maxLength: 32,
              default: '',
            },
            card_number: {
              type: 'string',
              maxLength: 19,
              default: '',
            },
            card_expiry_month: {
              type: ['object', 'null'],
              required: ['label', 'value'],
              properties: {
                label: {
                  type: 'string',
                  maxLength: 2,
                },
                value: {
                  type: 'string',
                  maxLength: 2,
                },
              },
            },
            card_expiry_year: {
              type: ['object', 'null'],
              required: ['label', 'value'],
              properties: {
                label: {
                  type: 'string',
                  maxLength: 4,
                },
                value: {
                  type: 'string',
                  maxLength: 4,
                },
              },
            },
            card_security_code: {
              type: 'string',
              maxLength: 4,
              default: '',
            },
            single_checkout: {
              type: 'boolean',
              default: false,
            },
            same_shipping: {
              type: 'boolean',
              default: false,
            },
          },
        },
      },
    },
  },
  proxies: {
    type: 'object',
    description: 'Proxy object to hold proxy groups',
    required: ['groups'],
    default: {
      groups: [],
    },
    properties: {
      groups: {
        type: 'array',
        default: [],
        items: {
          type: 'object',
          description: 'A proxy group which holds an array of proxies',
          required: ['id', 'group_name', 'proxies'],
          properties: {
            id: {
              type: 'string',
              minLength: 1,
              maxLength: 128,
            },
            group_name: {
              type: 'string',
              minLength: 1,
              maxLength: 32,
            },
            proxies: {
              type: 'array',
              default: [],
              items: {
                type: 'object',
                description: 'A proxy',
                required: ['host', 'port'],
                properties: {
                  host: {
                    type: 'string',
                  },
                  port: {
                    type: 'string',
                  },
                  username: {
                    type: ['string', 'null'],
                  },
                  password: {
                    type: ['string', 'null'],
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  accounts: {
    type: 'object',
    description: 'Holds accounts',
    required: ['groups'],
    default: {
      groups: [],
    },
    properties: {
      groups: {
        type: 'array',
        default: [],
        items: {
          type: 'object',
          description: 'An accounts group which holds an array of accounts',
          required: ['id', 'group_name', 'accounts'],
          properties: {
            id: {
              type: 'string',
              minLength: 1,
              maxLength: 128,
            },
            group_name: {
              type: 'string',
              minLength: 1,
              maxLength: 32,
            },
            accounts: {
              type: 'array',
              default: [],
              items: {
                type: 'object',
                description: 'An account',
                required: ['email', 'password'],
                properties: {
                  email: {
                    type: 'string',
                  },
                  password: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  shippingRates: {
    type: 'object',
    description: 'Holds shipping rates',
    default: {
      groups: [],
    },
  },
  settings: {
    type: 'object',
    description: 'Holds global settings',
    required: ['webhook'],
    default: {
      webhook: '',
      twocaptcha: '',
      capmonster: '',
      twocaptchaStatusMessage: '',
      capmonsterStatusMessage: '',
      twocaptchaStatusMessageType: '',
      capmonsterStatusMessageType: '',
      id: '',
      username: '',
      discriminator: '',
      avatar: ''
    },
    properties: {
      webhook: {
        type: 'string',
      },
      twocaptcha: {
          type: 'string'
      },
      capmonster: {
        type: 'string'
      },
      twocaptchaStatusMessage: {
        type: 'string'
      },
      capmonsterStatusMessage: {
        type: 'string'
      },
      twocaptchaStatusMessageType: {
        type: 'string'
      },
      capmonsterStatusMessageType: {
        type: 'string'
      },
      id: {
        type: 'string'
      },
      username: {
        type: 'string'
      },
      discriminator: {
        type: 'string'
      },
      avatar: {
        type: 'string'
      }
    },
  },
  bind: {
    type: 'object',
    description: 'Holds data for the client bind',
    default: undefined,
    properties: {
      license: {
        type: 'string',
      },
      key: {
        type: 'string',
      },
      secret: {
        type: 'string',
      },
      capsuleKey: {
        type: 'string',
      },
    },
  },
  captcha: {
    type: 'object',
    description: 'Holds info on captcha solvers and sessions',
    default: {
      sessions: [],
      solvers: [],
    },
    properties: {
      sessions: {
        type: 'array',
        default: [],
        items: {
          type: 'object',
          properties: {
            name: {},
            id: {},
            cookies: {},
            localStorage: {},
            sessionStorage: {},
          },
        },
      },
      solvers: {
        type: 'array',
        default: [],
        items: {
          type: 'object',
          properties: {
            sessionId: {},
            proxy: {},
            autoClickCaptcha: {},
          },
        },
      },
    },
  },
}

module.exports = schema
