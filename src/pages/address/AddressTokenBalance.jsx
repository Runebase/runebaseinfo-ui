import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate, useOutletContext } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useResponsive } from '@/hooks/useResponsive'
import { formatRrc20, formatTimestamp } from '@/utils/format'
import Address from '@/models/address'
import Pagination from '@/components/Pagination'
import TransactionLink from '@/components/links/TransactionLink'
import AddressLink from '@/components/links/AddressLink'

export default function AddressTokenBalance() {
  const { t } = useTranslation()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { isTablet } = useResponsive()
  const { tokens = [] } = useOutletContext() || {}
  const [totalCount, setTotalCount] = useState(0)
  const [transactions, setTransactions] = useState([])
  const [selectedToken, setSelectedToken] = useState(searchParams.get('token') || '')
  const currentPage = Number(searchParams.get('page') || 1)
  const pages = Math.ceil(totalCount / 100)

  useEffect(() => {
    Address.getTokenBalanceTransactions(id, { page: currentPage - 1, pageSize: 100, token: selectedToken || undefined })
      .then(({ totalCount: tc, transactions: txs }) => { setTotalCount(tc); setTransactions(txs) })
      .catch(() => {})
  }, [id, currentPage, selectedToken])

  function getLink(page) {
    let q = `page=${page}`
    if (selectedToken) q += `&token=${selectedToken}`
    return `/address/${id}/token-balance?${q}`
  }

  function onTokenChange(value) {
    setSelectedToken(value)
    navigate(`/address/${id}/token-balance${value ? `?token=${value}` : ''}`)
  }

  return (
    <div>
      <form style={{ display: 'flex', flexFlow: 'wrap', marginBottom: '1em' }} onSubmit={e => e.preventDefault()}>
        <label className="radio" style={{ marginRight: '1em' }}>
          <input type="radio" value="" checked={selectedToken === ''} onChange={() => onTokenChange('')} /> All
        </label>
        {tokens.map(token => (
          <label key={token.address} className="radio" style={{ marginRight: '1em' }}>
            <input type="radio" value={token.address} checked={selectedToken === token.address}
              onChange={() => onTokenChange(token.address)} />
            {' '}{token.name} ({token.symbol})
          </label>
        ))}
      </form>
      {pages > 1 && <Pagination pages={pages} currentPage={currentPage} getLink={getLink} />}
      <table className="table is-fullwidth is-bordered is-striped">
        <thead>
          <tr>
            <th>{t('address.timestamp')}</th>
            <th>{t('address.transaction_id')}</th>
            {isTablet && <th>{t('address.token_balances')}</th>}
            {isTablet && <th>{t('address.changes')}</th>}
          </tr>
        </thead>
        <tbody>
          {transactions.map(tx => (
            <tr key={tx.id}>
              <td>{formatTimestamp(tx.timestamp)}</td>
              <td><TransactionLink transaction={tx.id} /></td>
              {isTablet && (
                <td className="monospace">
                  {(tx.tokens || []).map((tok, i) => (
                    <div key={i}>
                      {formatRrc20((tok.balance || '').replace('-', ''), tok.decimals)}{' '}
                      <AddressLink address={tok.address}>{tok.symbol || tok.name || t('contract.token.tokens')}</AddressLink>
                    </div>
                  ))}
                </td>
              )}
              {isTablet && (
                <td className="monospace">
                  {(tx.tokens || []).map((tok, i) => (
                    <div key={i}>
                      {tok.amount > 0 ? '+' : tok.amount < 0 ? '-' : '\u00a0'}
                      {formatRrc20((tok.amount || '').toString().replace('-', ''), tok.decimals)}{' '}
                      <AddressLink address={tok.address}>{tok.symbol || tok.name || t('contract.token.tokens')}</AddressLink>
                    </div>
                  ))}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {pages > 1 && <Pagination pages={pages} currentPage={currentPage} getLink={getLink} />}
    </div>
  )
}
