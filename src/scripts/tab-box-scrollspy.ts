// Tab(variant="box") 전용 글로벌 스크립트 — 전 페이지 공통(Layout.astro에서 로드).
// 참고: CLAUDE.md "아직 스크립트(JS) 미구현 — TODO" 중 "Tab 클릭 전환" 항목 구현.
//
// 1) 탭 아이템 클릭 → 해당 href(#anchor) 섹션으로 부드럽게 스크롤 + 클릭한 탭 즉시 active 처리
// 2) 스크롤로 섹션이 바뀔 때마다 IntersectionObserver로 현재 보이는 섹션에 대응하는 탭을 active 처리
//
// 페이지에 `.tab--box`가 없으면(=대부분의 서브페이지에 없거나, in-page anchor 탭이 아닌 경우) 아무 것도
// 하지 않는다 — 하드코딩된 페이지 종속 로직 없이 마크업 컨벤션(.tab--box > .tab__item[href^="#"] +
// 매칭되는 id를 가진 섹션)만으로 동작한다.

function initTabBoxScrollspy() {
  document.querySelectorAll<HTMLElement>('.tab--box').forEach((tabBar) => {
    const items = Array.from(tabBar.querySelectorAll<HTMLAnchorElement>('.tab__item[href^="#"]'))
    if (items.length === 0) return

    const sections = items
      .map((item) => document.getElementById(item.getAttribute('href')!.slice(1)))
      .filter((el): el is HTMLElement => el !== null)
    if (sections.length === 0) return

    const setActive = (id: string) => {
      items.forEach((item) => {
        item.classList.toggle('is-active', item.getAttribute('href') === `#${id}`)
      })
    }

    // 스무스 스크롤 애니메이션이 진행되는 동안에는 중간에 지나치는 섹션들 때문에 IntersectionObserver가
    // active를 계속 덮어써서 깜빡이는 걸 막기 위한 플래그. scrollend를 지원하지 않는 브라우저 대비
    // 타임아웃 폴백도 같이 둔다.
    let isClickScrolling = false
    let clickScrollTimer: ReturnType<typeof setTimeout>

    const endClickScroll = () => {
      isClickScrolling = false
      clearTimeout(clickScrollTimer)
    }

    items.forEach((item) => {
      item.addEventListener('click', (event) => {
        const id = item.getAttribute('href')!.slice(1)
        const target = document.getElementById(id)
        if (!target) return

        event.preventDefault()
        isClickScrolling = true
        clearTimeout(clickScrollTimer)
        setActive(id)
        target.scrollIntoView({behavior: 'smooth', block: 'start'})
        history.replaceState(null, '', `#${id}`)

        clickScrollTimer = setTimeout(endClickScroll, 800)
      })
    })

    // 최신 브라우저는 scrollend로 정확히 스크롤 종료 시점을 알 수 있다 — 지원 시 타임아웃보다 우선.
    window.addEventListener('scrollend', () => {
      if (isClickScrolling) endClickScroll()
    })

    const observer = new IntersectionObserver(
      (entries) => {
        if (isClickScrolling) return
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id)
        })
      },
      // 뷰포트 상단 20%~하단 70% 사이를 지나는 섹션을 "현재 섹션"으로 판단.
      {rootMargin: '-20% 0px -70% 0px', threshold: 0}
    )
    sections.forEach((section) => observer.observe(section))
  })
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTabBoxScrollspy)
} else {
  initTabBoxScrollspy()
}
