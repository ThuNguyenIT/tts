import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  trailingSlash: true, // Add trailing slash to URLs (SEO friendly)
  poweredByHeader: false, // Hide 'X-Powered-By: Next.js' header (Security)
  experimental: {
    serverActions: {
      bodySizeLimit: '1gb',
      allowedOrigins: ['*'],
    },
    optimizeCss: false,
    optimizePackageImports: ['@next/image', 'lucide-react'],
    serverMinification: true,
    turbopackSourceMaps: process.env.NODE_ENV === 'production',
  },
  staticPageGenerationTimeout: 300, // 5 minutes
  webpack(config, { dev, isServer }) {
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            audio: {
              test: /[\\/]node_modules[\\/](howler|tone|web-audio-api)[\\/]/,
              name: 'audio-libs',
              chunks: 'all',
              priority: 30,
            },
            ui: {
              test: /[\\/]node_modules[\\/](lucide-react|class-variance-authority|clsx|tailwind-merge)[\\/]/,
              name: 'ui-libs',
              chunks: 'all',
              priority: 25,
            },
            images: {
              test: /\.(png|jpe?g|gif|svg|webp|avif)$/i,
              name: 'images',
              chunks: 'all',
              priority: 20,
            },
            audioAssets: {
              test: /\.(mp3|wav|ogg|m4a|aac|flac)$/i,
              name: 'audio-assets',
              chunks: 'all',
              priority: 15,
            },
          },
        },
      }
    }
    if (!dev && !isServer) {
      config.module.rules.push(
        {
          test: /\.(mp3|wav|ogg|m4a|aac|flac)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'static/audio/[name].[hash][ext]',
          },
        },
        {
          test: /\.(png|jpe?g|gif|svg|webp|avif)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'static/images/[name].[hash][ext]',
          },
        }
      )
    }
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    }
    return config
  },
  turbopack: {
    rules: {
      '*.{mp3,wav,ogg,m4a,aac,flac}': {
        loaders: ['file-loader'],
        as: '*.js',
      },
      '*.{png,jpg,jpeg,gif,svg,webp,avif}': {
        loaders: ['file-loader'],
        as: '*.js',
      },
    },
    resolveAlias: {
      '@': './src',
    },
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
      {
        source: '/static/audio/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/logo.png',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/tts',
        destination: '/',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
