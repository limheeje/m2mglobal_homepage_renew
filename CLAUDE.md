## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## Styling (SCSS via VSCode Watch Sass)

이 프로젝트는 Astro의 내장 vite-sass 파이프라인을 쓰지 않고, VSCode **Live Sass Compile**(`glenn2223.live-sass-compiler`) 확장의 watch 컴파일 방식을 사용한다.

```
src/styles/
  scss/
    abstracts/_functions.scss   # rem() — px→rem 변환 (10px = 1rem). variables/mixins 순환참조 방지용 별도 파일
    abstracts/_variables.scss   # 색상·타이포·spacing 스케일·breakpoint (디자인 토큰, :root에 rem으로 노출)
    abstracts/_mixins.scss      # color()/core()/spacing()/radius()/body-size() (전부 var(--...) 반환), heading()/body() 타이포 믹스인, breakpoint(), flex(), line-clamp(), rem()(functions.scss re-export)
    base/_reset.scss
    base/_typography.scss       # html{font-size:62.5%} rem 루트 세팅
    components/_button.scss
    components/_layout-grid.scss # Container/Row/Col 12컬럼 그리드
    layout/_header.scss
    layout/_footer.scss
    page/_company.scss         # /company/* 페이지 전용 — 공용 컴포넌트로 안 되는 마크업만
    main.scss                  # 진입점. 새 partial은 반드시 여기 @use로 등록
  css/
    main.css                    # 컴파일 결과물 (git ignore 대상, 직접 수정 금지)
```

**작업 방법**
1. VSCode 하단 상태바에서 **Watch Sass** 클릭 (한 번 켜두면 저장할 때마다 자동 컴파일)
2. `main.scss`가 참조하는 `.scss`만 수정하고, `src/styles/css/main.css`는 직접 건드리지 않음
3. `src/layouts/Layout.astro` 프론트매터에서 `import '~/styles/css/main.css'`로 결과 CSS를 불러옴

**주의**: `sass` npm 패키지를 devDependencies에 설치하지 말 것 — 설치하면 Astro/vite가 `.scss`를 자체적으로도 컴파일하려 들어 watch-sass 결과물과 이중 컴파일 충돌이 날 수 있다.

## UI/UX 공통 가이드 (네이밍 · 토큰 · 레이아웃)

전사 UI/UX 공통 가이드: https://comet-take-17267726.figma.site/
(React/Vue 컴포넌트 예시 중심의 범용 디자인 시스템 문서지만, **네이밍 · 디자인 토큰 · 레이아웃 · 아이콘/이미지 원칙은 이 Astro 프로젝트에도 동일하게 적용**한다. 컴포넌트별 상세 스펙(Button/Form/Table 등)은 필요할 때 사이트에서 직접 확인.)

공통 UI 공식: **Type + Size + State + Option** — 모든 컴포넌트는 이 4가지 조합으로 정의. 임의 수치·유사 타입 중복 생성 금지.

### 네이밍 규칙 (`/naming` 참고)
- **컴포넌트**: 폴더/파일 모두 PascalCase. `ComponentName.astro` + 스타일은 `ComponentName.module.scss`(또는 동일 폴더 `_component-name.scss`).
- **일반 폴더**: kebab-case (`data-display/`). 화면 전용 하위 리소스를 묶을 땐 `_components/`, `_utils/`처럼 `_` 접두사로 "라우트 미노출" 폴더임을 표시.
- **보조 파일 접미사**: `*.types.ts`, `*.constants.ts`, `*.utils.ts`, `*.mock.ts`, `useXxx.ts`(훅).
- **아이콘 SVG**: `snake_case`, 의미 기준 1개만 — `ico_search.svg`, `ico_arrow_right.svg`, `ico_close.svg`. `icon1`, `arrow2`, `edit_new`, `closeFinal2` 같은 임시/증식 네이밍 금지.
- **이미지(PNG/JPG/WebP)**: kebab-case — `empty-state.png`, `loading-bg.png`.
- **CSS 클래스/컴포넌트 상태**: `Type-Size-State-Option` 조합만 — `btn-primary-md`, `btn-outline-sm-icon-left`, `input-error`. `btn2`, `editBlueBtn`, `testButton` 같은 임의 네이밍 금지.

