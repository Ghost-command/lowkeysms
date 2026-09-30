# SMS Verification Platform

A production-grade, highly customizable REST API backend for an SMS verification service platform supporting two SMS providers (SMSPool and GlobeVerify), an admin control panel API, user-facing API with API key access, KoraPay payment integration, and full authentication.

## Stack

- **Node.js** + **Express.js**
- **MongoDB** (Mongoose ODM)
- **Redis** (caching, blacklisting, rate limiting)
- **JWT** authentication + API key access
- **Nodemailer** + Handlebars email templates
- **KoraPay** payment integration
- **SMSPool API** + **GlobeVerify API**

## Quick Start

### Prerequisites

- Node.js >= 18
- MongoDB
- Redis

### Installation

```bash
# Clone and install dependencies
cd sms-backend
npm install

# Copy environment file and configure
cp .env.example .env
# Edit .env with your credentials

# Start development server
npm run dev

# Or production
npm start
```

## Environment Variables

See `.env.example` for all required variables. Key ones:

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_SECRET` | JWT signing secret |
| `SMTP_*` | Email SMTP configuration |
| `KORAPAY_*` | KoraPay payment credentials |
| `SMSPOOL_API_KEY` | SMSPool provider API key |
| `GLOBEVERIFY_API_KEY` | GlobeVerify provider API key |

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "johndoe",
  "phoneNumber": "+2348012345678",
  "password": "password123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "emailOrUsername": "user@example.com",
  "password": "password123"
}
```

#### Response Format
All successful responses follow:
```json
{
  "success": true,
  "message": "...",
  "data": { ... }
}
```

### User Endpoints (JWT required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/profile` | Get profile |
| PATCH | `/api/user/profile` | Update profile |
| POST | `/api/user/api-key` | Generate API key |
| DELETE | `/api/user/api-key` | Revoke API key |

### Order Endpoints (JWT or API Key)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Create SMS order |
| GET | `/api/orders` | List orders |
| GET | `/api/orders/:orderId` | Get order |
| GET | `/api/orders/:orderId/check` | Check SMS/OTP |
| POST | `/api/orders/:orderId/cancel` | Cancel order |
| GET | `/api/orders/:orderId/reuse` | Check reuse capability |
| POST | `/api/orders/:orderId/reuse` | Reuse number |

### Wallet Endpoints (JWT or API Key)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/wallet/balance` | Get balance |
| GET | `/api/wallet/transactions` | Transaction history |

### Payment Endpoints (JWT required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/deposit` | Initiate deposit |
| POST | `/api/payments/virtual-account` | Create virtual account |
| GET | `/api/payments/history` | Payment history |

### Admin Endpoints (Admin JWT required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/admin/login` | Admin login |
| POST | `/api/auth/admin/register` | Admin registration |

#### Users Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List users |
| GET | `/api/admin/users/:userId` | Get user details |
| POST | `/api/admin/users/:userId/lock` | Lock account |
| POST | `/api/admin/users/:userId/unlock` | Unlock account |
| POST | `/api/admin/users/:userId/freeze` | Freeze balance |
| POST | `/api/admin/users/:userId/unfreeze` | Unfreeze balance |
| POST | `/api/admin/users/:userId/ban` | Ban user |
| POST | `/api/admin/users/:userId/credit` | Credit balance |
| POST | `/api/admin/users/:userId/debit` | Debit balance |
| POST | `/api/admin/users/:userId/api-key` | Toggle API key |

#### Provider Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/provider/status` | Provider status |
| POST | `/api/admin/provider/switch` | Switch provider |
| PATCH | `/api/admin/provider/:provider/config` | Update config |
| POST | `/api/admin/provider/exchange-rate` | Set exchange rate |
| GET | `/api/admin/provider/countries` | List countries |
| GET | `/api/admin/provider/services/:countryId` | List services |

#### Pricing & Margins
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/pricing/margins` | List margins |
| POST | `/api/admin/pricing/margins/global` | Set global margin |
| POST | `/api/admin/pricing/margins/service` | Set service margin |
| POST | `/api/admin/pricing/margins/country` | Set country margin |
| GET | `/api/admin/pricing/effective-price` | Get effective price |

#### Earnings & Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/earnings/analytics` | Platform analytics |
| GET | `/api/admin/earnings/report` | Earnings report |
| GET | `/api/admin/earnings/logs` | Admin action logs |

#### Settings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/settings` | Get settings |
| PATCH | `/api/admin/settings` | Update settings |
| POST | `/api/admin/settings/maintenance` | Toggle maintenance |

### Webhooks (No auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/webhooks/korapay` | KoraPay webhook |

## Provider Behavior

- **SMSPool**: Returns prices in USD, automatically converted to NGN using admin-configurable exchange rate
- **GlobeVerify**: Returns prices in USD or NGN depending on mode; automatically normalized to NGN
- **Active provider** switchable by admin at any time via API
- All user-facing responses follow the **same unified schema** regardless of active provider

## Pricing & Margin System

- Admin sets **USD to NGN exchange rate**
- Supports **global**, **per-service**, **per-country**, and **per-service-country** margins
- Margins can be **flat NGN amount** or **percentage**
- All user-facing prices in **NGN only** (stored as integer kobo)

## Authentication Methods

1. **JWT Bearer Token** - `Authorization: Bearer <token>`
2. **API Key** - `x-api-key: <api-key>` (for programmatic access)

## Rate Limiting

- Global: 100 requests/minute per IP
- API Key: 1000 requests/minute per key
- Auth endpoints: 10 requests per 15 minutes

## File Structure

```
sms-backend/
├── src/
│   ├── config/          # DB, Redis, env, logger
│   ├── models/          # Mongoose models
│   ├── providers/       # SMS provider abstraction
│   ├── services/        # Business logic
│   ├── controllers/     # Request handlers
│   ├── routes/          # Route definitions
│   ├── middleware/      # Auth, validation, rate limiting
│   ├── templates/       # Email templates
│   └── utils/           # Helpers
├── server.js            # Entry point
└── package.json
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Production server |
| `npm run dev` | Development with nodemon |
| `npm test` | Run tests |
| `npm run lint` | ESLint check |
