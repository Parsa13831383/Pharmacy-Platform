/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // unoptimized keeps Next.js Image working as a smart <img> wrapper
    // (lazy loading, fill layout, onError) without running the optimization
    // pipeline — required because backend product images are served from
    // an external Express server that isn't in the remotePatterns allowlist
    // at every possible deployment URL.
    unoptimized: true,
  },
}

export default nextConfig
