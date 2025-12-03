'use client'
import { motion } from 'framer-motion'
import { Memo } from '@/types/memo.types'
import { createClient } from '@/lib/supabase/client'
import { Trash2, Archive } from 'lucide-react'
import { useState, useEffect } from 'react'
import MemoModal from './MemoModal'
import { isImageUrl, isVideoUrl } from '@/lib/utils/media'

const colorMap = {
    yellow: 'bg-memo-yellow',
    pink: 'bg-memo-pink',
    green: 'bg-memo-green',
    blue: 'bg-memo-blue',
}

export default function MemoCard({ memo, isStatic = false }: { memo: Memo, isStatic?: boolean }) {
    const supabase = createClient()
    const [userId, setUserId] = useState<string | null>(null)
    const [showModal, setShowModal] = useState(false)

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUserId(user?.id || null)
        })
    }, [supabase])

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation()
        if (!confirm('정말 삭제하시겠습니까?')) return

        // Optimistically remove from UI immediately
        const memoId = memo.id

        const { error } = await supabase
            .from('memos')
            .delete()
            .eq('id', memoId)

        if (error) {
            console.error('Delete error:', error)
            alert('삭제 실패')
        } else {
            console.log('✅ Memo deleted successfully from DB:', memoId)
        }
    }

    const handleArchive = async (e: React.MouseEvent) => {
        e.stopPropagation()
        if (!userId) return alert('로그인이 필요합니다.')

        let { data: privateBoard } = await supabase
            .from('boards')
            .select('id')
            .eq('type', 'private')
            .eq('created_by', userId)
            .single()

        if (!privateBoard) {
            const { data: newBoard, error: createError } = await supabase
                .from('boards')
                .insert({
                    name: '나의 게시판',
                    type: 'private',
                    created_by: userId
                })
                .select()
                .single()

            if (createError || !newBoard) {
                console.error('Board create error:', createError)
                return alert('게시판 생성 실패')
            }
            privateBoard = newBoard
        }

        const boardId = privateBoard!.id

        // Move memo to private board and make it permanent
        const { error: moveError } = await supabase
            .from('memos')
            .update({
                board_id: boardId,
                expires_at: new Date('9999-12-31').toISOString()
            })
            .eq('id', memo.id)

        if (moveError) {
            console.error('Move error:', moveError)
            alert('이동 실패')
        } else {
            alert('나의 게시판으로 이동되었습니다! 📦')
        }
    }

    const handleDoubleClick = () => {
        setShowModal(true)
    }

    const cornerType = memo.id.charCodeAt(0) % 4
    const foldStyle =
        cornerType === 0 ? "top-0 left-0 border-b-[20px] border-r-[20px] border-b-black/10 border-r-white/0 rotate-90" :
            cornerType === 1 ? "top-0 right-0 border-b-[20px] border-l-[20px] border-b-black/10 border-l-white/0 -rotate-90" :
                cornerType === 2 ? "bottom-0 left-0 border-t-[20px] border-r-[20px] border-t-black/10 border-r-white/0 -rotate-90" :
                    "bottom-0 right-0 border-t-[20px] border-l-[20px] border-t-black/10 border-l-white/0 rotate-90"

    const getTextClass = (content: string) => {
        const len = content.length
        if (len <= 30) return 'text-sm'
        if (len <= 60) return 'text-xs'
        if (len <= 100) return 'text-[11px]'
        return 'text-[9px]'
    }

    const renderContent = () => {
        const content = memo.content?.trim() || ''
        const mediaUrl = memo.media_url

        // Case 1: Media Only (Legacy support or new media-only)
        if (mediaUrl && !content) {
            const isVideo = mediaUrl.match(/\.(mp4|webm|ogg)$/i)
            if (isVideo) {
                return (
                    <video src={mediaUrl} className="max-w-full max-h-full object-contain rounded pointer-events-none" muted loop autoPlay />
                )
            }
            return <img src={mediaUrl} alt="Memo" className="max-w-full max-h-full object-contain rounded pointer-events-none" />
        }

        // Case 2: Text Only
        if (!mediaUrl && content) {
            // Legacy check for URL in content (if migration didn't happen)
            if (isImageUrl(content)) return <img src={content} alt="Memo" className="max-w-full max-h-full object-contain rounded pointer-events-none" />

            const textClass = getTextClass(content)
            return (
                <p className={`break-words w-full h-full flex items-center justify-center overflow-hidden pointer-events-none select-none leading-tight px-1 ${textClass}`}>
                    {content}
                </p>
            )
        }

        // Case 3: Both (Mixed)
        if (mediaUrl && content) {
            const isVideo = mediaUrl.match(/\.(mp4|webm|ogg)$/i)
            return (
                <div className="flex flex-col w-full h-full p-1 gap-1 pointer-events-none">
                    <div className="flex-1 overflow-hidden flex items-center justify-center bg-black/5 rounded">
                        {isVideo ? (
                            <video src={mediaUrl} className="max-w-full max-h-full object-contain" muted loop autoPlay />
                        ) : (
                            <img src={mediaUrl} alt="Memo" className="max-w-full max-h-full object-contain" />
                        )}
                    </div>
                    <p className="text-[10px] line-clamp-2 leading-tight flex-none h-auto">
                        {content}
                    </p>
                </div>
            )
        }

        return null
    }

    return (
        <>
            <motion.div
                onDoubleClick={handleDoubleClick}
                style={isStatic ? { position: 'relative', width: '100%', height: '100%' } : { left: memo.position_x, top: memo.position_y, position: 'absolute' }}
                initial={isStatic ? { opacity: 0, scale: 0.9 } : { rotate: memo.rotation, scale: 0, opacity: 0 }}
                animate={isStatic ? { opacity: 1, scale: 1 } : { scale: 1, opacity: 1, rotate: memo.rotation }}
                exit={{ y: 1000, opacity: 0, rotate: 45, transition: { duration: 0.6, ease: "easeIn" } }}
                className={`w-48 h-48 p-4 shadow-memo hover:shadow-memo-hover flex items-center justify-center text-center ${colorMap[memo.color]} font-handwriting relative group cursor-pointer overflow-hidden ${isStatic ? 'transform-none' : ''}`}
                whileHover={{ scale: 1.05, zIndex: 10, rotate: 0 }}
            >
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    {userId && (
                        <button
                            onClick={handleArchive}
                            className="p-1.5 bg-white/50 hover:bg-white rounded-full text-blue-600 transition-colors pointer-events-auto"
                            title="나의 게시판으로 이동"
                        >
                            <Archive size={16} />
                        </button>
                    )}
                    {userId === memo.user_id && (
                        <button
                            onClick={handleDelete}
                            className="p-1.5 bg-white/50 hover:bg-white rounded-full text-red-600 transition-colors pointer-events-auto"
                            title="삭제"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>

                <div
                    className={`absolute w-0 h-0 shadow-sm pointer-events-none ${foldStyle}`}
                />

                {renderContent()}
            </motion.div>

            {showModal && <MemoModal memo={memo} onClose={() => setShowModal(false)} />}
        </>
    )
}
