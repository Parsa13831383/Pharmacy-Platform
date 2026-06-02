-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "featuredOnHomepage" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "featuredOnHomepage" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "HomepageSettings" (
    "id" TEXT NOT NULL,
    "heroTitle" TEXT NOT NULL DEFAULT 'خرید آسان محصولات داروخانه‌ای',
    "heroSubtitle" TEXT NOT NULL DEFAULT 'محصولات آرایشی، بهداشتی و مکمل‌ها را ساده، سریع و مطمئن سفارش دهید.',
    "heroButtonText" TEXT NOT NULL DEFAULT 'مشاهده محصولات',
    "heroButtonLink" TEXT NOT NULL DEFAULT '/products',
    "promoBannerTitle" TEXT NOT NULL DEFAULT 'جشنواره فروش ویژه',
    "promoBannerSubtitle" TEXT NOT NULL DEFAULT 'تخفیف‌های استثنایی روی محصولات منتخب',
    "aboutTitle" TEXT NOT NULL DEFAULT 'درباره داروخانه سبز',
    "aboutDescription" TEXT NOT NULL DEFAULT 'داروخانه سبز با هدف ارائه محصولات با کیفیت آرایشی، بهداشتی و دارویی، خدمات خود را به صورت آنلاین ارائه می‌دهد.',
    "contactPhone" TEXT NOT NULL DEFAULT '',
    "contactWhatsapp" TEXT NOT NULL DEFAULT '',
    "isHeroEnabled" BOOLEAN NOT NULL DEFAULT true,
    "isPromoEnabled" BOOLEAN NOT NULL DEFAULT true,
    "isFeaturedProductsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "isFeaturedCategoriesEnabled" BOOLEAN NOT NULL DEFAULT true,
    "isAboutEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomepageSettings_pkey" PRIMARY KEY ("id")
);
