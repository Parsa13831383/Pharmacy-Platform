export interface Product {
  id: string
  name: string
  nameEn: string
  description: string
  price: number
  originalPrice?: number
  image: string
  images?: string[]
  category: string
  categorySlug: string
  brand: string
  inStock: boolean
  stockCount: number
  rating: number
  reviewCount: number
  tags: string[]
  features?: string[]
  usage?: string
  ingredients?: string[]
  volume?: string
  isNew?: boolean
  isBestseller?: boolean
}

export interface Category {
  id: string
  name: string
  nameEn: string
  slug: string
  description: string
  image: string
  productCount: number
}

export const categories: Category[] = [
  {
    id: '1',
    name: 'مراقبت از پوست',
    nameEn: 'Skincare',
    slug: 'skincare',
    description: 'محصولات حرفه‌ای برای مراقبت و جوان‌سازی پوست',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80',
    productCount: 45,
  },
  {
    id: '2',
    name: 'آرایشی',
    nameEn: 'Cosmetics',
    slug: 'cosmetics',
    description: 'محصولات آرایشی از برندهای معتبر',
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&q=80',
    productCount: 38,
  },
  {
    id: '3',
    name: 'بهداشتی',
    nameEn: 'Hygiene',
    slug: 'hygiene',
    description: 'محصولات بهداشتی با کیفیت برتر',
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80',
    productCount: 52,
  },
  {
    id: '4',
    name: 'مکمل‌های غذایی',
    nameEn: 'Supplements',
    slug: 'supplements',
    description: 'ویتامین‌ها و مکمل‌های غذایی اصل',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80',
    productCount: 67,
  },
  {
    id: '5',
    name: 'مراقبت از مو',
    nameEn: 'Hair Care',
    slug: 'hair-care',
    description: 'شامپو، ماسک مو و محصولات تقویتی',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80',
    productCount: 29,
  },
  {
    id: '6',
    name: 'عطر و ادکلن',
    nameEn: 'Perfumes',
    slug: 'perfumes',
    description: 'عطرهای اورجینال از برندهای معروف',
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&q=80',
    productCount: 34,
  },
]

