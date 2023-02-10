import React from 'react'

import './analytics.scss'
import { AnalyticsHeader } from './header'

const Analytics = ({ activeScreen }) => (
  <div id={'analytics'} className={activeScreen === 'analytics' ? 'a' : undefined}>
    <AnalyticsHeader title="Analytics" options={[{ label: 'All', value: 'all' }]} />
    <div className="body">
      <div className="counts">
        <div className="success wrapper">
          <div className="header">Checkouts</div>
          <div className="body count">15</div>
        </div>

        <div className="entries wrapper">
          <div className="header">Entries</div>
          <div className="body count">25</div>
        </div>
      </div>
      <div className="checkouts wrapper">
        <div className="header"></div>
        <div className="body">
                  <div className="table">
          <table>
            <thead>
              <tr>
                <th className="product">Product</th>
                <th className="size">Size</th>
                <th className="email">Email</th>
                <th className="pass">Password</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="product">Air Jordan 1 Court Purple</td>
                <td className="size">9</td>
                <td className="email">XXXXXXXXXXXXX</td>
                <td className="pass">XXXXX</td>
              </tr>
              <tr>
                <td className="product">Air Jordan 1 Court Purple</td>
                <td className="size">9</td>
                <td className="email">XXXXXXXXXXXXX</td>
                <td className="pass">XXXXX</td>
              </tr>
              <tr>
                <td className="product">Air Jordan 1 Court Purple</td>
                <td className="size">9</td>
                <td className="email">XXXXXXXXXXXXX</td>
                <td className="pass">XXXXX</td>
              </tr>
              <tr>
                <td className="product">Air Jordan 1 Court Purple</td>
                <td className="size">9</td>
                <td className="email">XXXXXXXXXXXXX</td>
                <td className="pass">XXXXX</td>
              </tr>
              <tr>
                <td className="product">Air Jordan 1 Court Purple</td>
                <td className="size">9</td>
                <td className="email">XXXXXXXXXXXXX</td>
                <td className="pass">XXXXX</td>
              </tr>
              <tr>
                <td className="product">Air Jordan 1 Court Purple</td>
                <td className="size">9</td>
                <td className="email">XXXXXXXXXXXXX</td>
                <td className="pass">XXXXX</td>
              </tr>
              <tr>
                <td className="product">Air Jordan 1 Court Purple</td>
                <td className="size">9</td>
                <td className="email">XXXXXXXXXXXXX</td>
                <td className="pass">XXXXX</td>
              </tr>
              <tr>
                <td className="product">Air Jordan 1 Court Purple</td>
                <td className="size">9</td>
                <td className="email">XXXXXXXXXXXXX</td>
                <td className="pass">XXXXX</td>
              </tr>
              <tr>
                <td className="product">Air Jordan 1 Court Purple</td>
                <td className="size">9</td>
                <td className="email">XXXXXXXXXXXXX</td>
                <td className="pass">XXXXX</td>
              </tr>
              <tr>
                <td className="product">Air Jordan 1 Court Purple</td>
                <td className="size">9</td>
                <td className="email">XXXXXXXXXXXXX</td>
                <td className="pass">XXXXX</td>
              </tr>
              <tr>
                <td className="product">Air Jordan 1 Court Purple</td>
                <td className="size">9</td>
                <td className="email">XXXXXXXXXXXXX</td>
                <td className="pass">XXXXX</td>
              </tr>
              <tr>
                <td className="product">Air Jordan 1 Court Purple</td>
                <td className="size">9</td>
                <td className="email">XXXXXXXXXXXXX</td>
                <td className="pass">XXXXX</td>
              </tr>
              <tr>
                <td className="product">Air Jordan 1 Court Purple</td>
                <td className="size">9</td>
                <td className="email">XXXXXXXXXXXXX</td>
                <td className="pass">XXXXX</td>
              </tr>
              <tr>
                <td className="product">Air Jordan 1 Court Purple</td>
                <td className="size">9</td>
                <td className="email">XXXXXXXXXXXXX</td>
                <td className="pass">XXXXX</td>
              </tr>
              <tr>
                <td className="product">Air Jordan 1 Court Purple</td>
                <td className="size">9</td>
                <td className="email">XXXXXXXXXXXXX</td>
                <td className="pass">XXXXX</td>
              </tr>
              <tr>
                <td className="product">Air Jordan 1 Court Purple</td>
                <td className="size">9</td>
                <td className="email">XXXXXXXXXXXXX</td>
                <td className="pass">XXXXX</td>
              </tr>
              <tr>
                <td className="product">Air Jordan 1 Court Purple</td>
                <td className="size">9</td>
                <td className="email">XXXXXXXXXXXXX</td>
                <td className="pass">XXXXX</td>
              </tr>
              <tr>
                <td className="product">Air Jordan 1 Court Purple</td>
                <td className="size">9</td>
                <td className="email">XXXXXXXXXXXXX</td>
                <td className="pass">XXXXX</td>
              </tr>
              <tr>
                <td className="product">Air Jordan 1 Court Purple</td>
                <td className="size">9</td>
                <td className="email">XXXXXXXXXXXXX</td>
                <td className="pass">XXXXX</td>
              </tr>
              <tr>
                <td className="product">Air Jordan 1 Court Purple</td>
                <td className="size">9</td>
                <td className="email">XXXXXXXXXXXXX</td>
                <td className="pass">XXXXX</td>
              </tr>
              <tr>
                <td className="product">Air Jordan 1 Court Purple</td>
                <td className="size">9</td>
                <td className="email">XXXXXXXXXXXXX</td>
                <td className="pass">XXXXX</td>
              </tr>
              <tr>
                <td className="product">Air Jordan 1 Court Purple</td>
                <td className="size">9</td>
                <td className="email">XXXXXXXXXXXXX</td>
                <td className="pass">XXXXX</td>
              </tr>
            </tbody>
          </table>
        </div>

        </div>
      </div>
    </div>
  </div>
)

export default Analytics
