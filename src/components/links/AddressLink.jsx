import React from 'react'
import { Link } from 'react-router-dom'
import Clipboard from '../Clipboard'

export default function AddressLink({ address, plain = false, highlight = [], clipboard = true, children, onClick, className = '' }) {
  const highlights = Array.isArray(highlight) ? highlight : [highlight]
  const isHighlighted = highlights.includes(address)
  const display = children || address
  const linkTo = address.length === 40 ? `/contract/${address}` : `/address/${address}`

  return (
    <span className={`address-link ${className}`}>
      {plain || isHighlighted ? (
        <span className="break-word monospace">{display}</span>
      ) : (
        <Link to={linkTo} className="break-word monospace" onClick={onClick}>{display}</Link>
      )}
      {clipboard && <Clipboard string={address} />}
    </span>
  )
}
