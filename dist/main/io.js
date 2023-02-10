const { app, dialog, BrowserWindow } = require('electron')
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')
const path = require('path')

function io() {
  const getFileImportPath = title =>
    new Promise(res => {
      dialog
        .showOpenDialog(BrowserWindow.getFocusedWindow(), {
          title,
          defaultPath: app.getPath('desktop'),
          buttonLabel: 'Import',
          filters: [{ name: 'JSON file', extensions: ['json'] }],
          properties: ['openFile'],
        })
        .then(({ canceled, filePaths }) => {
          if (canceled || filePaths.length < 1) return res()
          else return res(filePaths[0])
        })
        .catch(err => {
          console.error('Unable to import file.', err?.message)
          return res()
        })
    })

  const getFileSavePath = title =>
    new Promise(res => {
      dialog
        .showSaveDialog(BrowserWindow.getFocusedWindow(), {
          title,
          defaultPath: path.resolve(app.getPath('desktop'), 'billing.json'),
          buttonLabel: 'Export',
          filters: [{ name: 'JSON file', extensions: ['json'] }],
        })
        .then(({ canceled, filePath }) => {
          if (canceled || !filePath) return res()
          else return res(filePath)
        })
        .catch(err => {
          console.error('Unable to export file.', err?.message)
          return res()
        })
    })

  async function exportBilling(billing) {
    const filePath = await getFileSavePath('Choose export location')
    
    let { profiles } = billing

    try{
        const json = JSON.stringify(profiles.map(x => {
            let profile = {
                name: x.profile_name,
                size: '',
                profileGroup: '',
                billingAddress: {
                    name: x.billing_first_name + ' ' + x.billing_last_name,
                    email: x.email_address,
                    phone: x.phone_number,
                    line1: x.billing_address_line_1,
                    line2: x.billing_address_line_2,
                    line3: '',
                    postCode: x.billing_zip_code,
                    city: x.billing_city,
                    country: x.billing_country.label,
                    state: x.billing_state.label
                },
                shippingAddress: {},
                paymentDetails: {
                    nameOnCard: x.card_name,
                    cardType: x.card_type,
                    cardNumber: x.card_number,
                    cardExpMonth: x.card_expiry_month.label,
                    cardExpYear: x.card_expiry_year.label,
                    cardCvv: x.card_security_code
                },
                sameBillingAndShippingAddress: x.same_shipping,
                onlyCheckoutOnce: x.single_checkout,
                matchNameOnCardAndAddress: false
            }

            profile = {
                ...profile,
                shippingAddress: x.same_shipping ? { ...profile.billingAddress } : {
                    name: x.shipping_first_name + '' + x.shipping_last_name,
                    email: x.email_address,
                    phone: x.phone_number,
                    line1: x.shipping_address_line_1,
                    line2: x.shipping_address_line_2,
                    line3: '',
                    postCode: x.shipping_zip_code,
                    city: x.shipping_city,
                    country: x.shipping_country.label,
                    state: x.shipping_state.label
                }
            }

            return profile
        }), null, '\t')

        await new Promise((res, rej) =>
          fs.writeFile(filePath, json,'utf8', (err, data) => {
            if (err) return rej(new Error('Unable to save file.'))
            else return res()
          }),
        )
    } catch (err) {
        throw new Error('Unable to save file.')
    }   
  }

  async function importBilling() {
    const filePath = await getFileImportPath('Choose billing file')

    if(!filePath) return;

    const fileBuffer = await new Promise((res, rej) =>
      fs.readFile(filePath, (err, data) => {
        if (err) return rej(new Error('Unable to read file.'))
        else return res(data)
      }),
    )

    try {
      const arr = JSON.parse(fileBuffer.toString())

      const profiles = arr.map(({ name, billingAddress, shippingAddress, paymentDetails: { nameOnCard, cardType, cardNumber, cardExpMonth, cardExpYear, cardCvv }, sameBillingAndShippingAddress, onlyCheckoutOnce }) => {
        const billingNameArr = billingAddress.name.split(' '),
          shippingNameArr = shippingAddress.name.split(' ')

        let profile = {
          id: uuidv4(),
          profile_name: name,
          phone_number: billingAddress.phone || shippingAddress.phone,
          email_address: billingAddress.email || shippingAddress.email,
          card_name: nameOnCard,
          card_type: cardType.toLowerCase(),
          card_number: cardNumber,
          card_expiry_month: {
            label: cardExpMonth,
            value: cardExpMonth,
          },
          card_expiry_year: {
            label: cardExpYear,
            value: cardExpYear,
          },
          card_security_code: cardCvv,
          billing_first_name: billingNameArr.shift(),
          billing_last_name: billingNameArr.join(' '),
          billing_address_line_1: billingAddress.line1,
          billing_address_line_2: billingAddress.line2 + (billingAddress.line3 ? ' ' + billingAddress.line3 : ''),
          billing_city: billingAddress.city,
          billing_state: {
            label: states.find(({ label }) => label.toLowerCase() === billingAddress.state.toLowerCase().trim()).label,
            value: states.find(({ label }) => label.toLowerCase() === billingAddress.state.toLowerCase().trim()).value,
          },
          billing_zip_code: billingAddress.postCode,
          billing_country: {
            label: countries.find(({ label }) => label.toLowerCase() === billingAddress.country.toLowerCase().trim()).label,
            value: countries.find(({ label }) => label.toLowerCase() === billingAddress.country.toLowerCase().trim()).value,
          },
          single_checkout: onlyCheckoutOnce,
          same_shipping: sameBillingAndShippingAddress,
        }

        profile = {
          ...profile,
          shipping_first_name: profile.same_shipping ? profile.billing_first_name : shippingNameArr.shift(),
          shipping_last_name: profile.same_shipping ? profile.billing_last_name : shippingNameArr.join(' '),
          shipping_address_line_1: profile.same_shipping ? profile.billing_address_line_1 : shippingAddress.line1,
          shipping_address_line_2: profile.same_shipping ? profile.billing_address_line_2 : shippingAddress.line2 + (shippingAddress.line3 ? ' ' + billingAddress.line3 : ''),
          shipping_city: profile.same_shipping ? profile.billing_city : shippingAddress.city,
          shipping_state: profile.same_shipping
            ? profile.billing_state
            : {
                label: states.find(({ label }) => label.toLowerCase() === shippingAddress.state.toLowerCase().trim()).label,
                value: states.find(({ label }) => label.toLowerCase() === shippingAddress.state.toLowerCase().trim()).value,
              },
          shipping_zip_code: profile.same_shipping ? profile.billing_zip_code : shippingAddress.postCode,
          shipping_country: profile.same_shipping
            ? profile.billing_country
            : {
                label: countries.find(({ label }) => label.toLowerCase() === shippingAddress.country.toLowerCase().trim()).label,
                value: countries.find(({ label }) => label.toLowerCase() === shippingAddress.country.toLowerCase().trim()).value,
              },
        }

        return profile
      })

      return profiles
    } catch (err) {
      throw new Error('File is not valid json.')
    }
  }

  const countries = [
    { label: 'Canada', value: 'CA' },
    { label: 'United States', value: 'US' },
  ]


  const states = [
    {country: 'US', label: 'Alabama', value: 'AL' },
    {country: 'US', label: 'Alaska', value: 'AK' },
    {country: 'US', label: 'Arizona', value: 'AZ' },
    {country: 'US', label: 'Arkansas', value: 'AR' },
    {country: 'US', label: 'California', value: 'CA' },
    {country: 'US', label: 'Colorado', value: 'CO' },
    {country: 'US', label: 'Connecticut', value: 'CT' },
    {country: 'US', label: 'Delaware', value: 'DE' },
    {country: 'US',label: 'Florida', value: 'FL' },
    {country: 'US', label: 'Georgia', value: 'GA' },
    {country: 'US', label: 'Hawaii', value: 'HI' },
    {country: 'US', label: 'Idaho', value: 'ID' },
    {country: 'US', label: 'Illinois', value: 'IL' },
    {country: 'US', label: 'Indiana', value: 'IN' },
    {country: 'US', label: 'Iowa', value: 'IA' },
    {country: 'US', label: 'Kansas', value: 'KS' },
    {country: 'US', label: 'Kentucky', value: 'KY' },
    {country: 'US', label: 'Louisiana', value: 'LA' },
    {country: 'US', label: 'Maine', value: 'ME' },
    {country: 'US', label: 'Maryland', value: 'MD' },
    {country: 'US', label: 'Massachusetts', value: 'MA' },
    {country: 'US', label: 'Michigan', value: 'MI' },
    {country: 'US', label: 'Minnesota', value: 'MN' },
    {country: 'US', label: 'Mississippi', value: 'MS' },
    {country: 'US', label: 'Missouri', value: 'MO' },
    {country: 'US', label: 'Montana', value: 'MT' },
    {country: 'US', label: 'Nebraska', value: 'NE' },
    {country: 'US', label: 'Nevada', value: 'NV' },
    {country: 'US', label: 'New Hampshire', value: 'NH' },
    {country: 'US', label: 'New Jersey', value: 'NJ' },
    {country: 'US', label: 'New Mexico', value: 'NM' },
    {country: 'US', label: 'New York', value: 'NY' },
    {country: 'US', label: 'North Carolina', value: 'NC' },
    {country: 'US', label: 'North Dakota', value: 'ND' },
    {country: 'US', label: 'Ohio', value: 'OH' },
    {country: 'US', label: 'Oklahoma', value: 'OK' },
    {country: 'US', label: 'Oregon', value: 'OR' },
    {country: 'US', label: 'Pennsylvania', value: 'PA' },
    {country: 'US', label: 'Rhode Island', value: 'RI' },
    {country: 'US', label: 'South Carolina', value: 'SC' },
    {country: 'US', label: 'South Dakota', value: 'SD' },
    {country: 'US', label: 'Tennessee', value: 'TN' },
    {country: 'US', label: 'Texas', value: 'TX' },
    {country: 'US', label: 'Utah', value: 'UT' },
    {country: 'US', label: 'Vermont', value: 'VT' },
    {country: 'US', label: 'Virginia', value: 'VA' },
    {country: 'US', label: 'Washington', value: 'WA' },
    {country: 'US', label: 'West Virginia', value: 'WV' },
    {country: 'US', label: 'Wisconsin', value: 'WI' },
    {country: 'US',label: 'Wyoming', value: 'WY' },
    {country: 'CA', label: 'Ontario', value: 'ON'},
    {country: 'CA', label: 'Quebec', value: 'QC'},
    {country: 'CA', label: 'Nova Scotia', value: 'NS'},
    {country: 'CA', label: 'New Brunswick', value: 'NB'},
    {country: 'CA', label: 'Manitoba', value: 'MB'},
    {country: 'CA', label: 'British Columbia', value: 'BC'},
    {country: 'CA', label: 'Prince Edward Island', value: 'PE'},
    {country: 'CA', abel: 'Saskatchewan', value: 'SK'},
    {country: 'CA', label: 'Alberta', value: 'AB'},
    {country: 'CA', label: 'Newfoundland and Labrador', value: 'NL'},
    {country: 'CA', abel: 'Northwest Territories', value: 'NT'},
    {country: 'CA', abel: 'Yukon', value: 'YT'},
    {country: 'CA', label: 'Nunavut', value: 'NU'},
  ]

  return {
    import: {
      billing: importBilling,
    },
    export: {
      billing: exportBilling,
    },
  }
}

module.exports = io
