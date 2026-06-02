/**
 * Brand Visual System — Photography Edition
 *
 * Every visual uses real photography via next/image.
 * If an image file is missing, a warm editorial background
 * shows instead — no broken states, no layout shifts.
 *
 * Image files live in: /public/images/
 * See /public/images/README.md for the full file list.
 */
'use client'

import Image from 'next/image'
import { useState } from 'react'

// ─── Warm editorial fallback backgrounds ─────────────────────────────────────
// Shown while images load and as a permanent fallback if a file is missing.
// Palette matches the MAAPILIM / Aesop warm-cream brand aesthetic.
const FALLBACKS = {
  hero:        '#DDD5C5',
  brandStory:  '#E4DDD2',
  promo:       '#2A2320',
  skincare:    '#E8E3D8',
  hairCare:    '#EDE6D8',
  cosmetics:   '#EDE0DC',
  supplements: '#E2E8DE',
  hygiene:     '#DDE4E8',
}

// ─── BrandPhoto — single smart image slot ─────────────────────────────────────
// Wraps next/image with:
//   • Absolute fill inside a positioned parent
//   • Warm fallback color visible behind the photo (no blank white)
//   • onError sets state so broken src never shows
//   • priority=true for above-the-fold slots
interface BrandPhotoProps {
  src: string
  alt: string
  fallback: string
  objectPosition?: string
  priority?: boolean
  className?: string
}

function BrandPhoto({
  src,
  alt,
  fallback,
  objectPosition = 'center',
  priority = false,
  className = '',
}: BrandPhotoProps) {
  const [failed, setFailed] = useState(false)

  return (
    <div
      className={`absolute inset-0 ${className}`}
      style={{ backgroundColor: fallback }}
    >
      {!failed && (
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, 50vw"
          style={{ objectFit: 'cover', objectPosition }}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  )
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
/**
 * Full editorial hero photo — occupies the right 50% of the hero section.
 * Place: /public/images/hero.jpg
 * Ideal: 1400 × 1800px portrait, premium skincare styling.
 */
export function HeroPhoto() {
  return (
    <BrandPhoto
      src="/images/hero.jpg"
      alt="داروخانه سبز — مجموعه مراقبت پوست و زیبایی"
      fallback={FALLBACKS.hero}
      objectPosition="center top"
      priority
    />
  )
}

// ─── CATEGORY PHOTOS ──────────────────────────────────────────────────────────
/**
 * Each category card gets a full-bleed photo background.
 * Portrait orientation (3:4) — fills the card completely.
 */

export function SkincareCategoryPhoto() {
  return (
    <BrandPhoto
      src="/images/cat-skincare.jpg"
      alt="مراقبت پوست"
      fallback={FALLBACKS.skincare}
    />
  )
}

export function HairCareCategoryPhoto() {
  return (
    <BrandPhoto
      src="/images/cat-hair-care.jpg"
      alt="مراقبت مو"
      fallback={FALLBACKS.hairCare}
    />
  )
}

export function CosmeticsCategoryPhoto() {
  return (
    <BrandPhoto
      src="/images/cat-cosmetics.jpg"
      alt="آرایشی"
      fallback={FALLBACKS.cosmetics}
    />
  )
}

export function SupplementsCategoryPhoto() {
  return (
    <BrandPhoto
      src="/images/cat-supplements.jpg"
      alt="مکمل‌ها"
      fallback={FALLBACKS.supplements}
    />
  )
}

export function HygieneCategoryPhoto() {
  return (
    <BrandPhoto
      src="/images/cat-hygiene.jpg"
      alt="بهداشت فردی"
      fallback={FALLBACKS.hygiene}
    />
  )
}

/** Map slug → photo component — used in the category card grid */
export const CATEGORY_PHOTO: Record<string, React.FC> = {
  skincare:    SkincareCategoryPhoto,
  'hair-care': HairCareCategoryPhoto,
  cosmetics:   CosmeticsCategoryPhoto,
  supplements: SupplementsCategoryPhoto,
  hygiene:     HygieneCategoryPhoto,
  perfumes:    CosmeticsCategoryPhoto,
}

// ─── BRAND STORY ──────────────────────────────────────────────────────────────
/**
 * Pharmacy / wellness lifestyle photo for the brand story section.
 * Place: /public/images/brand-story.jpg
 * Ideal: 1200 × 900px landscape, clean pharmacy shelves, warm lighting.
 */
export function BrandStoryPhoto() {
  return (
    <BrandPhoto
      src="/images/brand-story.jpg"
      alt="داروخانه سبز — کیفیت از منبع"
      fallback={FALLBACKS.brandStory}
    />
  )
}

// ─── PROMOTIONAL BANNER ───────────────────────────────────────────────────────
/**
 * Dark editorial photo for the promotional banner section.
 * Place: /public/images/promo-banner.jpg
 * Ideal: 1200 × 800px landscape, dark moody product photography.
 */
export function PromoBannerPhoto() {
  return (
    <BrandPhoto
      src="/images/promo-banner.jpg"
      alt="پیشنهاد ویژه داروخانه سبز"
      fallback={FALLBACKS.promo}
      objectPosition="center"
    />
  )
}

// ─── Legacy SVG names kept as aliases ────────────────────────────────────────
// Allows existing imports to keep working during the transition.
export const HeroEditorialSVG    = HeroPhoto
export const PharmacyStorySVG    = BrandStoryPhoto
export const PromoBannerSVG      = PromoBannerPhoto
export const SkincareSVG         = SkincareCategoryPhoto
export const HairCareSVG         = HairCareCategoryPhoto
export const FragranceSVG        = CosmeticsCategoryPhoto
export const SupplementsSVG      = SupplementsCategoryPhoto
export const HygieneSVG          = HygieneCategoryPhoto
export const CATEGORY_SVG        = CATEGORY_PHOTO
