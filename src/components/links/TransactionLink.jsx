import React from 'react'
import { Link } from 'react-router-dom'
import Clipboard from '../Clipboard'

export default function TransactionLink({ transaction, plain = false, clipboard = true, children }) {
  const display = children || transaction.toString()
  const clipboardStr = (clipboard === true ? transaction : clipboard).toString()

  return (
    <span className="transaction-link">
      {plain ? (
        <span className="break-word monospace">{display}</span>
      ) : (
        <Link to={`/tx/${transaction}`} className="break-word monospace">{display}</Link>
      )}
      {clipboard && <Clipboard string={clipboardStr} />}
    </span>
  )
}
