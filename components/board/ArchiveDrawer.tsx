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
                className="fixed bottom-4 left-4 z-50 bg-wood text-white p-3 rounded-full shadow-lg hover:bg-wood-dark transition-colors flex items-center gap-2 border-2 border-[#5d4037]"
            >
                <Archive size={20} />
                <span className="font-bold hidden sm:inline">나의 보관함</span>
                {isOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>

            {/* Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed bottom-0 left-0 right-0 h-72 bg-[url('/cork.webp')] shadow-[0_-4px_20px_rgba(0,0,0,0.5)] z-40 border-t-8 border-[#5d4037] flex flex-col"
                    >
                        <div className="bg-[#5d4037] text-white px-4 py-1 text-sm font-bold flex justify-between items-center">
                            <span>📦 나의 보관함 (My Board)</span>
                            <button onClick={() => setIsOpen(false)} className="hover:text-gray-300">닫기</button>
                        </div>
                        <div className="flex-1 overflow-x-auto p-6 flex items-center gap-6 scrollbar-thin scrollbar-thumb-wood scrollbar-track-transparent">
                            {loading ? (
                                <div className="text-black/50 w-full text-center font-bold">로딩 중...</div>
                            ) : memos.length === 0 ? (
                                <div className="text-black/50 w-full text-center font-bold">보관된 메모가 없습니다.</div>
                            ) : (
                                memos.map(memo => (
                                    <div key={memo.id} className="relative flex-none w-48 h-48 transform hover:-translate-y-2 transition-transform duration-300">
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
