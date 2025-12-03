'use client'
import { Memo } from '@/types/memo.types'
import { X } from 'lucide-react'
import { isImageUrl, isVideoUrl } from '@/lib/utils/media'

export default function MemoModal({
    memo,
    onClose
}: {
    memo: Memo
    onClose: () => void
}) {
    const colorMap = {
        yellow: 'bg-memo-yellow',
        pink: 'bg-memo-pink',
        green: 'bg-memo-green',
        blue: 'bg-memo-blue',
    }

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose()
        }
    }

    const renderContent = () => {
        const content = memo.content.trim()

        // Check if content is an image URL
        if (isImageUrl(content)) {
            return (
                <img
                    src={content}
                    alt="Memo image"
                    className="max-w-full max-h-[70vh] object-contain rounded"
                />
            )
        }

        // Check if content is a video URL
        if (isVideoUrl(content)) {
            return (
                <video
                    src={content}
                    controls
                    className="max-w-full max-h-[70vh] rounded"
                >
                    Your browser does not support the video tag.
                </video>
            )
        }

        // Regular text content
        return (
            <p className="text-xl leading-relaxed whitespace-pre-wrap break-words">
                {content}
            </p>
        )
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={handleBackdropClick}
        >
            <div className={`relative max-w-2xl w-full mx-4 p-8 rounded-lg shadow-2xl ${colorMap[memo.color]} font-handwriting`}>
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-white/50 hover:bg-white rounded-full transition-colors"
                    title="닫기"
                >
                    <X size={20} />
                </button>

                {/* Content */}
                <div className="mt-8">
                    {renderContent()}
                </div>

                {/* Metadata */}
                <div className="mt-6 text-sm opacity-70">
                    <p>작성일: {new Date(memo.created_at).toLocaleString('ko-KR')}</p>
                </div>
            </div>
        </div>
    )
}
