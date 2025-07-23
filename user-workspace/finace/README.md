# Finance Tracker - Complete Finance Management App

A comprehensive finance tracking application built with Next.js, TypeScript, and Tailwind CSS that integrates with Google Sheets for seamless data management.

## Features

### 🎯 **Core Features**
- **Expense Tracking**: Log daily expenses with multiple categories and payment methods
- **Debt Management**: Track loans, EMIs, and debt payments with detailed monitoring
- **Google Sheets Integration**: Automatic synchronization for data backup and analysis
- **Mobile-Friendly**: Responsive design optimized for Android and iOS devices
- **Real-time Dashboard**: Visual overview of your financial status

### 📊 **Categories Supported**
**Expense Categories:**
- Food & Dining
- Transportation
- Shopping
- Entertainment
- Bills & Utilities
- Healthcare
- Education
- Travel
- Groceries
- Personal Care
- Home & Garden
- Gifts & Donations
- Business
- Other

**Payment Methods:**
- Cash
- Credit Card
- Debit Card
- Bank Transfer
- Digital Wallet
- UPI
- Net Banking
- Cheque

**Loan Types:**
- Personal Loan
- Home Loan
- Car Loan
- Education Loan
- Credit Card
- Business Loan
- Gold Loan
- Other

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Google Sheets API key (see setup below)
- Google Spreadsheet ID

### 1. Clone and Install
\`\`\`bash
npm install
\`\`\`

### 2. Google Sheets Setup

#### Get Google Sheets API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Sheets API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Sheets API" and enable it
4. Create credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the API key

#### Create Google Spreadsheet
1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new blank spreadsheet
3. Copy the spreadsheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID/edit
   ```

### 3. Environment Configuration
1. Copy the example environment file:
   \`\`\`bash
   cp .env.local.example .env.local
   \`\`\`
2. Update \`.env.local\` with your credentials:
   \`\`\`
   GOOGLE_SHEETS_API_KEY=your_actual_api_key
   SPREADSHEET_ID=your_actual_spreadsheet_id
   \`\`\`

### 4. Run the Application
\`\`\`bash
# Development
npm run dev

# Build for production
npm run build
npm start
\`\`\`

The app will be available at \`http://localhost:8000\`

## 📱 Usage Guide

### Adding Expenses
1. Navigate to \`/expenses\`
2. Fill in the expense details:
   - Date of expense
   - Description
   - Category
   - Payment method
   - Amount
   - Optional notes
3. Click "Add Expense"

### Managing Debts
1. Navigate to \`/debts\`
2. Add new debt/loan:
   - Lender name
   - Loan type
   - Principal amount
   - Current balance
   - EMI amount
   - Interest rate
   - Start and end dates
   - Status
   - Optional notes
3. View all active and completed loans

### Dashboard Overview
- **Total Expenses**: All-time expense tracking
- **Monthly Expenses**: Current month spending
- **Total Debts**: Outstanding loan amounts
- **Active Loans**: Number of ongoing loans
- **Recent Activities**: Latest expenses and upcoming EMIs

## 🔧 Technical Details

### Tech Stack
- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **UI Components**: Shadcn/ui components
- **Data Storage**: Google Sheets API
- **Validation**: Zod schema validation
- **Styling**: Tailwind CSS with dark mode support

### Project Structure
\`\`\`
src/
├── app/
│   ├── api/sheets/          # Google Sheets API integration
│   ├── dashboard/           # Dashboard page
│   ├── debts/              # Debt management page
│   ├── expenses/           # Expense tracking page
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx           # Home page
├── components/ui/          # UI components
└── lib/                  # Utilities
\`\`\`

### API Endpoints
- \`GET /api/sheets\` - Fetch dashboard data
- \`GET /api/sheets?type=expenses\` - Fetch all expenses
- \`GET /api/sheets?type=debts\` - Fetch all debts
- \`POST /api/sheets\` - Add new expense or debt

## 🔐 Security Notes
- Never commit your \`.env.local\` file
- Keep your Google Sheets API key secure
- The app uses server-side API calls to protect your credentials

## 🎯 Next Steps
- Add expense analytics and charts
- Implement budget planning features
- Add expense categories customization
- Export data to CSV/PDF
- Add recurring expense tracking
- Implement expense sharing for family accounts

## 📊 Google Sheets Structure

The app will automatically create two sheets in your Google Spreadsheet:

### Expenses Sheet
| Date | Description | Category | Payment Method | Amount | Notes |

### Debts Sheet
| Lender | Loan Type | Principal Amount | Current Balance | EMI Amount | Interest Rate | Start Date | End Date | Status | Notes |

## 🐛 Troubleshooting

### Common Issues

1. **Google Sheets API Error**
   - Ensure Google Sheets API is enabled
   - Check API key permissions
   - Verify spreadsheet ID is correct

2. **Data Not Syncing**
   - Check environment variables
   - Ensure spreadsheet is accessible
   - Verify API key has read/write permissions

3. **Build Errors**
   - Run \`npm install\` to install dependencies
   - Check Node.js version (18+ required)
   - Clear \`.next\` folder and retry

### Environment Variables Check
\`\`\`bash
# Check if environment variables are set
echo $GOOGLE_SHEETS_API_KEY
echo $SPREADSHEET_ID
\`\`\`

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
