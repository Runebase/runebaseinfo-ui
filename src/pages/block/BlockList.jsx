import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { formatRunebase, formatTimestamp } from '@/utils/format'
import BlockModel from '@/models/block'
import BlockLink from '@/components/links/BlockLink'
import AddressLink from '@/components/links/AddressLink'

function formatUTCTimestamp(date) {
  let yyyy = date.getUTCFullYear().toString()
  let mm = (date.getUTCMonth() + 1).toString().padStart(2, '0')
  let dd = date.getUTCDate().toString().padStart(2, '0')
  return yyyy + '-' + mm + '-' + dd
}

export default function BlockList() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const blockchain = useSelector(state => state.blockchain)
  const [list, setList] = useState([])
  const [date, setDate] = useState(searchParams.get('date') || formatUTCTimestamp(new Date()))

  useEffect(() => {
    document.title = t('block.list.block_list') + ' - explorer.runebase.io'
    const queryDate = searchParams.get('date')
    const d = queryDate ? new Date(queryDate) : new Date()
    setDate(formatUTCTimestamp(d))
    BlockModel.getBlocksByDate(d).then(setList).catch(() => {})
  }, [searchParams.get('date')])

  useEffect(() => {
    if (blockchain.height && list.length) {
      BlockModel.get(blockchain.height).then(block => {
        const todayTimestamp = Date.parse(date + 'T00:00:00') / 1000
        if (block.timestamp >= todayTimestamp && block.timestamp < todayTimestamp + 86400) {
          setList(prev => [{
            hash: block.hash, height: block.height, timestamp: block.timestamp,
            interval: block.interval, size: block.size,
            transactionCount: block.transactions.length,
            miner: block.miner, reward: block.reward
          }, ...prev])
        }
      }).catch(() => {})
    }
  }, [blockchain.height])

  function submit(e) {
    e.preventDefault()
    const d = new Date(date)
    if (d.toString() === 'Invalid Date') return
    if (d.getTime() < Date.parse('2017-09-06')) return
    if (d.getTime() >= Date.now() + 86400000) return
    navigate(`/block?date=${formatUTCTimestamp(d)}`)
  }

  return (
    <section className="container">
      <form onSubmit={submit} style={{ display: 'flex' }}>
        <div style={{ display: 'flex', margin: '0 auto' }}>
          <input type="date" className="input" value={date} onChange={e => setDate(e.target.value)} style={{ width: '11em' }} />
          <button type="submit" className="button is-runebase" style={{ marginLeft: '0.5em' }}>{t('action.go')}</button>
        </div>
      </form>
      <table className="table is-fullwidth is-bordered is-striped" style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
        <thead>
          <tr>
            <th>{t('block.list.height')}</th>
            <th>{t('block.list.time')}</th>
            <th className="is-hidden-touch">{t('block.list.reward')}</th>
            <th className="is-hidden-touch">{t('block.list.mined_by')}</th>
            <th className="is-hidden-touch">{t('block.list.size')}</th>
            <th>{t('block.list.transactions')}</th>
          </tr>
        </thead>
        <tbody>
          {list.map(block => (
            <tr key={block.height}>
              <td><BlockLink block={block.height} clipboard={false} /></td>
              <td>{formatTimestamp(block.timestamp)}</td>
              <td className="is-hidden-touch monospace">{formatRunebase(block.reward, 8)} RUNES</td>
              <td className="is-hidden-touch"><AddressLink address={block.miner} /></td>
              <td className="is-hidden-touch monospace">{block.size.toLocaleString()}</td>
              <td>{block.transactionCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