### 디자인 토큰: Core → Semantic → Component 3단계 (`/tokens` 참고)
- hex/px 같은 실값은 **Core 토큰에만** 존재. Semantic·Component 레벨에서는 반드시 Core 토큰 "이름"으로만 참조 — 값 직접 입력 금지.
- 이 프로젝트의 `src/styles/scss/abstracts/_variables.scss`가 Core 레이어에 해당한다. 컴포넌트 스타일에서 새 의미 단위가 필요하면 `_variables.scss`에 Semantic 변수를 Core 변수 참조로 추가하고(`$color-action-primary: $color-primary;`), 컴포넌트 SCSS에서는 Semantic 변수만 사용한다.
- **Spacing**: `$spacing` map(4/8/12/16/20/24/32/40/48px) 외의 임의 숫자(13px, 17px, 19px 등) 사용 금지.
- **Radius**: 6/8/10/12px 중 사용. **Shadow**: sm/md/lg 등급으로 토큰화.
- **Breakpoints**: sm 480 / md 768 / lg 1024 / xl 1280 (현재 `$breakpoints`와 동일 — 유지). **px 그대로 둔다(rem 변환 예외)** — 아래 "단위: rem" 참고.
- **단위: rem** — `base/_typography.scss`가 `html { font-size: 62.5%; }`로 루트를 10px 기준으로 맞춰뒀다(브라우저 기본 16px 가정). 그래서 Figma px 값 ÷ 10 = rem (16px→1.6rem, 24px→2.4rem). SCSS에서 새 px 값을 쓸 일이 생기면 절대 `16px`라고 직접 쓰지 말고 `abstracts/_functions.scss`의 `rem()`(컴포넌트 파일에서는 `m.rem(16px)`으로 re-export됨)으로 감쌀 것 — `_variables.scss`의 `:root` 커스텀 프로퍼티(`--space-*`, `--text-body-*`, `--radius-*`, `--shadow-*` 등)는 이미 전부 rem으로 나가므로 `m.spacing()`/`m.radius()`/`m.body()`/`m.heading()`을 쓰면 자동으로 rem이 적용된다. **예외**: `@media` 조건식의 breakpoint px는 rem으로 바꾸지 않는다 — 브라우저가 미디어쿼리 안의 em/rem을 우리 html 오버라이드가 아니라 "브라우저 기본 font-size"로 계산하는 스펙 때문에, 10px 기준 rem()으로 변환하면 반응형이 엉뚱한 폭에서 꺾인다. JS에서 아이콘 크기 등 인라인 style로 px를 내려줄 때도 `~/utils/rem`의 `pxToRem()`을 쓴다(Icon/IconButton/IconCircle 참고).

### 레이아웃 (`/layout` 참고)
- Container 최대폭은 프로젝트 전체 1개로 고정, 페이지마다 임의 변경 금지 (가운데 정렬 기본).
- Grid는 12컬럼(또는 8컬럼) 중 하나로 통일, gap은 spacing 토큰만 사용. → `Container`/`Row`/`Col` 컴포넌트로 구현됨(아래 컴포넌트 표 참고) — 12컬럼 고정, 컬럼 간격(gutter) 20px 고정. 페이지에서 직접 `display:grid`를 새로 짜지 말고 이걸 쓸 것.
- 검색영역/툴바 등 반복되는 화면 덩어리는 `SearchCondition`, `PageToolbar`, `SplitLayout` 같은 공통 레이아웃 패턴으로 고정하고 페이지마다 다르게 만들지 않는다.
- **`Gnb`/`Footer`/`Tab(line)`은 1280 컨테이너 캡을 안 쓰는 예외**: 이 셋은 Figma 실측상 1920 뷰포트에 좌우 80px 거터만 있는 풀블리드 구조(`width:100%` + `padding-inline`, `max-width` 없음)라 `Container`의 1280 캡과 다르다. 새 레이아웃 컴포넌트를 만들 때 이 셋 중 하나를 참고한다면 그대로 100%+거터 패턴을 따를 것 — 1280으로 캡하면 Figma와 어긋난다.

