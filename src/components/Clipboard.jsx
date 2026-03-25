import React from 'react'
import { useTranslation } from 'react-i18next'
import Icon from './Icon'

export default function Clipboard({ string }) {
  const { t } = useTranslation()

  function copy() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(string)
    } else {
      let textarea = document.createElement('textarea')
      textarea.textContent = string
      textarea.style.position = 'fixed'
      document.body.appendChild(textarea)
      textarea.select()
      try { document.execCommand('copy') } finally { document.body.removeChild(textarea) }
    }
  }

  return (
    <Icon
      icon="clipboard"
      tag="a"
      className="clipboard"
      onClick={copy}
      title={t('action.copy')}
      style={{ cursor: 'pointer' }}
    />
  )
}
