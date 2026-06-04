import Link from 'next/link'
import { MapPin, Phone, Smartphone } from 'lucide-react'

export function Footer() {
  return (
    <footer style={{ backgroundColor: '#EFE7DA', borderTop: '1px solid #E5DED1' }}>
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-10 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-16">

          {/* Brand */}
          <div className="space-y-4 col-span-2 md:col-span-1 lg:col-span-1">
            <Link href="/" className="inline-block">
              <span className="font-bold text-base leading-tight" style={{ color: '#232323', letterSpacing: '-0.02em' }}>
                داروخانه دکتر پویا نانوازاده
              </span>
            </Link>
            <p className="text-sm leading-relaxed" style={{ color: '#6F6A61', maxWidth: '24ch' }}>
              سلامت، زیبایی و مراقبت با اطمینان — مهاباد
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://www.instagram.com/dr.pouyapharmacy"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center rounded-full border transition-colors text-xs font-bold"
                style={{ borderColor: '#E5DED1', color: '#6F6A61' }}
                aria-label="اینستاگرام"
              >
                IG
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-xs tracking-editorial font-medium" style={{ color: '#232323' }}>
              محصولات
            </h4>
            <nav className="flex flex-col gap-0">
              {[
                { href: '/products', label: 'همه محصولات' },
                { href: '/products?category=skincare', label: 'مراقبت پوست' },
                { href: '/products?category=cosmetics', label: 'آرایشی' },
                { href: '/products?category=supplements', label: 'مکمل‌ها' },
                { href: '/products?category=hygiene', label: 'بهداشت شخصی' },
              ].map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="py-2.5 text-sm transition-colors"
                  style={{ color: '#6F6A61' }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h4 className="text-xs tracking-editorial font-medium" style={{ color: '#232323' }}>
              خدمات مشتریان
            </h4>
            <nav className="flex flex-col gap-0">
              {[
                { href: '/track-order', label: 'پیگیری سفارش' },
                { href: '#', label: 'شرایط بازگشت کالا' },
                { href: '#', label: 'سوالات متداول' },
                { href: '#', label: 'تماس با ما' },
              ].map(link => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="py-2.5 text-sm transition-colors"
                  style={{ color: '#6F6A61' }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-xs tracking-editorial font-medium" style={{ color: '#232323' }}>
              تماس
            </h4>
            <div className="flex flex-col gap-3">
              <a href="tel:04442248282" className="flex items-center gap-2.5 text-sm" style={{ color: '#6F6A61' }}>
                <Phone className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
                ۰۴۴۴-۲۲۴۸۲۸۲
              </a>
              <a href="tel:09333252226" className="flex items-center gap-2.5 text-sm" style={{ color: '#6F6A61' }}>
                <Smartphone className="w-3.5 h-3.5 shrink-0" strokeWidth={1.5} />
                ۰۹۳۳-۳۲۵۲۲۲۶
              </a>
              <div className="flex items-start gap-2.5 text-sm" style={{ color: '#6F6A61' }}>
                <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" strokeWidth={1.5} />
                مهاباد، خیابان صلاح‌الدین ایوبی، غربی ساختمان پزشکان صلاح‌الدین، طبقه همکف
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-8 md:mt-16 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: '1px solid #E5DED1' }}
        >
          <p className="text-xs" style={{ color: '#6F6A61' }}>
            © ۱۴۰۳ داروخانه دکتر پویا نانوازاده. تمامی حقوق محفوظ است.
          </p>
          <Link href="/admin" className="text-xs transition-colors" style={{ color: '#6F6A61' }}>
            پنل مدیریت
          </Link>
        </div>
      </div>
    </footer>
  )
}
