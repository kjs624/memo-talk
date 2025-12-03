import React from 'react'

export default function CorkBoard({ children }: { children: React.ReactNode }) {
    return (
        <div
            className="relative min-h-screen w-full bg-[url('/cork.webp')] bg-repeat overflow-auto touch-pan-x touch-pan-y"
            style={{
                backgroundSize: '400px 400px',
                WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
                border: '24px solid #8B5A3C',
                borderImage: 'repeating-linear-gradient(45deg, #654321 0, #654321 10px, #8B5A3C 10px, #8B5A3C 20px) 30'
            }}
        >
            {/* Larger canvas for scrolling (especially on mobile) */}
            <div className="relative min-h-[200vh] min-w-[200vw] sm:min-h-screen sm:min-w-full">
                {children}
            </div>
        </div>
    )
}
