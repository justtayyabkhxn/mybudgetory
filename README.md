# MyBudgetory — Personal Finance Tracker

**MyBudgetory** is a full-stack personal finance app built with **Next.js 15**, **MongoDB**, and **Tailwind CSS**. Track income and expenses, set budget goals, manage recurring transactions, monitor debt, and visualise spending — all from a clean dark-themed interface.

---

## Features

### Dashboard
- Monthly income, expenses, and net savings at a glance
- Savings rate badge and today's spend tracker
- Recent 5 transactions with hover-reveal edit and delete
- Smart insights: spending velocity, category race, health score, streak tracker, monthly digest, and what-if simulator
- Month-end review panel (visible days 1–3 of each new month)
- Monthly PDF-style report

### Transactions
- Full CRUD — add, view, edit, delete
- Edit modal with category pills, type toggle, payment mode, and note
- Filter by month, search by title
- Color-coded category icons throughout
- Confirm dialog on delete (no `window.confirm`)

### Calendar View
- Heat-map grid — 4-tier coloring based on daily spend intensity
- Month navigation with animated month name transitions
- Month stats bar: income / expenses / net for the viewed month
- Income dot per day (green indicator)
- Day detail panel with transaction list — each item links to transaction detail
- Weekly rhythm sparklines

### Budget Goals
- Set monthly spending limits per category
- Speedometer gauge showing real-time utilization
- Color progression: green → yellow → orange → red at 100%
- Over Budget and Warning badges
- Remaining amount calculation per category

### Recurring Transactions
- Track subscriptions, rent, salary, EMIs — any repeating payment
- Daily / weekly / monthly frequency
- Log Now — instantly posts a transaction to your history
- Pause and resume without deleting
- Monthly recurring outflow summary

### Debt & Lent Tracker
- Track money you've lent to others and money you owe
- Optional due date with overdue badge
- Mark as cleared
- Pending and cleared entries in separate sections
- Total owed / owed-to summary cards

### Net Worth
- Bank balance tracking with inline edit (Enter to save, Escape to cancel)
- Total net worth card

### Charts & Analytics
- Category breakdown pie chart
- Monthly income vs expense bar chart
- Trend lines over time
- Advanced charts page with deeper breakdowns

### Expenses & Income Views
- Dedicated filtered views — expenses-only and income-only
- Month selector with running total
- Edit and delete inline

### Profile & Data
- Export all transactions as JSON
- Import transactions from a JSON backup
- Change password (current + new + confirm)
- Delete all transactions with typed confirmation (`"delete"`)

### Auth
- Custom JWT authentication (signup / login)
- `useAuthGuard` hook — automatic redirect to `/login` on missing or invalid token
- `apiFetch` utility — attaches Bearer token, 30 s timeout, auto-redirect on 401

---

## Tech Stack

| Layer          | Technology                                        |
|----------------|---------------------------------------------------|
| Framework      | Next.js 15 (App Router, `"use client"`)           |
| Language       | TypeScript                                        |
| Styling        | Tailwind CSS 4, Bricolage Grotesque (Google Font) |
| Database       | MongoDB Atlas + Mongoose                          |
| Authentication | Custom JWT (`jsonwebtoken` + `bcryptjs`)          |
| Charts         | Highcharts, Chart.js                              |
| Icons          | Lucide React                                      |
| Animations     | Framer Motion (AnimatePresence, motion)           |
| HTTP Client    | Axios (profile), custom `apiFetch` utility        |
| Utilities      | date-fns, html-to-image                           |

---

## Getting Started

### 1. Clone & install

```bash
git clone https://github.com/justtayyabkhxn/mybudgetory.git
cd mybudgetory
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the root:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
src/
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/               # Login, signup
│   │   ├── transactions/       # CRUD + import/delete-all
│   │   ├── budget-goals/       # Per-category limits
│   │   ├── recurring/          # Recurring transactions
│   │   ├── debt-lent/          # Debt & lent entries
│   │   ├── networth/           # Bank balance
│   │   └── user/               # Profile, password update
│   │
│   ├── dashboard/              # Main dashboard
│   ├── transactions/           # Full transaction list
│   ├── transactions/[id]/      # Transaction detail page
│   ├── calendar/               # Heat-map calendar
│   ├── budget-goals/           # Spending limits by category
│   ├── recurring/              # Recurring transactions
│   ├── debt-lent/              # Debt & lent tracker
│   ├── net-worth/              # Net worth tracker
│   ├── expenses/               # Expense-only filtered view
│   ├── inflow/                 # Income-only filtered view
│   ├── charts/                 # Charts & analytics
│   ├── advanced-charts/        # Extended chart views
│   ├── stats/                  # Monthly statistics
│   ├── split/                  # Bill splitter
│   ├── event-budget/           # Event / travel budget
│   ├── profile/                # User profile & data management
│   ├── features/               # Features showcase page
│   ├── login/                  # Login page
│   ├── signup/                 # Signup page
│   └── page.tsx                # Landing page
│
├── components/                 # Reusable UI components
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── BottomNav.tsx
│   ├── Menu.tsx
│   ├── AddTransactionForm.tsx
│   ├── EditTransactionModal.tsx
│   ├── ConfirmDialog.tsx
│   ├── ToastContainer.tsx
│   ├── CountUp.tsx             # Slot-machine number animation
│   ├── DashboardInsights.tsx   # Velocity, health, streak, digest
│   ├── FilteredTransactionsPage.tsx  # Shared expenses/inflow page
│   ├── MonthlyReport.tsx
│   ├── MonthEndReview.tsx
│   └── SkeletonLoader.tsx
│
├── hooks/
│   └── useAuthGuard.ts         # Auth redirect hook
│
├── utils/
│   └── apiFetch.ts             # Fetch wrapper with auth + timeout
│
└── lib/
    ├── categoryConfig.ts       # CATEGORIES, CATEGORY_COLORS, CATEGORY_ICONS
    ├── toast.ts                # Event-based toast dispatcher
    └── dbConnect.ts            # MongoDB connection
```

---

## Contributing

Contributions and suggestions are welcome. Fork the repo and open a pull request.