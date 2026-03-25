import React, { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useResponsive } from '@/hooks/useResponsive'

export default function Pagination({ pages, currentPage, getLink }) {
  const { t } = useTranslation()
  const { isTablet } = useResponsive()
  const navigate = useNavigate()
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef(null)

  function submit(e) {
    e.preventDefault()
    let input = inputValue.trim()
    if (/^[1-9]\d*$/.test(input)) {
      let page = parseInt(input)
      if (page <= pages && page !== currentPage) {
        navigate(getLink(page))
        setInputValue('')
      }
    }
  }

  function renderPageLink(page) {
    return (
      <li key={page}>
        <Link to={getLink(page)} className="pagination-link">{page}</Link>
      </li>
    )
  }

  const items = []

  if (isTablet) {
    if (currentPage > 3) items.push(renderPageLink(1))
    if (currentPage > 4) items.push(<li key="ellipsis-start"><span className="pagination-ellipsis">&hellip;</span></li>)
    if (currentPage > 2) items.push(renderPageLink(currentPage - 2))
  } else {
    if (currentPage > 2) items.push(renderPageLink(1))
    if (currentPage > 3) items.push(<li key="ellipsis-start"><span className="pagination-ellipsis">&hellip;</span></li>)
  }

  if (currentPage > 1) items.push(renderPageLink(currentPage - 1))
  items.push(
    <li key="current">
      <a href="#" className="pagination-link is-current" onClick={e => e.preventDefault()}>
        {currentPage}
      </a>
    </li>
  )
  if (currentPage < pages) items.push(renderPageLink(currentPage + 1))

  if (isTablet) {
    if (currentPage < pages - 1) items.push(renderPageLink(currentPage + 2))
    if (currentPage < pages - 3) items.push(<li key="ellipsis-end"><span className="pagination-ellipsis">&hellip;</span></li>)
    if (currentPage < pages - 2) items.push(renderPageLink(pages))
  } else {
    if (currentPage < pages - 2) items.push(<li key="ellipsis-end"><span className="pagination-ellipsis">&hellip;</span></li>)
    if (currentPage < pages - 1) items.push(renderPageLink(pages))
  }

  return (
    <nav className={`pagination is-centered ${isTablet ? '' : 'is-small'}`} style={{ padding: '1em' }}>
      <ul className="pagination-list">
        {items}
        <li>
          <form style={{ marginLeft: '2em', display: 'inline-flex', alignItems: 'center' }} onSubmit={submit}>
            <label className="label" style={{ display: 'inline-block', marginBottom: 0, marginRight: '0.5em' }}>
              {t('pagination.go_to')}
            </label>
            <div className="control" style={{ display: 'inline-block', width: isTablet ? '3.5em' : '3em', verticalAlign: 'middle' }}>
              <input
                ref={inputRef}
                type="text"
                className={`input has-text-centered ${isTablet ? '' : 'is-small'}`}
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
              />
            </div>
          </form>
        </li>
      </ul>
    </nav>
  )
}
