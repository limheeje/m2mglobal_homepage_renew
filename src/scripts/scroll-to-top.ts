// "맨 위로 가기" FAB 전용 글로벌 스크립트 — 전 페이지 공통(Layout.astro에서 로드).
// 참고: CLAUDE.md "아직 스크립트(JS) 미구현 — TODO" 중 "IconButton(맨 위로 가기) 스크롤 동작" 항목 구현.
//
// 1) 클릭 시 페이지 최상단으로 부드럽게 스크롤.
// 2) scrollY가 0이면 숨기고, 뷰포트 높이의 절반을 넘게 스크롤하면 노출(.is-visible).
// 3) 평소엔 화면 하단에서 30px 위에 붙어(fixed) 스크롤을 따라다니다가, 문서 맨 아래에 가까워지면
//    남은 스크롤 거리만큼 bottom을 끌어올려 문서 기준 178px 지점(기존 고정값)에서 더 못 내려가고
//    멈춘 것처럼 보이게 한다 — 페이지 끝에 닿으면 정지, 다시 위로 스크롤하면 다시 30px까지 따라옴.
//    (position은 항상 fixed 유지 — absolute로 바꾸면 html,body{height:100%} 때문에 버튼이 뷰포트
//    한 장 높이에서 컷되어 사라지는 버그가 있었음.)
const SHOW_THRESHOLD_RATIO = 0.5 // 뷰포트 높이의 몇 %를 넘기면 노출할지
const RESTING_BOTTOM = 30 // 평소 화면 하단에서 띄우는 값(px)
const PINNED_BOTTOM = 178 // 문서 맨 아래에서 멈추는 지점(px) — 기존 고정값
const PIN_GAP = PINNED_BOTTOM - RESTING_BOTTOM // 문서 끝까지 이 거리(px) 안으로 들어오면 멈추기 시작

function initScrollToTop() {
  const button = document.querySelector<HTMLButtonElement>('.layout__top-btn')
  if (!button) return

  button.addEventListener('click', () => {
    window.scrollTo({top: 0, behavior: 'smooth'})
  })

  let ticking = false
  const updateState = () => {
    ticking = false
    const scrollY = window.scrollY
    button.classList.toggle('is-visible', scrollY > window.innerHeight * SHOW_THRESHOLD_RATIO)

    const distanceToPageBottom = Math.max(
      document.documentElement.scrollHeight - (scrollY + window.innerHeight),
      0
    )
    const bottom =
      distanceToPageBottom < PIN_GAP ? PINNED_BOTTOM - distanceToPageBottom : RESTING_BOTTOM
    button.style.bottom = `${bottom}px`
  }
  const onScroll = () => {
    if (ticking) return
    ticking = true
    requestAnimationFrame(updateState)
  }

  window.addEventListener('scroll', onScroll, {passive: true})
  window.addEventListener('resize', onScroll)
  updateState()
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initScrollToTop)
} else {
  initScrollToTop()
}
