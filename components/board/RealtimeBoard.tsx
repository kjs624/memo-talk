'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import CorkBoard from './CorkBoard'
import BoardHeader from './BoardHeader'
import { Memo } from '@/types/memo.types'
import MemoCard from '../memo/MemoCard'
import MemoEditor from '../memo/MemoEditor'
import { AnimatePresence } from 'framer-motion'
import ArchiveDrawer from './ArchiveDrawer'
import TutorialOverlay from '../tutorial/TutorialOverlay'
import { useTutorial } from '@/hooks/useTutorial'


export default function RealtimeBoard({
    boardId,
    initialMemos,
    boardName = "공통 게시판"
}: {
    boardId: string
    initialMemos: Memo[]
    boardName?: string
}) {
    const [memos, setMemos] = useState<Memo[]>(initialMemos)
    const supabase = createClient()
    const { isFirstVisit, currentStep, nextStep, skipTutorial, completeTutorial } = useTutorial()


    useEffect(() => {
        setMemos(initialMemos)
    }, [initialMemos])

    useEffect(() => {
        console.log('🔌 Setting up Realtime subscription for boardId:', boardId)

        const channel = supabase
            .channel('realtime-memos')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'memos',
                    filter: `board_id=eq.${boardId}`,
                },
                (payload) => {
                    console.log('📡 Realtime event received:', payload.eventType, payload)
                    if (payload.eventType === 'INSERT') {
                        console.log('✅ INSERT - Adding memo:', payload.new)
                        setMemos((prev) => [...prev, payload.new as Memo])
                    } else if (payload.eventType === 'DELETE') {
                        console.log('🗑️ DELETE - Removing memo with id:', payload.old.id)
                        setMemos((prev) => {
                            const filtered = prev.filter((memo) => memo.id !== payload.old.id)
                            console.log('📊 Memos after delete:', filtered.length, 'remaining')
                            return filtered
                        })
                    } else if (payload.eventType === 'UPDATE') {
                        console.log('🔄 UPDATE - Updating memo:', payload.new)
                        setMemos((prev) => prev.map((memo) =>
                            memo.id === payload.new.id ? { ...memo, ...payload.new } as Memo : memo
                        ))
                    }
                }
            )
            .subscribe((status) => {
                console.log('📻 Realtime subscription status:', status)
            })

        return () => {
            console.log('🔌 Cleaning up Realtime subscription')
            supabase.removeChannel(channel)
        }
    }, [boardId, supabase])

    const [pendingMemo, setPendingMemo] = useState<{ content: string, color: string, mediaUrl?: string | null } | null>(null)
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (pendingMemo) {
                setMousePos({ x: e.clientX, y: e.clientY })
            }
        }
        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [pendingMemo])

    const handleMemoSubmit = (content: string, color: string, mediaUrl?: string | null) => {
        // If content is too long and is text (not a URL), split into multiple memos
        // BUT if we have mediaUrl, we shouldn't split because we can't duplicate the media easily/logically.
        // Also if it's mixed content, we treat it as a single memo for now.

        const isUrl = content.trim().startsWith('http')

        if (!mediaUrl && !isUrl && content.length > 150) {
            // Split into chunks of 120 characters (Only for text-only memos)
            const chunks: string[] = []
            let remainingText = content

            while (remainingText.length > 0) {
                if (remainingText.length <= 120) {
                    chunks.push(remainingText)
                    break
                }

                // Find last space before 120 chars
                let splitIndex = 120
                const lastSpace = remainingText.lastIndexOf(' ', 120)
                if (lastSpace > 80) { // Don't split too early
                    splitIndex = lastSpace
                }

                chunks.push(remainingText.slice(0, splitIndex).trim())
                remainingText = remainingText.slice(splitIndex).trim()
            }

            // Create multiple memos with slight position offset
            chunks.forEach((chunk, index) => {
                setTimeout(() => {
                    setPendingMemo({
                        content: `${chunk}${index < chunks.length - 1 ? '...' : ''}`,
                        color,
                        mediaUrl: null
                    })
                }, index * 500) // Delay each memo by 500ms
            })
        } else {
            // Single memo (Text, Media, or Both)
            setPendingMemo({ content, color, mediaUrl })
        }
    }

    const handleBoardClick = async (e: React.MouseEvent) => {
        if (!pendingMemo) return

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            alert('로그인이 필요합니다.')
            return
        }

        // Adjust position to center the memo on cursor
        const x = e.clientX - 100
        const y = e.clientY - 100

        // If in storage (private board), save permanently. Otherwise 24h expiration.
        const isStorage = boardName === '나의 게시판'
        const expiresAt = isStorage
            ? new Date('9999-12-31').toISOString()
            : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

        const { error } = await supabase.from('memos').insert({
            board_id: boardId,
            user_id: user.id,
            content: pendingMemo.content,
            color: pendingMemo.color,
            position_x: x,
            position_y: y,
            rotation: (Math.random() * 4) - 2,
            expires_at: expiresAt,
            media_url: pendingMemo.mediaUrl
        })

        if (error) {
            console.error('Memo insert error:', error)
            alert('메모 작성 실패')
        }

        setPendingMemo(null)
    }

    return (
        <div onClick={handleBoardClick} className={pendingMemo ? 'cursor-crosshair' : ''}>
            <CorkBoard>
                <BoardHeader name={boardName} />
                <AnimatePresence mode='popLayout'>
                    {memos.map((memo) => (
                        <MemoCard key={memo.id} memo={memo} />
                    ))}
                </AnimatePresence>

                {/* Ghost Memo for Placement */}
                {pendingMemo && (
                    <div
                        className={`fixed pointer-events-none w-48 h-48 p-6 shadow-2xl flex items-center justify-center text-center font-handwriting text-2xl z-50 opacity-80 ${pendingMemo.color === 'yellow' ? 'bg-memo-yellow' :
                            pendingMemo.color === 'pink' ? 'bg-memo-pink' :
                                pendingMemo.color === 'green' ? 'bg-memo-green' : 'bg-memo-blue'
                            }`}
                        style={{
                            left: mousePos.x - 96,
                            top: mousePos.y - 96,
                            transform: 'rotate(5deg)'
                        }}
                    >
                        {pendingMemo.mediaUrl ? (
                            <div className="w-full h-full flex flex-col">
                                <img src={pendingMemo.mediaUrl} className="flex-1 object-contain min-h-0" alt="Preview" />
                                {pendingMemo.content && <p className="text-sm truncate mt-1">{pendingMemo.content}</p>}
                            </div>
                        ) : (
                            pendingMemo.content
                        )}
                    </div>
                )}

                {!pendingMemo && <MemoEditor onSubmit={handleMemoSubmit} />}

                {/* Archive Drawer */}
                <ArchiveDrawer />
            </CorkBoard>
        </div>
    )
}
