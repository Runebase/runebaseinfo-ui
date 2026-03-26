# runebase-explorer-ui

An open-source blockchain explorer frontend for the Runebase network.

## Tech Stack

- **Vite** - Build tool and dev server
- **React 18** - UI framework (plain JavaScript)
- **Redux Toolkit** - State management
- **React Router v6** - Client-side routing
- **react-i18next** - Internationalization (English & Chinese)
- **Bulma** - CSS framework
- **ECharts 5** - Charts and data visualization
- **Socket.IO** - Real-time WebSocket updates
- **Axios** - HTTP client

## Prerequisites

- Node.js >= 18
- [runebase-explorer-api](https://github.com/runebase/runebase-explorer-api) running on port 7001

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:3000)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `RUNEBASE_EXPLORER_API_BASE_SERVER` | `http://localhost:7001` | Backend API URL (used by Vite proxy) |
| `RUNEBASE_NETWORK` | `mainnet` | Network: `mainnet` or `testnet` |

In development, all `/api/*` requests are proxied to the backend. WebSocket connects directly to the backend.

## Project Structure

```
src/
├── components/         # Shared UI components
│   └── links/          # AddressLink, BlockLink, TransactionLink
├── hooks/              # Custom React hooks
│   ├── useWebSocket    # Socket.IO context and subscriptions
│   ├── useResponsive   # Mobile/tablet breakpoint detection
│   └── useFromNow      # Relative time display
├── locales/            # i18n translations (en.yaml, zh.yaml)
├── models/             # API service classes
├── pages/              # Route page components
│   ├── address/        # Address detail and sub-pages
│   ├── block/          # Block list and detail
│   ├── contract/       # Contract detail, tokens, rich list
│   ├── misc/           # Charts, rich list, miners, staking calc
│   └── tx/             # Transaction detail
├── services/           # Axios API client
├── store/              # Redux Toolkit slices
├── styles/             # Global CSS
├── utils/              # Address validation, formatting, hashing
├── App.jsx             # Router configuration
├── main.jsx            # Entry point
└── i18n.js             # i18next setup
```

## Features

- Dashboard with network statistics and real-time updates
- Block explorer with date-based browsing
- Address lookup with balance history and token balances
- Transaction detail with contract call decoding
- QRC20/QRC721 token list and holder distribution
- Smart contract viewer
- Network charts (daily transactions, block intervals, address growth)
- Staking calculator
- Raw transaction broadcaster
- Saved address book with desktop notifications
- Responsive design (mobile/tablet/desktop)

## License

[MIT](LICENSE)