### 아이콘 / 이미지 (`/icon-image` 참고)
- 아이콘은 **SVG만** 사용(PNG/JPG 금지, 예외: 썸네일용). stroke width는 1.5 또는 2 중 하나로 프로젝트 전체 통일, 색상은 `currentColor` 상속(하드코딩 금지).
- 아이콘 크기는 **16(인라인) / 20(기본 버튼) / 24(카드·헤더) / 32(특수 강조)px** 중에서만 선택 — 17/19/21px 같은 애매한 값 금지.
- 같은 의미의 아이콘은 반드시 1개만 유지 — 모양이 비슷한 아이콘 여러 개 생성 금지.
- Thumbnail 크기: 32/40/48/72px. Avatar 크기: 24/32/40/64px.
- 이미지 비율: 썸네일 1:1, 카드 4:3, 배너 16:9, 프로필 1:1(원형). object-fit: cover 기본.

### 절대 금지 사항
- 공통 컴포넌트(버튼/폼 등)의 여백·높이·글씨 크기를 개별 페이지에서 임의 수정 — 바꿀 게 있으면 새 Option으로 추가.
- `btn-blue`, `btn-dark-blue`, `btn-navy`처럼 비슷한 타입 무한 생성.
- 13px, 17px, 19px 같은 규칙 없는 숫자 사용.
- 같은 뜻의 아이콘을 모양만 다르게 여러 개 생성.
- 로딩 상태를 버튼 State로 취급 (loading은 상태값이 아니라 별도 처리).

### 작업 전 체크리스트
전체 체크리스트: https://comet-take-17267726.figma.site/checklist — 새 컴포넌트/화면 작업 후 네이밍, 토큰 참조 여부, 아이콘 규칙, 반응형·예외 상태(empty/error/loading/disabled) 누락 여부를 확인한다.

## 공통 컴포넌트 (Figma "Component" 페이지 기반)

Figma 파일의 `Component` 페이지(Typography/Color/Tab/Label/Button/GNB 등)를 Dev Mode MCP로 조회해서 만든 실제 컴포넌트들. 전체를 한눈에 보려면 `npx astro dev` 실행 후 `/style-guide` 접속 (실 서비스 라우트 아님, 컴포넌트 검수 전용 페이지 — 새 컴포넌트 추가 시 여기에도 예시를 추가할 것).

| 컴포넌트 | 위치 | 대응 SCSS |
|---|---|---|
| `Container` / `Row` / `Col` (12컬럼 그리드) | `src/components/{Container,Row,Col}.astro` | `components/_layout-grid.scss` |
| `Icon` | `src/components/Icon.astro` | `components/_icon.scss` |
| `IconCircle` | `src/components/IconCircle.astro` | `components/_icon-circle.scss` |
| `Button` | `src/components/Button.astro` | `components/_button.scss` |
| `TextButton` | `src/components/TextButton.astro` | `components/_text-button.scss` |
| `IconButton` | `src/components/IconButton.astro` | `components/_icon-button.scss` |
| `Tab` (round/line/box) | `src/components/Tab.astro` | `components/_tab.scss` |
| `Label` | `src/components/Label.astro` | `components/_label.scss` |
| `Grid` (table/spec) | `src/components/Grid.astro` | `components/_grid.scss` |
| `Box` (bordered/filled 카드) | `src/components/Box.astro` | `components/_box.scss` |
| `Title` (hero/section/banner) | `src/components/Title.astro` | `components/_title.scss` |
| `TextList` | `src/components/TextList.astro` | `components/_text-list.scss` |
| `ListItem` (사례형/공지형) | `src/components/ListItem.astro` | `components/_list-item.scss` |
| `Gnb` (헤더) | `src/components/Gnb.astro` | `layout/_header.scss` |
| `PageBanner` (서브페이지 상단 배너) | `src/components/PageBanner.astro` | `layout/_page-banner.scss` |
| `Footer` | `src/components/Footer.astro` | `layout/_footer.scss` |

**Import는 전부 절대경로(`~/`) 사용**: `tsconfig.json`/`astro.config.mjs`에 `~` → `src/` 별칭이 있다. 컴포넌트 간 import·에셋 import 모두 `../../` 대신 `~/components/Xxx.astro`, `~/assets/...` 형태로 쓴다. `import.meta.glob`도 상대경로 대신 루트 절대경로(`/src/assets/icons/*.svg`)를 쓴다 — glob은 `~` alias를 못 쓰므로 `/src/...`로 통일. `src/` 밖에 있는 `config/`도 같은 이유로 `@config/*` → `config/*` 별칭이 있다(`tsconfig.json`/`astro.config.mjs` 동일하게 등록).

