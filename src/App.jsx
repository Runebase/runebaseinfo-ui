import React, { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import Layout from './components/Layout'
import Home from './pages/Home'
import BlockList from './pages/block/BlockList'
import BlockDetail from './pages/block/BlockDetail'
import AddressDetail from './pages/address/AddressDetail'
import AddressTransactions from './pages/address/AddressTransactions'
import AddressBalance from './pages/address/AddressBalance'
import AddressTokenBalance from './pages/address/AddressTokenBalance'
import TxDetail from './pages/tx/TxDetail'
import ContractDetail from './pages/contract/ContractDetail'
import ContractTransactions from './pages/contract/ContractTransactions'
import ContractRichList from './pages/contract/ContractRichList'
import TokenList from './pages/contract/TokenList'
import MiscLayout from './pages/misc/Misc'
import Charts from './pages/misc/Charts'
import RichList from './pages/misc/RichList'
import BiggestMiners from './pages/misc/BiggestMiners'
import StakeCalculator from './pages/misc/StakeCalculator'
import RawTx from './pages/misc/RawTx'
import NotFound from './pages/NotFound'
import { setHeight } from './store/blockchainSlice'
import { useWebSocket } from './hooks/useWebSocket'
import MiscModel from './models/misc'

function AppInit() {
  const dispatch = useDispatch()
  const { subscribe, unsubscribe } = useWebSocket()

  useEffect(() => {
    MiscModel.info().then(({ height }) => {
      if (height) dispatch(setHeight(height))
    }).catch(() => {})

    const onTip = (data) => dispatch(setHeight(data.height))
    subscribe('blockchain', 'tip', onTip)
    subscribe('blockchain', 'reorg', onTip)
    return () => {
      unsubscribe('blockchain', 'tip', onTip)
      unsubscribe('blockchain', 'reorg', onTip)
    }
  }, [])

  return null
}

export default function App() {
  return (
    <>
      <AppInit />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="block" element={<BlockList />} />
          <Route path="block/:id" element={<BlockDetail />} />
          <Route path="address/:id" element={<AddressDetail />}>
            <Route index element={<AddressTransactions />} />
            <Route path="balance" element={<AddressBalance />} />
            <Route path="token-balance" element={<AddressTokenBalance />} />
          </Route>
          <Route path="tx/:id" element={<TxDetail />} />
          <Route path="contract/tokens" element={<TokenList />} />
          <Route path="contract/:id" element={<ContractDetail />}>
            <Route index element={<ContractTransactions />} />
            <Route path="rich-list" element={<ContractRichList />} />
          </Route>
          <Route path="misc" element={<MiscLayout />}>
            <Route index element={<Charts />} />
            <Route path="charts" element={<Charts />} />
            <Route path="rich-list" element={<RichList />} />
            <Route path="biggest-miners" element={<BiggestMiners />} />
            <Route path="stake-calculator" element={<StakeCalculator />} />
            <Route path="raw-tx" element={<RawTx />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  )
}
