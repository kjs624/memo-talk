import Link from 'next/link'

export default function BoardHeader({ name }: { name: string }) {
    return (
        <div className="absolute top-4 left-4 z-10 flex gap-4 items-center">
            <div className="bg-wood/90 text-white px-6 py-3 rounded-lg shadow-xl backdrop-blur-sm">
                <h1 className="text-2xl font-bold tracking-wide">{name}</h1>
            </div>

            <div className="flex gap-2">
                <Link
                    href="/board/common"
                    className="bg-white/80 hover:bg-white text-wood-dark px-4 py-2 rounded-lg shadow-md font-bold transition-colors backdrop-blur-sm"
                >
                    📢 공통 게시판
                </Link>
                <Link
                    href="/board/my"
                    className="bg-white/80 hover:bg-white text-wood-dark px-4 py-2 rounded-lg shadow-md font-bold transition-colors backdrop-blur-sm"
                >
                    🎁 나의 타임캡슐
                </Link>
            </div>
        </div>
    )
}
