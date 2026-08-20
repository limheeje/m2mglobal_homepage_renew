# M2M GLOBAL 홈페이지 리뉴얼

Astro 기반 정적 사이트(SSG). 신규 디자인(Figma) 기준으로 구 사이트(`@old/`)를 페이지 단위로 재구축하는 프로젝트입니다.

> 이 문서는 프로젝트에 처음 합류하는 작업자가 "뭐가 어디 있고, 어떻게 돌리고, 어떤 규칙으로 짜여 있는지"를 빠르게 파악하도록 정리한 문서입니다. 작업 컨벤션(네이밍/토큰/컴포넌트 설계 원칙 등)의 **최종 소스는 `CLAUDE.md`**이며, 이 문서는 "지금 코드베이스에 실제로 뭐가 있는지"를 면밀하게 정리한 참고서입니다.

---

## 1. 빠른 시작

### 요구사항

- Node.js `>= 22.12.0` (`package.json` `engines` 명시)
- VSCode + **Live Sass Compile**(`glenn2223.live-sass-compiler`) 확장 — SCSS 컴파일에 필수 (아래 [6. 스타일링](#6-스타일링-scss--watch-sass) 참고)

### 설치 & 실행

```bash
npm install

# 개발 서버 (기본 모드, PUBLIC_BUILD_URL 빈 값)
npm run dev

# 개발 서버 (dev 모드 명시 + 네트워크 호스트 노출, cross-env로 MODE=dev 주입)
npm run local

# 프로덕션 빌드 (MODE=prod, PUBLIC_BUILD_URL=/dist)
npm run build:prod

# 빌드 결과 로컬 프리뷰
npm run preview
```

Claude Code로 작업할 때는 `astro dev --background`로 백그라운드 실행 후 `astro dev stop` / `astro dev status` / `astro dev logs`로 관리합니다(`CLAUDE.md` 참고).

### VSCode에서 SCSS 컴파일 켜기 (필수)

이 프로젝트는 Astro의 내장 vite-sass가 아니라 **VSCode Live Sass Compile 확장**으로 SCSS → CSS를 컴파일합니다.

1. VSCode 하단 상태바의 **Watch Sass** 클릭 (켜두면 저장할 때마다 자동 컴파일)
2. `src/styles/scss/**/*.scss`만 수정 — `src/styles/css/main.css`(컴파일 산출물, git ignore 대상)는 직접 건드리지 않음

---

## 2. 환경 변수 (`config/env/`)

`.env.dev`, `.env.prod` 두 파일만 있고, **파일명이 Vite의 자동 로딩 규칙(`.env.development`/`.env.production`)과 다릅니다** — 그래서 `astro.config.mjs`가 `loadEnv(mode, './config/env', '')`로 직접 읽어와 `vite.define`으로 `import.meta.env.PUBLIC_BUILD_URL`에 주입합니다(자동 로딩에 맡기면 항상 `undefined`가 되어 GNB 등 링크가 깨졌던 이력이 있음 — `astro.config.mjs` 주석 참고).

| 파일 | `MODE` | `APP_ENV` | `PUBLIC_BUILD_URL` | 의미 |
| --- | --- | --- | --- | --- |
| `config/env/.env.dev` | `dev` | `dev` | *(빈 문자열)* | 로컬 개발 — 루트 경로에서 서빙 |
| `config/env/.env.prod` | `prod` | `prod` | `/dist` | 배포 — `/dist` 서브패스에서 서빙 (`astro.config.mjs`의 `base`로도 그대로 들어감) |

- `MODE`는 `npm run local`/`npm run build:prod`가 `cross-env`로 주입하는 값이고, 이 값으로 `config/env/.env.{MODE}`를 고른다.
- 컴포넌트/페이지 코드에서 GNB/서브탭 등 메뉴 링크를 만들 때는 경로 문자열을 직접 쓰지 말고 `@config/route`의 `route` 배열(그룹/`children`)을 순회해서 만드는 게 원칙(아래 [4. 라우팅](#4-라우팅-configroute) 참고). 실제 URL 문자열 자체는 미리 계산된 조회 객체가 따로 있는 게 아니라 `` `${PUBLIC_BUILD_URL}${item.href}` `` 접합으로 만듭니다 — 코드베이스 전체가 이 방식으로 통일되어 있음.

---

## 3. 프로젝트 구조

```text
/
├── @old/                      # 구 사이트 원본(HTML/CSS/JS/이미지) — 마이그레이션 원본 참고용, 절대 수정 금지
├── config/
│   ├── env/                   # .env.dev / .env.prod
│   └── route/                 # index.ts 한 파일 — 라우트 정의(route: Route[]), 단일 소스
├── public/                    # 정적 파일 그대로 서빙 (images/, icons/, css/js — @old에서 옮겨온 서드파티 자산 등)
├── src/
│   ├── assets/                # Astro가 최적화 처리하는 이미지/아이콘 (import해서 사용)
│   ├── components/
│   │   ├── common/            # 공용 컴포넌트 (아래 5번 표)
│   │   ├── layout/             # Gnb.astro, Footer.astro
│   │   └── ui/box/             # Box 상단 타이틀 variant 5종(BoxTitleCase1~5) + 조합 래퍼(UiBoxCase1~3), UiNoti, UiTags — /company/info 전용으로 현재 쓰임
│   ├── constants/
│   │   └── Icon.ts             # ICON_KEY_NAME — Figma 레이어명(한글 포함) → public/images/icons/*.svg 파일명 매핑
│   ├── layouts/
│   │   └── Layout.astro        # 모든 페이지의 <html> 뼈대(GNB/Footer/AllMenu/전역 스크립트 로드)
│   ├── pages/                  # 파일 기반 라우팅 (아래 4번 표)
│   ├── scripts/                # 전역 vanilla TS 스크립트 (아래 7번 표) — Layout.astro의 <script>에서 import
│   ├── styles/
│   │   ├── scss/                # 실제 작업 대상 (아래 6번)
│   │   └── css/main.css         # SCSS 컴파일 산출물, git ignore, 직접 수정 금지
│   └── utils/
│       └── rem.ts               # pxToRem() — JS에서 인라인 스타일에 px 대신 rem을 내려줄 때 사용
├── astro.config.mjs
├── tsconfig.json                # 경로 별칭: ~/* → src/*, @config/* → config/*
├── eslint.config.mjs / .prettierrc
└── .husky/pre-commit            # lint-staged (package.json 설정: astro/js/ts eslint --fix + prettier --write)
```

---

## 4. 라우팅 (`config/route/`)

> **2026-08-20 통합**: 예전엔 이 폴더가 `routeMap.ts`(GNB/AllMenu/Navigation/page-list가 실제로 쓰던 `route: Route[]`)와 `index.ts`(링크 조회용 `route: Record<string,string>` 헬퍼 — 어디서도 import되지 않던 죽은 코드)로 나뉘어 있었고, 이름이 둘 다 `route`/`routeMap`이라 헷갈렸습니다. `index.ts` 한 파일로 통합하고 안 쓰이던 헬퍼는 제거했습니다(과거 구조는 git 이력에서 확인 가능).

GNB 2Depth(`Gnb.astro`), All메뉴(`AllMenu.astro`), Navigation(서브페이지 탭), page-list(개발용 전체 목록)가 **전부 이 배열 하나를 소스로 씀**. 새 메뉴를 추가/변경할 땐 여기 한 곳만 고치면 위 화면들에 전부 반영됩니다.

```ts
export interface RouteChildren {
  id: string       // Navigation.astro의 activeMenuId 매칭용
  koLabel: string   // 실제 노출 라벨(국문)
  label: string     // 영문 라벨(내부용, 현재 화면 노출엔 안 씀)
  href: string
}
export interface Route {
  label: string
  href: string        // 그룹 대표 href(보통 첫 child와 동일) — GNB 1Depth 링크, Navigation의 route.find() 조회 키
  children: RouteChildren[]
}
export const route: Route[] = [ /* Company / AI Engine / Robot Logistics / e-Commerce / Solutions / Project */ ]
```

**사용 패턴**:

```ts
import {route} from '@config/route'

// (a) route.find()로 현재 페이지가 속한 그룹의 children을 Navigation에 넘길 때
const localNavigation = route.find((item) => item.href === '/company/info')

// (b) 링크 생성 — 미리 계산된 URL 조회 객체는 없음, PUBLIC_BUILD_URL과 직접 접합
const PUBLIC_BUILD_URL = import.meta.env.PUBLIC_BUILD_URL
;<a href={`${PUBLIC_BUILD_URL}${item.href}`}>{item.koLabel}</a>
```

⚠️ **`route.find(item => item.href === ...)`는 항상 그룹 최상위 href로 조회할 것** — 페이지 자기 자신의 href를 넣으면 2Depth 서브 내비게이션(Navigation.astro)이 빈 값을 받아 사라지는 버그가 과거에 9개 페이지에서 동시 발생한 적 있음(`CLAUDE.md` 작업 로그 참고).

각 라우트 항목 옆에는 `@old/header.html`(구 GNB + 3-depth 사이트맵) 대비 신규 구조가 어떻게 바뀌었는지(`existing`/`renamed`/`new`/`merged`) 주석으로 기록되어 있습니다 — 런타임에서 쓰이진 않고 "이 메뉴가 옛날엔 뭐였는지" 추적하고 싶을 때 참고하는 용도(코드가 아니라 주석이라 `grep`으로 찾아야 함). Home(`/`)·`/privacy`·`/404`·`/page-list` 같은 유틸리티 라우트는 GNB 2Depth 구조가 아니라서 이 배열에 없습니다 — Home은 `Gnb.astro`의 로고 링크에 `${PUBLIC_BUILD_URL}/`로 직접 하드코딩.

### 전체 페이지 목록 (`src/pages/`)

| Path | 파일 | 소속 그룹 | 비고 |
| --- | --- | --- | --- |
| `/` | `pages/index.astro` | – | 메인. fullPage.js 스냅 스크롤(PC만, `responsiveWidth`로 모바일은 자동 해제) + Swiper 조합, 8개 섹션 |
| `/company/info` | `pages/company/info/index.astro` | Company | 회사 개요 + 숫자로 보는 M2M GLOBAL + 사업영역 하이라이트 |
| `/company/ceo-message` | `pages/company/ceo-message/index.astro` | Company | |
| `/company/history` | `pages/company/history/index.astro` | Company | 연도 구간 전환 탭(다른 페이지의 앵커-스크롤 탭과 다른 별도 패턴) |
| `/company/careers` | `pages/company/careers/index.astro` | Company | |
| `/company/news` | `pages/company/news/index.astro` | Company | |
| `/company/address` | `pages/company/address/index.astro` | Company | 지도는 실제 지도 API를 사용자가 직접 붙일 자리만 마련 |
| `/company/contact-us` | `pages/company/contact-us/index.astro` | Company | |
| `/ai-engine/machine-learning` | `pages/ai-engine/machine-learning/index.astro` | AI Engine | Figma 5개 프레임을 앵커탭 하나로 통합 |
| `/ai-engine/ai-commerce` | `pages/ai-engine/ai-commerce/index.astro` | AI Engine | Figma 9개 프레임을 앵커탭 하나로 통합 |
| `/robot-logistics/overview` | `pages/robot-logistics/overview/index.astro` | Robot Logistics | Figma 9개 프레임 통합. `CaseStudySection` 컴포넌트 원출처(`#cases`) |
| `/robot-logistics/smart-factory` | `pages/robot-logistics/smart-factory/index.astro` | Robot Logistics | Figma 3개 프레임 통합 |
| `/e-commerce/commerce-technology` | `pages/e-commerce/commerce-technology/index.astro` | e-Commerce | Figma 4개 프레임 통합 |
| `/e-commerce/b2b-commerce` | `pages/e-commerce/b2b-commerce/index.astro` | e-Commerce | Figma 4개 프레임 통합 |
| `/e-commerce/marketplace` | `pages/e-commerce/marketplace/index.astro` | e-Commerce | Figma 3개 프레임 통합 |
| `/solutions/commerce-platform` | `pages/solutions/commerce-platform/index.astro` | Solutions | Figma 3개 프레임 통합 |
| `/solutions/logistics-platform` | `pages/solutions/logistics-platform/index.astro` | Solutions | 〃 |
| `/solutions/trade-platform` | `pages/solutions/trade-platform/index.astro` | Solutions | 〃 |
| `/solutions/elivestock-platform` | `pages/solutions/elivestock-platform/index.astro` | Solutions | 〃 |
| `/project/reference` | `pages/project/reference/index.astro` | Project | 프로젝트 레퍼런스 12건 리스트 |
| `/project/specialized-outcomes` | `pages/project/specialized-outcomes/index.astro` | Project | Figma 4개 프레임을 앵커탭 하나로 통합 |
| `/privacy` | `pages/privacy/index.astro` | – | 개인정보처리방침(버전별 문서 리스트, 실 PDF는 외부 링크) |
| `/page-list` | `pages/page-list.astro` | – | **실 서비스 라우트 아님** — `route` 기반 전체 페이지 목록 자동 생성, 검수용. 새 라우트는 `config/route/index.ts`에만 등록하면 자동 반영 |
| `/404` | `pages/404.astro` | – | **Astro 예약 경로** — 파일명이 곧 라우트 규칙(Astro가 자동 인식, `config/route/index.ts` 등록 불필요/불가). Figma 디자인 없는 유틸리티 페이지라 `TitleMain` + `Button`만 조합. **자동 리다이렉트 없음** — "홈으로 가기" 버튼만 제공(사용자 확인 후 결정된 사양, 아래 [11. 배포 시 알아둘 것](#11-배포-시-알아둘-것--404와-base서브패스) 참고) |

> `CLAUDE.md`가 언급하는 `/style-guide`(컴포넌트 검수용 페이지)는 **현재 코드베이스에 실제로 없습니다**(파일 없음, `page-list.astro`의 `etcPages`에 링크만 남아 있는 죽은 링크). 새로 만들거나 CLAUDE.md 쪽을 정정해야 함.

여러 Figma 프레임을 한 페이지의 **앵커탭(`.bs-tab-group` 또는 `.g-section` id)** 으로 합친 페이지가 대부분입니다 — 즉 "탭 = 다른 페이지"가 아니라 "탭 = 같은 페이지 안 스크롤 이동"이라는 점에 유의(`src/scripts/tab-box-scrollspy.ts`가 이 클릭/스크롤 동기화를 전역 처리).

---

## 5. 공용 컴포넌트 (`src/components/`)

아래 표는 빠르게 훑어볼 때 쓰는 색인이고, 각 표 밑에는 **실제 소스 전문**을 접이식(`<details>`)으로 붙여뒀습니다 — Props가 뭔지 헷갈리면 표를, 실제로 어떻게 동작하는지 궁금하면 소스를 펼쳐 보면 됩니다(파일을 직접 열어보는 것과 100% 동일한 내용이라 둘이 어긋날 일은 없음 — README가 코드보다 낡으면 표는 틀릴 수 있어도 소스 블록은 항상 그 시점의 진실).

### `common/` — 페이지 전반에서 재사용

| 컴포넌트 | Props | 렌더 루트 클래스 | 비고 |
| --- | --- | --- | --- |
| `Box.astro` | `useBackground?`, `useSlotFoot?` | `.bs-box` | 카드형 박스 셸. 실제 내용은 슬롯 + `ui/box/*` 조합으로 구성 |
| `Button.astro` | `href?`, `useBlock?`, `useSuffixIcon?('copy'\|'blank'\|'plus'\|'toggle'\|'next'\|'download')`, `size?('md'\|'sm'\|'lg')`, `variant?('default'\|'white'\|'primary')`, `target?`, `class?` | `.bs-button[data-variant][data-size]` | `href` 있으면 `<a>`, 없으면 `<button>`으로 자동 전환 |
| `CaseCardGrid.astro` | `id?`, `title?`(HTML), `columns?`, `cases: {imageSrc?, title, date, desc}[]` | `.cc__grid` | 구축사례 카드 그리드 재사용 컴포넌트. `/ai-engine/machine-learning`, `/robot-logistics/smart-factory`, `/e-commerce/b2b-commerce`가 각자 구현하던 동일 패턴(`ai__case-*`/`rl__case-*`/`ec__case-*`)을 통합한 것 |
| `CaseStudySection.astro` | `id?`, `title?`, `partnerLogos?`, `timeline?`, `functions?`, `vendorTables?`, `diagram?`, `systemFeatures?`, `devicePanels?` (전부 optional, 기본값 = CJ대한통운 APRIL 구축사례 콘텐츠 내장) | `.cs__*` | **props 없이 그냥 `<CaseStudySection />`만 써도 완전한 섹션이 렌더링됨.** `/robot-logistics/overview#cases`에서 처음 추출, 다른 라우트에서 동일 내용 재사용 목적. 자체 스타일(`_case-study-section.scss`)만 쓰고 페이지 전용 scss에 안 기댐 |
| `ClientLogoGrid.astro` | `clients: {key, name}[]`, `columns?`(기본 6) | `.cl__grid` | 로고는 `src/assets/images/clients/ico_client_{key}.png` 필수(신규 다운로드 아님, 기존 자산 재사용) |
| `Icon.astro` | `name`, `width?`(기본 `10rem`), `height?`(기본 `10rem`) | `.bs-icon > img.v-ic` | **⚠️ `CLAUDE.md`에 적힌 "src/assets glob 방식" 설명과 실제 구현이 다름** — 실제로는 `public/images/icons/{name}`을 `PUBLIC_BUILD_URL` 기준 `<img src>`로 로드. `name`은 확장자 포함 전체 파일명(`ICON_KEY_NAME` 상수 참고) |
| `Label.astro` | `type?('type_1'\|'type_2')` | `.bs-label[data-type]` | |
| `LayerPopup.astro` | `items: {id, image, alt, href?, target?, cookieDays?}[]` | `.layer-popup-wrap` | `@old` 팝업 포팅. 동작은 전역 스크립트 `layer-popup.ts`가 담당(별도 연결 불필요). 상세 사용법은 이 컴포넌트 파일 상단 주석 참고 |
| `Navigation.astro` | `items: RouteChildren[] \| undefined`, `activeMenuId: string` | `.bs-navigation > .navi-group` | 서브페이지 상단 2Depth 가로 탭. `overflow-x:auto` 스크롤 영역 — 활성 탭 가운데 정렬은 `nav-active-state.ts` + `navi-group-active-scroll.ts`가 전역 처리 |
| `SubBanner.astro` | `title?`, `description?` | `.bs-sub-banner` | 서브페이지 상단 배너(`CLAUDE.md`가 말하는 `PageBanner`와 동일 개념, 실제 컴포넌트명은 `SubBanner`) |
| `Tab.astro` | `is?('span'\|'button')`, `type?('round'\|'line'\|'box')` | `.bs-tab[data-type]` | `type="box"`(`.bs-tab-group` 안에서 앵커탭으로 쓰일 때)는 `tab-box-scrollspy.ts`가 클릭/스크롤 동기화 |
| `Table.astro` | `size?('sm'\|'md'\|'lg')`, `tleft?` | `table.bs-table[data-size]` | |
| `TextList.astro` | `type?('type_1'\|'type_2')`, `circleType?('type_1'\|'type_2')` | `.bs-text-list[data-type][data-circle-type]` | 불릿 리스트. `circleType="type_2"`면 체크마크 아이콘 인라인 SVG 노출 |
| `TitleMain.astro` | `title?`, `description?` | `.bs-main-title` | 페이지 최상단 타이틀. `description`을 넘기면 타이틀+설명(`.bms-texts`) 조합, 안 넘기면 페이지명만(`.bm-page-name`) 렌더 — 모바일 폰트 축소 규칙 별도 적용(`_title-main.scss`) |
| `TitleMiddle.astro` | (슬롯만) | `.bs-title-middle` | |
| `TitleSub.astro` | `title?`(HTML), `description?`(HTML) | `.bs-title-sub` | |
| `TitleThird.astro` | (슬롯만) | `.bs-title-third` | |
| `AllMenu.astro` | (props 없음, `@config/route`를 직접 참조) | `.all-menu` | GNB `.all-gnb` 버튼으로 여닫는 전체 메뉴 오버레이. `Layout.astro`에 전역으로 이미 박혀 있어서 페이지에서 따로 안 씀 |

<details>
<summary><code>Box.astro</code></summary>

```astro
---
const {useBackground = false, useSlotFoot = false} = Astro.props
---

<div
  class="bs-box"
  class:list={{
    'use-background': useBackground,
    'use-slotfoot': useSlotFoot
  }}
>
  <div class="b-inner">
    <slot />
  </div>
</div>
```

</details>

<details>
<summary><code>Button.astro</code></summary>

```astro
---
export interface Props {
  class?: string
  href?: string
  useBlock?: boolean
  useSuffixIcon?: 'copy' | 'blank' | 'plus' | 'toggle' | 'next' | 'download'
  size?: 'md' | 'sm' | 'lg'
  variant?: 'default' | 'white' | 'primary'
  target?: string
}
const {
  class: className,
  href,
  useBlock,
  useSuffixIcon,
  size = 'md',
  variant = 'default',
  ...rest
} = Astro.props
const Tag = href ? 'a' : 'button'
---

<Tag
  class:list={[
    'bs-button',
    {
      'use-block': useBlock
    },
    className
  ]}
  data-variant={variant}
  data-size={size}
  href={href}
  {...rest}
>
  <div class="bs-inner">
    <span class="b-tx"><slot /></span>
    {useSuffixIcon && <span class="b-suff" data-type={useSuffixIcon} />}
  </div>
</Tag>
```

</details>

<details>
<summary><code>CaseCardGrid.astro</code></summary>

```astro
---
// 구축사례 카드 그리드 (재사용 컴포넌트) — 썸네일 + 타이틀 + 일자 + 설명, 중앙정렬.
// /ai-engine/machine-learning, /robot-logistics/smart-factory, /e-commerce/b2b-commerce에서
// 각자 구현하던 동일 패턴(ai__case-*/rl__case-*/ec__case-*)을 통합한 것.
// 이미지가 없는 케이스는 imageSrc를 생략하면 회색 placeholder 박스만 표시된다.
import TitleSub from './TitleSub.astro'

export interface Props {
  id?: string
  title?: string // set:html — 기본값은 프로젝트 전반에서 동일하게 쓰인 "구축 사례"
  columns?: number
  cases: {imageSrc?: string; title: string; date: string; desc: string}[]
}

const {
  id = 'cases',
  title = `구축 <span class="mark">사례</span>`,
  columns = 3,
  cases
} = Astro.props
---

<section id={id} class="g-section">
  <div class="innerWrap">
    <TitleSub title={title} />
    <div class="cc__grid" style={`--cc-cols: ${columns};`}>
      {
        cases.map((item) => (
          <div class="cc__card">
            {/* TODO: 이미지 삽입 */}
            <div class="cc__thumb" aria-hidden={!item.imageSrc}>
              {item.imageSrc && <img src={item.imageSrc} alt="" />}
            </div>
            <p class="cc__title">{item.title}</p>
            <span class="cc__date">{item.date}</span>
            <p class="cc__desc">{item.desc}</p>
          </div>
        ))
      }
    </div>
  </div>
</section>
```

</details>

<details>
<summary><code>CaseStudySection.astro</code> (375줄 — Props 인터페이스 + 렌더 구조만 발췌, 기본 데이터(CJ대한통운 APRIL 구축사례 텍스트 전량)는 생략. 전문은 파일에서 직접 확인)</summary>

```astro
---
// 구축사례 섹션 (재사용 컴포넌트) — 최초 /robot-logistics/overview#cases에서 추출.
// "프로젝트 전체" 등 다른 라우트에서도 완전히 동일한 내용(CJ 대한통운 APRIL 로봇통합플랫폼 구축사례)을
// 그대로 재사용하는 용도라, 모든 데이터를 컴포넌트 안에 기본값으로 내장해뒀다 — 그냥 <CaseStudySection />
// 만 써도 지금과 완전히 같은 내용이 렌더링된다. props는 나중에 다른 곳에서 진짜 다른 내용이 필요할 때만
// 있는 그대로 개별적으로 덮어쓰라고 열어둔 탈출구일 뿐, 평소엔 하나도 안 넘겨도 된다.
// 페이지 전용 scss(rl__*, ec__* 등)에 기대지 않고 자체 스타일(cs__*)만 사용한다.
// 모든 서브섹션(타임라인/구현기능/연동 제조사/다이어그램/시스템 업무 구성/디바이스 패널)은
// null을 넘기면 렌더링되지 않는 선택적(optional) 블록이다.
import TitleSub from './TitleSub.astro'
import TitleThird from './TitleThird.astro'
import TextList from './TextList.astro'
import Icon from './Icon.astro'
import {ICON_KEY_NAME} from '~/constants/Icon'
// (이미지 3종 + 고객사 로고 1종 import 생략)

type TimelineData = {
  periods: {range: string; label: string; span: number}[]
  phases: {name: string; desc: string}[]
}
type FunctionsData = {title: string; items: {number: string; title: string; desc: string}[]}
type VendorTablesData = {title: string; tables: string[][][]} // [표][행][셀]
type DiagramData = {title: string; thirdTitle?: string; width: number; height: number}
type SystemFeaturesData = {
  title: string
  description?: string
  items: {icon?: string; title: string; items: string[]}[]
}
type DevicePanelsData = {
  title: string
  description?: string
  panels: {icon?: string; title: string; items: string[]; imgSrc?: string}[]
}

export interface Props {
  id?: string
  title?: string // <span class="mark">...</span> 포함 가능 (set:html)
  partnerLogos?: boolean // 타이틀 옆 파트너 로고 placeholder 노출 여부
  timeline?: TimelineData | null
  functions?: FunctionsData | null
  vendorTables?: VendorTablesData | null
  diagram?: DiagramData | null
  systemFeatures?: SystemFeaturesData | null
  devicePanels?: DevicePanelsData | null
}

// --- 기본값: CJ 대한통운 APRIL 로봇통합플랫폼 구축사례 (Figma 실측 그대로, 실제 텍스트 데이터는 생략) ---
const DEFAULT_TITLE = `로봇기반 통합관제시스템 <span class="mark">구축 사례</span>`
const DEFAULT_TIMELINE: TimelineData = {
  /* periods: 2단계 기간/라벨, phases: 4단계 개발 이력 — 파일 참고 */
}
const DEFAULT_FUNCTIONS: FunctionsData = {
  /* "구현 기능" 01~07 카드 텍스트 — 파일 참고 */
}
const DEFAULT_VENDOR_TABLES: VendorTablesData = {
  /* "연동 제조사 AMR/AGV" 표 2개 — 파일 참고 */
}
const DEFAULT_DIAGRAM: DiagramData = {
  /* "동작 구현 화면" 타이틀/이미지 크기 — 파일 참고 */
}
const DEFAULT_SYSTEM_FEATURES: SystemFeaturesData = {
  /* "시스템 업무 구성" 8개 카드(정보조회/센터관리/SKU/주문/재고/시스템/통계/작업자) — 파일 참고 */
}
const DEFAULT_DEVICE_PANELS: DevicePanelsData = {
  /* "주요 기능 소개" PC/Tablet 패널 2개 — 파일 참고 */
}

const {
  id = 'cases',
  title = DEFAULT_TITLE,
  partnerLogos = true,
  timeline = DEFAULT_TIMELINE,
  functions: functionsData = DEFAULT_FUNCTIONS,
  vendorTables = DEFAULT_VENDOR_TABLES,
  diagram = DEFAULT_DIAGRAM,
  systemFeatures = DEFAULT_SYSTEM_FEATURES,
  devicePanels = DEFAULT_DEVICE_PANELS
} = Astro.props
---

<section id={id} class="g-section">
  <div class="innerWrap">
    {/* cs__head: TitleSub + (partnerLogos && 고객사 로고) */}
    {/* cs__timeline: timeline && periods/phases 렌더 (null이면 블록 자체가 안 그려짐) */}
    {/* cs__number-grid: functionsData && 01~07 넘버 카드 */}
    {/* cs__vendor-tables: vendorTables && 표 렌더 */}
    {/* cs__diagram-box: diagram && 타이틀+이미지 */}
    {/* cs__split(systemFeatures): 좌측 TitleSub, 우측 cs__feature-grid 아이콘 카드 */}
    {/* cs__split(devicePanels): 좌측 TitleSub, 우측 cs__device-panel(PC/Tablet 카드 + 커넥터) */}
    {/* 각 블록은 전부 `{data && (...)}` 패턴 — 파일 원문에 실제 마크업 전문 있음 */}
  </div>
</section>
```

</details>

<details>
<summary><code>ClientLogoGrid.astro</code></summary>

```astro
---
// 주요 고객사 로고 그리드 (재사용 컴포넌트) — /company/news, /ai-engine/ai-commerce,
// /e-commerce/commerce-technology에서 각자 구현하던 동일 패턴을 통합.
// 로고 자산은 /company/news 작업 시 원본 다운로드해 보관 중인 src/assets/images/clients/*.png를
// 그대로 재사용한다(신규 다운로드 아님) — 파일명 규칙 ico_client_{key}.png.
export interface Props {
  clients: {key: string; name: string}[]
  columns?: number
}

const {clients, columns = 6} = Astro.props

const clientLogos = import.meta.glob<{default: ImageMetadata}>('/src/assets/images/clients/*.png', {
  eager: true
})
const logoSrc = (key: string) =>
  clientLogos[`/src/assets/images/clients/ico_client_${key}.png`].default.src
---

<div class="cl__grid" style={`--cl-cols: ${columns};`}>
  {
    clients.map((client) => (
      <div class="cl__card">
        <img src={logoSrc(client.key)} alt={client.name} loading="lazy" />
      </div>
    ))
  }
</div>
```

</details>

<details>
<summary><code>Icon.astro</code></summary>

```astro
---
const {name, width = '10rem', height = '10rem'} = Astro.props
const PUBLIC_BUILD_URL = import.meta.env.PUBLIC_BUILD_URL
---

<span
  class="bs-icon"
  style={{
    width: width,
    height: height
  }}
>
  <img src={`${PUBLIC_BUILD_URL}/images/icons/${name}`} class="v-ic" alt="Icon" />
</span>
```

</details>

<details>
<summary><code>Label.astro</code></summary>

```astro
---
export interface Props {
  type?: 'type_1' | 'type_2'
}
const {type = 'type_1'} = Astro.props
---

<span class="bs-label" data-type={type}>
  <slot />
</span>
```

</details>

<details>
<summary><code>LayerPopup.astro</code></summary>

```astro
---
// 공통 레이어 팝업 — @old/index.html의 .popup-wrap(레거시 공지/이벤트 팝업)을 포팅한 컴포넌트.
// 오버레이/딤 없이 화면 좌측 상단에 여러 개가 나란히 뜨는 원본 구조 그대로이며, 체크박스로
// "오늘 하루 이 창을 열지 않음"을 선택한 뒤 닫으면 쿠키(기본 1일)로 재노출을 막는다.
// 동작은 layer-popup.ts가 담당(Layout.astro에 전역 등록되어 있어 별도 연결 코드 불필요) —
// data-layer-popup / data-cookie-key 마크업 컨벤션만 지키면 어느 페이지에서 써도 동작한다.
//
// 사용 예:
// <LayerPopup
//   items={[
//     { id: 'notice-01', image: '/images/popup/notice-01.png', alt: '공지 제목', href: 'https://...', target: '_blank' },
//   ]}
// />
export interface LayerPopupItem {
  id: string
  image: string
  alt: string
  href?: string
  target?: '_blank' | '_self'
  cookieDays?: number // 닫기 시 "오늘 하루 안 보기"를 체크했을 때 재노출을 막는 기간(일). 기본 1일
}

export interface Props {
  items: LayerPopupItem[]
}

const {items} = Astro.props
---

{
  items.length > 0 && (
    <div class="layer-popup-wrap">
      {items.map((item) => (
        <div
          class="layer-popup"
          id={`layerPopup-${item.id}`}
          data-layer-popup
          data-cookie-key={`layerPopupClosed-${item.id}`}
          data-cookie-days={item.cookieDays ?? 1}
          style="display:none"
        >
          {item.href ? (
            <a href={item.href} target={item.target ?? '_self'}>
              <img src={item.image} alt={item.alt} />
            </a>
          ) : (
            <img src={item.image} alt={item.alt} />
          )}
          <p class="layer-popup__bottom">
            <label class="layer-popup__hide-today">
              <input type="checkbox" /> 오늘 하루 이 창을 열지 않음
            </label>
            <button type="button" class="layer-popup__close">
              닫기 X
            </button>
          </p>
        </div>
      ))}
    </div>
  )
}
```

</details>

<details>
<summary><code>Navigation.astro</code></summary>

```astro
---
import type {RouteChildren} from '@config/route'
export interface Props {
  items: RouteChildren[] | undefined
  activeMenuId: string
}
const {items, activeMenuId = ''} = Astro.props
const PUBLIC_BUILD_URL = import.meta.env.PUBLIC_BUILD_URL
---

<div class="bs-navigation">
  <div class="inner">
    <div class="navi-group">
      {
        items &&
          items.map((item) => (
            <div class="nvi-item">
              {/* 활성화시 .is-active */}
              <a
                href={PUBLIC_BUILD_URL + item.href}
                class="nvi-txt"
                class:list={{
                  'is-active': item.id === activeMenuId
                }}
              >
                {item.koLabel}
              </a>
            </div>
          ))
      }
    </div>
  </div>
</div>
```

</details>

<details>
<summary><code>SubBanner.astro</code></summary>

```astro
---
const {title = 'Company', description = ''} = Astro.props
---

<div class="bs-sub-banner">
  <div class="innerWrap">
    <div class="tit" set:html={title} />
    <div class="desc" set:html={description} />
  </div>
</div>
```

</details>

<details>
<summary><code>Tab.astro</code></summary>

```astro
---
export interface Props {
  is?: 'span' | 'button'
  type?: 'round' | 'line' | 'box'
}
const {type = 'round', is = 'button'} = Astro.props
const Tag = is
---

<Tag class="bs-tab" data-type={type}><slot /></Tag>
```

</details>

<details>
<summary><code>Table.astro</code></summary>

```astro
---
export interface Props {
  size?: 'sm' | 'md' | 'lg'
  tleft?: boolean
}
const {size = 'md', tleft} = Astro.props
---

<table
  class="bs-table"
  class:list={{
    'is-tleft': tleft
  }}
  data-size={size}
>
  <slot />
</table>
```

</details>

<details>
<summary><code>TextList.astro</code></summary>

```astro
---
export interface Props {
  type?: 'type_1' | 'type_2'
  circleType?: 'type_1' | 'type_2'
}
const {type = 'type_1', circleType = 'type_1'} = Astro.props
---

<div class="bs-text-list" data-type={type} data-circle-type={circleType}>
  <div class="bst-inner">
    <span class="b-syn">
      {
        circleType === 'type_2' && (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* 체크마크 원형 아이콘 path 2개 — 파일 참고 */}
          </svg>
        )
      }
    </span>
    <div class="b-tx"><slot /></div>
  </div>
</div>
```

</details>

<details>
<summary><code>TitleMain.astro</code></summary>

```astro
---
const {title = '', description = ''} = Astro.props
---

<div class="bs-main-title">
  <div class="innerWrap">
    {
      description ? (
        <div class="bms-texts">
          <div class="bm-title" set:html={title} />
          <div class="bm-description" set:html={description} />
        </div>
      ) : (
        <div class="bm-page-name" set:html={title} />
      )
    }
  </div>
</div>
```

</details>

<details>
<summary><code>TitleMiddle.astro</code></summary>

```astro
---

---

<span class="bs-title-middle">
  <slot />
</span>
```

</details>

<details>
<summary><code>TitleSub.astro</code></summary>

```astro
---
const {title = '', description = ''} = Astro.props
---

<div class="bs-title-sub">
  <div class="bs-title" set:html={title} />
  {description && <div class="bs-description" set:html={description} />}
</div>
```

</details>

<details>
<summary><code>TitleThird.astro</code></summary>

```astro
---

---

<span class="bs-title-third">
  <slot />
</span>
```

</details>

<details>
<summary><code>AllMenu.astro</code></summary>

```astro
---
// All 메뉴 — GNB 우측 all-gnb 버튼으로 여닫는 전체 메뉴 오버레이(Figma "All 메뉴" 심볼, node 2932:22685).
// 화면 전체(GNB 포함)를 덮는 최상위 레이어라 Layout.astro의 <body> 최상단에 둔다.
// 2Depth 항목은 Figma 텍스트를 그대로 옮기지 않고 @config/route(route)를 그대로 사용한다 —
// Gnb.astro/Navigation.astro와 동일한 단일 소스라 라우트가 바뀌어도 항상 최신 상태로 맞다.
import {route} from '@config/route'
const PUBLIC_BUILD_URL = import.meta.env.PUBLIC_BUILD_URL
---

<div class="all-menu" id="allMenu" aria-hidden="true">
  <!-- TODO: 배경 이미지(스크린 블렌드 합성) 삽입 — 사용자가 직접 작업 -->
  <div class="all-menu__bg-ph" aria-hidden="true"></div>

  <button class="all-menu__close" type="button" aria-label="전체 메뉴 닫기">
    <span class="all-menu__close-icon" aria-hidden="true"></span>
  </button>

  <div class="all-menu__inner">
    <div class="all-menu__body">
      <div class="all-menu__head">
        <p class="all-menu__eyebrow">e-Commerce Leading Technology Partner</p>
        <p class="all-menu__brand">M2M GLOBAL</p>
      </div>

      <nav class="all-menu__nav">
        <div class="all-menu__depth1-row">
          {
            route.map((section) => (
              <div class="all-menu__depth1">
                <p class="all-menu__depth1-title">{section.label}</p>
                <span class="all-menu__depth1-line" aria-hidden="true" />
                <ul class="all-menu__depth2-col">
                  {section.children.map((child) => (
                    <li>
                      <a href={PUBLIC_BUILD_URL + child.href}>{child.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          }
        </div>
      </nav>
    </div>

    <!-- TODO: 실제 소개서 파일 연결 전까지 placeholder href (Footer.astro와 동일) -->
    <div class="all-menu__downloads">
      <a href={`${PUBLIC_BUILD_URL}/etc/m2m_company_info.pdf`} class="all-menu__download-btn" target="_blank">
        회사소개서
        <span class="all-menu__download-icon" aria-hidden="true"></span>
      </a>
      <a href="#" class="all-menu__download-btn">
        로봇물류 소개서
        <span class="all-menu__download-icon" aria-hidden="true"></span>
      </a>
    </div>
  </div>
</div>
```

</details>

### `layout/` — 전역 레이아웃 전용

| 컴포넌트 | 비고 |
| --- | --- |
| `Gnb.astro` | 헤더. `route`로 1/2Depth 메뉴 렌더, 1Depth hover 시 6컬럼 메가메뉴 패널이 통째로 열리는 구조(항목별 개별 드롭다운 아님). `nav-active-state.ts`가 현재 URL 기준 `.is-active` 부여 |
| `Footer.astro` | 다크 배경 전용 화이트 로고 자산(GNB용과 다른 별도 export) 사용 |

<details>
<summary><code>Gnb.astro</code></summary>

```astro
---
import {route} from '@config/route'
const localGnbItems = route
const PUBLIC_BUILD_URL = import.meta.env.PUBLIC_BUILD_URL
---

<div class="gnb-wrap">
  <div class="lts">
    <a href={`${PUBLIC_BUILD_URL}/`} class="logo">로고</a>
  </div>
  <div class="content">
    <ul class="gnb">
      {
        localGnbItems &&
          localGnbItems.map((item) => (
            <li class="gb-item">
              <a href={PUBLIC_BUILD_URL + item.href} class="g-link">
                {item.label}
              </a>
              {item.children && item.children.length > 0 && (
                <ul class="gb-submenu">
                  {item.children.map((child) => (
                    <li>
                      <a href={PUBLIC_BUILD_URL + child.href}>{child.koLabel}</a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))
      }
    </ul>
    <div class="gnb-mega-bg" aria-hidden="true"></div>
  </div>
  <div class="rts">
    <button class="all-gnb"></button>
  </div>
</div>
```

</details>

<details>
<summary><code>Footer.astro</code></summary>

```astro
---
// Footer 공통 컴포넌트
// Footer는 어두운 배경이라 GNB의 원색 로고가 아니라 Figma의 별도 화이트 2줄
// (워드마크+국문 표기) 로고 자산을 그대로 쓴다 — 단순 색 반전이 아니라 별개 export.
const year = new Date().getFullYear()
const PUBLIC_BUILD_URL = import.meta.env.PUBLIC_BUILD_URL
const {class: className, ...rest} = Astro.props
---

<footer class="footer-wrap" class:list={[className]} {...rest}>
  <div class="inner">
    <div class="top">
      <div class="info">
        <a href="/" class="logo">M2M GLOBAL 엠투엠글로벌(주)</a>
        <div class="contact">
          <p class="address">
            <span>Head Office </span>
            <span class="strong">서울특별시 영등포구 영등포로 150, B동 1509호 (생각공장 당산), 엠투엠글로벌</span>
          </p>
          <p class="reach">
            <span class="reach-item"><span>Email</span> <span class="strong">help@m2mglobal.co.kr</span></span>
            <span class="reach-item"><span>Tel</span> <span class="strong">02-6956-3955</span></span>
          </p>
        </div>
      </div>

      <!-- TODO: 실제 소개서 파일 연결 전까지 placeholder href -->
      <div class="downloads">
        <a href={`${PUBLIC_BUILD_URL}/etc/m2m_company_info.pdf`} class="download-btn" target="_blank"
          >회사소개서<span class="download-btn-icon"></span></a>
        <a href="#" class="download-btn">로봇물류 소개서<span class="download-btn-icon"></span></a>
      </div>
    </div>

    <div class="bottom">
      <p class="copyright">Copyright ⓒ {year} M2M GLOBAL. All rights reserved.</p>
      <a href={`${PUBLIC_BUILD_URL}/privacy`} class="privacy">개인정보처리방침</a>
    </div>
  </div>
</footer>
```

</details>

### `ui/box/` — `/company/info` 전용 Box 상단 타이틀 조합

`Box.astro`(공용 셸, 위에서 이미 소개) + `boxTitleCase/BoxTitleCase1~5.astro`(타이틀 영역 variant 5종) + `UiBoxCase1~3.astro`(Box+BoxTitleCase 조합 래퍼) + `UiNoti.astro`(dl 리스트형 안내) + `UiTags.astro`(태그 리스트). 현재 `/company/info`에서만 쓰이는 페이지 종속 컴포넌트에 가까움 — 다른 페이지에서 재사용할 땐 variant가 실제로 맞는지 먼저 확인할 것.

<details>
<summary><code>boxTitleCase/BoxTitleCase1.astro</code> — 아이콘 + 라벨 + 타이틀</summary>

```astro
---
import Icon from '~/components/common/Icon.astro'
import Label from '~/components/common/Label.astro'

const {label = '', title = '', icon = ''} = Astro.props
---

<div class="bs-box-title-case-1">
  <div class="bbtc1-inner">
    <span class="bsb-icon">
      <Icon name={icon} />
    </span>
    <div class="bsb-label">
      <Label>{label}</Label>
    </div>
    <div class="bsb-title" set:html={title} />
  </div>
</div>
```

</details>

<details>
<summary><code>boxTitleCase/BoxTitleCase2.astro</code> — 라벨 + 타이틀 (아이콘 없음)</summary>

```astro
---
import Label from '~/components/common/Label.astro'

const {label = '', title = ''} = Astro.props
---

<div class="bs-box-title-case-2">
  <div class="bbtc1-inner">
    <div class="bsb-label">
      <Label>{label}</Label>
    </div>
    <div class="bsb-title" set:html={title} />
  </div>
</div>
```

</details>

<details>
<summary><code>boxTitleCase/BoxTitleCase3.astro</code> — 아이콘 + 타이틀 (라벨 없음)</summary>

```astro
---
import Icon from '~/components/common/Icon.astro'
const {title = '', icon = ''} = Astro.props
---

<div class="bs-box-title-case-3">
  <div class="bbtc3-inner">
    <span class="bsb-icon">
      <Icon name={icon} />
    </span>
    <div class="bsb-title" set:html={title} />
  </div>
</div>
```

</details>

<details>
<summary><code>boxTitleCase/BoxTitleCase4.astro</code> — prefix + 라벨(type_2) + 타이틀</summary>

```astro
---
import Label from '~/components/common/Label.astro'
const {title = '', label = '', prefix} = Astro.props
---

<div class="bs-box-title-case-4">
  <div class="bbtc4-inner">
    <div class="bsb-label">
      <Label type="type_2">{label}</Label>
    </div>
    <div class="bsb-title-wrap">
      <div class="bsb-title" set:html={title} />
      {prefix && <div class="bsb-title-pref" set:html={prefix} />}
    </div>
  </div>
</div>
```

</details>

<details>
<summary><code>boxTitleCase/BoxTitleCase5.astro</code> — 아이콘 + 타이틀 + 설명</summary>

```astro
---
import Icon from '~/components/common/Icon.astro'

const {description = '', title = '', icon = ''} = Astro.props
---

<div class="bs-box-title-case-5">
  <div class="bbtc5-inner">
    <span class="bsb-icon">
      <Icon name={icon} />
    </span>
    <div class="bsb-title" set:html={title} />
    <div class="bsb-description" set:html={description} />
  </div>
</div>
```

</details>

<details>
<summary><code>UiBoxCase1.astro</code> — Box + BoxTitleCase1 조합</summary>

```astro
---
import Box from '~/components/common/Box.astro'
import BoxTitleCase1 from '~/components/ui/box/boxTitleCase/BoxTitleCase1.astro'
const {label, title, icon} = Astro.props
---

<Box>
  <BoxTitleCase1 label={label} title={title} icon={icon} />
  <div class="bs-gl-content">
    <slot />
  </div>
</Box>
```

</details>

<details>
<summary><code>UiBoxCase2.astro</code> — Box + BoxTitleCase2 조합</summary>

```astro
---
import Box from '~/components/common/Box.astro'
import BoxTitleCase2 from '~/components/ui/box/boxTitleCase/BoxTitleCase2.astro'
const {label, title, useBackground} = Astro.props
---

<Box useBackground={useBackground}>
  <BoxTitleCase2 label={label} title={title} />
  <div class="bs-gl-content">
    <slot />
  </div>
</Box>
```

</details>

<details>
<summary><code>UiBoxCase3.astro</code> — Box + 슬롯 3분할(head/default/foot)</summary>

```astro
---
import Box from '~/components/common/Box.astro'

const useSlotFoot = Astro.slots.has('slotFoot')
---

<Box useSlotFoot={useSlotFoot}>
  <slot name="slotHead" />
  <div class="bs-gl-content">
    <slot />
  </div>
  {
    useSlotFoot && (
      <div class="bs-gl-bottom">
        <slot name="slotFoot" />
      </div>
    )
  }
</Box>
```

</details>

<details>
<summary><code>UiNoti.astro</code> — dl 리스트형 안내(데이터 활용 수준 / 성과 지표 고정 2행)</summary>

```astro
---
const {dataLevel, metric} = Astro.props
---

<div class="bt-noti-group">
  <dl class="b-lst">
    <dt class="dt ico1">데이터 활용 수준</dt>
    <dd class="dd" set:html={dataLevel} />
  </dl>
  <dl class="b-lst">
    <dt class="dt ico2">성과 지표</dt>
    <dd class="dd" set:html={metric} />
  </dl>
</div>
```

</details>

<details>
<summary><code>UiTags.astro</code> — 태그 리스트</summary>

```astro
---
export type Item = {
  codeId: string | number
  codeName: string
}
export interface Props {
  items: Item[]
}

const {items} = Astro.props
---

<div class="bt-tags-group">
  {items && items.map((item) => <span class="b-tags">{item.codeName}</span>)}
</div>
```

</details>

---

## 6. 스타일링 (SCSS via Watch Sass)

```text
src/styles/scss/
  abstracts/
    _functions.scss   # rem()(10px=1rem 변환), color()(토큰명 문자열 → var(--...) 매핑), str-replace(), icon-map()
    _variables.scss    # Sass 변수 = var(--...) 참조 껍데기 (Core 값 자체는 base/_reset.scss의 :root에 있음!)
    _mixins.scss        # font($s)(H1~H6/Body14~36 타이포 프리셋), hidden(), text-ellipsis(), get-background-svg()
  base/
    _reset.scss          # 리셋 + **실제 디자인 토큰 :root 정의가 여기 있음**(CLAUDE.md는 abstracts/_variables.scss라 하지만 실제로는 여기) + 모바일 전역 축소(html font-size 8px) + Container/Row/Col 유틸 + .g-section/.innerWrap
    _fonts.scss           # @font-face
  components/            # 공용 컴포넌트 1:1 대응 스타일 (아래 참고)
  layout/                 # _gnb.scss, _footer.scss, _top-btn.scss
  page/                    # 라우트 1Depth 단위로 1파일(_company.scss, _ai-engine.scss, _e-commerce.scss,
                            # _robot-logistics.scss, _solutions.scss, _project.scss, _main.scss(메인 전용),
                            # _page-list.scss, _privacy.scss, _error.scss(/404)) — 공용 컴포넌트로 못 커버하는
                            # 그 페이지 전용 마크업만
  main.scss                # 진입점. 새 partial은 반드시 여기 @use로 등록해야 컴파일에 포함됨
src/styles/css/main.css    # 컴파일 산출물 — git ignore, 직접 수정 금지. Layout.astro가 import
```

### 핵심 함수/믹스인 (실제 사용 패턴)

```scss
@use '../abstracts/variables' as *;
@use '../abstracts/_functions' as *;
@use '../abstracts/_mixins' as *;

.foo {
  padding: rem(24px);                       // px → rem, 10px=1rem 기준
  color: color('Color/Primary Color');       // 토큰명 → var(--color-primary-50) 등
  @include font('H2');                       // 타이포 프리셋(H1~H6, Body 14~36 R)
  @include get-background-svg(icon_plus, color('Color/Black 20')); // mask 방식 인라인 SVG 아이콘
}
```

> ⚠️ `CLAUDE.md`는 `m.color()`/`m.spacing()`/`m.radius()`/`m.heading()`/`m.body()` 같은 네임스페이스 접두사·spacing/radius 헬퍼 함수를 언급하지만, **실제 코드베이스엔 `spacing()`/`radius()` 함수 자체가 없고**, import도 `@use '...' as *`(네임스페이스 없이 전역 노출)로 통일되어 있습니다. 실제로 쓰는 건 `rem()` / `color()` / `@include font()` / `@include get-background-svg()` 뿐 — 새 파일 작성 시 기존 `page/*.scss` 파일들의 `@use` 3줄 세트를 그대로 복사해서 시작할 것.

### 반응형 (모바일)

- 브레이크포인트: `$breakpoint-sm 480 / $breakpoint-md 1300(!) / $breakpoint-lg ≈1790(`$innerWrap`) / $breakpoint-xlg 1920` (`abstracts/_variables.scss`) — `CLAUDE.md`가 말하는 `md 768`과 실제 값이 다름, **모바일 분기는 항상 `$breakpoint-md`(1300px) 기준**.
- 모바일 전체 축소는 **`html`의 `font-size`를 `@media (max-width:$breakpoint-md)`에서 8px로(10px의 80%)** 바꾸는 한 줄로 처리(`base/_reset.scss`) — `rem()`이 전부 이 기준이라 개별 컴포넌트를 안 건드려도 폰트/spacing/radius/아이콘이 전부 비례 축소됨. **페이지별 레이아웃(row→column 전환, x스크롤 방지 등)은 각 `page/*.scss` 자체 미디어쿼리에서 별도 처리** — 지금까지 모바일 대응이 끝난 페이지: 메인(`/`), `/company/*`, `/ai-engine/*`, `/robot-logistics/*`(`_case-study-section.scss` 공용 포함), `/e-commerce/*`, `/solutions/*`, `/project/*`. 나머지(예: 전역 컴포넌트 일부)는 순차 진행 중일 수 있음.
- 메인페이지(`/`)는 **PC에서만 fullPage.js 스냅 스크롤**이 걸려 있고, `$breakpoint-md` 미만에서는 fullPage의 `responsiveWidth` 옵션으로 스냅이 자동 해제되어 평범한 문서 스크롤로 전환됩니다(섹션은 `min-height:100vh`라 컨텐츠가 넘치면 자라남) — PC 동작은 절대 안 건드림, 모바일 전용 예외 처리라는 점 유의.

---

## 7. 전역 스크립트 (`src/scripts/`)

전부 `Layout.astro`의 `<body>` 끝 `<script>` 블록에서 import되어 **모든 페이지에 자동 적용**됩니다. 공통 원칙: 클래스/마크업 컨벤션만으로 동작 대상을 스스로 찾고(`document.querySelectorAll`), 대상이 없는 페이지에서는 조용히 아무 것도 안 함 — 새 페이지에서 별도 연결 코드 불필요.

| 파일 | 대상 마크업 | 동작 |
| --- | --- | --- |
| `tab-box-scrollspy.ts` | `.bs-tab-group > .tab__item[href^="#"]` | 클릭 시 해당 id 섹션으로 스무스 스크롤 + 즉시 active, `IntersectionObserver`로 스크롤 위치 따라 active 자동 갱신(스크롤 중 클릭-스크롤끼리 깜빡임 방지 플래그 포함) |
| `scroll-to-top.ts` | `.layout__top-btn`(Layout.astro에 전역 렌더) | 클릭 시 최상단 스무스 스크롤. `scrollY` 절반 이상이면 노출, 문서 하단 근처에서 `bottom` 값을 동적으로 끌어올려 178px 지점에서 멈추게 처리 |
| `all-menu-toggle.ts` | `.all-gnb`(GNB 버튼) ↔ `#allMenu` | `body.is-allmenu-open` 클래스 토글로 전체메뉴 오버레이 여닫기, Esc로도 닫힘 |
| `layer-popup.ts` | `[data-layer-popup]`(`LayerPopup.astro`) | 쿠키(`layerPopupClosed-{id}`) 기반 "오늘 하루 안 보기" — 체크 후 닫기 클릭 시에만 쿠키 세팅 |
| `nav-active-state.ts` | `.gnb .gb-item`, `.all-menu__depth2-col a` | 현재 `location.pathname` 기준으로 GNB 1/2Depth 및 전체메뉴 2Depth에 `.is-active` 부여 |
| `navi-group-active-scroll.ts` | `.navi-group`(`Navigation.astro`) | 페이지 로드 시 `.is-active` 탭이 가로 스크롤 영역 중앙에 오도록 `scrollLeft` 자동 보정 |

---

## 8. Figma 연동 (Dev Mode MCP)

`.mcp.json`에 `figma-dev-mode-mcp-server`가 프로젝트 스코프로 등록되어 있습니다(`http://127.0.0.1:3845/mcp`, Figma 데스크톱 앱을 켜고 해당 파일에서 `Ctrl+/` → "Enable Dev Mode MCP Server"로 매번 새로 활성화해야 함). **Figma 파일은 조회 전용** — `get_code`/`get_metadata`/`get_screenshot`/`get_variable_defs`만 쓰고 절대 편집하지 않습니다. 상세 절차는 `CLAUDE.md`의 "Figma MCP 연동" 섹션 참고.

---

## 9. 알려진 문서-코드 불일치 / TODO

`CLAUDE.md` 자체에도 "⚠️ 위 표와 실제 코드 불일치 주의" 섹션이 있을 만큼, 문서가 코드 변경 속도를 못 따라간 부분이 있습니다. 이 README 최초 작성 시점(2026-08-19) 기준으로 직접 확인한 불일치 목록(2026-08-20 갱신 — `/404` 페이지 추가분 반영, `config/route/index.ts`+`routeMap.ts` 중복 통합 후 관련 서술 정리):

- `/style-guide` 페이지 없음(파일 자체가 없음, `page-list.astro`에 죽은 링크만 존재).
- `Icon.astro`는 `src/assets/**/*.svg` glob이 아니라 `public/images/icons/{name}`을 `<img src>`로 직접 로드.
- 디자인 토큰 `:root` 정의는 `abstracts/_variables.scss`가 아니라 `base/_reset.scss`에 있음.
- `spacing()`/`radius()`/`m.*` 네임스페이스 헬퍼는 실제로 존재하지 않음(`rem()`/`color()`만 있음).
- 브레이크포인트 실제 값은 `md=1300`(문서상 `768`과 다름).
- `IconButton`/`ListItem`/`SpecGroup`/`Title`(TitleMain/Sub/Third/Middle로 이미 분리 구현됨)/`TextButton`/`Container`/`Row`/`Col`/`Grid` 등 CLAUDE.md 공통 컴포넌트 표에 있는 일부 컴포넌트는 여전히 파일이 없음 — 실제 그리드는 `base/_reset.scss`의 `.g-container`/`.g-row`/`.g-col`(부트스트랩 스타일 12컬럼) 유틸리티로 구현되어 있고 별도 Astro 컴포넌트(`Row.astro` 등)는 없음.
- `page/_solutions.scss`의 `.sol__tech-diagram-ty2` 클래스가 빈 스타일(`{}`)로 스캐폴딩만 되어 있고 실제 테두리 스타일 미구현(주석엔 "테두리만 있는 흰 박스"로 의도가 적혀 있음, Figma 재확인 필요).

작업 중 이런 불일치를 새로 발견하면 이 섹션에 추가하거나 `CLAUDE.md`를 직접 고쳐서 다음 작업자가 같은 삽질을 안 하게 해주세요.

---

## 10. `@old/` 폴더

구 사이트(`m2mglobal.co.kr`) 원본 HTML/CSS/JS/이미지 스냅샷. 신규 페이지 제작 시 콘텐츠·구조 근거 자료로만 참고하고 **여기 파일은 절대 수정하지 않습니다**. `config/route/index.ts`의 `route` 배열 각 항목 옆 주석이 `@old/header.html`(구 GNB+사이트맵) 기준으로 신규/구 라우트 매핑을 기록해두었으니, "이 메뉴가 옛날엔 어디 있었는지" 찾을 땐 거기부터 보면 됩니다.

---

## 11. 배포 시 알아둘 것 — 404와 base(서브패스)

`output: 'static'`이라 빌드 산출물은 순수 정적 파일 묶음이고, "매칭 안 되는 경로를 어떻게 처리할지"는 결국 **이 파일들을 서빙하는 바깥쪽 웹서버**(Nginx/Apache/IIS 등)의 몫입니다. 이 프로젝트에서 특히 헷갈리기 쉬운 지점 두 가지:

### `outDir`과 `base`는 서로 다른 설정이다

`astro.config.mjs`의 `base: env.PUBLIC_BUILD_URL`(`prod`에서 `/dist`)은 **페이지 안 링크·에셋 URL에 붙는 프리픽스**일 뿐, 빌드 산출물이 쌓이는 **물리적 폴더 경로**(`outDir`, 커스텀 설정 없어 기본값 `./dist/`)와는 무관합니다. 이름이 우연히 같아서(`base=/dist` vs 산출 폴더 `dist/`) 같은 개념으로 착각하기 쉬운데:

- `src/pages/404.astro`는 `base` 값과 무관하게 **항상 `dist/404.html`에 그대로 생성**됩니다.
- 나중에 `PUBLIC_BUILD_URL`을 빈 문자열(루트 서빙)로 바꿔도 이 파일 위치는 안 바뀝니다 — Astro 쪽에서 추가로 손댈 코드 없음.

### 실제 404 응답 시 이 파일을 띄우는 건 인프라 설정

Astro 개발 서버(`astro dev`)와 `astro preview`는 없는 경로 요청 시 자동으로 `404.astro`를 보여주지만, 이건 **로컬 개발용 편의 기능**입니다. 실제 배포 환경에서 브라우저가 이 페이지를 보려면 호스팅 서버가 "매칭 안 되는 요청 → `404.html` 서빙"으로 명시적으로 설정돼 있어야 합니다(Nginx `error_page 404 /dist/404.html;`, Apache `ErrorDocument 404 /dist/404.html`, IIS 커스텀 오류 페이지, S3/Netlify류의 Error document 설정 등). **이 설정은 Astro 코드 밖의 영역이라 이 저장소만 봐서는 안 보임** — 배포 담당자/인프라 쪽에 확인 필요.

지금은 `/dist` 서브패스로 테스트 중이라 오류 페이지 경로도 `/dist/404.html`을 가리키게 되어 있을 텐데, **나중에 서브패스 없이 루트로 배포가 바뀌면 이 경로 설정값도 `/404.html`로 같이 바뀌어야 합니다** — `PUBLIC_BUILD_URL`을 바꾼다고 자동으로 따라가는 값이 아니니, 서브패스 제거 작업 시 체크리스트에 반드시 포함시킬 것.

---

## 12. 트러블슈팅 (과거에 실제로 겪은 문제)

작업 중 비슷한 증상을 마주치면 아래부터 의심해볼 것 — 전부 이 저장소에서 실제로 발생했던 버그입니다(`CLAUDE.md` 작업 로그에 원본 기록).

| 증상 | 원인 | 해결 |
| --- | --- | --- |
| GNB 등 링크가 `undefined/company/info`처럼 깨짐 | `config/env/.env.dev`·`.env.prod` 파일명이 Vite 자동 로딩 규칙(`.env.development`/`.env.production`)과 안 맞아 `import.meta.env.PUBLIC_BUILD_URL`이 항상 `undefined` | `astro.config.mjs`에서 `loadEnv(mode, './config/env', '')`로 직접 읽어 `vite.define`으로 강제 주입(현재 코드에 이미 반영됨, [2. 환경 변수](#2-환경-변수-configenv) 참고) |
| 특정 서브페이지에서 2Depth `Navigation` 탭이 통째로 안 보임 | `route.find(item => item.href === 자기_자신의_href)`로 조회 — `Route.href`는 그룹 대표(보통 첫 child) href라 자기 자신과 다르면 매칭 실패, 빈 값 전달 | `route.find()`는 항상 **그룹 최상위 href**로 조회([4. 라우팅](#4-라우팅-configroute) 참고). 과거 9개 페이지에서 동시에 발생했던 이력 있음 — 새 페이지 만들 때마다 재확인 |
| 특정 페이지에서 `window` 스크롤이 항상 0에 멈춤(스크롤이 아예 안 됨) | `html, body { height: 100% }` + 다른 곳의 `overflow-x: hidden`이 만나면 body가 고정 높이 스크롤 컨테이너가 되어버림 | `height: 100%` → `min-height: 100%`로 변경(`Layout.astro`의 scoped `<style>`, `base/_reset.scss` 양쪽 다 확인 — Astro scoped 스타일이라 한쪽만 고치면 안 먹음) |
| "맨 위로 가기" 버튼이 안 보이거나 클릭이 안 먹음 | CSS 포지셔닝과 클릭 훅(`scroll-to-top.ts`)만 있고 실제 `<button>` 엘리먼트 자체가 없던 상태 | `Layout.astro`에 `.layout__top-btn` 버튼 엘리먼트 직접 추가 — **새 페이지에서 페이지마다 다시 추가하지 말 것**(전역 렌더됨) |
| SCSS를 고쳤는데 브라우저에 반영이 안 됨 | VSCode **Watch Sass**가 꺼져 있어서 `src/styles/css/main.css`가 그대로 | 하단 상태바에서 **Watch Sass** 클릭해서 켜기(꺼진 채로 저장해봤자 컴파일 안 됨) — `npm install`에 `sass` 패키지를 추가하는 식으로 "해결"하지 말 것(Astro 자체 vite-sass와 이중 컴파일 충돌 남) |
| `color()`/`spacing()` 등 SCSS 함수를 썼는데 컴파일 경고(`정의되지 않은 토큰`)만 뜨고 스타일이 안 나옴 | 존재하지 않는 토큰 문자열을 넘김 — `abstracts/_functions.scss`의 `color()`는 매핑 안 되는 값이면 컴파일을 안 죽이고 `@warn` + `null` 반환(해당 속성만 조용히 생략) | Watch Sass 출력 패널의 경고 로그 확인, `_functions.scss`의 `color()` 함수 안 매핑 리스트에서 정확한 토큰명 문자열 확인 후 사용 |
