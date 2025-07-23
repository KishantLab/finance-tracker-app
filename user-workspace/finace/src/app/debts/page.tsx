'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface Debt {
  id: string
  lender: string
  loanType: string
  principalAmount: number
  currentBalance: number
  emiAmount: number
  interestRate: number
  startDate: string
  endDate: string
  status: string
  notes?: string
}

const loanTypes = [
  'Personal Loan',
  'Home Loan',
  'Car Loan',
  'Education Loan',
  'Credit Card',
  'Business Loan',
  'Gold Loan',
  'Other'
]

const loanStatuses = [
  'Active',
  'Completed',
  'Defaulted',
  'Prepaid'
]

export default function DebtsPage() {
  const [formData, setFormData] = useState({
    lender: '',
    loanType: '',
    principalAmount: '',
    currentBalance: '',
    emiAmount: '',
    interestRate: '',
    startDate: '',
    endDate: '',
    status: 'Active',
    notes: ''
  })
  const [debts, setDebts] = useState<Debt[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [fetchingDebts, setFetchingDebts] = useState(true)

  useEffect(() => {
    fetchDebts()
  }, [])

  const fetchDebts = async () => {
    try {
      setFetchingDebts(true)
      const response = await fetch('/api/sheets?type=debts')
      if (response.ok) {
        const data = await response.json()
        setDebts(data.debts || [])
      }
    } catch (err) {
      console.error('Error fetching debts:', err)
    } finally {
      setFetchingDebts(false)
    }
  }

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    if (error) setError(null)
    if (success) setSuccess(null)
  }

  const validateForm = () => {
    if (!formData.lender.trim()) return 'Lender name is required'
    if (!formData.loanType) return 'Loan type is required'
    if (!formData.principalAmount || parseFloat(formData.principalAmount) <= 0) return 'Valid principal amount is required'
    if (!formData.currentBalance || parseFloat(formData.currentBalance) < 0) return 'Valid current balance is required'
    if (!formData.emiAmount || parseFloat(formData.emiAmount) <= 0) return 'Valid EMI amount is required'
    if (!formData.interestRate || parseFloat(formData.interestRate) < 0) return 'Valid interest rate is required'
    if (!formData.startDate) return 'Start date is required'
    if (!formData.endDate) return 'End date is required'
    if (new Date(formData.startDate) >= new Date(formData.endDate)) return 'End date must be after start date'
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
          type: 'debt',
          data: {
            ...formData,
            principalAmount: parseFloat(formData.principalAmount),
            currentBalance: parseFloat(formData.currentBalance),
            emiAmount: parseFloat(formData.emiAmount),
            interestRate: parseFloat(formData.interestRate)
          }
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to add debt')
      }

      setSuccess('Debt/Loan added successfully!')
      setFormData({
        lender: '',
        loanType: '',
        principalAmount: '',
        currentBalance: '',
        emiAmount: '',
        interestRate: '',
        startDate: '',
        endDate: '',
        status: 'Active',
        notes: ''
      })
      
      // Refresh debts list
      fetchDebts()
    } catch (err: any) {
      setError(err.message || 'Error adding debt')
    } finally {
      setLoading(false)
    }
  }

  const calculateMonthsRemaining = (endDate: string, currentBalance: number, emiAmount: number) => {
    if (currentBalance <= 0 || emiAmount <= 0) return 0
    const months = Math.ceil(currentBalance / emiAmount)
    const actualEndDate = new Date(endDate)
    const maxMonths = Math.ceil((actualEndDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30))
    return Math.min(months, Math.max(0, maxMonths))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Debt & Loan Management</h1>
        <p className="text-muted-foreground">
          Track your loans, EMIs, and debt payments with detailed monitoring
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Add Debt Form */}
        <Card>
          <CardHeader>
            <CardTitle>Add New Debt/Loan</CardTitle>
            <CardDescription>
              Record a new loan or debt with EMI details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lender">Lender Name</Label>
                  <Input
                    id="lender"
                    placeholder="Bank or lender name"
                    value={formData.lender}
                    onChange={(e) => handleInputChange('lender', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Loan Type</Label>
                  <Select value={formData.loanType} onValueChange={(value) => handleInputChange('loanType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select loan type" />
                    </SelectTrigger>
                    <SelectContent>
                      {loanTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="principalAmount">Principal Amount ($)</Label>
                  <Input
                    id="principalAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.principalAmount}
                    onChange={(e) => handleInputChange('principalAmount', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentBalance">Current Balance ($)</Label>
                  <Input
                    id="currentBalance"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.currentBalance}
                    onChange={(e) => handleInputChange('currentBalance', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emiAmount">EMI Amount ($)</Label>
                  <Input
                    id="emiAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.emiAmount}
                    onChange={(e) => handleInputChange('emiAmount', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interestRate">Interest Rate (%)</Label>
                  <Input
                    id="interestRate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="0.00"
                    value={formData.interestRate}
                    onChange={(e) => handleInputChange('interestRate', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {loanStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes about this loan"
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
                {loading ? 'Adding Debt...' : 'Add Debt/Loan'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Active Debts */}
        <Card>
          <CardHeader>
            <CardTitle>Active Debts & Loans</CardTitle>
            <CardDescription>
              Your current loan obligations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {fetchingDebts ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : debts.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {debts.filter(debt => debt.status === 'Active').map((debt) => (
                  <div key={debt.id} className="p-4 border rounded space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{debt.lender}</h4>
                      <span className="text-sm px-2 py-1 bg-primary/10 text-primary rounded">
                        {debt.loanType}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Current Balance</p>
                        <p className="font-medium">${debt.currentBalance.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">EMI Amount</p>
                        <p className="font-medium">${debt.emiAmount.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Interest Rate</p>
                        <p className="font-medium">{debt.interestRate}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Months Remaining</p>
                        <p className="font-medium">
                          ~{calculateMonthsRemaining(debt.endDate, debt.currentBalance, debt.emiAmount)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No active debts found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Add your first loan using the form
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Debt Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Debt Summary</CardTitle>
          <CardDescription>
            Overview of your debt obligations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">
                ${debts.filter(d => d.status === 'Active').reduce((sum, debt) => sum + debt.currentBalance, 0).toFixed(2)}
              </div>
              <p className="text-sm text-muted-foreground">Total Outstanding</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                ${debts.filter(d => d.status === 'Active').reduce((sum, debt) => sum + debt.emiAmount, 0).toFixed(2)}
              </div>
              <p className="text-sm text-muted-foreground">Monthly EMI</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {debts.filter(d => d.status === 'Active').length}
              </div>
              <p className="text-sm text-muted-foreground">Active Loans</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {debts.filter(d => d.status === 'Completed').length}
              </div>
              <p className="text-sm text-muted-foreground">Completed Loans</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* All Debts Table */}
      {debts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>All Loans & Debts</CardTitle>
            <CardDescription>
              Complete history of your loans
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Lender</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Principal</th>
                    <th className="text-left p-2">Balance</th>
                    <th className="text-left p-2">EMI</th>
                    <th className="text-left p-2">Rate</th>
                    <th className="text-left p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {debts.map((debt) => (
                    <tr key={debt.id} className="border-b">
                      <td className="p-2 font-medium">{debt.lender}</td>
                      <td className="p-2">{debt.loanType}</td>
                      <td className="p-2">${debt.principalAmount.toFixed(2)}</td>
                      <td className="p-2">${debt.currentBalance.toFixed(2)}</td>
                      <td className="p-2">${debt.emiAmount.toFixed(2)}</td>
                      <td className="p-2">{debt.interestRate}%</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          debt.status === 'Active' ? 'bg-green-100 text-green-800' :
                          debt.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {debt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
