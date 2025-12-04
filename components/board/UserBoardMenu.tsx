'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { User, ChevronRight, Plus, X, LogOut } from 'lucide-react'

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

        const { data, error } = await supabase
            .from('boards')
            .select('*')
            .or(`type.eq.common,is_public.eq.true,created_by.eq.${user.id}`)
            .order('created_at', { ascending: false })

        if (!error && data) {
            setBoards(data)
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    const getBoardIcon = (board: Board) => {
        if (board.type === 'common') return '🟢'
        if (board.is_public) return '🟡'
        return '🔵'
    }

    return (
        <>
            {/* Toggle Button (Bottom Right) */}
            <motion.button
                onClick={() => setIsOpen(true)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="fixed bottom-6 right-6 z-40 w-16 h-16 rounded-full bg-wood text-white shadow-2xl flex items-center justify-center hover:bg-wood-dark transition-colors border-4 border-white"
            >
                <User size={28} />
            </motion.button>

            {/* Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black z-50"
                        />

                        {/* Right Sidebar Drawer */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-80 bg-[#fdfbf7] shadow-2xl z-50 flex flex-col border-l-4 border-wood"
                        >
                            {/* Header */}
                            <div className="p-6 bg-wood text-white flex justify-between items-center shadow-md">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="bg-white/20 p-2 rounded-full">
                                        <User size={24} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-lg truncate">내 프로필</p>
                                        <p className="text-xs text-white/80 truncate">{userEmail}</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Board List */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">내 게시판 목록</h3>

                                {boards.map((board) => (
                                    <button
                                        key={board.id}
                                        onClick={() => {
                                            router.push(`/board/${board.id}`)
                                            setIsOpen(false)
                                        }}
                                        className="w-full p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 flex items-center gap-3 text-left group"
                                    >
                                        <span className="text-2xl group-hover:scale-110 transition-transform">{getBoardIcon(board)}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-gray-800 truncate group-hover:text-wood transition-colors">{board.name}</div>
                                            {board.description && (
                                                <div className="text-xs text-gray-500 truncate">{board.description}</div>
                                            )}
                                        </div>
                                        <ChevronRight size={16} className="text-gray-300 group-hover:text-wood" />
                                    </button>
                                ))}
                            </div>

                            {/* Footer Actions */}
                            <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-3">
                                <button
                                    onClick={() => {
                                        router.push('/boards/create')
                                        setIsOpen(false)
                                    }}
                                    className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold shadow-md flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Plus size={20} />
                                    새 게시판 만들기
                                </button>

                                <button
                                    onClick={handleLogout}
                                    className="w-full py-3 bg-white border-2 border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                                >
                                    <LogOut size={18} />
                                    로그아웃
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}

