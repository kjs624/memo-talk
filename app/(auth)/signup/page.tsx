import { signup } from '../actions'

export default async function SignupPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>
}) {
    const params = await searchParams
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-cork-texture bg-cover">
            <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-memo border-4 border-wood">
                <h1 className="mb-6 text-2xl font-bold text-center text-wood">회원가입</h1>

                {params?.error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        ⚠️ {decodeURIComponent(params.error)}
                    </div>
                )}

                <form action={signup} className="flex flex-col gap-4">
                    <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="이메일"
                        required
                        className="rounded border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-wood"
                    />
                    <input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="비밀번호"
                        required
                        className="rounded border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-wood"
                    />
                    <button className="rounded bg-wood p-2 text-white hover:bg-opacity-90 transition-colors font-bold">
                        가입하기
                    </button>
                </form>
                <div className="mt-4 text-center text-sm">
                    이미 계정이 있으신가요? <a href="/login" className="text-wood underline font-bold">로그인</a>
                </div>
            </div>
        </div>
    )
}
