import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useResponsive } from '@/hooks/useResponsive'
import { formatRunebase, formatTimestamp } from '@/utils/format'
import Address from '@/models/address'
import Pagination from '@/components/Pagination'
import TransactionLink from '@/components/links/TransactionLink'

export default function AddressBalance() {
  const { t } = useTranslation()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const { isTablet } = useResponsive()
  const [totalCount, setTotalCount] = useState(0)
  const [transactions, setTransactions] = useState([])
  const currentPage = Number(searchParams.get('page') || 1)
  const pages = Math.ceil(totalCount / 100)

  useEffect(() => {
    Address.getBalanceTransactions(id, { page: currentPage - 1, pageSize: 100 })
      .then(({ totalCount: tc, transactions: txs }) => { setTotalCount(tc); setTransactions(txs) })
      .catch(() => {})
  }, [id, currentPage])

  function getLink(page) { return `/address/${id}/balance?page=${page}` }

  return (
    <div>
      {pages > 1 && <Pagination pages={pages} currentPage={currentPage} getLink={getLink} />}
      <table className="table is-fullwidth is-bordered is-striped">
        <thead>
          <tr>
            <th>{t('address.timestamp')}</th>
            <th>{t('address.transaction_id')}</th>
            {isTablet && <th>{t('address.balance')}</th>}
            {isTablet && <th>{t('address.changes')}</th>}
          </tr>
          {!isTablet && (
            <tr>
              <th>{t('address.balance')}</th>
              <th>{t('address.changes')}</th>
            </tr>
          )}
        </thead>
        <tbody>
          {transactions.map(tx => isTablet ? (
            <tr key={tx.id}>
              <td>{tx.timestamp ? formatTimestamp(tx.timestamp) : t('transaction.mempool')}</td>
              <td><TransactionLink transaction={tx.id} /></td>
              <td className="monospace">{formatRunebase(tx.balance, 8)} RUNES</td>
              <td className="monospace">
                {tx.amount > 0 ? '+' : tx.amount < 0 ? '-' : '\u00a0'}
                {formatRunebase(Math.abs(tx.amount), 8)} RUNES
              </td>
            </tr>
          ) : (
            <React.Fragment key={tx.id}>
              <tr>
                <td>{tx.timestamp ? formatTimestamp(tx.timestamp) : t('transaction.mempool')}</td>
                <td><TransactionLink transaction={tx.id} /></td>
              </tr>
              <tr>
                <td className="monospace">{formatRunebase(tx.balance, 8)} RUNES</td>
                <td className="monospace">
                  {tx.amount > 0 ? '+' : tx.amount < 0 ? '-' : '\u00a0'}
                  {formatRunebase(Math.abs(tx.amount), 8)} RUNES
                </td>
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>
      {pages > 1 && <Pagination pages={pages} currentPage={currentPage} getLink={getLink} />}
    </div>
  )
}
