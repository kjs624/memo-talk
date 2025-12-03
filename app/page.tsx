import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-cork via-amber-50 to-yellow-100">
      <main className="flex flex-col items-center gap-8 px-8 py-16 text-center">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-wood drop-shadow-lg">
            📌 메모 톡
          </h1>
          <p className="text-2xl text-gray-700 max-w-2xl">
            포스트잇처럼 자유롭게 붙이는 소셜 메모 보드
          </p>
        </div>

        <div className="grid gap-4 mt-8 w-full max-w-md">
          <Link
            href="/login"
            className="rounded-lg bg-wood px-8 py-4 text-xl text-white shadow-memo hover:shadow-memo-hover transition-all transform hover:scale-105 font-bold"
          >
            시작하기
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-white border-4 border-wood px-8 py-4 text-xl text-wood shadow-memo hover:shadow-memo-hover transition-all transform hover:scale-105 font-bold"
          >
            회원가입
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
          <div className="bg-memo-yellow p-6 rounded-lg shadow-memo transform rotate-1">
            <h3 className="text-lg font-bold mb-2">🎨 다양한 색상</h3>
            <p className="text-sm">노랑, 핑크, 초록, 파랑 포스트잇으로 표현하세요</p>
          </div>
          <div className="bg-memo-pink p-6 rounded-lg shadow-memo transform -rotate-1">
            <h3 className="text-lg font-bold mb-2">⚡ 실시간 동기화</h3>
            <p className="text-sm">모두가 함께 보는 실시간 공유 보드</p>
          </div>
          <div className="bg-memo-green p-6 rounded-lg shadow-memo transform rotate-2">
            <h3 className="text-lg font-bold mb-2">🤖 AI 모더레이션</h3>
            <p className="text-sm">Gemini AI가 부적절한 내용을 자동 필터링</p>
          </div>
        </div>
      </main>
    </div>
  )
}
