import './globals.css'
import { Open_Sans } from 'next/font/google';
import {
  ClerkProvider,
  SignedIn,
  UserButton
} from '@clerk/nextjs'
import { ThemeProvider } from '@/components/providers/theme-provider';

const font = Open_Sans({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={font.className}>
          <ThemeProvider
            attribute='class'
            defaultTheme='dark'
            enableSystem
            disableTransitionOnChange
            storageKey='echo-theme'
            >
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}