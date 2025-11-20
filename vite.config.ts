import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
//element plus按需导入
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    // createHtmlPlugin({}),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
    AutoImport({
      resolvers: [ElementPlusResolver()],
      imports: ['vue'],
      dts: 'types/auto-imports.d.ts',
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
function createHtmlPlugin(arg0: {}): import('vite').PluginOption {
  throw new Error('Function not implemented.')
}