**라우트 맵 & 링크 헬퍼 (`config/route/index.ts`)**: `@old/header.html`(구 GNB) 대비 신규 `Gnb.astro` 구조를 문서화한 `routeMap`(각 항목의 `status`가 existing/renamed/new/dropped/merged)과, 실제 `<a href>`에 바로 쓰는 `route` 조회 객체 둘 다 여기서 export한다. `route`는 `routeMap`의 모든 `path`를 key로, `env(PUBLIC_BUILD_URL)`을 붙인 완성 URL을 value로 미리 계산해둔 것 — 페이지에서 경로 문자열을 직접 쓰지 말고 이걸 통해서만 링크를 만든다: `import {route} from '@config/route'` → `<a href={route['/company/ceo-message']}>`. `PUBLIC_BUILD_URL`이 dev(빈 문자열)/prod(`/dist`)로 바뀌어도 코드 수정 없이 따라간다. 새 GNB 메뉴가 추가되면 `routeMap`에 항목을 추가하기만 하면 `route`에도 자동으로 반영된다(직접 `route` 객체를 손으로 수정하지 말 것).

**실제 페이지 작업 시 (`src/pages/**`)**: 반드시 공용 컴포넌트(`~/components/*`)를 최대한 조합해서 만들고, 공용 컴포넌트로 커버 안 되는 그 페이지만의 마크업(고정폭 카드 줄, 커스텀 정보 표, 통계 배너 등)만 `src/styles/scss/page/_{1뎁스라우트}.scss`에 `.{route}__*` 클래스로 추가한다(`main.scss`에 `@use 'page/xxx';` 등록 필수) — 파일은 exact 페이지 단위가 아니라 라우트 1뎁스 단위(`/company/*` 전부 `page/_company.scss` 하나)로 묶는다. `Container`는 기본 1280 max-width 토큰을 쓰지만, Figma가 실측으로 다른 폭(예: 1760)을 쓰는 페이지는 `<Container maxWidth={1760}>`처럼 개별 지정 가능 — 근거 없이 임의 수치로 쓰지 말 것. 예시: `src/pages/company/info/index.astro`(`/company/info`, Figma "About us > 회사 개요") + `src/styles/scss/page/_company.scss`.

**Icon 시스템**: `src/assets/icons/ico_*.svg`를 `Icon.astro`가 `import.meta.glob('/src/assets/icons/*.svg', {query:'?raw'})`으로 전부 읽어들여 `name` prop과 매칭해 인라인 렌더링한다. 아이콘 SVG는 반드시 `fill="currentColor"` / `stroke="currentColor"`로 저장해야 버튼 등에서 부모 텍스트 색을 상속받는다 (단, `ico_check_circle`처럼 원 배경+흰 체크마크로 고정된 2톤 "상태 배지" 아이콘은 예외 — 배경만 currentColor, 체크마크는 흰색 고정). 새 아이콘 추가 시: ① Figma에서 `get_design_context`로 아이콘 svg URL 확보 → ② `fill`/`stroke`를 `currentColor`로 치환해 `src/assets/icons/ico_의미_옵션.svg`로 저장 → ③ `<Icon name="ico_..." />`로 바로 사용 가능 (별도 등록 불필요). `IconCircle`은 100px 원형 배경(blue-10) + 아이콘을 감싸는 래퍼 — Figma의 About US_Icon/AI_Icon/로봇물류_Icon/Solution_Icon 등 150개 이상 브랜드 전용 일러스트는 페이지별 콘텐츠 에셋이라 일괄 컴포넌트화하지 않았고, 대표로 4개 카테고리에서 5개(`ico_ai_machine_learning`, `ico_robot_logistics`, `ico_smart_factory`, `ico_commerce_platform`, `ico_logistics_platform`)만 실제 export해서 `/style-guide`에 케이스로 넣어뒀다. 이 5개는 원본 그대로 48x48 fill 아이콘이라 (UI 아이콘과 달리 별도 viewBox 패딩 없음) 그대로 재사용 가능하고, 나머지 필요한 아이콘은 같은 방식(Figma에서 `get_design_context`로 svg URL 확보 → `fill="#023894"`를 `currentColor`로 치환 → `src/assets/icons/ico_의미.svg`로 저장)으로 추가하면 됨. `/style-guide`에는 이 아이콘들로 조합한 "라벨_타이틀_설명_Box"(개인화 추천 시스템) 대형 서비스 카드 예시도 있음 — 새 컴포넌트가 아니라 IconCircle+Label+TextList+Button을 페이지에서 조합한 것.

