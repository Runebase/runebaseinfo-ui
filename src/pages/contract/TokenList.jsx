import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { formatRrc20 } from '@/utils/format'
import Contract from '@/models/contract'
import Pagination from '@/components/Pagination'
import AddressLink from '@/components/links/AddressLink'

export default function TokenList() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const [totalCount, setTotalCount] = useState(0)
  const [tokens, setTokens] = useState([])
  const currentPage = Number(searchParams.get('page') || 1)
  const pages = Math.ceil(totalCount / 20)

  useEffect(() => {
    document.title = t('contract.token.tokens') + ' - explorer.runebase.io'
    Contract.listTokens({ page: currentPage - 1, pageSize: 20 }).then(({ totalCount: tc, tokens: toks }) => {
      setTotalCount(tc); setTokens(toks)
    }).catch(() => {})
  }, [currentPage])

  function getLink(page) { return `/contract/tokens?page=${page}` }

  return (
    <section className="container">
      {pages > 1 && <Pagination pages={pages} currentPage={currentPage} getLink={getLink} />}
      <table className="table is-fullwidth is-bordered is-striped" style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
        <thead>
          <tr>
            <th>{t('misc.ranking')}</th>
            <th>{t('contract.token.name')}</th>
            <th>{t('contract.token.total_supply')}</th>
            <th>{t('contract.token.token_transactions')}</th>
            <th className="is-hidden-touch">{t('contract.token.token_holders')}</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((token, index) => (
            <tr key={token.address}>
              <td>{20 * (currentPage - 1) + index + 1}</td>
              <td><AddressLink address={token.address}>{token.name}</AddressLink></td>
              <td className="monospace break-word">
                {formatRrc20(token.totalSupply, token.decimals, true)} {token.symbol || token.name || t('contract.token.tokens')}
              </td>
              <td>{token.transactions}</td>
              <td className="is-hidden-touch">{token.holders}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {pages > 1 && <Pagination pages={pages} currentPage={currentPage} getLink={getLink} />}
    </section>
  )
}
