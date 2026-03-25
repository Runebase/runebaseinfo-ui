import React, { useState, useEffect } from 'react'
import { Outlet, Link, useParams, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { formatRunebase, formatRrc20 } from '@/utils/format'
import Address from '@/models/address'
import { addAddress, removeAddress } from '@/store/addressSlice'
import Icon from '@/components/Icon'
import AddressLink from '@/components/links/AddressLink'

export default function AddressDetail() {
  const { t } = useTranslation()
  const { id } = useParams()
  const location = useLocation()
  const dispatch = useDispatch()
  const myAddresses = useSelector(state => state.address.myAddresses)
  const [data, setData] = useState(null)

  const addresses = [...new Set(id.split(','))]

  useEffect(() => {
    document.title = t('blockchain.address') + ' ' + id + ' - explorer.runebase.io'
    Address.get(id).then(setData).catch(() => {})
  }, [id])

  if (!data) return <div className="container">Loading...</div>

  const existingTokenBalances = (data.qrc20Balances || []).filter(t => t.balance !== '0')

  return (
    <section className="container">
      <div className="card section-card">
        <div className="card-header">
          <div className="card-header-icon"><Icon icon="address-card" regular fixedWidth /></div>
          <h3 className="card-header-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{t('address.summary')}</span>
            {addresses.length === 1 && (
              <span>
                {myAddresses.includes(addresses[0]) ? (
                  <a href="#" onClick={e => { e.preventDefault(); dispatch(removeAddress(addresses[0])) }}>
                    <Icon icon="heart" solid fixedWidth title={t('my_addresses.unstar')} />
                  </a>
                ) : (
                  <a href="#" onClick={e => { e.preventDefault(); dispatch(addAddress(addresses[0])) }}>
                    <Icon icon="heart" regular fixedWidth title={t('my_addresses.star')} />
                  </a>
                )}
              </span>
            )}
          </h3>
        </div>
        <div className="card-body info-table">
          <div className="columns">
            <div className="column info-title">{t('address.address')}</div>
            <div className="column info-value">
              {addresses.map(addr => <div key={addr}><AddressLink address={addr} plain={addresses.length === 1} /></div>)}
            </div>
          </div>
          <div className="columns">
            <div className="column info-title">{t('address.balance')}</div>
            <div className="column info-value monospace">
              {formatRunebase(data.balance)} RUNES
              {data.unconfirmed !== '0' && <span> ({formatRunebase(data.unconfirmed)} RUNES {t('address.unconfirmed')})</span>}
              {data.staking !== '0' && <span> ({formatRunebase(data.staking)} RUNES {t('address.staking')})</span>}
            </div>
          </div>
          {data.ranking > 0 && (
            <div className="columns">
              <div className="column info-title">{t('misc.ranking')}</div>
              <div className="column info-value">{data.ranking}</div>
            </div>
          )}
          <div className="columns">
            <div className="column info-title">{t('address.total_received')}</div>
            <div className="column info-value monospace">{formatRunebase(data.totalReceived)} RUNES</div>
          </div>
          <div className="columns">
            <div className="column info-title">{t('address.total_sent')}</div>
            <div className="column info-value monospace">{formatRunebase(data.totalSent)} RUNES</div>
          </div>
          {existingTokenBalances.length > 0 && (
            <div className="columns">
              <div className="column info-title">{t('address.token_balances')}</div>
              <div className="column info-value">
                {existingTokenBalances.map(token => (
                  <div key={token.address} className="monospace">
                    {formatRrc20(token.balance, token.decimals)}{' '}
                    <AddressLink address={token.address}>{token.symbol || t('contract.token.tokens')}</AddressLink>
                  </div>
                ))}
              </div>
            </div>
          )}
          {data.blocksMined > 0 && (
            <div className="columns">
              <div className="column info-title">{t('address.blocks_mined')}</div>
              <div className="column info-value">{data.blocksMined}</div>
            </div>
          )}
          <div className="columns">
            <div className="column info-title">{t('address.transaction_count')}</div>
            <div className="column info-value">{data.transactionCount}</div>
          </div>
        </div>
      </div>

      {data.transactionCount > 0 && (
        <div className="tabs is-centered">
          <ul>
            <li className={location.pathname === `/address/${id}` || location.pathname === `/address/${id}/` ? 'is-active' : ''}>
              <Link to={`/address/${id}`}>{t('address.transaction_list')}</Link>
            </li>
            {data.totalReceived !== '0' && (
              <li className={location.pathname.includes('/balance') ? 'is-active' : ''}>
                <Link to={`/address/${id}/balance`}>{t('address.balance_changes')}</Link>
              </li>
            )}
            {(data.qrc20Balances || []).length > 0 && (
              <li className={location.pathname.includes('/token-balance') ? 'is-active' : ''}>
                <Link to={`/address/${id}/token-balance`}>{t('address.token_balance_changes')}</Link>
              </li>
            )}
          </ul>
        </div>
      )}
      <Outlet context={{ tokens: (data.qrc20Balances || []).map(({ address, name, symbol }) => ({ address, name, symbol })) }} />
    </section>
  )
}