export const products: Product[] = [
  // Skincare
  {
    id: 'sk-001',
    name: 'سرم ویتامین C روشن‌کننده',
    nameEn: 'Vitamin C Brightening Serum',
    description: 'سرم قدرتمند حاوی ویتامین C خالص برای روشن کردن و یکدست کردن رنگ پوست. این سرم با فرمولاسیون پیشرفته به کاهش لک‌ها و تیرگی‌های پوست کمک می‌کند.',
    price: 890000,
    originalPrice: 1200000,
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80',
      'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600&q=80',
    ],
    category: 'مراقبت از پوست',
    categorySlug: 'skincare',
    brand: 'سیدرکس',
    inStock: true,
    stockCount: 24,
    rating: 4.8,
    reviewCount: 156,
    tags: ['روشن‌کننده', 'ضد لک', 'آنتی‌اکسیدان'],
    features: ['حاوی ۲۰٪ ویتامین C', 'بدون پارابن', 'مناسب انواع پوست'],
    usage: 'صبح و شب پس از پاکسازی پوست، چند قطره روی صورت و گردن بمالید.',
    volume: '30 میلی‌لیتر',
    isNew: true,
    isBestseller: true,
  },
  {
    id: 'sk-002',
    name: 'کرم مرطوب‌کننده هیالورونیک اسید',
    nameEn: 'Hyaluronic Acid Moisturizer',
    description: 'کرم مرطوب‌کننده عمیق با هیالورونیک اسید برای آبرسانی ۲۴ ساعته و حفظ نرمی پوست.',
    price: 650000,
    image: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=600&q=80',
    category: 'مراقبت از پوست',
    categorySlug: 'skincare',
    brand: 'لاروش پوزای',
    inStock: true,
    stockCount: 18,
    rating: 4.9,
    reviewCount: 234,
    tags: ['مرطوب‌کننده', 'آبرسان', 'ضد چروک'],
    volume: '50 میلی‌لیتر',
    isBestseller: true,
  },
  {
    id: 'sk-003',
    name: 'ضدآفتاب SPF50 بی‌رنگ',
    nameEn: 'SPF50 Invisible Sunscreen',
    description: 'ضدآفتاب با حفاظت بالا و بافت سبک که روی پوست نامرئی می‌شود.',
    price: 480000,
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80',
    category: 'مراقبت از پوست',
    categorySlug: 'skincare',
    brand: 'اوسرین',
    inStock: true,
    stockCount: 45,
    rating: 4.7,
    reviewCount: 312,
    tags: ['ضدآفتاب', 'SPF50', 'بی‌رنگ'],
    volume: '50 میلی‌لیتر',
  },
  {
    id: 'sk-004',
    name: 'سرم رتینول شب',
    nameEn: 'Night Retinol Serum',
    description: 'سرم قدرتمند شب با رتینول برای کاهش چروک‌ها و نشانه‌های پیری.',
    price: 1250000,
    originalPrice: 1500000,
    image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600&q=80',
    category: 'مراقبت از پوست',
    categorySlug: 'skincare',
    brand: 'اوردینری',
    inStock: true,
    stockCount: 12,
    rating: 4.6,
    reviewCount: 89,
    tags: ['ضد پیری', 'رتینول', 'شب'],
    volume: '30 میلی‌لیتر',
    isNew: true,
  },
  // Cosmetics
  {
    id: 'co-001',
    name: 'کرم پودر ماندگار مات',
    nameEn: 'Long-lasting Matte Foundation',
    description: 'کرم پودر با پوشش کامل و ماندگاری ۲۴ ساعته. مناسب برای پوست‌های چرب و مختلط.',
    price: 720000,
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&q=80',
    category: 'آرایشی',
    categorySlug: 'cosmetics',
    brand: 'میبلین',
    inStock: true,
    stockCount: 32,
    rating: 4.5,
    reviewCount: 198,
    tags: ['کرم پودر', 'مات', 'ماندگار'],
    volume: '30 میلی‌لیتر',
  },
  {
    id: 'co-002',
    name: 'ماسکارا حجم‌دهنده',
    nameEn: 'Volume Mascara',
    description: 'ماسکارا با برس منحصر به فرد برای حجم دادن و جدا کردن مژه‌ها.',
    price: 380000,
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&q=80',
    category: 'آرایشی',
    categorySlug: 'cosmetics',
    brand: 'لورآل',
    inStock: true,
    stockCount: 56,
    rating: 4.4,
    reviewCount: 267,
    tags: ['ماسکارا', 'حجم‌دهنده', 'مژه'],
    isBestseller: true,
  },
  {
    id: 'co-003',
    name: 'رژ لب مایع مات',
    nameEn: 'Matte Liquid Lipstick',
    description: 'رژ لب مایع با فینیش مات و ماندگاری بالا. بدون خشک کردن لب‌ها.',
    price: 290000,
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&q=80',
    category: 'آرایشی',
    categorySlug: 'cosmetics',
    brand: 'نیکس',
    inStock: true,
    stockCount: 78,
    rating: 4.6,
    reviewCount: 345,
    tags: ['رژ لب', 'مات', 'مایع'],
  },
  // Supplements
  {
    id: 'su-001',
    name: 'قرص ویتامین D3',
    nameEn: 'Vitamin D3 Tablets',
    description: 'ویتامین D3 با دوز ۱۰۰۰ واحد برای تقویت استخوان‌ها و سیستم ایمنی.',
    price: 185000,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80',
    category: 'مکمل‌های غذایی',
    categorySlug: 'supplements',
    brand: 'نیچرز بونتی',
    inStock: true,
    stockCount: 120,
    rating: 4.8,
    reviewCount: 412,
    tags: ['ویتامین', 'D3', 'استخوان'],
    isBestseller: true,
  },
  {
    id: 'su-002',
    name: 'کپسول امگا ۳',
    nameEn: 'Omega 3 Capsules',
    description: 'روغن ماهی خالص با غلظت بالای EPA و DHA برای سلامت قلب و مغز.',
    price: 320000,
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&q=80',
    category: 'مکمل‌های غذایی',
    categorySlug: 'supplements',
    brand: 'سولگار',
    inStock: true,
    stockCount: 85,
    rating: 4.7,
    reviewCount: 289,
    tags: ['امگا 3', 'قلب', 'مغز'],
  },
  {
    id: 'su-003',
    name: 'پودر کلاژن دریایی',
    nameEn: 'Marine Collagen Powder',
    description: 'کلاژن دریایی هیدرولیز شده برای سلامت پوست، مو و ناخن.',
    price: 580000,
    originalPrice: 750000,
    image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&q=80',
    category: 'مکمل‌های غذایی',
    categorySlug: 'supplements',
    brand: 'ویتال پروتئین',
    inStock: true,
    stockCount: 34,
    rating: 4.9,
    reviewCount: 178,
    tags: ['کلاژن', 'پوست', 'مو'],
    isNew: true,
    isBestseller: true,
  },
  // Hygiene
  {
    id: 'hy-001',
    name: 'ژل شستشوی صورت ملایم',
    nameEn: 'Gentle Face Wash Gel',
    description: 'ژل پاک‌کننده ملایم برای شستشوی روزانه صورت بدون خشک کردن پوست.',
    price: 245000,
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80',
    category: 'بهداشتی',
    categorySlug: 'hygiene',
    brand: 'سراوی',
    inStock: true,
    stockCount: 67,
    rating: 4.6,
    reviewCount: 234,
    tags: ['ژل شستشو', 'ملایم', 'روزانه'],
    volume: '200 میلی‌لیتر',
  },
  {
    id: 'hy-002',
    name: 'دهان‌شویه ضد باکتری',
    nameEn: 'Antibacterial Mouthwash',
    description: 'دهان‌شویه با فرمول پیشرفته برای از بین بردن ۹۹٪ باکتری‌ها.',
    price: 125000,
    image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=600&q=80',
    category: 'بهداشتی',
    categorySlug: 'hygiene',
    brand: 'لیسترین',
    inStock: true,
    stockCount: 89,
    rating: 4.5,
    reviewCount: 156,
    tags: ['دهان‌شویه', 'ضد باکتری'],
    volume: '500 میلی‌لیتر',
  },
  // Hair Care
  {
    id: 'hc-001',
    name: 'شامپو ضد ریزش مو',
    nameEn: 'Anti Hair Loss Shampoo',
    description: 'شامپو تقویتی با فرمول پیشرفته برای کاهش ریزش و تقویت رشد مو.',
    price: 420000,
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80',
    category: 'مراقبت از مو',
    categorySlug: 'hair-care',
    brand: 'ویچی',
    inStock: true,
    stockCount: 41,
    rating: 4.7,
    reviewCount: 198,
    tags: ['شامپو', 'ضد ریزش', 'تقویتی'],
    volume: '400 میلی‌لیتر',
    isBestseller: true,
  },
  {
    id: 'hc-002',
    name: 'ماسک مو کراتینه',
    nameEn: 'Keratin Hair Mask',
    description: 'ماسک ترمیمی قوی با کراتین برای موهای آسیب‌دیده و خشک.',
    price: 350000,
    image: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=600&q=80',
    category: 'مراقبت از مو',
    categorySlug: 'hair-care',
    brand: 'مورواکی',
    inStock: true,
    stockCount: 28,
    rating: 4.8,
    reviewCount: 145,
    tags: ['ماسک مو', 'کراتین', 'ترمیمی'],
    volume: '250 میلی‌لیتر',
    isNew: true,
  },
  // Perfumes
  {
    id: 'pf-001',
    name: 'ادوپرفیوم زنانه گل رز',
    nameEn: 'Rose Garden Eau de Parfum',
    description: 'عطر زنانه لوکس با رایحه گل رز و یاسمن. ماندگاری بالا.',
    price: 1850000,
    originalPrice: 2200000,
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&q=80',
    category: 'عطر و ادکلن',
    categorySlug: 'perfumes',
    brand: 'شانل',
    inStock: true,
    stockCount: 15,
    rating: 4.9,
    reviewCount: 87,
    tags: ['عطر', 'زنانه', 'گل رز'],
    volume: '100 میلی‌لیتر',
    isBestseller: true,
  },
  {
    id: 'pf-002',
    name: 'ادوتویلت مردانه چوبی',
    nameEn: 'Woody Eau de Toilette',
    description: 'عطر مردانه با رایحه چوبی و مشک. مناسب استفاده روزانه.',
    price: 980000,
    image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&q=80',
    category: 'عطر و ادکلن',
    categorySlug: 'perfumes',
    brand: 'دیور',
    inStock: true,
    stockCount: 22,
    rating: 4.6,
    reviewCount: 134,
    tags: ['عطر', 'مردانه', 'چوبی'],
    volume: '75 میلی‌لیتر',
  },
]

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fa-IR').format(price) + ' تومان'
}

export function getProductById(id: string): Product | undefined {
  return products.find(p => p.id === id)
}

export function getProductsByCategory(categorySlug: string): Product[] {
  return products.filter(p => p.categorySlug === categorySlug)
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find(c => c.slug === slug)
}

export function searchProducts(query: string): Product[] {
  const lowercaseQuery = query.toLowerCase()
  return products.filter(p => 
    p.name.toLowerCase().includes(lowercaseQuery) ||
    p.nameEn.toLowerCase().includes(lowercaseQuery) ||
    p.description.toLowerCase().includes(lowercaseQuery) ||
    p.tags.some(t => t.toLowerCase().includes(lowercaseQuery))
  )
}

export function getBestsellers(): Product[] {
  return products.filter(p => p.isBestseller)
}

export function getNewProducts(): Product[] {
  return products.filter(p => p.isNew)
}
