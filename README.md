# MyBudgetory — Smart Personal Finance Tracker

**MyBudgetory** is a full-stack personal finance app built with **Next.js 15**, **MongoDB**, and **Tailwind CSS**. Track income and expenses, visualise spending trends, and split bills with friends — all from a beautiful dark-themed interface.

---

## Features

### Dashboard
- Add income and expense transactions with title, category, amount, and date
- Filter transactions by week, month, or year
- Interactive bar and pie charts (Recharts + Chart.js)
- Export transactions as CSV

### Statistics
- Monthly summary: total income, expenses, net balance
- Spending insights: most active day, avg monthly spending, top/least spent categories
- Notable transactions: largest income and expense of the month
- Top 3 highest-spend days

### Split Bills
- Enter a total bill amount and description
- Add people manually or import from phone contacts (Chrome Mobile)
- Auto-calculates each person's equal share
- Send WhatsApp payment reminders with a personalised shareable link
- Mark people as paid, delete individuals, or clear the entire split

### Auth
- Secure signup and login with custom JWT authentication
- Animated split-screen auth pages with live app preview cards
- Password visibility toggle, focused input states, error handling

---

## Tech Stack

| Layer          | Technology                                    |
|----------------|-----------------------------------------------|
| Framework      | Next.js 15 (App Router)                       |
| Language       | TypeScript                                    |
| Styling        | Tailwind CSS 4, custom CSS animations         |
| Database       | MongoDB Atlas + Mongoose                      |
| Authentication | Custom JWT (`jsonwebtoken` + `jwt-decode`)    |
| Charts         | Recharts, Chart.js, Highcharts, Tremor        |
| Icons          | Lucide React                                  |
| Animations     | Framer Motion, CSS keyframes                  |
| HTTP Client    | Axios                                         |
| Utilities      | date-fns, papaparse, bcryptjs, html-to-image  |

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
│   ├── api/                  # API routes (auth, transactions, stats)
│   │   ├── login/
│   │   ├── signup/
│   │   └── transactions/
│   ├── dashboard/            # Main dashboard page
│   ├── login/                # Login page
│   ├── signup/               # Signup page
│   ├── stats/                # Statistics page
│   ├── split/                # Bill splitter
│   │   └── summary/[encoded] # Shareable payment summary
│   └── globals.css           # Global styles & animations
│
├── components/               # Reusable UI components
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Menu.tsx
│   └── FloatingTransactionButton.tsx
│
└── lib/                      # MongoDB connection, utilities
```

---

## Roadmap

- [ ] Budget limit alerts & overspending notifications
- [ ] Recurring income/expense entries
- [ ] AI-based financial tips and anomaly detection
- [ ] Shared budgets for households or teams
- [ ] PWA support for offline and mobile-first use
- [ ] Dark/light theme toggle

---

## Contributing

Contributions and suggestions are welcome. Fork the repo and open a pull request.
