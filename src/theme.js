import { createTheme } from '@mui/material/styles'

const sharedTypography = {
  fontFamily: [
    'Inter',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Helvetica',
    'Arial',
    'sans-serif',
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
  ].join(','),
}

export const monoFontFamily = [
  '"JetBrains Mono"',
  '"Fira Code"',
  '"Cascadia Code"',
  'Menlo',
  'Consolas',
  'monospace',
].join(',')

const sharedComponents = {
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
  MuiTableRow: {
    styleOverrides: {
      root: {
        transition: 'background-color 0.15s ease',
      },
    },
  },
}

export function createAppTheme(mode = 'light') {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#712074',
        light: '#9a4d9d',
        dark: '#5a1a5c',
        contrastText: '#fff',
      },
      ...(mode === 'light'
        ? {
            background: {
              default: '#f5f6f8',
              paper: '#fff',
            },
          }
        : {
            background: {
              default: '#121212',
              paper: '#1e1e1e',
            },
          }),
    },
    typography: sharedTypography,
    components: {
      ...sharedComponents,
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: mode === 'light' ? '#f5f6f8' : '#121212',
            transition: 'background-color 0.3s ease, color 0.3s ease',
          },
          '*:focus-visible': {
            outline: `2px solid ${mode === 'light' ? '#712074' : '#9a4d9d'}`,
            outlineOffset: '2px',
          },
        },
      },
    },
  })
}

// Default export for backwards compat
export const theme = createAppTheme('light')
