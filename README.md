# Optima Bank — Voucher Rewards App

A full-stack voucher redemption platform built for Optima Bank, where users earn and redeem points for real-world rewards (dining, shopping, travel, and entertainment vouchers).

**🔗 Live demo:** https://optima-voucher-app.vercel.app

> ⚠️ **Demo status:** the hosted Azure SQL database is currently offline, so the live demo can't load data right now. See [Running Locally](#-running-locally) to try the full app. When the backend is up, note that Render's free tier can take 30-60 seconds to wake up after being idle.

---

## 📸 Screenshots

<!-- Replace these with actual screenshots once you have them saved -->
| Login | Dashboard | Checkout |
|---|---|---|
| ![Login](./screenshots/login.png) | ![Dashboard](./screenshots/dashboard.png) | ![Checkout](./screenshots/checkout.png) |

---

## ✨ Features

### Accounts & security
- **Email/password authentication** — signup and login secured with JWT tokens and BCrypt password hashing
- **Sign in with Google** — Google Identity Services on the frontend; the backend verifies the ID token's signature and audience before issuing its own JWT
- **Password reset by email** — random single-use token, stored hashed, expiring after 15 minutes; the response is identical whether or not the email exists, so the form can't be used to discover registered accounts
- **Password rules enforced on both client and server** — 8-64 characters with a letter, a number and a symbol, plus a show/hide toggle
- **Rate limiting** on authentication endpoints (5 requests per minute) to slow brute-force attempts
- **Double-submit protection** — buttons lock while a request is in flight

### Vouchers & checkout
- **Voucher browsing** — server-side pagination, category filtering, and debounced search, so the app stays fast as the catalog grows
- **Shopping cart** — add, adjust quantity, and remove vouchers before checkout
- **Points-based redemption** — atomic checkout transaction that deducts points, decrements stock, and logs the redemption, safely even under concurrent requests
- **PDF generation** — each redeemed voucher can be downloaded as a PDF receipt

### Profile & experience
- **User profile** — editable name and gender, profile picture upload, and password change
- **In-app help chatbot** — a guided assistant widget answering common questions about how the app works
- **Toast notifications** — real-time feedback for every action (success/error)
- **Reusable UI components** — shared `Button` (with variants) and `Input` (with built-in password toggle) used across pages
- **Responsive layout** — built mobile-first with Tailwind CSS

---

## 🔌 API Overview

| Area | Endpoints | Auth |
|---|---|---|
| Auth | `POST /api/auth/signup`, `/login`, `/google`, `/forgot-password`, `/reset-password` | Public (rate limited) |
| Profile | `GET` / `PUT /api/auth/me`, `POST /api/auth/change-password`, `POST /api/auth/profile-picture` | JWT |
| Vouchers | `GET /api/vouchers` (`search`, `categoryId`, `page`, `pageSize`), `GET /api/vouchers/categories`, `GET /api/vouchers/{id}` | Public |
| Cart | `GET` / `POST /api/cart`, `PUT` / `DELETE /api/cart/{id}` | JWT |
| Redemption | `POST /api/redemption/checkout`, `GET /api/redemption/{id}/pdf` | JWT |

All responses use a consistent `{ success, message, data }` shape.

---

## 🏗️ Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────────┐
│   Vercel         │  HTTPS  │   Render          │  SQL    │   Azure SQL          │
│   (Frontend)     │────────▶│   (Backend API)   │────────▶│   Database           │
│   React + Vite   │         │   ASP.NET Core    │         │                      │
└─────────────────┘         └──────────────────┘         └─────────────────────┘
                                     │
                                     ├──▶ Google (ID token verification)
                                     └──▶ Resend (password reset email)
```

The frontend and backend are fully decoupled — React communicates with the ASP.NET Core Web API purely over JSON/REST, with no server-rendered pages. Authentication state is carried via a JWT bearer token attached to every request after login. Google sign-in only changes how a user proves who they are; the backend then issues the same JWT, so every other endpoint works unchanged.

---

## 🛠️ Tech Stack

**Frontend**
- React + TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- `@react-oauth/google` (Sign in with Google)
- lucide-react (icons)

**Backend**
- ASP.NET Core Web API (.NET 10)
- Entity Framework Core
- JWT Bearer Authentication
- BCrypt.Net (password hashing)
- Google.Apis.Auth (ID token verification)
- ASP.NET Core rate limiting middleware
- QuestPDF (PDF generation)
- Resend (transactional email)

**Database**
- SQL Server (Azure SQL Database in production)

**Infrastructure**
- Frontend hosting: Vercel
- Backend hosting: Render (Docker deployment)
- Database hosting: Azure SQL Database
- Version control: GitHub (with secret scanning push protection)

---

## 🚀 Running Locally

### Prerequisites
- .NET SDK 8+
- Node.js 20+
- SQL Server (local instance or Docker)

### Backend
```bash
cd OptimaVoucherApi
cp appsettings.Example.json appsettings.json
# edit appsettings.json: set your local SQL Server connection string and a long random JWT key
dotnet ef database update
dotnet run
```
The API runs at `http://localhost:5215` (check your console output for the exact port).

