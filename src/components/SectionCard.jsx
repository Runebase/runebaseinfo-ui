import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Avatar from '@mui/material/Avatar'

export default function SectionCard({ icon, title, action, children, sx, ...props }) {
  return (
    <Card sx={{ mx: { xs: 0, md: '0.75em' }, my: '0.5em', ...sx }} {...props}>
      {(title || icon) && (
        <CardHeader
          avatar={icon ? (
            <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
              {icon}
            </Avatar>
          ) : undefined}
          title={title}
          titleTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold' }}
          action={action}
          sx={{ pb: 0 }}
        />
      )}
      <CardContent>
        {children}
      </CardContent>
    </Card>
  )
}
