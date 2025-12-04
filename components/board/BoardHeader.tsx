'use client'
import Link from 'next/link'

export default function BoardHeader({ name }: { name: string }) {
    return (
        <div className="absolute top-0 left-0 right-0 h-16 bg-wood-pattern shadow-lg z-30 flex items-center justify-center border-b-8 border-[#5d4037]">
            {/* Realistic Wood Texture Overlay */}
            <div className="absolute inset-0 bg-[url('/wood-texture.png')] opacity-20 pointer-events-none mix-blend-overlay"></div>

            {/* Title Plate */}
            <div className="relative bg-[#8d6e63] px-8 py-2 rounded-lg shadow-inner border-2 border-[#5d4037] transform hover:scale-105 transition-transform cursor-default">
                <div className="absolute inset-0 bg-black/10 rounded-lg pointer-events-none"></div>
                <h1 className="text-2xl font-bold text-white drop-shadow-md relative z-10 font-handwriting tracking-wider">
                    {name}
                </h1>

                {/* Screws */}
                <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-[#3e2723] shadow-inner"></div>
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#3e2723] shadow-inner"></div>
                <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-[#3e2723] shadow-inner"></div>
                <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-[#3e2723] shadow-inner"></div>
            </div>

            {/* User menu moved to UserBoardMenu component */}
        </div>
    )
}
