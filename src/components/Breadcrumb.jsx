import React from 'react'
import { Link as RouterLink, useLocation, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import MuiBreadcrumbs from '@mui/material/Breadcrumbs'
import MuiLink from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import HomeIcon from '@mui/icons-material/Home'
import ViewInArIcon from '@mui/icons-material/ViewInAr'
import ContactMailIcon from '@mui/icons-material/ContactMail'
import ListAltIcon from '@mui/icons-material/ListAlt'
import CodeIcon from '@mui/icons-material/Code'
import ShowChartIcon from '@mui/icons-material/ShowChart'

const iconMap = {
  cubes: ViewInArIcon,
  'address-card': ContactMailIcon,
  'list-alt': ListAltIcon,
  code: CodeIcon,
  'chart-area': ShowChartIcon,
}

export default function Breadcrumb() {
  const { t } = useTranslation()
  const location = useLocation()
  const params = useParams()
  const path = location.pathname

  const crumbs = []

  if (path.startsWith('/block')) {
    crumbs.push({ to: '/block', icon: 'cubes', label: t('block.list.block_list') })
    if (params.id) {
      crumbs.push({ to: `/block/${params.id}`, icon: 'cubes', label: t('blockchain.block') + ' ' + params.id })
    }
  } else if (path.startsWith('/address')) {
    if (params.id) {
      crumbs.push({ to: `/address/${params.id}`, icon: 'address-card', label: t('blockchain.address') + ' ' + params.id })
    }
  } else if (path.startsWith('/tx')) {
    if (params.id) {
      crumbs.push({ to: `/tx/${params.id}`, icon: 'list-alt', label: t('blockchain.transaction') + ' ' + params.id })
    }
  } else if (path.startsWith('/contract/tokens')) {
    crumbs.push({ to: '/contract/tokens', label: t('contract.token.tokens') })
  } else if (path.startsWith('/contract')) {
    if (params.id) {
      crumbs.push({ to: `/contract/${params.id}`, icon: 'code', label: t('blockchain.contract') + ' ' + params.id })
    }
  } else if (path.startsWith('/misc')) {
    crumbs.push({ to: '/misc', icon: 'chart-area', label: t('blockchain.misc') })
  }

  return (
    <MuiBreadcrumbs sx={{ my: 1, ml: 1 }}>
      <MuiLink
        component={RouterLink}
        to="/"
        color="inherit"
        sx={{ display: 'flex', alignItems: 'center' }}
      >
        <HomeIcon fontSize="small" />
      </MuiLink>
      {crumbs.map((crumb, i) => {
        const IconComp = crumb.icon ? iconMap[crumb.icon] : null
        return (
          <MuiLink
            key={i}
            component={RouterLink}
            to={crumb.to}
            color="inherit"
            underline="hover"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              maxWidth: '15em',
              fontFamily: 'monospace',
            }}
          >
            {IconComp && <IconComp fontSize="small" />}
            <Typography
              variant="body2"
              noWrap
              component="span"
              sx={{ fontFamily: 'monospace' }}
            >
              {crumb.label}
            </Typography>
          </MuiLink>
        )
      })}
    </MuiBreadcrumbs>
  )
}
