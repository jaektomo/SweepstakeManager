import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Melbourne Cup Sweepstake Manager',
  description: 'Manage your Melbourne Cup sweepstake entries and horse assignments',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
   <html lang="en" suppressHydrationWarning>
  <body className={inter.className}>
    {children}
    <div className="fixed bottom-0 left-0 right-0 p-2 bg-white border-t border-gray-200 text-center">
      <a 
        href="https://buymeacoffee.com/jaek" 
        target="_blank" 
        rel="noopener noreferrer"
        className="inline-flex items-center px-3 py-1 text-sm bg-yellow-400 hover:bg-yellow-500 text-black rounded transition-colors duration-200"
      >
        ☕️ Buy me a coffee
      </a>
    </div>
  </body>
</html>

  )
}
