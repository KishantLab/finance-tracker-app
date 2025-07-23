import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schemas
const expenseSchema = z.object({
  date: z.string(),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  amount: z.number().positive('Amount must be positive'),
  notes: z.string().optional()
})

const debtSchema = z.object({
  lender: z.string().min(1, 'Lender name is required'),
  loanType: z.string().min(1, 'Loan type is required'),
  principalAmount: z.number().positive('Principal amount must be positive'),
  currentBalance: z.number().min(0, 'Current balance cannot be negative'),
  emiAmount: z.number().positive('EMI amount must be positive'),
  interestRate: z.number().min(0, 'Interest rate cannot be negative'),
  startDate: z.string(),
  endDate: z.string(),
  status: z.string(),
  notes: z.string().optional()
})

// Google Sheets API configuration
const GOOGLE_SHEETS_API_KEY = process.env.GOOGLE_SHEETS_API_KEY
const SPREADSHEET_ID = process.env.SPREADSHEET_ID
const SHEETS_BASE_URL = 'https://sheets.googleapis.com/v4/spreadsheets'

// Helper function to make Google Sheets API calls
async function callSheetsAPI(endpoint: string, method: string = 'GET', body?: any) {
  if (!GOOGLE_SHEETS_API_KEY || !SPREADSHEET_ID) {
    throw new Error('Google Sheets API configuration is missing. Please check your environment variables.')
  }

  const url = `${SHEETS_BASE_URL}/${SPREADSHEET_ID}${endpoint}?key=${GOOGLE_SHEETS_API_KEY}`
  
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  }

  if (body) {
    options.body = JSON.stringify(body)
  }

  const response = await fetch(url, options)
  
  if (!response.ok) {
    const errorText = await response.text()
    console.error('Google Sheets API Error:', errorText)
    throw new Error(`Google Sheets API error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

// Helper function to append data to a sheet
async function appendToSheet(sheetName: string, values: any[][]) {
  const endpoint = `/values/${sheetName}:append`
  const body = {
    range: sheetName,
    majorDimension: 'ROWS',
    values: values,
    valueInputOption: 'USER_ENTERED'
  }

  return callSheetsAPI(endpoint, 'POST', body)
}

// Helper function to read data from a sheet
async function readFromSheet(sheetName: string, range?: string) {
  const endpoint = `/values/${sheetName}${range ? `:${range}` : ''}`
  return callSheetsAPI(endpoint)
}

// Helper function to ensure sheets exist
async function ensureSheetsExist() {
  try {
    // Try to read from both sheets to check if they exist
    await readFromSheet('Expenses', 'A1:A1')
    await readFromSheet('Debts', 'A1:A1')
  } catch (error) {
    // If sheets don't exist, we'll create headers when first data is added
    console.log('Sheets may not exist yet, will be created on first data entry')
  }
}

// GET handler - Fetch data from Google Sheets
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    if (!GOOGLE_SHEETS_API_KEY || !SPREADSHEET_ID) {
      return NextResponse.json(
        { 
          message: 'Google Sheets integration not configured. Please add GOOGLE_SHEETS_API_KEY and SPREADSHEET_ID to your environment variables.',
          totalExpenses: 0,
          totalDebts: 0,
          monthlyExpenses: 0,
          activeLoans: 0,
          recentExpenses: [],
          upcomingEMIs: [],
          expenses: [],
          debts: []
        },
        { status: 200 }
      )
    }

    await ensureSheetsExist()

    if (type === 'expenses') {
      // Fetch expenses data
      try {
        const expensesData = await readFromSheet('Expenses')
        const expenses = []
        
        if (expensesData.values && expensesData.values.length > 1) {
          // Skip header row
          for (let i = 1; i < expensesData.values.length; i++) {
            const row = expensesData.values[i]
            if (row.length >= 5) {
              expenses.push({
                id: `expense_${i}`,
                date: row[0] || '',
                description: row[1] || '',
                category: row[2] || '',
                paymentMethod: row[3] || '',
                amount: parseFloat(row[4]) || 0,
                notes: row[5] || ''
              })
            }
          }
        }

        return NextResponse.json({ expenses: expenses.reverse() }) // Most recent first
      } catch (error) {
        console.error('Error fetching expenses:', error)
        return NextResponse.json({ expenses: [] })
      }
    }

    if (type === 'debts') {
      // Fetch debts data
      try {
        const debtsData = await readFromSheet('Debts')
        const debts = []
        
        if (debtsData.values && debtsData.values.length > 1) {
          // Skip header row
          for (let i = 1; i < debtsData.values.length; i++) {
            const row = debtsData.values[i]
            if (row.length >= 9) {
              debts.push({
                id: `debt_${i}`,
                lender: row[0] || '',
                loanType: row[1] || '',
                principalAmount: parseFloat(row[2]) || 0,
                currentBalance: parseFloat(row[3]) || 0,
                emiAmount: parseFloat(row[4]) || 0,
                interestRate: parseFloat(row[5]) || 0,
                startDate: row[6] || '',
                endDate: row[7] || '',
                status: row[8] || '',
                notes: row[9] || ''
              })
            }
          }
        }

        return NextResponse.json({ debts })
      } catch (error) {
        console.error('Error fetching debts:', error)
        return NextResponse.json({ debts: [] })
      }
    }

    // Default dashboard data
    try {
      const [expensesData, debtsData] = await Promise.all([
        readFromSheet('Expenses').catch(() => ({ values: [] })),
        readFromSheet('Debts').catch(() => ({ values: [] }))
      ])

      // Process expenses
      let totalExpenses = 0
      let monthlyExpenses = 0
      const recentExpenses = []
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()

      if (expensesData.values && expensesData.values.length > 1) {
        for (let i = 1; i < expensesData.values.length; i++) {
          const row = expensesData.values[i]
          if (row.length >= 5) {
            const amount = parseFloat(row[4]) || 0
            const date = new Date(row[0])
            
            totalExpenses += amount
            
            if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
              monthlyExpenses += amount
            }

            if (recentExpenses.length < 5) {
              recentExpenses.push({
                id: `expense_${i}`,
                date: row[0],
                description: row[1],
                amount: amount,
                category: row[2]
              })
            }
          }
        }
      }

      // Process debts
      let totalDebts = 0
      let activeLoans = 0
      const upcomingEMIs = []

      if (debtsData.values && debtsData.values.length > 1) {
        for (let i = 1; i < debtsData.values.length; i++) {
          const row = debtsData.values[i]
          if (row.length >= 9) {
            const currentBalance = parseFloat(row[3]) || 0
            const status = row[8] || ''
            
            if (status === 'Active') {
              totalDebts += currentBalance
              activeLoans += 1
              
              if (upcomingEMIs.length < 5) {
                upcomingEMIs.push({
                  id: `debt_${i}`,
                  lender: row[0],
                  amount: parseFloat(row[4]) || 0,
                  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // Next month
                })
              }
            }
          }
        }
      }

      return NextResponse.json({
        totalExpenses,
        totalDebts,
        monthlyExpenses,
        activeLoans,
        recentExpenses: recentExpenses.reverse(),
        upcomingEMIs
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      return NextResponse.json({
        totalExpenses: 0,
        totalDebts: 0,
        monthlyExpenses: 0,
        activeLoans: 0,
        recentExpenses: [],
        upcomingEMIs: []
      })
    }
  } catch (error: any) {
    console.error('GET /api/sheets error:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to fetch data from Google Sheets' },
      { status: 500 }
    )
  }
}

// POST handler - Add data to Google Sheets
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data } = body

    if (!GOOGLE_SHEETS_API_KEY || !SPREADSHEET_ID) {
      return NextResponse.json(
        { message: 'Google Sheets integration not configured. Please add GOOGLE_SHEETS_API_KEY and SPREADSHEET_ID to your environment variables.' },
        { status: 400 }
      )
    }

    if (type === 'expense') {
      // Validate expense data
      const validatedData = expenseSchema.parse(data)
      
      // Prepare data for Google Sheets
      const values = [[
        validatedData.date,
        validatedData.description,
        validatedData.category,
        validatedData.paymentMethod,
        validatedData.amount,
        validatedData.notes || ''
      ]]

      // Check if headers exist, if not add them
      try {
        const existingData = await readFromSheet('Expenses', 'A1:F1')
        if (!existingData.values || existingData.values.length === 0) {
          // Add headers first
          const headers = [['Date', 'Description', 'Category', 'Payment Method', 'Amount', 'Notes']]
          await appendToSheet('Expenses', headers)
        }
      } catch (error) {
        // Sheet might not exist, headers will be added with first row
        const headers = [['Date', 'Description', 'Category', 'Payment Method', 'Amount', 'Notes']]
        await appendToSheet('Expenses', headers)
      }

      // Add the expense data
      await appendToSheet('Expenses', values)
      
      return NextResponse.json({ message: 'Expense added successfully to Google Sheets' })
    }

    if (type === 'debt') {
      // Validate debt data
      const validatedData = debtSchema.parse(data)
      
      // Prepare data for Google Sheets
      const values = [[
        validatedData.lender,
        validatedData.loanType,
        validatedData.principalAmount,
        validatedData.currentBalance,
        validatedData.emiAmount,
        validatedData.interestRate,
        validatedData.startDate,
        validatedData.endDate,
        validatedData.status,
        validatedData.notes || ''
      ]]

      // Check if headers exist, if not add them
      try {
        const existingData = await readFromSheet('Debts', 'A1:J1')
        if (!existingData.values || existingData.values.length === 0) {
          // Add headers first
          const headers = [['Lender', 'Loan Type', 'Principal Amount', 'Current Balance', 'EMI Amount', 'Interest Rate', 'Start Date', 'End Date', 'Status', 'Notes']]
          await appendToSheet('Debts', headers)
        }
      } catch (error) {
        // Sheet might not exist, headers will be added with first row
        const headers = [['Lender', 'Loan Type', 'Principal Amount', 'Current Balance', 'EMI Amount', 'Interest Rate', 'Start Date', 'End Date', 'Status', 'Notes']]
        await appendToSheet('Debts', headers)
      }

      // Add the debt data
      await appendToSheet('Debts', values)
      
      return NextResponse.json({ message: 'Debt/Loan added successfully to Google Sheets' })
    }

    return NextResponse.json(
      { message: 'Invalid request type. Use "expense" or "debt".' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('POST /api/sheets error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: error.message || 'Failed to add data to Google Sheets' },
      { status: 500 }
    )
  }
}
