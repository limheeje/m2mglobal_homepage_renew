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
│   │   ├── common/            # 공용 컴포넌트 (아래 5번)
│   │   ├── layout/             # Gnb.astro, Footer.astro
│   │   └── ui/box/             # Box 상단 타이틀 variant 6종(BoxTitleCase1~6) + 조합 래퍼(UiBoxCase1~3), UiNoti, UiTags — 아래 5번 참고(더 이상 /company/info 전용 아님, 사이트 전반에서 재사용됨)
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
| `/style-guide` | `pages/style-guide.astro` | – | **실 서비스 라우트 아님** — 컴포넌트/디자인 토큰 검수용(2026-08-21 신규, 같은 날 전용 레이아웃으로 재구축). `SubLayout`(Gnb/Footer) 대신 전용 `StyleGuideLayout.astro`(왼쪽 고정 사이드바 + 스크롤 활성 하이라이트)를 씀. 각 컴포넌트마다 실제 라이브 렌더 + `?raw` import로 읽어온 진짜 소스코드(손으로 옮겨 적지 않음, `SourceBlock.astro`)를 같이 보여줌. Color/Typography 스와치는 `abstracts/_functions.scss`·`_mixins.scss`의 `color()`/`font()`를 그대로 호출해서 그려서 항상 실제 값과 동기화됨. 가이드 자체 UI 텍스트(사이드바/캡션/설명)는 사이트 표준 `rem()`이 아니라 순수 px 고정값(14px 기준) — 이유는 `layout/_style-guide-layout.scss` 상단 주석 참고. 새 공용 컴포넌트를 추가하면 이 페이지에도 예시 섹션을 추가할 것 |
| `/404` | `pages/404.astro` | – | **Astro 예약 경로** — 파일명이 곧 라우트 규칙(Astro가 자동 인식, `config/route/index.ts` 등록 불필요/불가). Figma 디자인 없는 유틸리티 페이지라 `TitleMain` + `Button`만 조합. **자동 리다이렉트 없음** — "홈으로 가기" 버튼만 제공(사용자 확인 후 결정된 사양, 아래 [11. 배포 시 알아둘 것](#11-배포-시-알아둘-것--404와-base서브패스) 참고) |

여러 Figma 프레임을 한 페이지의 **앵커탭(`.bs-tab-group` 또는 `.g-section` id)** 으로 합친 페이지가 대부분입니다 — 즉 "탭 = 다른 페이지"가 아니라 "탭 = 같은 페이지 안 스크롤 이동"이라는 점에 유의(`src/scripts/tab-box-scrollspy.ts`가 이 클릭/스크롤 동기화를 전역 처리).

---

## 5. 공용 컴포넌트 (`src/components/`)

> **2026-08-21 갱신**: 기존엔 이 섹션이 표(Props | 렌더 루트 클래스 | 비고) 위주였는데, 한눈에 "이 prop을 주면 뭐가 바뀌는지"가 잘 안 들어온다는 피드백으로 컴포넌트별 서술형으로 다시 정리했습니다. 각 컴포넌트는 **① 한 줄 요약 → ② prop이 실제로 무엇을 바꾸는지(불릿) → ③ 어느 페이지에서 쓰이는지** 순서로 적혀 있고, 정확한 동작이 궁금하면 바로 밑 `<details>`를 펼쳐 소스 전문을 확인하면 됩니다(README가 낡아도 소스 블록은 항상 그 시점의 진실). 같은 이유로 **오늘(2026-08-21) 진행된 `Box`/`BoxTitleCase*`/`ImagePlaceholder`/`IconTitle` 관련 변경분도 이번에 전부 반영**했습니다 — 특히 `Box`는 더 이상 `/company/info` 전용이 아니라 사이트 전역 공용 컴포넌트로 승격되었습니다.

### `common/` — 페이지 전반에서 재사용

#### `Box.astro` — 카드형 박스 셸
테두리+패딩+radius가 있는 카드형 박스가 필요할 때 항상 기본으로 삼는 셸 컴포넌트. 내용은 슬롯으로 자유롭게 넣거나, 아래 `ui/box/BoxTitleCase*` 시리즈와 조합해 "아이콘+타이틀(+설명) 헤더 + 본문" 형태로 구성. 렌더 루트는 `.bs-box`.

- **`useBackground`** (기본 `false`) — 켜면 배경을 `Color/Box/Box BG`(#F1F1F1)로 채우고, 테두리색도 같은 색으로 덮어써서 사실상 무테두리 카드처럼 보이게 만든다(메인페이지 `.sp-why-card`가 이 옵션 하나로 배경 카드를 재현).
- **`useSlotFoot`** (기본 `false`) — 카드 하단에 별도 슬롯 영역(`UiBoxCase3`의 `slotFoot` 참고)이 있을 때, 그 영역만큼 `padding-bottom`을 미리 확보(105px)하고 `position:relative`를 건다.
- **`useLightBorder`** (기본 `false`) — 기본 테두리색(`Color/Box/Border color` #b7b7b7) 대신 더 옅은 `Color/Black 10`(#dbdbdb)을 쓴다. Figma 실측상 테두리 색이 다른 인스턴스용(`/company/info` 사업영역 카드, 메인페이지 `.sp-solution-card`).
- **`useAccentBorder`** (기본 `false`) — 테두리색만 `Color/Primary Color`로 강조(두께는 기본과 동일, 배경은 안 채움). `/e-commerce/marketplace` MARKETPLACE 카드처럼 테두리만 브랜드컬러로 눈에 띄게 할 때.
- **`class`** — 최상위 `.bs-box`에 그대로 patch. Box가 동시에 다른 클래스(예: Swiper의 `swiper-slide`)를 겸해야 할 때 씀(메인페이지 `.sp-solution-card`).

⚠️ **주의**: Box는 슬롯 콘텐츠를 항상 `.b-inner`로 한 번 더 감싼다 — 카드 안에서 세로 flex 배치(`display:flex;flex-direction:column;gap:...`)가 필요하면 Box 자신이 아니라 `.b-inner`에 CSS를 줘야 한다(`.ai__feature-grid > .bs-box .b-inner`, 메인페이지 `.sp-solution-card .b-inner` 등이 실제 적용 예).

**사용처**: `/company/info`, `/company/careers`, `/company/ceo-message`, `/ai-engine/machine-learning`, `/ai-engine/ai-commerce`, `/e-commerce/commerce-technology`, `/e-commerce/b2b-commerce`, `/e-commerce/marketplace`, `/robot-logistics/smart-factory`, `/solutions/commerce-platform`, `/solutions/logistics-platform`, `/solutions/trade-platform`, `/solutions/elivestock-platform`, 메인(`/`) — 사실상 페이지 전반(예전엔 `/company/info` 전용이었으나 컴포넌트 리팩터링으로 전역 공용이 됨).

<details>
<summary><code>Box.astro</code> 소스</summary>

```astro
---
const {
  useBackground = false,
  useSlotFoot = false,
  useLightBorder = false,
  useAccentBorder = false,
  class: className
} = Astro.props
---

<div
  class="bs-box"
  class:list={[
    className,
    {
      'use-background': useBackground,
      'use-slotfoot': useSlotFoot,
      'use-light-border': useLightBorder,
      'use-accent-border': useAccentBorder
    }
  ]}
>
  <div class="b-inner">
    <slot />
  </div>
</div>
```

</details>

#### `Button.astro` — 버튼/링크 겸용
`href`를 주는지 여부로 `<a>`/`<button>`이 자동으로 갈리는 버튼. 렌더 루트는 `.bs-button[data-variant][data-size]`.

- **`href`** — 값을 주면 `<a href>`로, 안 주면 `<button type="button">`으로 렌더된다.
- **`useBlock`** — 켜면 버튼을 블록 레벨로 늘려서 카드 폭 100%를 채운다.
- **`useSuffixIcon`** (`'copy'|'blank'|'plus'|'toggle'|'next'|'download'`) — 텍스트 오른쪽에 해당 의미의 아이콘(`.b-suff[data-type]`)을 덧붙인다.
- **`size`** (`'md'|'sm'|'lg'`, 기본 `md`) — 버튼 높이/패딩/폰트 사이즈 프리셋.
- **`variant`** (`'default'|'white'|'primary'`, 기본 `default`) — 색상 스킴.
- **`target`** — `href`가 있을 때만 의미 있음(`_blank` 등).
- **`class`** — 그대로 patch.

<details>
<summary><code>Button.astro</code> 소스</summary>

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

#### `CaseCardGrid.astro` — 구축사례 카드 그리드
썸네일 + 타이틀 + 일자 + 설명 카드를 중앙정렬 그리드로 뿌린다. `/ai-engine/machine-learning`, `/robot-logistics/smart-factory`, `/e-commerce/b2b-commerce`가 각자 구현하던 동일 패턴(`ai__case-*`/`rl__case-*`/`ec__case-*`)을 통합한 것. 렌더 루트는 `.cc__grid`.

- **`id`** (기본 `'cases'`) — 앵커탭이 스크롤할 대상 `<section id>`.
- **`title`** (HTML, 기본 `"구축 사례"`) — `set:html`로 그대로 삽입.
- **`columns`** — 그리드 컬럼 수(`--cc-cols` CSS 변수로 전달).
- **`cases`** (필수) — `{imageSrc?, title, date, desc}[]`. `imageSrc`를 생략한 항목은 회색 placeholder 박스만 표시된다.

<details>
<summary><code>CaseCardGrid.astro</code> 소스</summary>

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

#### `CaseStudySection.astro` — 구축사례 섹션(내용 내장형)
`/robot-logistics/overview#cases`에서 처음 추출된 큰 섹션. **props 없이 `<CaseStudySection />`만 써도 CJ대한통운 APRIL 구축사례 전체(타임라인/구현기능/연동 제조사/다이어그램/시스템 업무 구성/디바이스 패널)가 완전하게 렌더링된다** — 모든 데이터가 기본값으로 내장돼 있어서다. 다른 라우트에서 완전히 동일한 내용을 재사용하려는 목적. 자체 스타일(`_case-study-section.scss`)만 쓰고 페이지 전용 scss에는 안 기댐.

- **`id`** (기본 `'cases'`) — 앵커탭 대상.
- **`title`** (HTML) — 기본은 "로봇기반 통합관제시스템 구축 사례".
- **`partnerLogos`** — 타이틀 옆 파트너 로고 placeholder 노출 여부.
- **`timeline` / `functions` / `vendorTables` / `diagram` / `systemFeatures` / `devicePanels`** — 각각 해당 서브섹션 데이터. **`null`을 넘기면 그 블록 자체가 렌더링 안 됨**(선택적 블록) — 기본값은 전부 채워져 있어서, 진짜 다른 내용이 필요한 곳에서만 개별적으로 덮어쓰면 된다.

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

#### `ClientLogoGrid.astro` — 고객사 로고 그리드
`/company/news`, `/ai-engine/ai-commerce`, `/e-commerce/commerce-technology`에서 각자 구현하던 동일 패턴을 통합. 렌더 루트는 `.cl__grid`.

- **`clients`** (필수) — `{key, name}[]`. 로고 이미지는 `src/assets/images/clients/ico_client_{key}.png`가 이미 존재해야 한다(신규 다운로드 아님, `/company/news` 작업 시 확보해둔 기존 자산 재사용).
- **`columns`** (기본 `6`) — 그리드 컬럼 수.

<details>
<summary><code>ClientLogoGrid.astro</code> 소스</summary>

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

#### `Icon.astro` — 인라인 아이콘
`public/images/icons/{name}`을 `<img src>`로 로드하는 아이콘 래퍼. 렌더 루트는 `.bs-icon > img.v-ic`.

- **`name`** (필수) — 확장자 포함 전체 파일명(`ICON_KEY_NAME` 상수 참고, Figma 레이어명 → 파일명 매핑).
- **`width` / `height`** (기본 각 `10rem`) — 래퍼 `<span>`의 인라인 크기.

⚠️ **`CLAUDE.md`에 적힌 "`src/assets` glob 방식" 설명과 실제 구현이 다릅니다** — 실제로는 위처럼 `public/images/icons/`를 `PUBLIC_BUILD_URL` 기준 `<img src>`로 로드.

<details>
<summary><code>Icon.astro</code> 소스</summary>

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

#### `IconTitle.astro` — 아이콘 + 타이틀(+서브타이틀) 🆕
아이콘(100px 원형, Blue-10 배경) + 타이틀 + 선택적 서브타이틀로 이루어진 단일 아이템. **카드 테두리/padding/그리드 배치는 이 컴포넌트가 관여하지 않고 페이지의 wrapper가 담당**한다 — `Box`+`BoxTitleCase*` 조합과 똑같은 역할 분담 철학. `/company/ceo-message`(`.company__ceo-value`), `/robot-logistics/overview`(`.rl__divider-item`, `.rl__insight-card`)에서 각자 다르게 구현되어 있던 걸 2026-08-21에 공용화. 렌더 루트는 `.bs-icon-title`.

- **`icon`** (필수) — `Icon.astro`에 그대로 전달되는 아이콘 파일명.
- **`title`** (필수) — 순수 텍스트(HTML 아님, `set:html` 안 씀).
- **`subtitle`** — 값을 주면 타이틀 아래 서브타이틀 한 줄이 추가로 렌더되고, 안 주면 아예 렌더 안 됨.
- **`size`** (`'lg'|'sm'`, 기본 `'sm'`) — 타이틀 폰트 크기 프리셋(`lg`=24px, `sm`=18px).

**사용처**: `/company/ceo-message`, `/robot-logistics/overview`.

<details>
<summary><code>IconTitle.astro</code> 소스</summary>

```astro
---
// 아이콘(100px 원형, Blue-10) + 타이틀(+선택적 서브타이틀) 단일 아이템 — 카드 테두리/padding/그리드
// 배치는 컴포넌트가 관여하지 않고 페이지에서 감싸는 wrapper가 맡는다(Box/BoxTitleCase 조합과 동일한
// 역할 분담). /company/ceo-message(.company__ceo-value), /robot-logistics/overview
// (.rl__divider-item, .rl__insight-card) 등에서 각자 다르게 구현되어 있던 걸 공용화(2026-08-21).
import Icon from '~/components/common/Icon.astro'

export interface Props {
  icon: string
  title: string
  subtitle?: string
  size?: 'lg' | 'sm'
}
const {icon, title, subtitle, size = 'sm'} = Astro.props
---

<div class="bs-icon-title" class:list={{'size-lg': size === 'lg'}}>
  <span class="bit-icon" aria-hidden="true">
    <Icon name={icon} />
  </span>
  <p class="bit-title">{title}</p>
  {subtitle && <p class="bit-subtitle">{subtitle}</p>}
</div>
```

</details>

#### `ImagePlaceholder.astro` — 테두리 박스 안 이미지 1장 🆕
"테두리+radius 박스 안에 이미지 1장" 다이어그램/구성도 패턴 — `ai-engine`/`robot-logistics`/`solutions`/`e-commerce` 등 여러 페이지에 항목별 비율만 다르게 중복 구현돼 있던 걸 2026-08-21에 공용화. 렌더 루트는 `.bs-image-placeholder > img`.

- **`src`** (필수), **`alt`**
- **`ratio`** — CSS `aspect-ratio` 문자열(예: `'16/7'`). `fixedRatio` 값에 따라 바깥 박스 또는 이미지 자체에 적용된다.
- **`useBorder`** (기본 `true`) — 끄면 테두리 없이 이미지만 남는다.
- **`usePadding`** (기본 `false`) — 켜면 박스 안쪽에 36px(모바일 20px) 여백을 두고 그 안에 이미지를 띄운다.
- **`maxWidth`** — 박스의 최대 폭(CSS 값 문자열, 예: `'176rem'`). 아무리 큰 값을 줘도 모바일에서 뷰포트를 넘치지 않도록 컴포넌트 내부에서 `max-width:100%`로 추가 보정되어 있다.
- **`fixedRatio`** (기본 `true`) — `true`면 바깥 박스 자체가 `ratio`로 고정되고 넘치는 이미지는 크롭된다(여러 페이지에서 동일 프레임 크기를 맞출 때). `false`면 바깥 박스는 콘텐츠 높이만큼 `auto`이고, 이미지 자체가 `ratio`+`maxWidth`로 가운데 정렬되어 원래 비율 그대로(크롭 없이) 보인다.
- **`useFill`** — 켜면 이미지 자체에 회색 채움(`Color/Black 3`)+radius 12를 한 번 더 씌운다 — 큰 테두리 박스 안에 작게 채워진 카드형으로 감싸야 하는 경우(예: robot-logistics 스케줄링 다이어그램).
- **`class`** — patch.

**모바일 참고**: `aspect-ratio`가 인라인 style로 들어가기 때문에 외부 CSS보다 항상 우선한다 — 그래서 모바일 전용 오버라이드(`aspect-ratio:auto`)는 컴포넌트 내부 CSS에서 이미 `!important`로 강제해뒀다(별도 대응 불필요).

**사용처**: `/ai-engine/ai-commerce`, `/robot-logistics/overview`, `/robot-logistics/smart-factory`, `/solutions/commerce-platform`, `/solutions/elivestock-platform`, `/solutions/logistics-platform`, `/solutions/trade-platform`.

<details>
<summary><code>ImagePlaceholder.astro</code> 소스</summary>

```astro
---
// 다이어그램/구성도 등 "테두리+radius 박스 안에 이미지 1장" 패턴 — 여러 페이지
// (ai-engine/robot-logistics/solutions/e-commerce 등)에 항목별 비율만 다르게 중복 구현되어 있던 걸
// 공용화. ratio만 페이지별로 지정, border/padding은 Figma상 예외가 있는 페이지에서만 끔/조정.
//
// fixedRatio(기본 true): 바깥 박스 자체를 ratio로 고정하고 넘치는 이미지는 잘라낸다(예: ai-engine
// 다이어그램, robot-logistics 시스템구성도 — 여러 페이지에서 동일 프레임 크기를 맞출 때).
// fixedRatio=false: 바깥 박스는 콘텐츠 높이만큼 auto — 이미지 자체가 ratio+maxWidth로 가운데
// 정렬되어 자기 비율 그대로 표시된다(예: robot-logistics 인프라/소프트웨어/시뮬레이션 구성도 — 박스가
// 이미지를 크롭하지 않고 그대로 감싸기만 함).
// useFill: 이미지 자체에 회색 채움(Color/Black 3)+radius 12를 추가(예: robot-logistics 스케줄링
// 다이어그램 — 큰 테두리 박스 안에 작게 채워진 카드 형태로 한 번 더 감싸는 경우).
export interface Props {
  src: string
  alt?: string
  ratio?: string
  useBorder?: boolean
  usePadding?: boolean
  maxWidth?: string
  fixedRatio?: boolean
  useFill?: boolean
  class?: string
}
const {
  src,
  alt = '',
  ratio,
  useBorder = true,
  usePadding = false,
  maxWidth,
  fixedRatio = true,
  useFill = false,
  class: className
} = Astro.props
---

<div
  class="bs-image-placeholder"
  class:list={[
    className,
    {
      'use-border': useBorder,
      'use-padding': usePadding,
      'fit-content': !fixedRatio,
      'use-fill': useFill
    }
  ]}
  style={{
    aspectRatio: fixedRatio ? ratio : undefined,
    '--ip-max-width': maxWidth
  }}
  aria-hidden="true"
>
  <img src={src} alt={alt} style={{aspectRatio: fixedRatio ? undefined : ratio}} />
</div>
```

</details>

#### `Label.astro` — 필/뱃지 라벨
렌더 루트는 `.bs-label[data-type]`.

- **`type`** (`'type_1'|'type_2'`, 기본 `'type_1'`) — 색상/모양 프리셋.

<details>
<summary><code>Label.astro</code> 소스</summary>

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

#### `LayerPopup.astro` — 레이어 팝업
`@old/index.html`의 `.popup-wrap`(레거시 공지/이벤트 팝업)을 포팅한 컴포넌트. 오버레이/딤 없이 화면 좌측 상단에 여러 개가 나란히 뜨는 원본 구조 그대로이며, 체크박스로 "오늘 하루 이 창을 열지 않음"을 선택한 뒤 닫으면 쿠키(기본 1일)로 재노출을 막는다. 동작은 `layer-popup.ts`가 전담(Layout.astro에 전역 등록되어 있어 별도 연결 코드 불필요) — `data-layer-popup`/`data-cookie-key` 마크업 컨벤션만 지키면 어느 페이지에서 써도 동작한다. 렌더 루트는 `.layer-popup-wrap`.

- **`items`** (필수) — `{id, image, alt, href?, target?, cookieDays?}[]`. `href`가 있으면 이미지가 링크로 감싸지고, `cookieDays`(기본 1)는 "오늘 하루 안 보기" 체크 후 닫았을 때 재노출을 막는 기간이다.

<details>
<summary><code>LayerPopup.astro</code> 소스</summary>

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

#### `Navigation.astro` — 서브페이지 2Depth 탭
서브페이지 상단의 가로 2Depth 탭. `overflow-x:auto` 스크롤 영역이고, 활성 탭이 가운데로 오도록 `nav-active-state.ts` + `navi-group-active-scroll.ts`가 전역으로 처리한다. 렌더 루트는 `.bs-navigation > .navi-group`.

- **`items`** — 보통 `route.find(...)?.children`을 그대로 넘긴다([4. 라우팅](#4-라우팅-configroute) 참고). `undefined`면 아무것도 안 그림.
- **`activeMenuId`** — 이 값과 `item.id`가 일치하는 탭에 `.is-active`가 붙는다.

<details>
<summary><code>Navigation.astro</code> 소스</summary>

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

#### `SubBanner.astro` — 서브페이지 상단 배너
`CLAUDE.md`가 말하는 `PageBanner`와 동일 개념이지만 실제 컴포넌트명은 `SubBanner`. 렌더 루트는 `.bs-sub-banner`.

- **`title`** (HTML), **`description`** (HTML) — 둘 다 `set:html`.

<details>
<summary><code>SubBanner.astro</code> 소스</summary>

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

#### `Tab.astro` — 탭 단일 아이템
렌더 루트는 `.bs-tab[data-type]`.

- **`is`** (`'span'|'button'`, 기본 `'button'`) — 렌더되는 실제 태그.
- **`type`** (`'round'|'line'|'box'`, 기본 `'round'`) — `'box'`(`.bs-tab-group` 안에서 앵커탭으로 쓰일 때)는 `tab-box-scrollspy.ts`가 클릭/스크롤을 자동 동기화한다.

<details>
<summary><code>Tab.astro</code> 소스</summary>

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

#### `Table.astro` — 테이블 셸
렌더 루트는 `table.bs-table[data-size]`.

- **`size`** (`'sm'|'md'|'lg'`, 기본 `'md'`) — 셀 padding/폰트 크기 프리셋.
- **`tleft`** — 켜면 첫 컬럼을 왼쪽 정렬(`.is-tleft`)로 강제.

<details>
<summary><code>Table.astro</code> 소스</summary>

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

#### `TextList.astro` — 불릿 리스트 아이템
렌더 루트는 `.bs-text-list[data-type][data-circle-type]`.

- **`type`** (`'type_1'|'type_2'`, 기본 `'type_1'`) — 리스트 아이템의 시각적 스타일(일반 텍스트 줄 vs 필 형태 박스 등).
- **`circleType`** (`'type_1'|'type_2'`, 기본 `'type_1'`) — `'type_2'`면 불릿 자리에 체크마크 아이콘(인라인 SVG)이 노출된다.

<details>
<summary><code>TextList.astro</code> 소스</summary>

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

#### `TitleMain.astro` — 페이지 최상단 타이틀
렌더 루트는 `.bs-main-title`.

- **`title`**, **`description`** — `description`을 넘기면 타이틀+설명 조합(`.bms-texts`)으로 렌더되고, **안 넘기면 페이지명만**(`.bm-page-name`) 렌더된다 — 이 둘은 서로 다른 마크업/스타일 블록이라는 점에 유의. 모바일 폰트 축소는 `_title-main.scss`에서 별도 처리.

<details>
<summary><code>TitleMain.astro</code> 소스</summary>

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

#### `TitleMiddle.astro` — 인라인 중간 타이틀
슬롯만 받는다. 렌더 루트는 `.bs-title-middle`.

<details>
<summary><code>TitleMiddle.astro</code> 소스</summary>

```astro
---

---

<span class="bs-title-middle">
  <slot />
</span>
```

</details>

#### `TitleSub.astro` — 섹션 타이틀+설명
렌더 루트는 `.bs-title-sub`.

- **`title`** (HTML), **`description`** (HTML) — `description`은 값이 있을 때만 렌더된다(없으면 `.bs-description` 자체가 안 그려짐).

<details>
<summary><code>TitleSub.astro</code> 소스</summary>

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

#### `TitleThird.astro` — 인라인 소제목
슬롯만 받는 인라인 소제목. 렌더 루트는 `.bs-title-third`.

- **`class`** (신규) — 페이지마다 필요한 하단 여백이 제각각(뒤에 오는 요소가 다름)이라, 여백 값 자체는 컴포넌트에 절대 안 넣고 항상 페이지 전용 클래스로 넘겨서 주는 게 원칙이다 — 이 prop이 그 탈출구.

<details>
<summary><code>TitleThird.astro</code> 소스</summary>

```astro
---
// 페이지마다 필요한 하단 여백이 달라서(뒤에 오는 요소가 다름) 여백값 자체는 항상
// 페이지 전용 클래스(예: .ai__diagram-title)로 넘겨서 준다 — 컴포넌트 자체엔 여백을 넣지 않음.
const {class: className} = Astro.props
---

<span class="bs-title-third" class:list={[className]}>
  <slot />
</span>
```

</details>

#### `AllMenu.astro` — 전체 메뉴 오버레이
GNB `.all-gnb` 버튼으로 여닫는 전체 메뉴 오버레이(Figma "All 메뉴" 심볼). props는 없고 `@config/route`를 직접 참조한다 — Gnb.astro/Navigation.astro와 같은 단일 소스라 라우트가 바뀌어도 항상 최신 상태로 맞다. `Layout.astro`에 전역으로 이미 박혀 있어서 페이지에서 따로 안 씀. 렌더 루트는 `.all-menu`.

<details>
<summary><code>AllMenu.astro</code> 소스</summary>

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

#### `Gnb.astro` — 헤더
`route`로 1/2Depth 메뉴를 렌더하고, 1Depth를 hover하면 6컬럼 메가메뉴 패널이 통째로 열리는 구조(항목별 개별 드롭다운이 아님 — Figma 원본 그대로, 바꾸지 말 것). `nav-active-state.ts`가 현재 URL 기준으로 `.is-active`를 부여한다. props 없음.

<details>
<summary><code>Gnb.astro</code> 소스</summary>

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

#### `Footer.astro` — 푸터
다크 배경 전용 화이트 로고 자산(GNB용과 다른 별도 export)을 쓴다 — 단순 색 반전이 아니라 Figma에 워드마크+국문 표기가 같이 들어있는 별개 자산.

- **`class`** — 최상위 `<footer>`에 patch.

<details>
<summary><code>Footer.astro</code> 소스</summary>

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

### `ui/box/` — `Box`의 헤더 영역 variant 시리즈

`Box.astro`(공용 셸, 위 `common/`에서 소개)의 헤더 영역(아이콘/라벨/타이틀/설명)을 조합용으로 쪼갠 `BoxTitleCase1~6` + 그걸 Box와 한 번에 묶어주는 `UiBoxCase1~3` + 그 외 보조 컴포넌트(`UiNoti`, `UiTags`)로 구성됩니다.

> **더 이상 `/company/info` 전용이 아닙니다.** 2026-08-21 컴포넌트 리팩터링으로 `BoxTitleCase2`~`BoxTitleCase6`은 `/company/*`·`/ai-engine/*`·`/e-commerce/*`·`/robot-logistics/*`·`/solutions/*` 전반에서 재사용되는 핵심 공용 컴포넌트가 됐습니다(정확한 사용처는 각 항목 참고). 다만 **`BoxTitleCase1`과 그걸 감싸는 `UiBoxCase1`은 실제로 어느 페이지에서도 쓰이지 않는 죽은 코드**로 확인됩니다(2026-08-21 `grep` 기준) — 삭제 후보로 남겨둡니다.

모든 `BoxTitleCase*`는 `Box` 안에서 **첫 번째 자식**으로 쓰이는 걸 전제로 설계돼 있고(헤더 아래 여백을 자기 자신의 `margin-bottom`으로 처리), `Box`가 콘텐츠를 `.b-inner`로 한 번 더 감싼다는 점은 `Box.astro` 설명과 동일하게 적용됩니다.

#### `boxTitleCase/BoxTitleCase1.astro` — 아이콘 + 라벨 + 타이틀 ⚠️ 미사용
- **`label`**, **`title`**, **`icon`**
- **사용처**: 없음. `UiBoxCase1.astro` 안에서만 참조되는데 그 `UiBoxCase1`조차 어느 페이지에서도 안 쓰임 — 실질적으로 죽은 코드.

<details>
<summary><code>BoxTitleCase1.astro</code> 소스</summary>

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

#### `boxTitleCase/BoxTitleCase2.astro` — 라벨 + 타이틀 (아이콘 없음)
- **`label`**, **`title`**
- **`tight`** (기본 `false`) — 켜면 타이틀의 `margin-bottom`을 제거한다. 타이틀 뒤에 이어지는 본문(`.bs-gl-content`)이 없는 카드(라벨+타이틀만 있는 경우)에서 안 쓰면 갈 곳 없는 여백만 남는다.
- **사용처**: `/company/ceo-message`.

<details>
<summary><code>BoxTitleCase2.astro</code> 소스</summary>

```astro
---
import Label from '~/components/common/Label.astro'

const {label = '', title = '', tight = false} = Astro.props
---

<div class="bs-box-title-case-2" class:list={{'is-tight': tight}}>
  <div class="bbtc1-inner">
    <div class="bsb-label">
      <Label>{label}</Label>
    </div>
    <div class="bsb-title" set:html={title} />
  </div>
</div>
```

</details>

#### `boxTitleCase/BoxTitleCase3.astro` — 아이콘 + 타이틀 (라벨 없음, 하단 구분선)
헤더 하단에 `Color/Primary Color` 구분선이 붙는 게 이 케이스의 특징(다른 케이스와 구별 포인트).

- **`title`**, **`icon`**
- **`titleColor`** (`'secondary'|'primary100'`, 기본 `'secondary'`) — Figma 실측상 인스턴스마다 타이틀 색이 실제로 다르다(예: ai-engine은 Secondary Color, robot-logistics 스마트팩토리 특장점은 Primary/Blue100) — 그래서 진짜 색상 옵션으로 분리돼 있다.
- **사용처**: `/ai-engine/ai-commerce`, `/ai-engine/machine-learning`, `/e-commerce/b2b-commerce`, `/e-commerce/commerce-technology`, `/e-commerce/marketplace`, `/robot-logistics/smart-factory`.

<details>
<summary><code>BoxTitleCase3.astro</code> 소스</summary>

```astro
---
import Icon from '~/components/common/Icon.astro'
const {title = '', icon = '', titleColor = 'secondary'} = Astro.props
---

<div
  class="bs-box-title-case-3"
  class:list={{'title-color-primary100': titleColor === 'primary100'}}
>
  <div class="bbtc3-inner">
    <span class="bsb-icon">
      <Icon name={icon} />
    </span>
    <div class="bsb-title" set:html={title} />
  </div>
</div>
```

</details>

#### `boxTitleCase/BoxTitleCase4.astro` — prefix + 라벨(type_2) + 타이틀 (하단 구분선)
- **`title`**, **`label`**
- **`prefix`** — 값을 주면 타이틀 옆에 접미 텍스트(`.bsb-title-pref`)가 추가로 렌더된다(예: 단위 표시). 안 주면 렌더 안 됨.
- **`tight`** (기본 `false`) — 뒤에 이어지는 콘텐츠와의 간격을 부모 쪽에서 이미 `flex gap` 등으로 주는 경우(예: ai-commerce Level 카드), 자기 자신의 `margin-bottom`까지 겹치면 여백이 중복되므로 제거하는 옵션.
- **사용처**: `/ai-engine/ai-commerce`, `/company/info`, `/e-commerce/marketplace`.

<details>
<summary><code>BoxTitleCase4.astro</code> 소스</summary>

```astro
---
import Label from '~/components/common/Label.astro'
const {title = '', label = '', prefix, tight = false} = Astro.props
---

<div class="bs-box-title-case-4" class:list={{'is-tight': tight}}>
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

#### `boxTitleCase/BoxTitleCase5.astro` — 아이콘 + 타이틀 + 설명(옵션) — 가장 많이 쓰이는 케이스
- **`title`**, **`icon`**
- **`description`** — 생략 가능. 값이 있을 때만 `.bsb-description`이 렌더된다(케이스3/4와 달리 이 케이스는 원래도 설명 유무가 갈리는 카드가 많았음).
- **`size`** (`'lg'|'sm'|'md'`, 기본 `'lg'`) — 타이틀/설명 폰트 크기 프리셋. `lg`=30px/18px, `sm`=24px/16px(예: careers 복지카드), `md`=타이틀만 24px로 줄고 설명은 18px 그대로(예: e-commerce/b2b-commerce 통계 카드 — 코멘트상 "미검증", Figma 재확인 전까지는 기존 코드값을 그대로 옵션화한 상태).
- **`tight`** (기본 `false`) — 아이콘+타이틀+설명 뒤에 리스트 등 추가 콘텐츠가 안 이어지는 경우(예: careers 복지카드), 마지막 요소(`description`)의 `margin-bottom`이 갈 곳 없이 남아 카드가 필요 이상으로 커지는 걸 막는다.
- **`titleColor`** (`'default'|'primary100'`, 기본 `'default'`) — Figma 실측상 타이틀 색이 기본이 아니라 Primary/Blue100인 인스턴스용(예: solutions "이해하기" 카드).
- **PC/모바일 폰트 크기 유의**: `size` 옵션이 없는 기본(`lg`) 인스턴스는 **PC는 Figma 실측(30/18)**을 그대로 쓰지만, **모바일은 Figma 시안이 없어 기존에 이미 배포/QA된 화면(24/16)을 그대로 보존**한다(모바일 전용 CSS 오버라이드로 처리, `size-sm`/`size-md`는 이 오버라이드 대상이 아니라 자기 값을 모든 화면폭에서 그대로 유지).
- **사용처**: `/ai-engine/machine-learning`, `/company/careers`, `/company/info`, `/e-commerce/b2b-commerce`, `/e-commerce/marketplace`, `/solutions/commerce-platform`, `/solutions/elivestock-platform`, `/solutions/logistics-platform`, `/solutions/trade-platform`.

<details>
<summary><code>BoxTitleCase5.astro</code> 소스</summary>

```astro
---
import Icon from '~/components/common/Icon.astro'

const {
  description = '',
  title = '',
  icon = '',
  size = 'lg',
  tight = false,
  titleColor = 'default'
} = Astro.props
---

<div
  class="bs-box-title-case-5"
  class:list={{
    'size-sm': size === 'sm',
    'size-md': size === 'md',
    'is-tight': tight,
    'title-color-primary100': titleColor === 'primary100'
  }}
>
  <div class="bbtc5-inner">
    <span class="bsb-icon">
      <Icon name={icon} />
    </span>
    <div class="bsb-title" set:html={title} />
    {description && <div class="bsb-description" set:html={description} />}
  </div>
</div>
```

</details>

#### `boxTitleCase/BoxTitleCase6.astro` — 타이틀 + 설명 (아이콘/라벨 없음) 🆕
케이스5에서 아이콘만 뺀 모양 — 아이콘/라벨 없이 타이틀+설명만 있는 카드용(예: careers 인재채용 분야 카드). Figma 실측(y좌표 역산): 타이틀→설명 간격 20px, 설명은 마지막 요소라 trailing 여백 없음.

- **`title`**, **`description`**
- **사용처**: `/company/careers`, `/solutions/elivestock-platform`.

<details>
<summary><code>BoxTitleCase6.astro</code> 소스</summary>

```astro
---
const {description = '', title = ''} = Astro.props
---

<div class="bs-box-title-case-6">
  <div class="bbtc6-inner">
    <div class="bsb-title" set:html={title} />
    <div class="bsb-description" set:html={description} />
  </div>
</div>
```

</details>

#### `UiBoxCase1.astro` — Box + BoxTitleCase1 조합 ⚠️ 미사용
- **`label`**, **`title`**, **`icon`** — 그대로 `BoxTitleCase1`에 전달.
- **사용처**: 없음(위 `BoxTitleCase1` 참고).

<details>
<summary><code>UiBoxCase1.astro</code> 소스</summary>

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

#### `UiBoxCase2.astro` — Box + BoxTitleCase2 조합
- **`label`**, **`title`** — 그대로 `BoxTitleCase2`에 전달.
- **`useBackground`** — 그대로 `Box`에 전달.
- **사용처**: `/company/info`, `/e-commerce/b2b-commerce`.

<details>
<summary><code>UiBoxCase2.astro</code> 소스</summary>

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

#### `UiBoxCase3.astro` — Box + 슬롯 3분할(head/default/foot)
헤더/본문/하단을 슬롯 3개로 나눠 받는 조합 래퍼 — `slotFoot`을 실제로 넘겼는지 여부를 컴포넌트가 스스로 감지(`Astro.slots.has`)해서 `Box`의 `useSlotFoot`을 자동으로 켠다(페이지에서 별도로 boolean을 안 넘겨도 됨).

- 슬롯: `slotHead`(헤더 영역), 기본 슬롯(본문, `.bs-gl-content`로 감싸짐), `slotFoot`(하단 영역, 넣으면 자동으로 `.bs-gl-bottom`+`Box`의 `useSlotFoot` 여백까지 같이 적용).
- **사용처**: `/company/info`.

<details>
<summary><code>UiBoxCase3.astro</code> 소스</summary>

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

#### `UiNoti.astro` — dl 리스트형 안내 (고정 2행)
"데이터 활용 수준"/"성과 지표" 두 행이 고정된 `<dl>` 안내 블록 — 범용 리스트가 아니라 이 두 항목 전용으로 하드코딩돼 있다는 점에 유의.

- **`dataLevel`** (HTML), **`metric`** (HTML) — 각각 `set:html`.
- **사용처**: `/ai-engine/ai-commerce`.

<details>
<summary><code>UiNoti.astro</code> 소스</summary>

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

#### `UiTags.astro` — 태그 리스트
- **`items`** (필수) — `{codeId, codeName}[]`. `codeName`을 그대로 텍스트로 렌더.
- **사용처**: `/company/info`.

<details>
<summary><code>UiTags.astro</code> 소스</summary>

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
- 메인페이지 Swiper(`.sp-solution-card` 등, `slidesPerView`가 소수점인 케이스)는 **카드에 `width`/`max-width`를 CSS로 직접 주면 안 됨** — Swiper가 슬라이드 폭을 DOM 실측이 아니라 "컨테이너 폭÷slidesPerView" 공식으로 계산해서 그 값을 그대로 다음 슬라이드 이동 거리(translate)에 쓰기 때문에, CSS로 렌더 폭만 눌러버리면 계산값과 실제 렌더 폭이 어긋나 네비게이션 시 카드가 화면 밖으로 튕겨나가는 버그가 생김(2026-08-21 실제로 태블릿 폭에서 재현/확인, `page/_main.scss`의 `.sp-solution-card` 주석 참고). 카드 폭 제한이 필요하면 카드 자신이 아니라 **swiper 컨테이너 쪽의 실측 폭 자체**를 줄이는 방향으로 접근할 것.

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

`CLAUDE.md` 자체에도 "⚠️ 위 표와 실제 코드 불일치 주의" 섹션이 있을 만큼, 문서가 코드 변경 속도를 못 따라간 부분이 있습니다. 이 README 최초 작성 시점(2026-08-19) 기준으로 직접 확인한 불일치 목록(2026-08-21 갱신 — `Box`/`BoxTitleCase*` 전역화, `ImagePlaceholder`/`IconTitle` 신규 추가, `BoxTitleCase1`/`UiBoxCase1` 미사용 확인분 반영, **`/style-guide` 페이지 신규 제작으로 해소**):

- ~~`/style-guide` 페이지 없음~~ → **2026-08-21 해소**: `src/pages/style-guide.astro`로 신규 제작. Color/Typography 디자인 토큰 스와치(실제 `color()`/`font()` 호출 결과) + `common/`·`ui/box/` 전 컴포넌트의 주요 variant 예시를 한 페이지에서 확인 가능. (Spacing/Radius는 CLAUDE.md가 언급하는 공식 스케일 자체가 코드에 없어서 — 바로 아래 항목 참고 — 스와치 없이 생략.) `page-list.astro`의 `etcPages`에도 연결해둠.
- `Icon.astro`는 `src/assets/**/*.svg` glob이 아니라 `public/images/icons/{name}`을 `<img src>`로 직접 로드.
- 디자인 토큰 `:root` 정의는 `abstracts/_variables.scss`가 아니라 `base/_reset.scss`에 있음.
- `spacing()`/`radius()`/`m.*` 네임스페이스 헬퍼는 실제로 존재하지 않음(`rem()`/`color()`만 있음).
- 브레이크포인트 실제 값은 `md=1300`(문서상 `768`과 다름).
- `IconButton`/`ListItem`/`SpecGroup`/`Title`(TitleMain/Sub/Third/Middle로 이미 분리 구현됨)/`TextButton`/`Container`/`Row`/`Col`/`Grid` 등 CLAUDE.md 공통 컴포넌트 표에 있는 일부 컴포넌트는 여전히 파일이 없음 — 실제 그리드는 `base/_reset.scss`의 `.g-container`/`.g-row`/`.g-col`(부트스트랩 스타일 12컬럼) 유틸리티로 구현되어 있고 별도 Astro 컴포넌트(`Row.astro` 등)는 없음.
- `page/_solutions.scss`의 `.sol__tech-diagram-ty2` 클래스가 빈 스타일(`{}`)로 스캐폴딩만 되어 있던 문제는 2026-08-21 `ImagePlaceholder` 도입으로 다른 3개 자매 페이지(commerce/logistics/trade-platform)와 동일한 마크업으로 통일되며 해소됨.
- `BoxTitleCase1.astro`와 `UiBoxCase1.astro`는 코드는 남아있지만 실제로 어느 페이지에서도 참조되지 않는 죽은 컴포넌트(2026-08-21 `grep` 확인) — 삭제하거나, 필요해지면 그때 재사용할 것.

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
| Swiper(`slidesPerView`가 소수점인 경우) 카드에 `max-width`를 줬더니 다음 슬라이드로 넘어갈 때 카드가 화면 밖으로 튕겨나감 | Swiper가 슬라이드 폭을 DOM 실측이 아니라 "컨테이너 폭÷slidesPerView" 공식으로 계산해 그 값을 그대로 이동 거리(translate)에 쓰는데, CSS `max-width`로 렌더 폭만 눌러버리면 계산값과 실제 폭이 어긋남 | 카드 자신에 `width`/`max-width`를 주지 말 것(2026-08-21 메인페이지 `.sp-solution-card`에서 실제 발생/확인, [6. 스타일링 > 반응형](#반응형-모바일) 참고). 폭 제한이 꼭 필요하면 swiper 컨테이너의 실측 폭 자체를 줄이는 방향으로 |
