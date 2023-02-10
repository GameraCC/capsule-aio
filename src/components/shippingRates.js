import React from 'react'

import { SelectHeader } from './header'

import actions from '../img/actions.svg'
import { Trash } from './actions'
import { PlusIcon } from './headerIcons'

export default ({ activeScreen, groupCreateOpen, shippingRatesAddOpen, shippingRates }) => {
  const options = shippingRates.groups.map(({ group_name }) => ({
    value: group_name,
    label: group_name,
  }))

  return (
    <>
      <div id="shippingRates" className={'tableView' + (activeScreen === 'shippingRates' ? ' a' : '')}>
        <SelectHeader
          title="Shipping Rates"
          buttons={[{ name: 'Create', onClick: groupCreateOpen }]}
          count="3"
          placeholder="Select Group"
          options={options}>
          <PlusIcon onClick={shippingRatesAddOpen} />
        </SelectHeader>
        <div className="table">
          <table>
            <thead>
              <tr>
                <th className="name">
                  Name
                </th>
                <th className="rate">
                  Rate
                </th>
                <th className="price">
                  Price
                </th>
                <th className="actions">Actions
                  <img src={actions} alt="" /></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="name">Domestic Shipping</td>
                <td className="rate">shopify-20#40832940832498</td>
                <td className="price">$15.00</td>
                <td className="actions">
                  <div className="actions-controls">
                    <Trash />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
