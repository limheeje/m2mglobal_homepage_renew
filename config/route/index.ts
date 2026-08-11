// 라우트 맵 — 신규 GNB(src/components/layout/Gnb.astro) 구조를 기준으로, @old/header.html에 있던
// 구버전 GNB(및 사이트맵 레이어)를 어디로 옮길지 매핑해둔다.
// @old/header.html이 old 사이트의 실제 GNB 마크업(<nav class="gnb-area">)과 전체메뉴
// 사이트맵(#sitemap, 3-depth까지)을 전부 포함하고 있어서, 이 파일이 old 쪽 라벨/구조의 근거다.
//
// status 값:
//   'existing' — old와 신규 GNB에 라벨/개념이 사실상 동일 (경로 표기만 .html → clean path로 변경)
//   'renamed'  — old와 신규 사이의 라벨이 바뀌었거나 메뉴 계층(부모/깊이)이 바뀐 항목
//   'new'      — old GNB에는 없던, 신규 GNB에서 새로 생긴 항목
//   'dropped'  — old GNB에는 있었는데 신규 GNB 어디에도 대응 항목이 없는 항목. 신규 GNB 기준으로
//                불필요하다고 판단해 routeMap 자체에서 제거했다(IT Consulting/IT Management/
//                Benefit/Partner) — 필요해지면 git 이력에서 복원.
//   'merged'   — old는 3-depth(사이트맵) 개별 메뉴였지만, 신규 GNB는 2-depth까지만 있어서
//                하나의 상위 페이지 안 콘텐츠 섹션으로 합쳐진 것으로 추정되는 항목

export type RouteStatus = 'existing' | 'renamed' | 'new' | 'dropped' | 'merged'

export interface RouteEntry {
  label: string
  /** 신규 사이트 경로 (Gnb.astro의 href와 동일 값이어야 함). dropped/merged는 신규 경로가 없을 수 있음 */
  path?: string
  /** @old/ 기준 원본 경로 (해시 앵커 포함, 예: @old/aboutus/about_us.html#benefit) */
  oldPath?: string
  status: RouteStatus
  /** renamed/new/dropped/merged 판단 근거, 확인 필요 사항 */
  note?: string
  children?: RouteEntry[]
}

