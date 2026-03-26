import React, { lazy, Suspense, useEffect } from 'react'
import { Routes, Route } from 'react-router'
import { useDispatch } from 'react-redux'
import Layout from './components/Layout'
import { setHeight } from './store/blockchainSlice'
import { useWebSocket } from './hooks/useWebSocket'
import { useLazyGetInfoQuery } from './store/api'
import Container from '@mui/material/Container'
import LinearProgress from '@mui/material/LinearProgress'

// Lazy-loaded page components
const Home = lazy(() => import('./pages/Home'))
const BlockList = lazy(() => import('./pages/block/BlockList'))
const BlockDetail = lazy(() => import('./pages/block/BlockDetail'))
const AddressDetail = lazy(() => import('./pages/address/AddressDetail'))
const AddressTransactions = lazy(() => import('./pages/address/AddressTransactions'))
const AddressBalance = lazy(() => import('./pages/address/AddressBalance'))
const AddressTokenBalance = lazy(() => import('./pages/address/AddressTokenBalance'))
const TxDetail = lazy(() => import('./pages/tx/TxDetail'))
const ContractDetail = lazy(() => import('./pages/contract/ContractDetail'))
const ContractTransactions = lazy(() => import('./pages/contract/ContractTransactions'))
const ContractRichList = lazy(() => import('./pages/contract/ContractRichList'))
const TokenList = lazy(() => import('./pages/contract/TokenList'))
const MiscLayout = lazy(() => import('./pages/misc/Misc'))
const Charts = lazy(() => import('./pages/misc/Charts'))
const RichList = lazy(() => import('./pages/misc/RichList'))
const BiggestMiners = lazy(() => import('./pages/misc/BiggestMiners'))
const StakeCalculator = lazy(() => import('./pages/misc/StakeCalculator'))
const RawTx = lazy(() => import('./pages/misc/RawTx'))
const NotFound = lazy(() => import('./pages/NotFound'))

function SuspenseFallback() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <LinearProgress />
    </Container>
  )
}

function AppInit() {
  const dispatch = useDispatch()
  const { subscribe, unsubscribe } = useWebSocket()
  const [triggerGetInfo] = useLazyGetInfoQuery()

  useEffect(() => {
    triggerGetInfo().unwrap().then(({ height }) => {
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
      <Suspense fallback={<SuspenseFallback />}>
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
      </Suspense>
    </>
  )
}
