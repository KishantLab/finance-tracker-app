export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] text-center">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Complete Finance Management
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Track your daily expenses, manage multiple payment categories, monitor debts and EMIs, 
            all synced with Google Sheets for seamless data management.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="p-6 rounded-lg border bg-card">
            <h3 className="text-lg font-semibold mb-2">Expense Tracking</h3>
            <p className="text-sm text-muted-foreground">
              Log daily expenses with multiple categories and payment methods
            </p>
          </div>
          <div className="p-6 rounded-lg border bg-card">
            <h3 className="text-lg font-semibold mb-2">Debt Management</h3>
            <p className="text-sm text-muted-foreground">
              Track loans, EMIs, and debt payments with detailed monitoring
            </p>
          </div>
          <div className="p-6 rounded-lg border bg-card">
            <h3 className="text-lg font-semibold mb-2">Google Sheets Sync</h3>
            <p className="text-sm text-muted-foreground">
              Automatic synchronization with Google Sheets for data backup
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <a 
            href="/dashboard" 
            className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            Get Started
          </a>
          <a 
            href="/expenses" 
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-8 py-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Add Expense
          </a>
        </div>
      </div>
    </div>
  )
}
