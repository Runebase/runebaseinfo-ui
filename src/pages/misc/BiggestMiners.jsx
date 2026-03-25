import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { formatRunebase } from '@/utils/format'
import MiscModel from '@/models/misc'
import Pagination from '@/components/Pagination'
import AddressLink from '@/components/links/AddressLink'

export default function BiggestMiners() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const blockchain = useSelector(state => state.blockchain)
  const [totalCount, setTotalCount] = useState(0)
  const [list, setList] = useState([])
  const currentPage = Number(searchParams.get('page') || 1)
  const pages = Math.ceil(totalCount / 100)
  const posBlocks = blockchain.height - 5000

  useEffect(() => {
    document.title = t('misc.biggest_miners_title') + ' - explorer.runebase.io'
    MiscModel.biggestMiners({ from: (currentPage - 1) * 100, to: currentPage * 100 })
      .then(({ totalCount: tc, list: l }) => { setTotalCount(tc); setList(l) })
      .catch(() => {})
  }, [currentPage])

  function getLink(page) { return `/misc/biggest-miners?page=${page}` }

  return (
    <section className="container">
      {pages > 1 && <Pagination pages={pages} currentPage={currentPage} getLink={getLink} />}
      <table className="table is-fullwidth is-bordered is-striped" style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
        <thead>
          <tr>
            <th>{t('misc.ranking')}</th>
            <th>{t('misc.address')}</th>
            <th>{t('misc.blocks_mined')}</th>
            <th>{t('misc.percentage')}</th>
            <th className="is-hidden-touch">{t('misc.balance')}</th>
          </tr>
        </thead>
        <tbody>
          {list.map(({ address, blocks, balance }, index) => (
            <tr key={address}>
              <td>{100 * (currentPage - 1) + index + 1}</td>
              <td><AddressLink address={address} /></td>
              <td>{blocks}</td>
              <td className="monospace">{(blocks / posBlocks * 100).toFixed(4)}%</td>
              <td className="monospace is-hidden-touch">{formatRunebase(balance, 8)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {pages > 1 && <Pagination pages={pages} currentPage={currentPage} getLink={getLink} />}
    </section>
  )
}
