import React from 'react'

export default function CorkBoard({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen w-full bg-cork-texture bg-cover relative overflow-hidden shadow-inner"
            style={{
                border: '24px solid #8B5A3C',
                borderImage: 'repeating-linear-gradient(45deg, #654321 0, #654321 10px, #8B5A3C 10px, #8B5A3C 20px) 30'
            }}>
            {children}
        </div>
    )
}
