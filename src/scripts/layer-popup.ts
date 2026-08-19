// LayerPopup.astro 동작 — @old/index.html 인라인 setCookie/closeWin 로직 포팅.
// 마크업 컨벤션(.layer-popup[data-layer-popup][data-cookie-key])만으로 동작하므로
// 페이지에 LayerPopup이 없으면 아무 일도 하지 않는다 — 새 페이지에서 별도 연결 코드 불필요.

function setCookie(name: string, value: string, expireDays: number) {
  const date = new Date()
  date.setDate(date.getDate() + expireDays)
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; expires=${date.toUTCString()};`
}

function hasClosedCookie(name: string) {
  return document.cookie.split('; ').some((row) => row === `${name}=done`)
}

document.querySelectorAll<HTMLElement>('[data-layer-popup]').forEach((popup) => {
  const cookieKey = popup.dataset.cookieKey
  if (!cookieKey) return

  if (!hasClosedCookie(cookieKey)) {
    popup.style.display = ''
  }

  const hideTodayCheckbox = popup.querySelector<HTMLInputElement>('.layer-popup__hide-today input')
  const closeBtn = popup.querySelector<HTMLButtonElement>('.layer-popup__close')

  closeBtn?.addEventListener('click', () => {
    if (hideTodayCheckbox?.checked) {
      const days = Number(popup.dataset.cookieDays ?? '1')
      setCookie(cookieKey, 'done', days)
    }
    popup.style.display = 'none'
  })
})
