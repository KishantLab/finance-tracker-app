'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface Expense {
  id: string
  date: string
  description: string
  category: string
  paymentMethod: string
  amount: number
  notes?: string
}

const expenseCategories = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Education',
  'Travel',
  'Groceries',
  'Personal Care',
  'Home & Garden',
  'Gifts & Donations',
  'Business',
  'Other'
]

const paymentMethods = [
  'Cash',
  'Credit Card',
  'Debit Card',
  'Bank Transfer',
  'Digital Wallet',
  'UPI',
  'Net Banking',
  'Cheque'
]

export default function ExpensesPage() {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    category: '',
    paymentMethod: '',
    amount: '',
    notes: ''
  })
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [fetchingExpenses, setFetchingExpenses] = useState(true)

  useEffect(() => {
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    try {
      setFetchingExpenses(true)
      const response = await fetch('/api/sheets?type=expenses')
      if (response.ok) {
        const data = await response.json()
        setExpenses(data.expenses || [])
      }
    } catch (err) {
      console.error('Error fetching expenses:', err)
    } finally {
      setFetchingExpenses(false)
    }
  }

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    if (error) setError(null)
    if (success) setSuccess(null)
  }

  const validateForm = () => {
    if (!formData.date) return 'Date is required'
    if (!formData.description.trim()) return 'Description is required'
    if (!formData.category) return 'Category is required'
    if (!formData.paymentMethod) return 'Payment method is required'
    if (!formData.amount || parseFloat(formData.amount) <= 0) return 'Valid amount is required'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'expense',
          data: {
            ...formData,
            amount: parseFloat(formData.amount)
          }
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to add expense')
      }

      setSuccess('Expense added successfully!')
      setFormData({
        date: new Date().toISOString().split('T')[0],
        description: '',
        category: '',
        paymentMethod: '',
        amount: '',
        notes: ''
      })
      
      // Refresh expenses list
      fetchExpenses()
    } catch (err: any) {
      setError(err.message || 'Error adding expense')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Expense Management</h1>
        <p className="text-muted-foreground">
          Track your daily expenses with detailed categorization
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Add Expense Form */}
        <Card>
          <CardHeader>
            <CardTitle>Add New Expense</CardTitle>
            <CardDescription>
              Record a new expense entry with all relevant details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="What did you spend on?"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select value={formData.paymentMethod} onValueChange={(value) => handleInputChange('paymentMethod', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method} value={method}>
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes about this expense"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                />
              </div>

              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded">
                  {success}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Adding Expense...' : 'Add Expense'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Recent Expenses */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
            <CardDescription>
              Your latest expense entries
            </CardDescription>
          </CardHeader>
          <CardContent>
            {fetchingExpenses ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : expenses.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {expenses.slice(0, 10).map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{expense.description}</p>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span>{expense.category}</span>
                        <span>•</span>
                        <span>{expense.paymentMethod}</span>
                        <span>•</span>
                        <span>{new Date(expense.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-sm font-medium">
                      ${expense.amount.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No expenses recorded yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Add your first expense using the form
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Expense Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Summary</CardTitle>
          <CardDescription>
            Quick overview of your spending patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">
                ${expenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)}
              </div>
              <p className="text-sm text-muted-foreground">Total Expenses</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{expenses.length}</div>
              <p className="text-sm text-muted-foreground">Total Entries</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                ${expenses.length > 0 ? (expenses.reduce((sum, exp) => sum + exp.amount, 0) / expenses.length).toFixed(2) : '0.00'}
              </div>
              <p className="text-sm text-muted-foreground">Average Amount</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {new Set(expenses.map(exp => exp.category)).size}
              </div>
              <p className="text-sm text-muted-foreground">Categories Used</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
