'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { User, ChevronUp, Plus } from 'lucide-react'

interface Board {
    id: string
    name: string
    type: string
    is_public: boolean
    description: string
}

export default function UserBoardMenu() {
    const [isOpen, setIsOpen] = useState(false)
    const [boards, setBoards] = useState<Board[]>([])
    const [userEmail, setUserEmail] = useState('')
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        fetchUserAndBoards()
    }, [])

    const fetchUserAndBoards = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        setUserEmail(user.email || '')

        // Fetch boards: common + public + my private boards
        const { data, error } = await supabase
            .from('boards')
            .select('*')
            .or(`type.eq.common,is_public.eq.true,created_by.eq.${user.id}`)
            .order('created_at', { ascending: false })

        if (!error && data) {
            setBoards(data)
        }
    }

    const getBoardColor = (board: Board) => {
        if (board.type === 'common') return 'bg-green-500'
        if (board.is_public) return 'bg-yellow-500'
        return 'bg-blue-500'
    }

    const getBoardIcon = (board: Board) => {
        if (board.type === 'common') return '🟢'
        if (board.is_public) return '🟡'
        return '🔵'
    }

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute bottom-20 right-0 w-72 bg-white rounded-lg shadow-2xl border-2 border-wood overflow-hidden"
                    >
                        {/* User Info */}
                        <div className="bg-wood text-white px-4 py-3">
                            <div className="flex items-center gap-2">
                                <User size={20} />
                                <div className="flex-1 text-sm truncate">{userEmail}</div>
                            </div>
                        </div>

                        {/* Board List */}
                        <div className="max-h-96 overflow-y-auto">
                            {boards.map((board) => (
                                <button
                                    key={board.id}
                                    onClick={() => {
                                        router.push(`/board/${board.id}`)
                                        setIsOpen(false)
                                    }}
                                    className="w-full px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 text-left flex items-center gap-3"
                                >
                                    <span className="text-xl">{getBoardIcon(board)}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-sm truncate">{board.name}</div>
                                        {board.description && (
                                            <div className="text-xs text-gray-500 truncate">{board.description}</div>
                                        )}
                                    </div>
                                </button>
                            ))}

                            {/* Create New Board */}
                            <button
                                onClick={() => {
                                    router.push('/boards/create')
                                    setIsOpen(false)
                                }}
                                className="w-full px-4 py-3 hover:bg-green-50 transition-colors flex items-center gap-3 text-green-600 font-bold"
                            >
                                <Plus size={20} />
                                <span>새 게시판 만들기</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-14 h-14 rounded-full bg-wood text-white shadow-xl flex items-center justify-center hover:bg-wood-dark transition-colors"
            >
                {isOpen ? <ChevronUp size={24} /> : <User size={24} />}
            </motion.button>
        </div>
    )
}
