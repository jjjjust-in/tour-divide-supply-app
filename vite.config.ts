import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

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
  ],
})
