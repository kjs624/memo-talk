'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Memo } from '@/types/memo.types'
import MemoCard from '../memo/MemoCard'
import { motion, AnimatePresence } from 'framer-motion'
import { Archive, ChevronDown, ChevronUp } from 'lucide-react'

export default function ArchiveDrawer() {
    const [isOpen, setIsOpen] = useState(false)
    const [memos, setMemos] = useState<Memo[]>([])
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        if (isOpen) {
            fetchArchivedMemos()
        }
    }, [isOpen])

    const fetchArchivedMemos = async () => {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            setLoading(false)
            return
        }

        // Get private board
        const { data: board } = await supabase
            .from('boards')
            .select('id')
            .eq('type', 'private')
            .eq('created_by', user.id)
            .single()

        if (board) {
            const { data: archivedMemos } = await supabase
                .from('memos')
                .select('*')
                .eq('board_id', board.id)
                .order('created_at', { ascending: false })

            if (archivedMemos) {
                setMemos(archivedMemos)
            }
        }
        setLoading(false)
    }

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-4 left-4 z-50 bg-wood text-white p-2 sm:p-3 rounded-full shadow-lg hover:bg-wood-dark transition-colors flex items-center gap-2 border-2 border-[#5d4037] text-sm sm:text-base"
            >
                <Archive size={18} className="sm:w-5 sm:h-5" />
                <span className="font-bold hidden sm:inline">나의 보관함</span>
                {isOpen ? <ChevronDown size={14} className="sm:w-4 sm:h-4" /> : <ChevronUp size={14} className="sm:w-4 sm:h-4" />}
            </button>

            {/* Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        drag="y"
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={0.2}
                        onDragEnd={(e, info) => {
                            if (info.offset.y > 100) setIsOpen(false)
                        }}
                        className="fixed bottom-0 left-0 right-0 h-64 sm:h-72 bg-[url('/cork.webp')] shadow-[0_-4px_20px_rgba(0,0,0,0.5)] z-40 border-t-8 border-[#5d4037] flex flex-col touch-none"
                    >
                        <div className="bg-[#5d4037] text-white px-4 py-2 text-xs sm:text-sm font-bold flex justify-between items-center cursor-grab active:cursor-grabbing">
                            <span>📦 나의 보관함 (My Board)</span>
                            <button onClick={() => setIsOpen(false)} className="hover:text-gray-300 px-2 py-1">닫기</button>
                        </div>
                        <div className="flex-1 overflow-x-auto p-4 sm:p-6 flex items-center gap-4 sm:gap-6 scrollbar-thin scrollbar-thumb-wood scrollbar-track-transparent">
                            {loading ? (
                                <div className="text-black/50 w-full text-center font-bold text-sm">로딩 중...</div>
                            ) : memos.length === 0 ? (
                                <div className="text-black/50 w-full text-center font-bold text-sm">보관된 메모가 없습니다.</div>
                            ) : (
                                memos.map(memo => (
                                    <div key={memo.id} className="relative flex-none w-36 h-36 sm:w-48 sm:h-48 transform hover:-translate-y-2 transition-transform duration-300">
                                        <MemoCard memo={memo} isStatic={true} />
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
