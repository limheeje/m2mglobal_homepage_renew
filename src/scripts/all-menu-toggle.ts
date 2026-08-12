// All 메뉴(AllMenu.astro) 열기/닫기 — GNB 우측 .all-gnb 버튼으로 열고, .all-menu__close 또는 Esc로 닫는다.
// body.is-allmenu-open 클래스 토글만으로 동작(_all-menu.scss가 이 클래스를 opacity/visibility 전환에 사용).

function initAllMenuToggle() {
  const openBtn = document.querySelector<HTMLButtonElement>('.all-gnb')
  const menu = document.getElementById('allMenu')
  const closeBtn = menu?.querySelector<HTMLButtonElement>('.all-menu__close')
  if (!openBtn || !menu) return

  const open = () => {
    document.body.classList.add('is-allmenu-open')
    menu.setAttribute('aria-hidden', 'false')
  }
  const close = () => {
    document.body.classList.remove('is-allmenu-open')
    menu.setAttribute('aria-hidden', 'true')
  }

  openBtn.addEventListener('click', () => {
    if (document.body.classList.contains('is-allmenu-open')) {
      close()
    } else {
      open()
    }
  })
  closeBtn?.addEventListener('click', close)
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close()
  })
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAllMenuToggle)
} else {
  initAllMenuToggle()
}
