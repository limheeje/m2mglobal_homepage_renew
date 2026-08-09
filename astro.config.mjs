import {defineConfig} from 'astro/config'
import {loadEnv} from 'vite'
import {resolve} from 'path'

const mode = process.env.MODE || 'dev'
const env = loadEnv(mode, './config/env', '')
console.log('MODE:', mode)
console.log('PUBLIC_BUILD_URL:', env.PUBLIC_BUILD_URL)
console.log('APP_ENV:', env.APP_ENV)

export default defineConfig({
  output: 'static',
  base: env.PUBLIC_BUILD_URL,
  vite: {
    envDir: './config/env',
    resolve: {
      alias: {
        '~': resolve('./src'),
        '@config': resolve('./config')
      }
    }
  }
})