export const routeMap: RouteEntry[] = [
  {
    label: 'Home',
    path: '/',
    oldPath: '@old/index.html',
    status: 'existing'
  },

  // ------------------------------------------------------------------
  // old "About us" → 신규 "Company"
  // ------------------------------------------------------------------
  {
    label: 'Company',
    path: '/company',
    oldPath: '@old/header.html (About us)',
    status: 'renamed',
    note: 'old 최상위 라벨은 "About us" — 신규는 "Company"로 변경',
    children: [
      {
        label: 'Company Info',
        path: '/company/info',
        oldPath: '@old/aboutus/about_us.html',
        status: 'existing'
      },
      {
        label: 'Address',
        path: '/company/address',
        oldPath: '@old/aboutus/about_us.html#headquartersAddress',
        status: 'renamed',
        note: 'old 라벨 "Headquarters Address" → 신규 "Address"'
      },
      {
        label: 'History',
        path: '/company/history',
        oldPath: '@old/aboutus/about_us.html#history',
        status: 'existing'
      },
      {
        label: "CEO's Message",
        path: '/company/ceo-message',
        status: 'new',
        note: 'old GNB에 없던 신규 항목. about_us.html 회사개요 표에 "대표이사" 이름 필드는 있지만(companyInfo 섹션) 별도 인사말 콘텐츠는 없었음 — 내용이 같다고 보기엔 근거가 약해서 new로 유지'
      },
      {
        label: 'Careers',
        path: '/company/careers',
        status: 'new',
        note: 'old GNB에 없던 신규 항목. about_us.html benefit 섹션에 "인재추천"(추천 채용 포상금) 항목은 있지만 별도 채용 페이지는 아니었음 — 내용이 같다고 보기엔 근거가 약해서 new로 유지'
      },
      {
        label: 'News',
        path: '/company/news',
        status: 'new',
        note: 'old GNB/콘텐츠 어디에도 대응 근거 없음'
      },
      {
        label: 'Contact us',
        path: '/company/contact-us',
        oldPath: '@old/aboutus/about_us.html#headquartersAddress (사업 문의 항목)',
        status: 'renamed',
        note: 'old에는 별도 메뉴가 아니라 "Headquarters Address" 섹션 안 dt "사업 문의"(전화번호와 같은 목록) 항목으로만 있었음 — 신규에서 Address와 분리돼 별도 nav 항목으로 승격된 것으로 추정. 같은 내용이라 old 근거를 남김'
      }
    ]
  },

  // ------------------------------------------------------------------
  // old "Business" → 신규 "AI Engine" / "Robot Logistics" / "e-Commerce"(일부)로 분리 승격.
  // old "Business" 하위의 IT Consulting / IT Management, old "About us" 하위의 Benefit,
  // old 홈 본문의 Partner(파트너사 로고 섹션)는 신규 GNB에 대응 항목이 없어 라우트 맵에서 제외했다.
  // ------------------------------------------------------------------
  {
    label: 'AI Engine',
    path: '/ai-engine',
    status: 'renamed',
    note: 'old에는 "AI Engine"이라는 최상위 메뉴가 없었음 — old "Business > AI Engineering for Real Business"가 최상위로 승격된 것으로 추정',
    children: [
      {
        label: 'AI & Machine Learning',
        path: '/ai-engine/machine-learning',
        oldPath: '@old/business/ai-solution.html',
        status: 'renamed',
        note: 'old 라벨 "AI Engineering for Real Business" → 신규 "AI & Machine Learning". ai-solution-old.html(구판)도 있으니 ai-solution.html(신판) 기준으로 이관'
      },
      {
        label: 'AI Commerce',
        path: '/ai-engine/ai-commerce',
        oldPath: '@old/business/ai-solution.html (02 AI 커머스 플랫폼 섹션)',
        status: 'renamed',
        note: 'old에는 별도 메뉴가 아니라 ai-solution.html 안 6개 하위 섹션(01 AI 추천 플랫폼 / 02 AI 커머스 플랫폼 / 03 스마트 물류 시스템 / 04 수요 예측 시스템 / 05 고객 행동 분석 / 06 AI 이미지 분석) 중 "02 AI 커머스 플랫폼"으로만 존재 — 신규에서 AI & Machine Learning과 분리돼 별도 nav 항목으로 승격된 것으로 추정. 같은 내용이라 old 근거를 남김'
      }
    ]
  },
  {
    label: 'Robot Logistics',
    path: '/robot-logistics',
    status: 'renamed',
    note: 'old에는 "Robot Logistics"라는 최상위 메뉴가 없었음 — old "Business > Robotic Logistics / Smart Factory"가 최상위로 승격된 것으로 추정',
    children: [
      {
        label: 'Robot Logistics',
        path: '/robot-logistics/overview',
        oldPath: '@old/business/agv.html',
        status: 'renamed',
        note: 'old 라벨 "Robotic Logistics" → 신규 "Robot Logistics". agv_0727.html(수정판)도 있음, 신판 기준 확인 필요'
      },
      {
        label: 'Smart Factory',
        path: '/robot-logistics/smart-factory',
        oldPath: '@old/business/mes.html',
        status: 'existing',
        note: 'old 라벨 그대로 "Smart Factory" (old에서는 실제 파일이 mes.html/MES였고, 부모만 Business → Robot Logistics로 변경)'
      }
    ]
  },
  // ------------------------------------------------------------------
  // old "Business > e-Commerce" + old "Solution > Commerce Platform > M2M-eMarketPlace"
  // → 신규 최상위 "e-Commerce"로 재편
  // ------------------------------------------------------------------
  {
    label: 'e-Commerce',
    path: '/e-commerce',
    status: 'renamed',
    note: 'old에는 "e-Commerce"라는 최상위 메뉴가 없었음 — old "Business > e-Commerce"가 최상위로 승격된 것으로 추정',
    children: [
      {
        label: 'Commerce Technology',
        path: '/e-commerce/commerce-technology',
        oldPath: '@old/business/ecommerce.html',
        status: 'renamed',
        note: 'old 라벨 "e-Commerce"(Business 하위) → 신규 "Commerce Technology"'
      },
      {
        label: 'B2B Commerce',
        path: '/e-commerce/b2b-commerce',
        oldPath: '@old/business/ecommerce.html (이커머스 비즈니스 지원 카드의 "B2B 지원" 항목)',
        status: 'renamed',
        note: 'old에는 별도 메뉴가 아니라 ecommerce.html 안 "유연한 이커머스 비즈니스 지원" 카드의 여러 지원 항목(Promotion/Coupon/B2E/B2B) 중 하나로만 언급됨 — 신규에서 별도 nav 항목으로 승격된 것으로 추정. 같은 내용이라 old 근거를 남김'
      },
      {
        label: 'Marketplace',
        path: '/e-commerce/marketplace',
        oldPath: '@old/solution/emp.html',
        status: 'renamed',
        note: 'old 사이트맵 기준 "M2M-eMarketPlace"(Solution > Commerce Platform 3-depth 하위)가 신규에서는 e-Commerce 최상위 2-depth "Marketplace"로 승격/이동'
      }
    ]
  },

  // ------------------------------------------------------------------
  // old "Solution" → 신규 "Solutions" (라벨은 거의 동일, 3-depth 세부 항목은 병합된 것으로 추정)
  // ------------------------------------------------------------------
  {
    label: 'Solutions',
    path: '/solutions',
    oldPath: '@old/header.html (Solution)',
    status: 'existing',
    note: '최상위 라벨은 old "Solution" 그대로(단수→복수만 차이). old 사이트맵은 3-depth까지 있었는데 신규 GNB는 2-depth뿐이라, 3-depth 항목들은 상위 Platform 페이지 안 콘텐츠 섹션으로 합쳐진 것으로 추정 — 실제 이관 시 개별 페이지 유지 여부 재확인 필요.',
    children: [
      {
        label: 'Commerce Platform',
        path: '/solutions/commerce-platform',
        oldPath: '@old/solution/emall.html',
        status: 'existing',
        note: 'old 하위 3-depth: M2M-eMall(emall.html), M2M-MultiMall(multimall.html), M2M-ePRO(epro.html), M2M-ImageTag(imagetag.html), M2M-eCCP(eccp.html) — M2M-eMarketPlace(emp.html)만 위 e-Commerce>Marketplace로 이동, 나머지는 이 페이지로 병합 추정',
        children: [
          {label: 'M2M-eMall', oldPath: '@old/solution/emall.html', status: 'merged'},
          {label: 'M2M-MultiMall', oldPath: '@old/solution/multimall.html', status: 'merged'},
          {label: 'M2M-ePRO', oldPath: '@old/solution/epro.html', status: 'merged'},
          {label: 'M2M-ImageTag', oldPath: '@old/solution/imagetag.html', status: 'merged'},
          {label: 'M2M-eCCP', oldPath: '@old/solution/eccp.html', status: 'merged'}
        ]
      },
      {
        label: 'Logistics Platform',
        path: '/solutions/logistics-platform',
        oldPath: '@old/solution/tms.html',
        status: 'existing',
        note: 'old 하위 3-depth: M2M-TMS(tms.html), M2M-WMS(wms.html), M2M-CVO(cvo.html) — 전부 이 페이지로 병합 추정',
        children: [
          {label: 'M2M-TMS', oldPath: '@old/solution/tms.html', status: 'merged'},
          {label: 'M2M-WMS', oldPath: '@old/solution/wms.html', status: 'merged'},
          {label: 'M2M-CVO', oldPath: '@old/solution/cvo.html', status: 'merged'}
        ]
      },
      {
        label: 'Trade Platform',
        path: '/solutions/trade-platform',
        oldPath: '@old/solution/etrade.html',
        status: 'existing',
        note: 'old 하위 3-depth: M2M-eTrade(etrade.html), M2M-FTA(fta.html), M2M-eDrawback(edrawback.html) — 전부 이 페이지로 병합 추정',
        children: [
          {label: 'M2M-eTrade', oldPath: '@old/solution/etrade.html', status: 'merged'},
          {label: 'M2M-FTA', oldPath: '@old/solution/fta.html', status: 'merged'},
          {label: 'M2M-eDrawback', oldPath: '@old/solution/edrawback.html', status: 'merged'}
        ]
      },
      {
        label: 'eLiveStock Platform',
        path: '/solutions/elivestock-platform',
        status: 'new',
        note: 'old에 축산(livestock) 관련 페이지 없음 — 신규 GNB에서 새로 생긴 솔루션 라인'
      }
    ]
  },

  // ------------------------------------------------------------------
  // old "Works" → 신규 "Project"
  // ------------------------------------------------------------------
  {
    label: 'Project',
    path: '/project',
    oldPath: '@old/header.html (Works)',
    status: 'renamed',
    note: 'old 최상위 라벨은 "Works" — 신규는 "Project"로 변경',
    children: [
      {
        label: 'Reference',
        path: '/project/reference',
        oldPath: '@old/works/works.html',
        status: 'renamed',
        note: 'old 라벨 "Major Clients" → 신규 "Reference"로 추정(확정 아님, 확인 필요). works_251224.html(개정판) 존재, 신판 기준 확인 필요'
      },
      {
        label: 'Specialized Outcomes',
        path: '/project/specialized-outcomes',
        oldPath: '@old/works/works.html#portfolio',
        status: 'renamed',
        note: 'old 라벨 "Portfolio"(works.html 내 앵커 섹션) → 신규 "Specialized Outcomes"로 추정(확정 아님, 확인 필요)'
      }
    ]
  }
]

