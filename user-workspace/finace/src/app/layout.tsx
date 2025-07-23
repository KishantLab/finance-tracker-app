import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Finance Tracker',
  description: 'Complete finance management with expense tracking, debt management, and Google Sheets integration',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-background text-foreground`}>
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold">Finance Tracker</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="/dashboard" className="text-sm font-medium transition-colors hover:text-primary">
                Dashboard
              </a>
              <a href="/expenses" className="text-sm font-medium transition-colors hover:text-primary">
                Expenses
              </a>
              <a href="/debts" className="text-sm font-medium transition-colors hover:text-primary">
                Debts & Loans
              </a>
            </nav>
            <div className="md:hidden">
              <button className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                <span className="sr-only">Open menu</span>
                <div className="space-y-1">
                  <div className="h-0.5 w-4 bg-current"></div>
                  <div className="h-0.5 w-4 bg-current"></div>
                  <div className="h-0.5 w-4 bg-current"></div>
                </div>
              </button>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  )
}
