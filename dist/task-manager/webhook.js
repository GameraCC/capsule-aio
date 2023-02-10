const axios = require('axios')

class Webhook {
  /**
   *
   * @param {Object} args
   * @param {?Object} parent - The this variable of the task sending a webhook
   */
  constructor({ parent }) {
    this.parent = parent

    this.url = this.parent?.webhookArgs?.url

    this.settings = {
      messages: {
        success: 'Checked Out',
        decline: 'Payment Decline',
      },
      colors: {
        success: '57FF9A',
        decline: 'FF5757',
      },
      footer: {
        icon_url: 'https://capsuleaio.com/logo512.png',
        text: 'Capsule AIO',
      },
    }
  }

  YEEZYSUPPLY(order) {
    return {
      embeds: [
        {
          title: `${order.type === 'success' ? this.settings.messages.success : this.settings.messages.decline} | Yeezysupply`,
          description: `[${order.name}](https://${this.parent.variables.static.host}/product/${order.product})`,
          color: order.type === 'success' ? parseInt(this.settings.colors.success, 16) : parseInt(this.settings.colors.decline, 16),
          timestamp: new Date().toISOString(),
          footer: this.settings.footer,
          thumbnail: {
            url: order.image,
          },
          fields: [
            {
              name: 'Profile',
              value: order.profile,
              inline: true,
            },
            {
              name: 'Proxy List',
              value: order.proxy,
              inline: true,
            },
            {
              name: 'Size',
              value: order.size,
              inline: true,
            },
            {
              name: 'Price',
              value: `$${order.price}`,
              inline: true,
            },
            {
              name: 'Email',
              value: `||${order.email}||`,
              inline: true,
            },
            {
              name: 'Order ID',
              value: `||${order.id}||`,
              inline: true,
            },
          ],
        },
      ],
    }
  }

  FOOTSITES_US_DESKTOP(order) {
    return {
      embeds: [
        {
          title: `${order.type === 'success' ? this.settings.messages.success : this.settings.messages.decline} | ${order.site}`,
          description: `[${order.name}](https://${this.parent.variables.static.host.value}/product/~/${order.product}.html)`,
          color: order.type === 'success' ? parseInt(this.settings.colors.success, 16) : parseInt(this.settings.colors.decline, 16),
          timestamp: new Date().toISOString(),
          footer: this.settings.footer,
          thumbnail: {
            url: order.image,
          },
          fields: [
            {
              name: 'Profile',
              value: order.profile,
              inline: true,
            },
            {
              name: 'Proxy List',
              value: order.proxy,
              inline: true,
            },
            {
              name: 'Size',
              value: order.size,
              inline: true,
            },
            {
              name: 'Price',
              value: `$${order.price}`,
              inline: true,
            },
            {
              name: 'Email',
              value: `||${order.email}||`,
              inline: true,
            },
            ...(order.id
              ? [
                  {
                    name: 'Order ID',
                    value: `||${order.id}||`,
                    inline: true,
                  },
                ]
              : []),
          ],
        },
      ],
    }
  }

  generateWebhook(order, site) {
    switch (site) {
      case 'YEEZYSUPPLY':
        return this.YEEZYSUPPLY(order)
      case 'FOOTLOCKER_US_DESKTOP':
        return this.FOOTSITES_US_DESKTOP({ ...order, site: 'Footlocker US' })
      case 'FOOTLOCKER_CA_DESKTOP':
        return this.FOOTSITES_US_DESKTOP({ ...order, site: 'Footlocker CA' })
      case 'CHAMPSSPORTS_US_DESKTOP':
        return this.FOOTSITES_US_DESKTOP({ ...order, site: 'Champssports US' })
      case 'EASTBAY_US_DESKTOP':
        return this.FOOTSITES_US_DESKTOP({ ...order, site: 'Eastbay US' })
      case 'FOOTACTION_US_DESKTOP':
        return this.FOOTSITES_US_DESKTOP({ ...order, site: 'Footaction US' })
      case 'KIDSFOOTLOCKER_US_DESKTOP':
        return this.FOOTSITES_US_DESKTOP({ ...order, site: 'Kidsfootlocker US' })
    }
  }

  /**
   * Handles sending a webhook
   *
   * @param {Object} args.order
   * @param {'success' | 'decline'} args.order.type - The type of order
   * @param {string} args.order.id - Order ID of the item brought
   * @param {string} args.order.profile - Name of the profile used to buy the item
   * @param {string} args.order.email - Email of the profile used to buy item
   * @param {number} args.order.price - Price of the item brought
   * @param {string} args.order.size - Size of the item brought
   * @param {string} args.order.product - ID / SKU / PID / URL of the item brought
   * @param {string} args.order.name - Name of the item brought
   * @param {string} args.order.image - Image of the item brought
   * @returns
   */
  handleWebhook(order) {
    try {
      const data = this.generateWebhook(order, this.parent.runArgs.site)

      axios({
        method: 'POST',
        url: this.url,
        data,
      }).catch(() => {
        return
      })
    } catch (err) {
      console.error(`Error while sending webhook for order id ${args.order.id} with type ${args.order.type}, Error: ${err}`)
      return
    }
  }
}

module.exports = Webhook
