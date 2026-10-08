import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// Plugin to resolve figma:asset/ imports to files in public/
function figmaAssetPlugin() {
  return {
    name: 'figma-asset',
    enforce: 'pre' as const,
    resolveId(id: string) {
      if (id.startsWith('figma:asset/')) {
        return '\0' + id
      }
    },
    load(id: string) {
      if (id.startsWith('\0figma:asset/')) {
        const hash = id.replace('\0figma:asset/', '').replace('.png', '')
        // Map known hashes to public assets
        const assetMap: Record<string, string> = {
          '53e87b274f9e9eae37a672b63e5feb2e3c44276d': '/nav-bg-pattern.png',
        }
        const publicPath = assetMap[hash] || '/nav-bg-pattern.png'
        return `export default ${JSON.stringify(publicPath)}`
      }
    }
  }
}

export default defineConfig({
  plugins: [
    figmaAssetPlugin(),
    react(),
    tailwindcss(),
    // Service worker: precaches the whole app shell so it opens with no signal.
    // autoUpdate quietly swaps in a new version the next time the app is
    // opened with a connection.
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'icon-180.png', 'nav-bg-pattern.png'],
      manifest: {
        name: 'Tour Divide Supply',
        short_name: 'TD Supply',
        description: 'Tour Divide route notes, resupplies and journal. Works offline.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#febc12',
        theme_color: '#febc12',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2,otf,ttf}'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
      },
    }),
  ],
})
