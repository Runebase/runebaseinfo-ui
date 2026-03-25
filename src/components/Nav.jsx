import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { get as runebaseinfoGet } from '@/services/runebaseinfo-api'
import Icon from './Icon'

export default function Nav() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)
  const [searchString, setSearchString] = useState('')
  const [searching, setSearching] = useState(false)

  async function search(e) {
    e.preventDefault()
    let query = searchString.trim()
    if (!query || searching) return
    setSearching(true)
    try {
      let { type, address } = await runebaseinfoGet('/search', { params: { query } })
      switch (type) {
        case 'address':
          setSearchString('')
          navigate(`/address/${query}`)
          break
        case 'block':
          setSearchString('')
          navigate(`/block/${query}`)
          break
        case 'contract':
          setSearchString('')
          navigate(`/contract/${address || query}`)
          break
        case 'transaction':
          setSearchString('')
          navigate(`/tx/${query}`)
          break
      }
    } catch (err) {}
    setShowMenu(false)
    setSearching(false)
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand is-size-4">
        <Link to="/" className="navbar-item navbar-logo">
          <span className="runebase-icon runebase-icon--runebase" /> explorer.runebase.io
        </Link>
        <button type="button" className="button navbar-burger" onClick={() => setShowMenu(!showMenu)}>
          <span></span><span></span><span></span>
        </button>
      </div>
      <div className={`navbar-menu ${showMenu ? 'is-active' : ''}`}>
        <div className="navbar-start is-uppercase">
          <Link to="/block" className="navbar-item" onClick={() => setShowMenu(false)}>
            {t('blockchain.block_plural')}
          </Link>
          <Link to="/contract/tokens" className="navbar-item" onClick={() => setShowMenu(false)}>
            {t('blockchain.token')}
          </Link>
          <div className="navbar-item has-dropdown is-hoverable">
            <Link to="/misc/charts" className="navbar-link">{t('misc.misc')}</Link>
            <div className="navbar-dropdown is-boxed">
              <Link to="/misc/charts" className="navbar-item" onClick={() => setShowMenu(false)}>
                {t('misc.charts_title')}
              </Link>
              <Link to="/misc/rich-list" className="navbar-item" onClick={() => setShowMenu(false)}>
                {t('misc.rich_list_title')}
              </Link>
              <Link to="/misc/biggest-miners" className="navbar-item" onClick={() => setShowMenu(false)}>
                {t('misc.biggest_miners_title')}
              </Link>
              <Link to="/misc/stake-calculator" className="navbar-item" onClick={() => setShowMenu(false)}>
                {t('misc.stake_calculator.title')}
              </Link>
              <Link to="/misc/raw-tx" className="navbar-item" onClick={() => setShowMenu(false)}>
                Send Raw Transaction
              </Link>
            </div>
          </div>
        </div>
        <form className="navbar-end" onSubmit={search} style={{ flex: 'auto', alignItems: 'center' }}>
          <div className="navbar-item" style={{ flex: 'auto', position: 'relative' }}>
            <input
              type="text"
              className="input"
              value={searchString}
              onChange={e => setSearchString(e.target.value)}
              placeholder={t('nav.search')}
              style={{ paddingRight: '3em' }}
            />
            <button
              type="submit"
              className={`button is-runebase ${searching ? 'is-loading' : ''}`}
              style={{ position: 'absolute', top: '0.5em', right: 0 }}
            >
              <Icon icon="search" />
            </button>
          </div>
        </form>
      </div>
    </nav>
  )
}
