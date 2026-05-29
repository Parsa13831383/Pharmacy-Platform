import Link from 'next/link'
import { Phone, Mail, MapPin, Instagram } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-secondary/50 border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">س</span>
              </div>
              <span className="font-bold text-xl text-foreground">داروخانه سبز</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              داروخانه آنلاین با بهترین محصولات مراقبت از پوست، آرایشی، بهداشتی و مکمل‌های غذایی با کیفیت برتر و قیمت مناسب.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-bold text-foreground">دسترسی سریع</h4>
            <nav className="flex flex-col gap-2">
              <Link href="/products" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                همه محصولات
              </Link>
              <Link href="/products?category=skincare" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                مراقبت از پوست
              </Link>
              <Link href="/products?category=cosmetics" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                محصولات آرایشی
              </Link>
              <Link href="/products?category=supplements" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                مکمل‌های غذایی
              </Link>
            </nav>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h4 className="font-bold text-foreground">خدمات مشتریان</h4>
            <nav className="flex flex-col gap-2">
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                پیگیری سفارش
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                شرایط بازگشت کالا
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                سوالات متداول
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                تماس با ما
              </Link>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-bold text-foreground">ارتباط با ما</h4>
            <div className="space-y-3">
              <a href="tel:02112345678" className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors text-sm">
                <Phone className="w-4 h-4" />
                <span>۰۲۱-۱۲۳۴۵۶۷۸</span>
              </a>
              <a href="mailto:info@sabzpharmacy.ir" className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors text-sm">
                <Mail className="w-4 h-4" />
                <span>info@sabzpharmacy.ir</span>
              </a>
              <div className="flex items-start gap-3 text-muted-foreground text-sm">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>تهران، خیابان ولیعصر، پلاک ۱۲۳</span>
              </div>
              <a href="#" className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors text-sm">
                <Instagram className="w-4 h-4" />
                <span>@sabzpharmacy</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">
            © ۱۴۰۳ داروخانه سبز. تمامی حقوق محفوظ است.
          </p>
          <div className="flex items-center gap-6">
            <img 
              src="https://via.placeholder.com/60x30/f5f5f0/666666?text=eNamad" 
              alt="نماد اعتماد الکترونیکی"
              className="h-8 opacity-60 hover:opacity-100 transition-opacity"
            />
            <img 
              src="https://via.placeholder.com/60x30/f5f5f0/666666?text=Samandehi" 
              alt="ساماندهی"
              className="h-8 opacity-60 hover:opacity-100 transition-opacity"
            />
          </div>
        </div>
      </div>
    </footer>
  )
}
