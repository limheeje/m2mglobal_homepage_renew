// 라우트 정의 — GNB 2Depth(Gnb.astro), 전체메뉴(AllMenu.astro), 서브페이지 2Depth 탭(Navigation.astro),
// 개발용 전체 페이지 목록(page-list.astro)이 전부 이 배열 하나를 소스로 쓴다. 새 메뉴를 추가/변경할
// 땐 여기 한 곳만 고치면 위 화면 전부에 자동 반영됨.
//
// 사용 예:
//   import {route} from '@config/route'
//   const localNavigation = route.find((item) => item.href === '/company/info') // ⚠️ 그룹 최상위 href로 조회
//   <a href={`${PUBLIC_BUILD_URL}${item.href}`}>{item.koLabel}</a>
//
// (예전엔 이 파일 옆에 링크 조회용 `route: Record<string,string>` 헬퍼가 있는 index.ts와, 실제 UI가
// 쓰는 이 `Route[]` 구조가 담긴 routeMap.ts로 파일이 2개 나뉘어 있었다 — 이름이 둘 다 "routeMap"이라
// 헷갈리는데 실제로는 이 파일(당시 routeMap.ts)만 24개 파일에서 쓰이고 있었고, 옛 index.ts의
// Record 헬퍼는 어디서도 import되지 않는 죽은 코드였음. 하나로 합치면서 안 쓰이던 헬퍼는 제거하고,
// 실제 관례대로 링크는 `PUBLIC_BUILD_URL + item.href` 문자열 접합으로 만든다 — Gnb.astro 등 기존
// 호출부 전부 이 방식.)

export interface RouteChildren {
  /** Navigation.astro의 activeMenuId 매칭용 */
  id: string
  /** 실제 노출 라벨(국문) */
  koLabel: string
  /** 영문 라벨(내부용, 현재 화면 노출엔 안 씀) */
  label: string
  href: string
}
export interface Route {
  label: string
  /** 그룹 대표 href(보통 첫 child와 동일) — GNB 1Depth 링크, `route.find()` 조회 키.
   *  ⚠️ 새 페이지에서 route.find()는 항상 이 그룹 최상위 href로 조회할 것 — 페이지 자기 자신의
   *  href를 넣으면 2Depth 서브 내비게이션(Navigation.astro)이 빈 값을 받아 사라진다(과거 9개
   *  페이지에서 동시에 발생했던 버그, CLAUDE.md 작업 로그 참고). */
  href: string
  children: RouteChildren[]
}

