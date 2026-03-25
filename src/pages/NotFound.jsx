import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div style={{
      position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,
      display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'
    }}>
      <p className="is-size-3">Page Not Found</p>
      <br />
      <Link to="/" className="button is-runebase is-size-5">Back to Home Page</Link>
    </div>
  )
}
