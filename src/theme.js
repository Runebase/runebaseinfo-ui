import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    primary: {
      main: '#712074',
      light: '#9a4d9d',
      dark: '#5a1a5c',
      contrastText: '#fff',
    },
    background: {
      default: '#f5f6f8',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Helvetica',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
    ].join(','),
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          marginBottom: '1rem',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 'bold',
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#f5f6f8',
        },
      },
    },
  },
})
