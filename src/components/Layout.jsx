import React, { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Nav from './Nav'
import Breadcrumb from './Breadcrumb'
import MyAddresses from './MyAddresses'

export default function Layout() {
  const location = useLocation()

  useEffect(() => {
    if (navigator.serviceWorker) {
      navigator.serviceWorker.register('/service-worker.js').then(registration => {
        registration.update()
        const interval = setInterval(() => registration.update(), 3600 * 1000)
        return () => clearInterval(interval)
      })
    }
    if (window.Notification) {
      Notification.requestPermission()
    }
  }, [])

  return (
    <div id="app" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div>
        <header className="container">
          <Nav />
        </header>
      </div>
      <div className="background" style={{ position: 'relative', flex: 1, padding: '0.5rem 0 1rem', backgroundColor: '#f5f6f8' }}>
        <div className="container">
          {location.pathname !== '/' && <Breadcrumb />}
        </div>
        <Outlet />
      </div>
      <MyAddresses />
    </div>
  )
}