Optional settings in `appsettings.json`:

| Setting | Needed for |
|---|---|
| `Resend:ApiKey` | Sending real password reset emails. Without it, the reset link is printed to the backend console in Development, so the flow is still testable. |
| `Google:ClientId` | Sign in with Google (an OAuth web client ID from Google Cloud Console) |
| `App:FrontendUrl` | The base URL used in reset links (defaults to `http://localhost:5173`) |

### Frontend
```bash
cd optima-voucher-web
npm install
# optional, for the Google button: create a .env file containing
# VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
npm run dev
```
The app runs at `http://localhost:5173`.

> The backend URL is set in one place, `API_BASE_URL` in `src/api/client.ts`. Point it at your local backend when running locally.

---

## 📁 Project Structure

```
optima-voucher-app/
├── OptimaVoucherApi/          # ASP.NET Core backend
│   ├── Controllers/           # API endpoints (Auth, Vouchers, Cart, Redemption)
│   ├── Models/                # Entity classes (User, Voucher, CartItem, RedemptionLog...)
│   ├── DTOs/                  # Request/response data shapes
│   ├── Data/                  # EF Core DbContext + migrations
│   ├── Services/              # PDF generation, email sending
│   ├── Common/                # ApiResponse wrapper, password validator
│   └── Dockerfile
└── optima-voucher-web/        # React frontend
    ├── src/
    │   ├── pages/              # One component per screen
    │   ├── components/         # Reusable pieces (Button, Input, ChatWidget, GoogleSignInButton...)
    │   ├── context/             # Auth + Toast global state
    │   ├── hooks/               # Custom hooks (useDebounce)
    │   ├── utils/               # Shared helpers (password validation)
    │   ├── api/                 # Axios calls to the backend
    │   └── types/                # Shared TypeScript interfaces
    └── vercel.json
```

---

## ⚠️ Known Limitations

- **Uploaded profile pictures** are saved to the server's disk, which Render's free tier wipes on restart. A production version would use object storage such as Azure Blob Storage.
- **JWTs can't be revoked before they expire** (120 minutes), so resetting a password doesn't sign out sessions that already exist.
- **Signup doesn't verify email ownership.** For that reason, Google sign-in deliberately refuses to auto-link to an existing password account with the same email, since that would allow account takeover.
- **Password reset emails** are sent through Resend's free sandbox, which only delivers to the account owner's address until a sending domain is verified.

---

## 🧠 What I Learned

This was my first full end-to-end full-stack project, built from a client's design spec and wireframes through to a deployed application. Along the way I worked through:

- Structuring a REST API around clear resource boundaries (Auth, Vouchers, Cart, Redemption)
- Using database transactions (`BeginTransactionAsync`) to keep a multi-step operation (checkout: deduct points, reduce stock, log the redemption) safe from partial failures and race conditions
- JWT-based stateless authentication, and the difference between frontend route protection (UX) and backend `[Authorize]` enforcement (actual security)
- Designing a safe password reset: hashing the token, making it single-use and short-lived, and returning the same response whether or not an account exists
- Verifying Google ID tokens on the server instead of trusting the frontend, and why auto-linking accounts by email is risky when signup doesn't verify email
- Rate limiting authentication endpoints, and validating passwords on the server as well as the client, since frontend checks are trivially bypassed
- Server-side pagination with debounced search, and why both matter once a dataset grows
- Extracting reusable components, including catching a bug where a shared button variant became unreadable on a light background
- Debugging real deployment issues: CORS misconfiguration, cloud database firewall rules, SPA client-side routing 404s on refresh, and environment variable wiring across three hosting platforms
- Keeping secrets out of git, after GitHub's push protection caught an API key in a committed example config file
- The tradeoffs of free-tier hosting (spin-down delays, ephemeral file storage) and how those constraints shape design decisions

---

## 📄 License

This project was built as a learning exercise based on a provided design specification. Feel free to explore the code for reference.