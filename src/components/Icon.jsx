import React from 'react'

export default function Icon({
  icon, solid = false, regular = false, light = false, brands = false,
  fixedWidth = false, tag: Tag = 'span', className = '', onClick, title, style
}) {
  let prefix = 'fas'
  if (solid) prefix = 'fas'
  else if (regular) prefix = 'far'
  else if (light) prefix = 'fal'
  else if (brands) prefix = 'fab'

  const classes = [
    prefix,
    ...icon.split(' ').map(s => 'fa-' + s),
    fixedWidth ? 'fa-fw' : '',
    className
  ].filter(Boolean).join(' ')

  return <Tag className={classes} onClick={onClick} title={title} style={style} />
}
