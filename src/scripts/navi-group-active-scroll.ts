// 서브페이지 2Depth 탭(Navigation.astro, .bs-navigation .navi-group)은 overflow-x:auto라 항목이
// 많으면 가로 스크롤이 생긴다 — 활성 탭(.is-active)이 스크롤 영역 맨 끝에 걸려 있으면 사용자가
// 자기가 어디 있는지 못 보고 스크롤을 직접 해야 하는 문제가 있어서, 페이지 로드 시 활성 탭이 그
// 스크롤 영역의 가로 중앙에 오도록 자동으로 스크롤해준다. 클래스/마크업 컨벤션(.navi-group
// 안의 .is-active)만으로 동작하므로 페이지마다 별도 연결 코드 필요 없고, .navi-group이 없는
// 페이지에서는 아무 일도 하지 않는다.

function centerActiveNaviItem(group: HTMLElement) {
  const active = group.querySelector<HTMLElement>('.is-active')
  if (!active) return

  const groupRect = group.getBoundingClientRect()
  const activeRect = active.getBoundingClientRect()
  const groupCenter = groupRect.left + groupRect.width / 2
  const activeCenter = activeRect.left + activeRect.width / 2

  // 현재 scrollLeft에 "활성 탭 중심 - 스크롤 영역 중심" 차이만큼만 더해준다 — 초기 스크롤
  // 위치(보통 0)와 무관하게 항상 활성 탭이 정중앙에 오도록 계산된다.
  group.scrollLeft += activeCenter - groupCenter
}

function initNaviGroupActiveScroll() {
  document.querySelectorAll<HTMLElement>('.navi-group').forEach(centerActiveNaviItem)
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNaviGroupActiveScroll)
} else {
  initNaviGroupActiveScroll()
}
