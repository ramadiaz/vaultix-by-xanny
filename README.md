<p align="center">
  <img src="public/favicon_io/android-chrome-192x192.png" width="96" alt="Vaultix Logo" />
</p>

<h1 align="center">Vaultix</h1>

<p align="center">
  <strong>Offline-first personal finance tracker — built to stay fast, private, and always in sync.</strong>
</p>

<p align="center">
  <a href="https://vaultix.xann.my.id">🌐 Live App</a> &nbsp;·&nbsp;
  <a href="https://github.com/ramadiaz/vaultix-by-xanny">Frontend Repo</a> &nbsp;·&nbsp;
  <a href="https://github.com/ramadiaz/vaultix-server">Backend Repo</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript" />
  <img src="https://img.shields.io/badge/TailwindCSS-4-38bdf8?logo=tailwindcss" />
  <img src="https://img.shields.io/badge/Go-1.22-00ADD8?logo=go" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb" />
</p>

---

## ✨ Features

- 💼 **Multi-Wallet Management** — Create, archive, and organize wallets by group and currency
- 💸 **Transactions** — Log income, expenses, and transfers with custom categories
- 📊 **Stats & Charts** — Visual spending insights powered by Recharts
- 🔄 **Cloud Sync** — Encrypted sync to the Vaultix server (optional, account-based)
- 📦 **Backup & Restore** — Export and import your full database as a file
- 📤 **Import / Export** — Move data in and out with flexible formats (XLSX supported)
- 🔁 **Recurring Transactions** — Set up repeating income or expense entries
- 📝 **Memos** — Attach notes to your financial records
- 💡 **Budgets** — Track spending against budget limits
- 🌒 **Dark Mode** — Full light/dark theme support
- 📱 **Responsive** — Mobile-first with a full desktop sidebar layout
- 🔒 **Offline-first** — All data lives locally in your browser via SQLite (sql.js); sync is optional

---

## 🏗️ Tech Stack

### Frontend (`vaultix-by-xanny`)

| Technology | Role |
|---|---|
| [Next.js 16](https://nextjs.org) | App framework (App Router) |
| [React 19](https://react.dev) | UI library |
| [TypeScript 5](https://www.typescriptlang.org) | Type safety |
| [Tailwind CSS 4](https://tailwindcss.com) | Styling |
| [Framer Motion](https://www.framer.com/motion/) | Animations |
| [HeroUI](https://www.heroui.com) | Component library |
| [Recharts](https://recharts.org) | Charts & graphs |
| [sql.js](https://sql.js.org) | In-browser SQLite database |
| [xlsx](https://sheetjs.com) | Spreadsheet import/export |
| [Lucide React](https://lucide.dev) | Icons |

### Backend (`vaultix-server`)

| Technology | Role |
|---|---|
| [Go 1.22](https://go.dev) | Server language |
| [Gin](https://gin-gonic.com) | HTTP framework |
| [MongoDB Atlas](https://www.mongodb.com/atlas) | Cloud database |
| [JWT](https://github.com/golang-jwt/jwt) | Authentication tokens |
| [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/) | Bot protection |

---

## 🚀 Getting Started (Frontend)

### Prerequisites

- **Node.js** ≥ 18
- A running instance of [vaultix-server](https://github.com/ramadiaz/vaultix-server) (optional — only needed for sync)

### Installation

```bash
git clone https://github.com/ramadiaz/vaultix-by-xanny.git
cd vaultix-by-xanny
npm install
```

### Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-turnstile-site-key
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL of the Vaultix backend server |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile site key (used for register/login) |

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

---

## 🖥️ Getting Started (Backend)

See the [vaultix-server repository](https://github.com/ramadiaz/vaultix-server) for full setup instructions.

### Quick Setup

```bash
git clone https://github.com/ramadiaz/vaultix-server.git
cd vaultix-server
cp .env.example .env
```

```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
PORT=8080
TURNSTILE_SECRET_KEY=your-turnstile-secret-key
```

```bash
go run ./cmd/main.go
```

The server starts on `http://localhost:8080`.

---

## 📁 Project Structure (Frontend)

```
vaultix-by-xanny/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Wallets / Overview page
│   ├── transactions/       # Transactions page
│   ├── stats/              # Stats page
│   └── settings/           # Settings page
├── components/             # Shared UI components
├── features/               # Feature modules (domain logic)
│   ├── auth/               # Login / Register
│   ├── wallets/            # Wallet management
│   ├── transactions/       # Transaction management
│   ├── stats/              # Analytics & charts
│   ├── sync/               # Cloud sync engine
│   ├── backup/             # Backup & restore
│   ├── import-export/      # Data import/export
│   ├── budgets/            # Budget tracking
│   ├── memos/              # Memo notes
│   └── recurring/          # Recurring transactions
├── lib/                    # Utilities and helpers
└── public/                 # Static assets
    └── favicon_io/         # App icons
```

---

## 🔄 How Sync Works

Vaultix uses an **offline-first** architecture:

1. All data is stored locally in your browser using **SQLite** (via `sql.js`).
2. When you log in and enable sync, the client serializes the local database and uploads it to the **Vaultix server**.
3. On other devices, the database is downloaded and merged.
4. Your data is always accessible — even without an internet connection.

---

## 📜 License

This project is open-source. See [LICENSE](LICENSE) for details.

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/ramadiaz">Xanny</a>
</p>
