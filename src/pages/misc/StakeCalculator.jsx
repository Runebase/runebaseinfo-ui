import React, { useState, useEffect } from 'react'
import BigNumber from 'bignumber.js'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { useLazyGetInfoQuery, useLazyGetAddressQuery } from '@/store/api'
import { useWebSocket } from '@/hooks/useWebSocket'
import { formatRunebase } from '@/utils/format'
import { toHexAddress } from '@/utils/address'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { monoFontFamily } from '../../theme'

export default function StakeCalculator() {
  const { t } = useTranslation()
  const blockchain = useSelector(state => state.blockchain)
  const { subscribe, unsubscribe } = useWebSocket()
  const [netStakeWeight, setNetStakeWeight] = useState(0)
  const [address, setAddress] = useState('')
  const [weightInput, setWeightInput] = useState('')

  const [triggerGetInfo] = useLazyGetInfoQuery()
  const [triggerGetAddress] = useLazyGetAddressQuery()

  useEffect(() => {
    document.title = t('misc.stake_calculator.title') + ' - RuneBase Explorer'
    triggerGetInfo().unwrap().then(({ netStakeWeight: w }) => setNetStakeWeight(w)).catch(() => {})

    const onWeight = (w) => setNetStakeWeight(w)
    subscribe('blockchain', 'stakeweight', onWeight)
    return () => unsubscribe('blockchain', 'stakeweight', onWeight)
  }, [])

  useEffect(() => {
    if (!address) return
    const addresses = address.split(',')
    try {
      if (addresses.every(toHexAddress)) {
        triggerGetAddress(address).unwrap().then(({ balance }) => {
          setWeightInput(new BigNumber(balance).dividedBy(1e8).toFixed(8))
        }).catch(() => {})
      }
    } catch (err) {}
  }, [address])

  const weight = new BigNumber(weightInput.replace(',', '')).times(1e8).integerValue().toNumber() || 0
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
    <Box component="form" onSubmit={e => e.preventDefault()}>
      <Stack spacing={2}>
        <Box>
          <Typography variant="body2" fontWeight="bold" gutterBottom>{t('blockchain.network_weight')}</Typography>
          <Typography variant="body1" sx={{ fontFamily: monoFontFamily }}>{formatRunebase(netStakeWeight, 8)}</Typography>
        </Box>
        <TextField
          label={t('misc.stake_calculator.enter_address')}
          value={address}
          onChange={e => setAddress(e.target.value)}
          fullWidth
          size="small"
          slotProps={{ input: { sx: { fontFamily: monoFontFamily } } }}
        />
        <TextField
          label={t('misc.stake_calculator.weight')}
          type="number"
          value={weightInput}
          onChange={e => setWeightInput(e.target.value)}
          placeholder="0"
          fullWidth
          size="small"
          slotProps={{ input: { sx: { fontFamily: monoFontFamily } } }}
        />
        {weight > 0 && (
          <>
            <Box>
              <Typography variant="body2" fontWeight="bold" gutterBottom>{t('misc.stake_calculator.expected_time')}</Typography>
              <Typography variant="body1">{interval}</Typography>
            </Box>
            {expectedTime < 100000 && (
              <Box>
                <Typography variant="body2" fontWeight="bold" gutterBottom>{t('misc.stake_calculator.average_blocks_per_day')}</Typography>
                <Typography variant="body1">{(86400 / expectedTime).toFixed(2)}</Typography>
              </Box>
            )}
            <Box>
              <Typography variant="body2" fontWeight="bold" gutterBottom>{t('misc.stake_calculator.average_blocks_per_year')}</Typography>
              <Typography variant="body1">{(365 * 86400 / expectedTime).toFixed(2)}</Typography>
            </Box>
          </>
        )}
        <Box>
          <Typography variant="body2" fontWeight="bold" gutterBottom>{t('misc.stake_calculator.yearly_roi')}</Typography>
          <Typography variant="body1" sx={{ fontFamily: monoFontFamily }}>
            {netStakeWeight ? new BigNumber(reward).times(365).times(675).dividedBy(netStakeWeight).times(100).toFixed(2) : 0}%
          </Typography>
        </Box>
      </Stack>
    </Box>
  )
}
