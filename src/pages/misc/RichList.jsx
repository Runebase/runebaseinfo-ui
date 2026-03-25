import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { formatRunebase } from '@/utils/format'
import MiscModel from '@/models/misc'
import Pagination from '@/components/Pagination'
import AddressLink from '@/components/links/AddressLink'

export default function RichList() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const blockchain = useSelector(state => state.blockchain)
  const [totalCount, setTotalCount] = useState(0)
  const [list, setList] = useState([])
  const currentPage = Number(searchParams.get('page') || 1)
  const pages = Math.ceil(totalCount / 100)

  const totalSupply = (() => {
    const h = blockchain.height
    if (h <= 5000) return h * 8000
    let supply = 3.99999e15
    return supply + (h - 5000) * 100e8
  })()

  useEffect(() => {
    document.title = t('misc.rich_list_title') + ' - explorer.runebase.io'
    MiscModel.richList({ from: (currentPage - 1) * 100, to: currentPage * 100 })
      .then(({ totalCount: tc, list: l }) => { setTotalCount(tc); setList(l) })
      .catch(() => {})
  }, [currentPage])

  function getLink(page) { return `/misc/rich-list?page=${page}` }

  return (
    <section className="container">
      {pages > 1 && <Pagination pages={pages} currentPage={currentPage} getLink={getLink} />}
      <table className="table is-fullwidth is-bordered is-striped" style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
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
              <td className="monospace break-word">{formatRunebase(balance, 8)} RUNES</td>
              <td className="monospace">{(balance / totalSupply * 100).toFixed(4)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
      {pages > 1 && <Pagination pages={pages} currentPage={currentPage} getLink={getLink} />}
    </section>
  )
}
