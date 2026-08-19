// GNB 1/2Depth(Gnb.astro), All 메뉴 2Depth(AllMenu.astro)에 현재 접속 페이지 기준으로
// .is-active 클래스를 부여한다(스타일은 이미 _gnb.scss/_all-menu.scss에 정의돼 있음).
// 마크업의 <a href>가 이미 PUBLIC_BUILD_URL이 붙은 완성 경로라 location.pathname과
// 그대로 비교하면 되고, 페이지마다 별도 연결 코드 없이 이 스크립트만 전역 로드하면 동작한다.

function normalize(href: string | null): string {
  if (!href) return ''
  return new URL(href, window.location.origin).pathname.replace(/\/$/, '') || '/'
}

function initNavActiveState() {
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/'

  // GNB: 1Depth(.g-link)는 자기 하위 2Depth(.gb-submenu a) 중 하나라도 현재 경로와 일치하면 활성.
  document.querySelectorAll<HTMLElement>('.gnb .gb-item').forEach((item) => {
    const gLink = item.querySelector<HTMLAnchorElement>('.g-link')
    const subLinks = item.querySelectorAll<HTMLAnchorElement>('.gb-submenu a')
    let groupActive = false

    subLinks.forEach((link) => {
      const active = normalize(link.getAttribute('href')) === currentPath
      link.classList.toggle('is-active', active)
      if (active) groupActive = true
    })

    gLink?.classList.toggle('is-active', groupActive)
  })

  // All 메뉴: 2Depth 링크만 존재(1Depth는 라벨 텍스트라 링크 없음) — 경로 일치 시 활성.
  document.querySelectorAll<HTMLAnchorElement>('.all-menu__depth2-col a').forEach((link) => {
    const active = normalize(link.getAttribute('href')) === currentPath
    link.classList.toggle('is-active', active)
  })
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNavActiveState)
} else {
  initNavActiveState()
}
