# Memo Talk (메모 톡)

포스트잇 기반 소셜 게시판 서비스입니다.

## 기능
- **코르크판 게시판**: 자유롭게 메모를 붙이고 이동할 수 있습니다.
- **실시간 소통**: 다른 사용자의 활동이 실시간으로 보입니다.
- **AI 검열**: Gemini가 부적절한 메모 작성을 방지합니다.
- **자동 삭제**: 메모는 24시간 후 자동으로 떨어집니다.

## 기술 스택
- Next.js 15, React 19, TypeScript
- Tailwind CSS, Framer Motion
- Supabase (Auth, DB, Realtime)
- Google Gemini API

## 시작하기

1. 의존성 설치
```bash
npm install
```

2. 환경 변수 설정 (`.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
GEMINI_API_KEY=...
```

3. 개발 서버 실행
```bash
npm run dev
```