// 각 그룹/항목 옆 주석은 @old/header.html(구 GNB + 3-depth 사이트맵) 대비 신규 구조가 어떻게
// 바뀌었는지 기록한 것 — 런타임에서는 안 쓰지만 "이 메뉴가 옛날엔 뭐였는지" 추적할 때 참고용으로
// 남겨둔다. 상태 구분: existing(라벨·개념 동일, 경로만 clean path화) / renamed(라벨·계층 변경) /
// new(구 GNB에 없던 신규) / merged(구 3-depth 개별 메뉴가 신규 2-depth 페이지 콘텐츠 섹션으로
// 병합된 것으로 추정). old GNB의 IT Consulting/IT Management/Benefit/Partner는 신규 GNB에 대응
// 항목이 없어(dropped) 아예 뺐음 — 필요해지면 git 이력에서 복원.
//
// 참고: 최상위 Home(path '/')은 이 배열에 없음 — GNB 로고 링크(Gnb.astro)에 `${PUBLIC_BUILD_URL}/`로
// 직접 하드코딩되어 있고, /privacy·/404·/page-list 같은 유틸리티 라우트도 GNB 2Depth 구조가
// 아니라서 이 배열 밖(각 페이지 파일 자체가 라우트 정의)에 있다.
export const route: Route[] = [
  {
    // old 최상위 라벨은 "About us" — 신규는 "Company"로 변경(renamed)
    label: 'Company',
    href: '/company/info',
    children: [
      {
        id: 'MAP-COMPANY-ID-1',
        koLabel: 'ABOUT M2MGLOBAL',
        label: 'Company Info',
        href: '/company/info' // old: @old/aboutus/about_us.html (existing)
      },
      {
        id: 'MAP-COMPANY-ID-2',
        koLabel: 'CEO 인사말',
        label: "CEO's Message",
        href: '/company/ceo-message' // old GNB에 없던 신규 항목(new). about_us.html 회사개요 표에
        // "대표이사" 이름 필드는 있지만 별도 인사말 콘텐츠는 없었음
      },
      {
        id: 'MAP-COMPANY-ID-3',
        koLabel: '회사 연혁',
        label: 'History',
        href: '/company/history' // old: @old/aboutus/about_us.html#history (existing)
      },
      {
        id: 'MAP-COMPANY-ID-4',
        koLabel: '인재 채용',
        label: 'Careers',
        href: '/company/careers' // old GNB에 없던 신규 항목(new). benefit 섹션 "인재추천"(추천 채용
        // 포상금)과는 다른 별도 채용 페이지
      },
      {
        id: 'MAP-COMPANY-ID-5',
        koLabel: 'News',
        label: 'News',
        href: '/company/news' // old GNB/콘텐츠 어디에도 대응 근거 없음(new)
      },
      {
        id: 'MAP-COMPANY-ID-6',
        koLabel: '위치 및 연락처',
        label: 'Address',
        href: '/company/address' // old: about_us.html#headquartersAddress (renamed, "Headquarters
        // Address" → "Address")
      },
      {
        id: 'MAP-COMPANY-ID-7',
        koLabel: '사업 문의',
        label: 'Contact us',
        href: '/company/contact-us' // old: about_us.html#headquartersAddress 안 "사업 문의" dt
        // 항목이 별도 nav 항목으로 승격(renamed)
      }
    ]
  },
  {
    // old에는 "AI Engine"이라는 최상위 메뉴가 없었음 — old "Business > AI Engineering for Real
    // Business"가 최상위로 승격된 것으로 추정(renamed)
    label: 'AI Engine',
    href: '/ai-engine/machine-learning',
    children: [
      {
        id: 'MAP-AI-ENGINE-ID-1',
        koLabel: 'AI & Machine Learning',
        label: 'AI & Machine Learning',
        href: '/ai-engine/machine-learning' // old: @old/business/ai-solution.html, 라벨 "AI
        // Engineering for Real Business" → "AI & Machine Learning"(renamed)
      },
      {
        id: 'MAP-AI-ENGINE-ID-2',
        koLabel: 'AI Commerce',
        label: 'AI Commerce',
        href: '/ai-engine/ai-commerce' // old: ai-solution.html 안 "02 AI 커머스 플랫폼" 섹션이
        // 별도 nav 항목으로 승격(renamed)
      }
    ]
  },
  {
    // old에는 "Robot Logistics"라는 최상위 메뉴가 없었음 — old "Business > Robotic Logistics /
    // Smart Factory"가 최상위로 승격된 것으로 추정(renamed)
    label: 'Robot Logistics',
    href: '/robot-logistics/overview',
    children: [
      {
        id: 'MAP-ROBOT-LOGISTICS-ID-1',
        koLabel: 'Robot Logistics',
        label: 'Robot Logistics',
        href: '/robot-logistics/overview' // old: @old/business/agv.html, 라벨 "Robotic Logistics"
        // → "Robot Logistics"(renamed)
      },
      {
        id: 'MAP-ROBOT-LOGISTICS-ID-2',
        koLabel: 'Smart Factory',
        label: 'Smart Factory',
        href: '/robot-logistics/smart-factory' // old: @old/business/mes.html, 라벨 그대로 "Smart
        // Factory"(existing, 부모만 Business → Robot Logistics로 변경)
      }
    ]
  },
  {
    // old에는 "e-Commerce"라는 최상위 메뉴가 없었음 — old "Business > e-Commerce"가 최상위로
    // 승격된 것으로 추정(renamed). old "Solution > Commerce Platform > M2M-eMarketPlace"도 여기로 재편
    label: 'e-Commerce',
    href: '/e-commerce/commerce-technology',
    children: [
      {
        id: 'MAP-E-COMMERCE-ID-1',
        koLabel: 'B2C Commerce',
        label: 'Commerce Technology',
        href: '/e-commerce/commerce-technology' // old: @old/business/ecommerce.html, 라벨
        // "e-Commerce"(Business 하위) → "Commerce Technology"(renamed)
      },
      {
        id: 'MAP-E-COMMERCE-ID-2',
        koLabel: 'B2B Commerce',
        label: 'B2B Commerce',
        href: '/e-commerce/b2b-commerce' // old: ecommerce.html "유연한 이커머스 비즈니스 지원" 카드의
        // 여러 지원 항목(Promotion/Coupon/B2E/B2B) 중 "B2B 지원"이 별도 nav 항목으로 승격(renamed)
      },
      {
        id: 'MAP-E-COMMERCE-ID-3',
        koLabel: 'Auction',
        label: 'Marketplace',
        href: '/e-commerce/marketplace' // old: @old/solution/emp.html "M2M-eMarketPlace"(Solution >
        // Commerce Platform 3-depth 하위)가 e-Commerce 최상위 2-depth로 승격/이동(renamed)
      }
    ]
  },
  {
    // 최상위 라벨은 old "Solution" 그대로(단수→복수만 차이, existing). old 사이트맵은 3-depth까지
    // 있었는데 신규 GNB는 2-depth뿐이라, 3-depth 항목들은 상위 Platform 페이지 안 콘텐츠 섹션으로
    // 합쳐진 것으로 추정(merged) — 실제 이관 시 개별 페이지 유지 여부는 재확인 필요했던 부분.
    label: 'Solutions',
    href: '/solutions/commerce-platform',
    children: [
      {
        id: 'MAP-SOLUTIONS-ID-1',
        koLabel: 'Commerce Platform',
        label: 'Commerce Platform',
        href: '/solutions/commerce-platform' // old: @old/solution/emall.html(existing). 구 3-depth
        // M2M-eMall(emall.html)/M2M-MultiMall(multimall.html)/M2M-ePRO(epro.html)/
        // M2M-ImageTag(imagetag.html)/M2M-eCCP(eccp.html)가 전부 이 페이지로 병합 추정(merged)
      },
      {
        id: 'MAP-SOLUTIONS-ID-2',
        koLabel: 'Logistics Platform',
        label: 'Logistics Platform',
        href: '/solutions/logistics-platform' // old: @old/solution/tms.html(existing). 구 3-depth
        // M2M-TMS(tms.html)/M2M-WMS(wms.html)/M2M-CVO(cvo.html)가 전부 이 페이지로 병합 추정(merged)
      },
      {
        id: 'MAP-SOLUTIONS-ID-3',
        koLabel: 'Trade Platform',
        label: 'Trade Platform',
        href: '/solutions/trade-platform' // old: @old/solution/etrade.html(existing). 구 3-depth
        // M2M-eTrade(etrade.html)/M2M-FTA(fta.html)/M2M-eDrawback(edrawback.html)가 전부 이
        // 페이지로 병합 추정(merged)
      },
      {
        id: 'MAP-SOLUTIONS-ID-4',
        koLabel: 'eLiveStock Platform',
        label: 'eLiveStock Platform',
        href: '/solutions/elivestock-platform' // old에 축산(livestock) 관련 페이지 없음 — 신규
        // GNB에서 새로 생긴 솔루션 라인(new)
      }
    ]
  },
  {
    // old 최상위 라벨은 "Works" — 신규는 "Project"로 변경(renamed)
    label: 'Project',
    href: '/project/reference',
    children: [
      {
        id: 'MAP-PROJECT-ID-1',
        koLabel: 'Reference',
        label: 'Reference',
        href: '/project/reference' // old: @old/works/works.html, 라벨 "Major Clients" → "Reference"로
        // 추정(renamed, 확정 아님 — 확인 필요)
      },
      {
        id: 'MAP-PROJECT-ID-2',
        koLabel: 'Specialized Outcomes',
        label: 'Specialized Outcomes',
        href: '/project/specialized-outcomes' // old: @old/works/works.html#portfolio, 라벨
        // "Portfolio"(앵커 섹션) → "Specialized Outcomes"로 추정(renamed, 확정 아님 — 확인 필요)
      }
    ]
  }
]