// path 기준으로 평탄화해서 조회할 때 쓰는 헬퍼 — 라우팅 미들웨어/리다이렉트 매핑 등에서 활용.
export function flattenRoutes(entries: RouteEntry[] = routeMap): RouteEntry[] {
  const children = (entry: RouteEntry) => (entry.children ? flattenRoutes(entry.children) : [])
  return entries.flatMap((entry) => [entry, ...children(entry)])
}

// 사람 확인이 필요한 항목만 모아서 보여준다(new/dropped/merged/renamed — existing만 제외).
export function getRoutesNeedingReview(entries: RouteEntry[] = routeMap): RouteEntry[] {
  return flattenRoutes(entries).filter((entry) => entry.status !== 'existing')
}

// ---------------------------------------------------------------------------
// route — 프론트에서 실제로 링크를 만들 때 쓰는 조회용 맵.
// key는 routeMap의 path 그대로(예: '/company/ceo-message'), value는 env(PUBLIC_BUILD_URL,
// config/env/.env.{dev,prod} — astro.config.mjs의 base와 동일 값)를 앞에 붙인 완성 URL이다.
// PUBLIC_BUILD_URL은 dev에서 빈 문자열, prod에서 '/dist'라 base가 바뀌어도(배포 경로가
// 서브패스로 바뀌어도) 이 값만 보고 링크를 만들면 코드 수정 없이 따라간다.
//
// 사용 예:
//   import {route} from '@config/route'
//   <a href={route['/company/ceo-message']}>CEO's Message</a>
// ---------------------------------------------------------------------------

function toBuildUrl(path: string): string {
  const base = (import.meta.env.PUBLIC_BUILD_URL ?? '').replace(/\/$/, '')
  return `${base}${path}` || '/'
}

export const route: Record<string, string> = Object.fromEntries(
  flattenRoutes()
    .filter((entry): entry is RouteEntry & {path: string} => Boolean(entry.path))
    .map((entry) => [entry.path, toBuildUrl(entry.path)])
)
