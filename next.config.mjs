/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Lint ainda ignorado no build (ruidoso). Rode `next lint` manualmente.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Checagem de tipo religada — projeto typecheck limpo em 2026-07-01.
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
  // Evitar redirect 307 em rotas de API
  skipTrailingSlashRedirect: true,
  trailingSlash: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=()',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://generativelanguage.googleapis.com https://api.stripe.com; frame-src https://js.stripe.com https://checkout.stripe.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self';",
          },
        ],
      },
    ]
  },
}

export default nextConfig