**Button / TextButton / IconButton은 서로 다른 컴포넌트다**: 배경+테두리가 있는 버튼은 `Button`, 배경 없는 순수 텍스트 링크는 `TextButton`(예: 개인정보처리방침 — Figma에서 검정 배경처럼 보인 건 프리뷰 아트보드 배경일 뿐 컴포넌트 자체엔 없음), 원형 아이콘 전용은 `IconButton`. 셋을 섞어 쓰지 말 것.

**variant 설계 시 주의**: Figma 원본에 동일 컴포넌트인데도 인스턴스마다 패딩/폰트가 미묘하게 다른 경우(디자인 드리프트)가 있었다 — 그대로 베끼지 않고 Type+Size+State+Option 공식에 맞게 하나의 일관된 규칙으로 정리했다. 예: `Button` secondary는 기본적으로 `#f8f8f8` 배경+`#b7b7b7` 테두리지만 **lg 사이즈만** 테두리 없이 `#f1f1f1` 배경(Figma 실측 기준 — 임의 통일 아님, `btn--secondary.btn--lg`로 분리 구현). 새 컴포넌트를 뽑을 때도 Figma 인스턴스 간 불일치를 발견하면 "정말 사이즈/타입별 의도된 차이인지" 먼저 `get_design_context`로 재검증한 뒤 통합 여부를 판단할 것 — 겉보기만 보고 섣불리 뭉개지 말 것.

**아이콘 크기는 SVG 파일 자체의 viewBox 패딩으로 맞춘다 (컴포넌트에서 비율 계산 금지)**: `Icon` 컴포넌트는 SVG를 요청받은 `size` 정사각형에 꽉 채우기만 한다. 그런데 Figma는 아이콘을 "프레임 크기"(예: 24px)와 그 안의 "실제 그림 크기"(예: 16px, 66.7%)를 다르게 두는 경우가 흔하다 — 이 인셋을 무시하고 원본 그림 그대로 SVG를 만들면 프레임을 꽉 채워버려서 Figma보다 훨씬 커 보인다(실제로 전 아이콘이 이 문제였음). 그래서 `src/assets/icons/ico_*.svg`는 그림을 **Figma가 실측한 인셋 비율만큼 투명 여백을 포함한 viewBox로 패딩**해서 저장한다 (예: `ico_download.svg`는 실제 그림이 16×16이지만 viewBox는 24×24, `<g transform="translate(4,4)">`로 중앙 배치). 이렇게 하면 어떤 `size`로 쓰든 Figma와 같은 비율로 자동으로 작게 보인다 — `IconButton`처럼 컴포넌트마다 별도로 축소 비율을 곱하는 방식은 쓰지 않는다. **새 아이콘을 추가할 때**: ① `get_design_context`로 실제 사용된 인스턴스의 inset 비율(예: `inset-[16.67%]`, `left-1/4 right-1/4`)을 확인 → ② raw SVG의 원본 크기를 그 비율의 100%로 보고 전체 캔버스 크기를 역산(캔버스 = 원본 ÷ (1-2×inset)) → ③ 캔버스 크기의 정사각형(또는 필요한 비율) viewBox로 만들고 원본 path를 `<g transform="translate(x,y)">`로 중앙 배치. `IconCircle`도 같은 원리라 별도 처리 불필요 — 아이콘 파일만 고치면 자동으로 같이 고쳐진다.

**아직 스크립트(JS) 미구현 — TODO**: GNB 모바일 드로어 열기/닫기, Tab 클릭 전환, IconButton(맨 위로가기) 스크롤 동작. 지금은 마크업/CSS만 있고 GNB 데스크탑 메가메뉴만 `:hover`/`:focus-within` CSS로 동작한다. GNB 메가메뉴는 항목별 개별 드롭다운이 아니라 **1Depth 아무거나 hover하면 6개 컬럼 전체가 하나의 패널로 열리는 구조**(Figma 원본 그대로) — 항목별 드롭다운으로 바꾸지 말 것.

