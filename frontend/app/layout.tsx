import type { Metadata, Viewport } from 'next'
import { Vazirmatn, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { CartProvider } from '@/lib/cart-context'
import { LoadingWrapper } from '@/components/loading-wrapper'

const vazirmatn = Vazirmatn({ 
  subsets: ['arabic', 'latin'],
  variable: '--font-vazirmatn',
  display: 'swap',
})

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'داروخانه سبز | محصولات مراقبت از پوست و زیبایی',
  description: 'داروخانه آنلاین با بهترین محصولات مراقبت از پوست، آرایشی، بهداشتی و مکمل‌های غذایی با کیفیت برتر',
  generator: 'v0.app',
  keywords: ['داروخانه', 'مراقبت از پوست', 'آرایشی', 'بهداشتی', 'مکمل'],
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#7fa882',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fa" dir="rtl" className="bg-background">
      <body className={`${vazirmatn.variable} ${playfair.variable} font-sans antialiased`}>
        <LoadingWrapper>
          <CartProvider>
            {children}
          </CartProvider>
        </LoadingWrapper>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
