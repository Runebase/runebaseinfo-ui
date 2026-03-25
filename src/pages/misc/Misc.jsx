import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function Misc() {
  const { t } = useTranslation()
  const location = useLocation()
  const path = location.pathname

  return (
    <div className="container">
      <div className="tabs is-centered">
        <ul>
          <li className={path.includes('/charts') || path === '/misc' || path === '/misc/' ? 'is-active' : ''}>
            <Link to="/misc/charts">{t('misc.charts_title')}</Link>
          </li>
          <li className={path.includes('/rich-list') ? 'is-active' : ''}>
            <Link to="/misc/rich-list">{t('misc.rich_list_title')}</Link>
          </li>
          <li className={path.includes('/biggest-miners') ? 'is-active' : ''}>
            <Link to="/misc/biggest-miners">{t('misc.biggest_miners_title')}</Link>
          </li>
          <li className={path.includes('/stake-calculator') ? 'is-active' : ''}>
            <Link to="/misc/stake-calculator">{t('misc.stake_calculator.title')}</Link>
          </li>
          <li className={path.includes('/raw-tx') ? 'is-active' : ''}>
            <Link to="/misc/raw-tx">Send Raw Transaction</Link>
          </li>
        </ul>
      </div>
      <Outlet />
    </div>
  )
}