**"맨 위로 가기" 버튼은 `Layout.astro`에 전역으로 있다**: 모든 페이지의 `<body>` 끝에서 자동으로 렌더링되는 `<IconButton icon="ico_arrow_top" .../>`(fixed, 우측 하단) — 새 페이지에서 페이지마다 다시 추가하지 말 것.

**Figma에서 다운로드한 로고**: `src/assets/images/m2m-global-logo.svg`(GNB용 원색 단일 로고)와 `m2m-global-logo-white.svg`(Footer 전용 — 단순 색 반전이 아니라 Figma에 워드마크+국문 표기 "엠투엠글로벌(주)"가 한 자산 안에 같이 들어있는 별개 export)로 2종류 존재. 둘 다 브랜드 자산 원본 그대로 유지 — currentColor 적용 대상 아님. 다크 배경(Footer 등) 신규 위치에 로고를 쓸 때는 GNB용을 그대로 재사용하지 말고 먼저 Figma에 해당 배경 전용 export가 따로 있는지 확인할 것.

**`PageBanner`**: GNB 바로 아래 오는 서브페이지 공통 상단 배너(Secondary color 배경 + 네트워크 패턴 이미지 20% 오버레이 + 타이틀/서브타이틀, 옵션으로 breadcrumb). Figma 원본(`Header`, property1=About us 등)은 GNB(80px)가 배너 위에 absolute로 겹쳐 273px 프레임 하나였지만, 실제 조합에서는 `<Gnb />`를 이 컴포넌트 "위에" 일반 흐름으로 두므로 GNB 높이만큼의 padding은 제외했다 — 페이지에서는 항상 `<Gnb /><PageBanner title="..." subtitle={[...]} />` 순서로 붙여 쓴다. breadcrumb는 참고 인스턴스에서 hidden 상태였던 슬롯이라 optional prop으로 살려뒀고, 배경 패턴 이미지는 `src/assets/images/subpage-banner-pattern.png`(Figma 기본값, `image` prop으로 교체 가능). breadcrumb의 `ico_chevron_right`는 Figma 원본이 8×10 비정사각형이라 다른 아이콘과 달리 10×10 정사각 viewBox로 패딩해서 저장한 예외 케이스.

**색상·타이포·spacing은 컴포넌트 SCSS에서도 반드시 CSS 커스텀 프로퍼티(`var(--...)`)로 나간다 — Sass 변수(`v.$color-*`) 직접 참조 금지**: `_variables.scss` 맨 끝 `:root { ... }` 블록이 Core/Semantic 색상, 타이포 스케일, spacing, radius, shadow를 전부 `--color-text-primary`, `--space-16`, `--text-body-18`, `--radius-8` 같은 CSS 변수로 내보낸다. `abstracts/_mixins.scss`가 이 값들을 `var(--...)` 형태로 꺼내는 함수/믹스인을 제공하니, 컴포넌트 SCSS(`components/*.scss`, `layout/*.scss`)는 **이 함수/믹스인만** 쓰고 `@use '../abstracts/variables' as v;`는 `$container-max-width`처럼 정말 컴파일 타임 상수가 필요한 경우가 아니면 아예 import하지 않는다.
  - 색상: `m.color('action-primary')` → `var(--color-action-primary)`, Core 레벨이 꼭 필요하면 `m.core('secondary')` → `var(--core-secondary)`.
  - spacing/radius: `m.spacing(24)` → `var(--space-24)`, `m.radius(8)` → `var(--radius-8)` (기존 호출부 그대로 — 내부 구현만 var()를 반환하도록 바뀜). pill/circle처럼 map이 아닌 단일 값은 `var(--radius-pill)`처럼 직접 쓴다.
  - 타이포: 개별 `font-size`/`line-height`/`font-weight`/`font-family`를 나열하지 말고 `@include m.heading(1)`(H1~H6, Figma 그대로) / `@include m.body(18)`(Body 14~36, Figma 그대로) 믹스인 하나로 끝낸다. 새 헤딩/바디 크기가 필요하면 `_variables.scss`의 `$font-size-h*`/`$font-size-body` map과 `:root` 블록에 추가.
  - `style-guide.astro`의 scoped `<style>`처럼 애초에 SCSS 파이프라인 밖에 있는 곳도 당연히 `var(--...)`를 직접 쓴다.
  - 새 토큰이 필요하면 `_variables.scss`의 Sass 변수(Core 정의용) + `:root` 블록(런타임 노출용) 양쪽 다 추가할 것 — 하나만 추가하면 `m.color()`/`var()` 참조가 깨진다.

