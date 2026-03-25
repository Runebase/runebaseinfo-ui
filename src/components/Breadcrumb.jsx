import React from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Icon from './Icon'

export default function Breadcrumb() {
  const { t } = useTranslation()
  const location = useLocation()
  const params = useParams()
  const path = location.pathname

  const crumbs = []

  if (path.startsWith('/block')) {
    crumbs.push({ to: '/block', icon: 'cubes', label: t('block.list.block_list') })
    if (params.id) {
      crumbs.push({ to: `/block/${params.id}`, icon: 'cubes', label: t('blockchain.block') + ' ' + params.id })
    }
  } else if (path.startsWith('/address')) {
    if (params.id) {
      crumbs.push({ to: `/address/${params.id}`, icon: 'address-card', label: t('blockchain.address') + ' ' + params.id })
    }
  } else if (path.startsWith('/tx')) {
    if (params.id) {
      crumbs.push({ to: `/tx/${params.id}`, icon: 'list-alt', label: t('blockchain.transaction') + ' ' + params.id })
    }
  } else if (path.startsWith('/contract/tokens')) {
    crumbs.push({ to: '/contract/tokens', label: t('contract.token.tokens') })
  } else if (path.startsWith('/contract')) {
    if (params.id) {
      crumbs.push({ to: `/contract/${params.id}`, icon: 'code', label: t('blockchain.contract') + ' ' + params.id })
    }
  } else if (path.startsWith('/misc')) {
    crumbs.push({ to: '/misc', icon: 'chart-area', label: t('blockchain.misc') })
  }

  return (
    <div className="breadcrumb" style={{ marginLeft: '1em' }}>
      <ul className="breadcrumb-list" style={{ display: 'flex', alignItems: 'center', listStyle: 'none', gap: '0.5em' }}>
        <li>
          <Link to="/"><Icon icon="home" /></Link>
        </li>
        {crumbs.map((crumb, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.3em' }}>
            <span style={{ margin: '0 0.3em' }}>/</span>
            <Link to={crumb.to} style={{ display: 'flex', alignItems: 'center', gap: '0.3em' }}>
              {crumb.icon && <Icon icon={crumb.icon} />}
              <span className="monospace" style={{ maxWidth: '15em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {crumb.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
