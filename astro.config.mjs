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
  redirects: {
    '/aboutus/about_us.html': `${env.PUBLIC_BUILD_URL}/company/info`
  },
  vite: {
    envDir: './config/env',
    // config/env는 .env.dev/.env.prod로 명명돼있어 Vite가 모드별로 자동 로드하는
    // .env.development/.env.production 규칙과 안 맞는다 — 그래서 컴포넌트 코드의
    // import.meta.env.PUBLIC_BUILD_URL이 항상 undefined였다(GNB 등 링크가 "undefined/...''로
    // 깨져 404 나던 원인). 위에서 이미 loadEnv(mode, ...)로 정확히 읽어온 값을 define으로
    // 그대로 주입해 Vite의 자동 로딩과 무관하게 항상 올바른 값이 들어가게 한다.
    define: {
      'import.meta.env.PUBLIC_BUILD_URL': JSON.stringify(env.PUBLIC_BUILD_URL)
    },
    resolve: {
      alias: {
        '~': resolve('./src'),
        '@config': resolve('./config')
      }
    }
  }
})
