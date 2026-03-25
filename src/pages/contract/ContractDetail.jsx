import React, { useState, useEffect } from 'react'
import { Outlet, Link, useParams, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { formatRunebase, formatRrc20 } from '@/utils/format'
import Contract from '@/models/contract'
import Icon from '@/components/Icon'
import AddressLink from '@/components/links/AddressLink'

export default function ContractDetail() {
  const { t } = useTranslation()
  const { id } = useParams()
  const location = useLocation()
  const [data, setData] = useState(null)

  useEffect(() => {
    document.title = t('blockchain.contract') + ' ' + id + ' - explorer.runebase.io'
    Contract.get(id).then(setData).catch(() => {})
  }, [id])

  if (!data) return <div className="container">Loading...</div>

  const existingTokenBalances = (data.qrc20Balances || []).filter(t => t.balance !== '0')

  return (
    <section className="container">
      <div className="card section-card">
        <div className="card-header">
          <div className="card-header-icon"><Icon icon="code" fixedWidth /></div>
          <h3 className="card-header-title">{t('contract.summary')}</h3>
        </div>
        <div className="card-body info-table">
          <div className="columns">
            <div className="column info-title">{t('contract.address')}</div>
            <div className="column info-value"><AddressLink address={data.address} plain /></div>
          </div>
          {data.qrc20 && (
            <>
              {data.qrc20.name && (
                <div className="columns">
                  <div className="column info-title">{t('contract.token.name')}</div>
                  <div className="column info-value">{data.qrc20.name}</div>
                </div>
              )}
              {data.qrc20.holders > 0 && (
                <div className="columns">
                  <div className="column info-title">{t('contract.token.total_supply')}</div>
                  <div className="column info-value monospace">
                    {formatRrc20(data.qrc20.totalSupply, data.qrc20.decimals, true)} {data.qrc20.symbol || t('contract.token.tokens')}
                  </div>
                </div>
              )}
              <div className="columns">
                <div className="column info-title">{t('contract.token.token_holders')}</div>
                <div className="column info-value">{data.qrc20.holders}</div>
              </div>
            </>
          )}
          <div className="columns">
            <div className="column info-title">{t('contract.balance')}</div>
            <div className="column info-value monospace">{formatRunebase(data.balance)} RUNES</div>
          </div>
          <div className="columns">
            <div className="column info-title">{t('contract.total_received')}</div>
            <div className="column info-value monospace">{formatRunebase(data.totalReceived)} RUNES</div>
          </div>
          <div className="columns">
            <div className="column info-title">{t('contract.total_sent')}</div>
            <div className="column info-value monospace">{formatRunebase(data.totalSent)} RUNES</div>
          </div>
          {existingTokenBalances.length > 0 && (
            <div className="columns">
              <div className="column info-title">{t('address.token_balances')}</div>
              <div className="column info-value">
                {existingTokenBalances.map(token => (
                  <div key={token.address} className="monospace">
                    {formatRrc20(token.balance, token.decimals)}{' '}
                    <AddressLink address={token.address}>{token.symbol || token.name || t('contract.token.tokens')}</AddressLink>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="columns">
            <div className="column info-title">{t('contract.transaction_count')}</div>
            <div className="column info-value">{data.transactionCount}</div>
          </div>
        </div>
      </div>

      {data.transactionCount > 0 && (
        <div className="tabs is-centered">
          <ul>
            <li className={!location.pathname.includes('/rich-list') ? 'is-active' : ''}>
              <Link to={`/contract/${id}`}>{t('contract.transaction_list')}</Link>
            </li>
            {data.type === 'qrc20' && (
              <li className={location.pathname.includes('/rich-list') ? 'is-active' : ''}>
                <Link to={`/contract/${id}/rich-list`}>{t('misc.rich_list_title')}</Link>
              </li>
            )}
          </ul>
        </div>
      )}
      <Outlet context={{ qrc20: data.qrc20 }} />
    </section>
  )
}
