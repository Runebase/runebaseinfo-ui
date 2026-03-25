import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { useWebSocket } from '@/hooks/useWebSocket'
import { formatRunebase } from '@/utils/format'
import { toHexAddress } from '@/utils/address'
import Address from '@/models/address'
import MiscModel from '@/models/misc'

export default function StakeCalculator() {
  const { t } = useTranslation()
  const blockchain = useSelector(state => state.blockchain)
  const { subscribe, unsubscribe } = useWebSocket()
  const [netStakeWeight, setNetStakeWeight] = useState(0)
  const [address, setAddress] = useState('')
  const [weightInput, setWeightInput] = useState('')

  useEffect(() => {
    document.title = t('misc.stake_calculator.title') + ' - explorer.runebase.io'
    MiscModel.info().then(({ netStakeWeight: w }) => setNetStakeWeight(w)).catch(() => {})

    const onWeight = (w) => setNetStakeWeight(w)
    subscribe('blockchain', 'stakeweight', onWeight)
    return () => unsubscribe('blockchain', 'stakeweight', onWeight)
  }, [])

  useEffect(() => {
    if (!address) return
    const addresses = address.split(',')
    try {
      if (addresses.every(toHexAddress)) {
        Address.get(address).then(({ balance }) => {
          setWeightInput((balance / 1e8).toFixed(8))
        }).catch(() => {})
      }
    } catch (err) {}
  }, [address])

  const weight = Math.round(Number(weightInput.replace(',', '')) * 1e8) || 0
  const n = 8
  const p = weight ? 1 - Math.exp(-weight / (n * netStakeWeight)) : 0
  const expectedTime = weight ? n * 16 * (1 / n - p * p) / (p - p * p) : 0

  let interval = ''
  if (expectedTime < 60) interval = expectedTime.toFixed(2) + ' ' + t('misc.stake_calculator.seconds')
  else if (expectedTime < 3600) interval = (expectedTime / 60).toFixed(2) + ' ' + t('misc.stake_calculator.minutes')
  else if (expectedTime < 86400) interval = (expectedTime / 3600).toFixed(2) + ' ' + t('misc.stake_calculator.hours')
  else if (expectedTime < 86400 * 30) interval = (expectedTime / 86400).toFixed(2) + ' ' + t('misc.stake_calculator.days')
  else if (expectedTime < 86400 * 360) interval = (expectedTime / 86400 / 30).toFixed(2) + ' ' + t('misc.stake_calculator.months')
  else interval = (expectedTime / 86400 / 365).toFixed(2) + ' ' + t('misc.stake_calculator.years')

  const reward = 100e8

  return (
    <form onSubmit={e => e.preventDefault()}>
      <div className="field">
        <label>{t('blockchain.network_weight')}</label>
        <div className="control"><output className="monospace">{formatRunebase(netStakeWeight, 8)}</output></div>
      </div>
      <div className="field">
        <label>{t('misc.stake_calculator.enter_address')}</label>
        <div className="control">
          <input type="text" className="input monospace" value={address} onChange={e => setAddress(e.target.value)} />
        </div>
      </div>
      <div className="field">
        <label>{t('misc.stake_calculator.weight')}</label>
        <div className="control">
          <input type="number" className="input monospace" value={weightInput} onChange={e => setWeightInput(e.target.value)} placeholder="0" />
        </div>
      </div>
      {weight > 0 && (
        <>
          <div className="field">
            <label>{t('misc.stake_calculator.expected_time')}</label>
            <div className="control"><output>{interval}</output></div>
          </div>
          {expectedTime < 100000 && (
            <div className="field">
              <label>{t('misc.stake_calculator.average_blocks_per_day')}</label>
              <div className="control"><output>{(86400 / expectedTime).toFixed(2)}</output></div>
            </div>
          )}
          <div className="field">
            <label>{t('misc.stake_calculator.average_blocks_per_year')}</label>
            <div className="control"><output>{(365 * 86400 / expectedTime).toFixed(2)}</output></div>
          </div>
        </>
      )}
      <div className="field">
        <label>{t('misc.stake_calculator.yearly_roi')}</label>
        <div className="control">
          <output className="monospace">{netStakeWeight ? (reward * 365 * 675 / netStakeWeight * 100).toFixed(2) : 0}%</output>
        </div>
      </div>
    </form>
  )
}
