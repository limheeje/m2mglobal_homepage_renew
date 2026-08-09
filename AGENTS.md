## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## Styling (SCSS via VSCode Watch Sass)

이 프로젝트는 Astro의 내장 vite-sass 파이프라인을 쓰지 않고, VSCode **Live Sass Compile**(`glenn2223.live-sass-compiler`) 확장의 watch 컴파일 방식을 사용한다.

```
src/styles/
  scss/
    abstracts/_variables.scss   # 색상·타이포·spacing 스케일·breakpoint (디자인 토큰)
    abstracts/_mixins.scss      # spacing(), breakpoint(), flex(), line-clamp()
    base/_reset.scss
    base/_typography.scss
    components/_button.scss
    layout/_header.scss
    layout/_footer.scss
    main.scss                  # 진입점. 새 partial은 반드시 여기 @use로 등록
  css/
    main.css                    # 컴파일 결과물 (git ignore 대상, 직접 수정 금지)
```

**작업 방법**
1. VSCode 하단 상태바에서 **Watch Sass** 클릭 (한 번 켜두면 저장할 때마다 자동 컴파일)
2. `main.scss`가 참조하는 `.scss`만 수정하고, `src/styles/css/main.css`는 직접 건드리지 않음
3. `src/layouts/Layout.astro` 프론트매터에서 `import '~/styles/css/main.css'`로 결과 CSS를 불러옴

**주의**: `sass` npm 패키지를 devDependencies에 설치하지 말 것 — 설치하면 Astro/vite가 `.scss`를 자체적으로도 컴파일하려 들어 watch-sass 결과물과 이중 컴파일 충돌이 날 수 있다.

## Figma MCP 연동 (Dev Mode MCP Server)

Figma 디자인을 Claude Code에서 직접 참조(코드/이미지/디자인 토큰 추출)하기 위해 Figma 공식 **Dev Mode MCP Server**를 사용한다. `.mcp.json`(프로젝트 스코프)에 `figma-dev-mode-mcp-server`로 이미 등록되어 있음.

**요구 조건**
- Figma **데스크톱 앱** (브라우저 Figma는 지원 안 함)
- **Professional/Organization/Enterprise 플랜** (Starter 무료 플랜에서는 기능 자체가 없음)
- 작업할 Figma 파일을 데스크톱 앱으로 열어둔 상태

**연결 방법 (매번 새로 켜야 할 때)**
1. Figma 데스크톱 앱 실행 → 연동할 파일 열기
2. 단축키 `Ctrl + /` → Quick Actions 검색창에 `MCP` 입력 → **"Enable Dev Mode MCP Server"** 클릭해서 활성화
   - (안 보이면: 좌측 상단 Figma 로고 → Preferences → "Enable Dev Mode MCP Server")
3. 활성화되면 로컬에 `http://127.0.0.1:3845/mcp` 로 서버가 열림 (Figma 데스크톱 앱이 켜져 있는 동안만 유지됨 — 앱을 끄면 연결도 끊김)
4. Claude Code 재시작 → 프로젝트 MCP 서버(`figma-dev-mode-mcp-server`) 사용 승인 프롬프트 수락
5. `/mcp` 슬래시 명령으로 `connected` 상태와 제공 도구(`get_code`, `get_image`, `get_variable_defs` 등) 확인

**등록 명령 (참고, 이미 완료됨)**
```
claude mcp add --transport http figma-dev-mode-mcp-server http://127.0.0.1:3845/mcp -s project
```

**작업 흐름**
1. Figma Dev Mode에서 구현할 프레임/컴포넌트 선택
2. Claude Code에 "선택한 Figma 노드로 컴포넌트 만들어줘" 요청 → MCP 도구로 마크업/스크린샷/디자인 토큰 획득
3. 받은 토큰은 `src/styles/scss/abstracts/_variables.scss`에 SCSS 변수로 정리
4. `.astro` 컴포넌트 + 대응 `.scss` 작성 → Watch Sass 자동 컴파일 → 브라우저에서 확인

**대안**: Dev/Full seat이 없어 위 기능이 안 보이는 경우, 커뮤니티 서버 **Framelink `figma-developer-mcp`**(Figma 개인 액세스 토큰만으로 동작, 무료 플랜도 가능)로 대체 가능.
```
claude mcp add figma-developer-mcp -s local --env FIGMA_API_KEY=<토큰> -- npx -y figma-developer-mcp --stdio
```
