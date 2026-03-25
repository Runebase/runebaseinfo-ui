import React from 'react'
import { useFromNow } from '@/hooks/useFromNow'

export default function FromNow({ timestamp, tag: Tag = 'span' }) {
  const text = useFromNow(timestamp)
  return <Tag>{text}</Tag>
}
