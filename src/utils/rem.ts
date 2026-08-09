// px → rem 변환 (SCSS의 abstracts/_functions.scss rem()과 동일 규칙: 10px = 1rem)
// html { font-size: 62.5%; } (src/styles/scss/base/_typography.scss) 로 루트를 10px로
// 맞춰뒀으므로, JS에서 인라인 style로 크기를 내려줄 때도 px가 아니라 이 함수로 rem을 써야 한다.
export function pxToRem(px: number): string {
  return `${px / 10}rem`
}
