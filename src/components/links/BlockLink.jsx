import React from 'react'
import { Link } from 'react-router-dom'
import Clipboard from '../Clipboard'

export default function BlockLink({ block, plain = false, clipboard = true, children }) {
  const display = children || block.toString()
  const clipboardStr = (clipboard === true ? block : clipboard).toString()

  return (
    <span className="block-link">
      {plain ? (
        <span className="break-word monospace">{display}</span>
      ) : (
        <Link to={`/block/${block}`} className="break-word monospace">{display}</Link>
      )}
      {clipboard && <Clipboard string={clipboardStr} />}
    </span>
  )
}
