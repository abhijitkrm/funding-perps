# fundingperps

A modern web application for tracking and comparing real-time funding rates across multiple decentralized exchanges (DEXs) for perpetual swaps.

## Overview

fundingperps provides traders and analysts with a comprehensive view of funding rates across four major decentralized exchanges: Hyperliquid, Lighter, Aster, and Extended. The platform aggregates data in real-time, allowing users to identify arbitrage opportunities and track funding rate trends across different timeframes.

## Key Features

### Multi-Exchange Support
Track funding rates from four decentralized exchanges simultaneously:
- Hyperliquid
- Lighter (zkSync-based)
- Aster
- Extended (Starknet-based)

### Real-Time Data
- Live funding rates with automatic updates
- Progressive data fetching for optimal performance
- 5-minute caching to reduce API load
- Rate limit handling for all exchanges

### Flexible Timeframes
View funding rates across multiple time periods:
- Current (hourly rate)
- 1 Day
- 7 Day
- 30 Day
- 1 Year

### Advanced Filtering
- Search functionality for specific assets
- Favorites system to track preferred trading pairs
- Highest/Lowest funding rate displays
- Sort and filter capabilities

### User Experience
- Dark mode support with theme toggle
- Responsive design for all screen sizes
- Clean, professional interface
- IBM Plex Sans typography
- Intuitive navigation

## Technology Stack

### Frontend
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **State Management**: Zustand
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Fonts**: IBM Plex Sans (500 weight)
- **Theme**: next-themes

### Backend
- **Runtime**: Node.js 22
- **API Routes**: Next.js API routes for CORS handling
- **Data Fetching**: Native fetch API with caching

## Getting Started

### Prerequisites

- Node.js 22 or higher
- npm, yarn, or pnpm package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd perp-funding
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
fundingperps/
├── app/
│   ├── api/                    # Next.js API routes
│   │   ├── aster/             # Aster proxy endpoint
│   │   └── extended/          # Extended proxy endpoints
│   ├── page.tsx               # Main application page
│   ├── layout.tsx             # Root layout with metadata
│   └── globals.css            # Global styles
├── components/
│   ├── ui/                    # shadcn/ui base components
│   ├── top-nav.tsx           # Top navigation bar
│   ├── funding-extremes.tsx  # Highest/Lowest rates tables
│   ├── header.tsx            # Timeframe tabs and filters
│   ├── funding-rates-table.tsx # Main data table
│   ├── theme-provider.tsx    # Theme context provider
│   └── theme-toggle.tsx      # Dark mode toggle button
├── lib/
│   ├── api/                   # Exchange API clients
│   │   ├── hyperliquid.ts
│   │   ├── lighter.ts
│   │   ├── aster.ts
│   │   └── extended.ts
│   ├── store/
│   │   └── funding-store.ts  # Zustand state management
│   └── utils.ts              # Utility functions
└── types/
    └── funding.ts            # TypeScript type definitions
```

## Exchange Integrations

### Hyperliquid
**Endpoint**: `https://api.hyperliquid.xyz/info`

Provides real-time funding rates and asset metadata for all perpetual markets. Data includes current funding rates, mark prices, and open interest.

### Lighter
**Endpoint**: `https://mainnet.zklighter.elliot.ai/api/v1/funding-rates`

zkSync-based perpetual exchange providing funding rates for various trading pairs. Direct API integration without proxy.

### Aster
**Endpoint**: `https://fapi.asterdex.com/fapi/v1/fundingRate`
**Proxy**: `/api/aster`

Funding rates for perpetual contracts. Uses Next.js API route to handle CORS restrictions.

### Extended
**Markets Endpoint**: `https://api.starknet.extended.exchange/api/v1/info/markets`
**Stats Endpoint**: `https://starknet.app.extended.exchange/api/v1/info/markets/{market}/stats`
**Proxies**: `/api/extended/markets` and `/api/extended/market-stats`

Starknet-based exchange with progressive data fetching to respect rate limits (1,000 requests per minute). Initial data loads from markets list, followed by individual market stats updates at 1 request per second.

## Data Management

### Caching Strategy
- All exchange data cached for 5 minutes in Zustand store
- Prevents redundant API calls
- Enables instant tab switching between timeframes
- Automatic cache invalidation after timeout

### Progressive Loading
Extended exchange implements progressive fetching:
1. Initial load fetches markets list with basic funding rates
2. Background process fetches detailed stats for each market
3. Updates display as new data arrives
4. Respects API rate limits with controlled intervals

### Rate Calculations
Funding rates are multiplied based on selected timeframe:
- Current/1 Day: 1x (hourly rate)
- 7 Day: 168x (24 hours × 7 days)
- 30 Day: 720x (24 hours × 30 days)
- 1 Year: 8,760x (24 hours × 365 days)

## Available Scripts

- `npm run dev` - Start development server on port 3000
- `npm run build` - Create optimized production build
- `npm start` - Start production server
- `npm run lint` - Run ESLint code quality checks

## API Proxy Routes

The application includes Next.js API routes to handle CORS issues:

### `/api/aster`
Proxies requests to Aster DEX API, adding appropriate CORS headers.

### `/api/extended/markets`
Proxies requests to Extended markets list endpoint.

### `/api/extended/market-stats`
Proxies requests to Extended individual market stats endpoint. Accepts `market` query parameter.

## Development Roadmap

### Completed Features
- Hyperliquid DEX integration
- Lighter DEX integration
- Aster DEX integration
- Extended DEX integration
- Search functionality
- Favorites filtering
- Dark mode support
- Multiple timeframe views
- Highest/Lowest funding rates display
- Responsive design
- SEO optimization

### Planned Enhancements
- Additional DEX integrations
- Data export (CSV/JSON)
- Price alerts and notifications
- Historical charts and analytics
- WebSocket for real-time updates
- Funding rate arbitrage calculator
- Advanced filtering and sorting
- Mobile application
- API documentation
- User accounts and preferences

## Performance Considerations

- Lazy loading for optimal initial page load
- Efficient state management with Zustand
- Minimal re-renders through proper memoization
- Progressive enhancement for better UX
- Optimized bundle size with tree shaking

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

Contributions are welcome. Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes with clear commit messages
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or feature requests, please open an issue on the GitHub repository.

## Acknowledgments

- Exchange APIs: Hyperliquid, Lighter, Aster, Extended
- UI Components: shadcn/ui
- Icons: Lucide React
- Fonts: IBM Plex Sans by IBM

---

Built with Next.js 16 and TypeScript
