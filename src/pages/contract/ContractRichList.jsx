import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams, useOutletContext } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { formatRrc20 } from '@/utils/format'
import Contract from '@/models/contract'
import Pagination from '@/components/Pagination'
import AddressLink from '@/components/links/AddressLink'

export default function ContractRichList() {
  const { t } = useTranslation()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const { qrc20 } = useOutletContext() || {}
  const [totalCount, setTotalCount] = useState(0)
  const [list, setList] = useState([])
  const currentPage = Number(searchParams.get('page') || 1)
  const pages = Math.ceil(totalCount / 100)

  useEffect(() => {
    Contract.richList(id, { page: currentPage - 1, pageSize: 100 }).then(({ totalCount: tc, list: l }) => {
      setTotalCount(tc); setList(l)
    }).catch(() => {})
  }, [id, currentPage])

  function getLink(page) { return `/contract/${id}/rich-list?page=${page}` }

  if (!qrc20) return null

  return (
    <div>
      {pages > 1 && <Pagination pages={pages} currentPage={currentPage} getLink={getLink} />}
      <table className="table is-fullwidth is-bordered is-striped">
        <thead>
          <tr>
            <th>{t('misc.ranking')}</th>
            <th>{t('misc.address')}</th>
            <th>{t('misc.balance')}</th>
            <th>{t('misc.percentage')}</th>
          </tr>
        </thead>
        <tbody>
          {list.map(({ address, balance }, index) => (
            <tr key={address}>
              <td>{100 * (currentPage - 1) + index + 1}</td>
              <td><AddressLink address={address} /></td>
              <td className="monospace break-word">{formatRrc20(balance, qrc20.decimals)} {qrc20.symbol}</td>
              <td className="monospace">{(Number(balance) / Number(qrc20.totalSupply) * 100).toFixed(4)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
      {pages > 1 && <Pagination pages={pages} currentPage={currentPage} getLink={getLink} />}
    </div>
  )
}
