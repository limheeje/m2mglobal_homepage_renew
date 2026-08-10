// "맨 위로 가기" FAB 전용 글로벌 스크립트 — 전 페이지 공통(Layout.astro에서 로드).
// 참고: CLAUDE.md "아직 스크립트(JS) 미구현 — TODO" 중 "IconButton(맨 위로 가기) 스크롤 동작" 항목 구현.
//
// 클릭 시 페이지 최상단으로 부드럽게 스크롤한다.

function initScrollToTop() {
  const button = document.querySelector<HTMLButtonElement>('.layout__top-btn')
  if (!button) return

  button.addEventListener('click', () => {
    window.scrollTo({top: 0, behavior: 'smooth'})
  })
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initScrollToTop)
} else {
  initScrollToTop()
}
