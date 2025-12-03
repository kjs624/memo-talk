import Link from 'next/link'

export default function BoardHeader({ name }: { name: string }) {
    return (
        <div className="absolute top-4 left-4 z-10 flex gap-4 items-center">
            <div className="bg-gradient-to-br from-[#8B5A3C] via-[#A0694F] to-[#8B5A3C] text-white px-6 py-3 rounded-lg shadow-[inset_0_2px_4px_rgba(139,69,19,0.5),inset_0_-2px_4px_rgba(0,0,0,0.3),0_4px_8px_rgba(0,0,0,0.3)] backdrop-blur-sm border-2 border-[#654321]">
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
                    📦 나의 보관소
                </Link>
            </div>
        </div>
    )
}
