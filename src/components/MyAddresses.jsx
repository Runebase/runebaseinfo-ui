import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { removeAddress, addAddress } from '@/store/addressSlice'
import { useWebSocket } from '@/hooks/useWebSocket'
import { formatRunebase } from '@/utils/format'
import AddressModel from '@/models/address'
import Icon from './Icon'
import AddressLink from './links/AddressLink'

export default function MyAddresses() {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const addresses = useSelector(state => state.address.myAddresses)
  const { subscribe, unsubscribe } = useWebSocket()
  const [list, setList] = useState([])
  const [show, setShow] = useState(false)
  const elRef = useRef(null)
  const onTransactionRef = useRef(null)

  const totalBalance = list.reduce((sum, item) => {
    return sum + BigInt(item.balance || '0')
  }, BigInt(0)).toString()

  const onTransaction = useCallback(async ({ address, id }) => {
    if (list.every(item => item.address !== address)) return
    if (window.Notification && Notification.permission === 'granted') {
      const title = t('notification.new_transaction_received')
      const options = { body: id, tag: 'transaction/' + id }
      if (navigator.serviceWorker) {
        const registration = await navigator.serviceWorker.ready
        registration.showNotification(title, options)
      } else {
        const notification = new Notification(title, options)
        notification.addEventListener('click', event => {
          event.preventDefault()
          window.open('/tx/' + id)
        })
      }
    }
  }, [list, t])

  onTransactionRef.current = onTransaction

  useEffect(() => {
    const handler = (...args) => onTransactionRef.current(...args)
    const newList = addresses.map(address => ({ address, balance: '0' }))
    setList(newList)
    for (let item of newList) {
      subscribe('address/' + item.address, 'address/transaction', handler)
      AddressModel.getBalance(item.address).then(
        balance => setList(prev => prev.map(p => p.address === item.address ? { ...p, balance: String(balance) } : p)),
        () => {}
      )
    }
    return () => {
      for (let addr of addresses) {
        unsubscribe('address/' + addr, 'address/transaction', handler)
      }
    }
  }, [addresses.join(',')])

  useEffect(() => {
    function clickOutside(event) {
      if (elRef.current && !elRef.current.contains(event.target)) {
        setShow(false)
      }
    }
    document.body.addEventListener('click', clickOutside)
    return () => document.body.removeEventListener('click', clickOutside)
  }, [])

  if (!addresses.length) return null

  return (
    <div ref={elRef} style={{
      position: 'fixed', zIndex: 100, bottom: '2em', right: '2em'
    }}>
      <button className="button is-runebase" onClick={() => setShow(!show)}>
        <Icon icon="address-book" regular />
      </button>
      {show && (
        <table style={{
          position: 'absolute', bottom: 'calc(100% + 0.5rem)', right: 0,
          width: 'max-content', maxWidth: '90vw',
          border: '1px solid #666', backgroundColor: 'white'
        }}>
          <tbody>
            {list.map(({ address, balance }) => (
              <tr key={address}>
                <td style={{ padding: '2px' }}>
                  <AddressLink address={address} onClick={() => setShow(false)} />
                </td>
                <td className="monospace has-text-right" style={{ padding: '2px' }}>{formatRunebase(balance, 8)}</td>
                <td style={{ padding: '2px' }}>
                  <Icon icon="trash" onClick={() => dispatch(removeAddress(address))} style={{ cursor: 'pointer' }} />
                </td>
              </tr>
            ))}
          </tbody>
          {addresses.length > 1 && (
            <tfoot>
              <tr>
                <td style={{ padding: '2px' }}>
                  <AddressLink address={list.map(item => item.address).join(',')} clipboard={false} onClick={() => setShow(false)}>
                    {t('my_addresses.summary')}
                  </AddressLink>
                </td>
                <td className="monospace has-text-right" style={{ padding: '2px' }}>{formatRunebase(totalBalance, 8)}</td>
                <td></td>
              </tr>
            </tfoot>
          )}
        </table>
      )}
    </div>
  )
}