**의도적으로 만들지 않은 것**: `Carousel`(요청으로 제외), `Arrow`(장식용 그래픽 모티프라 컴포넌트화 근거 약함), `라벨_타이틀_설명_Box` 대형 서비스카드(IconCircle+Label+Title+TextList+Button 조합으로 페이지에서 직접 구성).

## Figma MCP 연동 (Dev Mode MCP Server)

Figma 디자인을 Claude Code에서 직접 참조(코드/이미지/디자인 토큰 추출)하기 위해 Figma 공식 **Dev Mode MCP Server**를 사용한다. `.mcp.json`(프로젝트 스코프)에 `figma-dev-mode-mcp-server`로 이미 등록되어 있음.

**⚠️ 절대 규칙: Figma 파일은 조회(read-only) 전용으로만 사용한다.** 계정에 편집 권한이 있더라도 Figma 파일을 직접 편집하지 않는다 — 이 프로젝트의 Figma 시안은 다른 작업자(디자이너)가 만든 것이며, 그 사람의 동의 없이 레이어/컴포넌트/속성을 수정하는 것은 절대 금지. `get_code`, `get_image`, `get_variable_defs`, `get_metadata` 등 조회 도구만 사용하고, 편집이 필요하다고 판단되면 직접 고치지 말고 사용자에게 알려서 원작업자와 협의하도록 안내한다.

**요구 조건**
- Figma **데스크톱 앱** (브라우저 Figma는 지원 안 함)
- **Professional/Organization/Enterprise 플랜** (Starter 무료 플랜에서는 기능 자체가 없음)
- 작업할 Figma 파일을 데스크톱 앱으로 열어둔 상태

**연결 방법 (매번 새로 켜야 할 때)**
1. Figma 데스크톱 앱 실행 → 연동할 파일 열기
2. 단축키 `Ctrl + /` → Quick Actions 검색창에 `MCP` 입력 → **"Enable Dev Mode MCP Server"** 클릭해서 활성화
   - (안 보이면: 좌측 상단 Figma 로고 → Preferences → "Enable Dev Mode MCP Server")
3. 활성화되면 로컬에 `http://127.0.0.1:3845/mcp` 로 서버가 열림 (Figma 데스크톱 앱이 켜져 있는 동안만 유지됨 — 앱을 끄면 연결도 끊김)
4. Claude Code 재시작 → 프로젝트 MCP 서버(`figma-dev-mode-mcp-server`) 사용 승인 프롬프트 수락
5. `/mcp` 슬래시 명령으로 `connected` 상태와 제공 도구(`get_code`, `get_image`, `get_variable_defs` 등) 확인

**등록 명령 (참고, 이미 완료됨)**
```
claude mcp add --transport http figma-dev-mode-mcp-server http://127.0.0.1:3845/mcp -s project
```

**작업 흐름**
1. Figma Dev Mode에서 구현할 프레임/컴포넌트 선택
2. Claude Code에 "선택한 Figma 노드로 컴포넌트 만들어줘" 요청 → MCP 도구로 마크업/스크린샷/디자인 토큰 획득
3. 받은 토큰은 `src/styles/scss/abstracts/_variables.scss`에 SCSS 변수로 정리
4. `.astro` 컴포넌트 + 대응 `.scss` 작성 → Watch Sass 자동 컴파일 → 브라우저에서 확인

**대안**: Dev/Full seat이 없어 위 기능이 안 보이는 경우, 커뮤니티 서버 **Framelink `figma-developer-mcp`**(Figma 개인 액세스 토큰만으로 동작, 무료 플랜도 가능)로 대체 가능.
```
claude mcp add figma-developer-mcp -s local --env FIGMA_API_KEY=<토큰> -- npx -y figma-developer-mcp --stdio
```
