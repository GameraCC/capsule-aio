import { BILLING_PROFILES_UPDATE, BILLING_NEW_PROFILE, BILLING_UPDATE_PROFILE, BILLING_DELETE_PROFILE } from './types'
import { v4 as uuidv4 } from 'uuid'

const newProfile = profile => ({
  type: BILLING_NEW_PROFILE,
  profile,
})

const updateProfile = profile => ({
  type: BILLING_UPDATE_PROFILE,
  profile,
})

const deleteProfile = profileId => ({
  type: BILLING_DELETE_PROFILE,
  profileId,
})

export const updateBillingProfiles = () => ({
  type: BILLING_PROFILES_UPDATE
})

export const saveBillingProfile = profile => (dispatch, getState) => {
  const { billing } = getState()

  profile.id || (profile.id = uuidv4())

  if (profile.same_shipping)
    profile = {
      ...profile,
      shipping_first_name: profile.billing_first_name,
      shipping_last_name: profile.billing_last_name,
      shipping_address_line_1: profile.billing_address_line_1,
      shipping_address_line_2: profile.billing_address_line_2,
      shipping_city: profile.billing_city,
      shipping_state: profile.billing_state,
      shipping_zip_code: profile.billing_zip_code,
      shipping_country: profile.billing_country,
    }

  if (billing.profiles.some(({ id }) => id === profile.id)) {
      dispatch(updateProfile(profile))
  } else dispatch(newProfile(profile))
}

export const billingProfileDelete = id => (dispatch, getState) => {
  const { billing } = getState()

  if (!billing.profiles.some(profile => profile.id === id)) throw new Error(`Profile ${id} doesn't exist.`)

  dispatch(deleteProfile(id))
}
