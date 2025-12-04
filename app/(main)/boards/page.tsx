'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Plus, Lock, Globe, Users } from 'lucide-react'
import CorkBoard from '@/components/board/CorkBoard'
import UserBoardMenu from '@/components/board/UserBoardMenu'
import { motion } from 'framer-motion'

interface Board {
    id: string
    name: string
    description: string
    type: string
    is_public: boolean
    created_by: string
    created_at: string
}

export default function BoardsPage() {
    const router = useRouter()
    const supabase = createClient()
    const [boards, setBoards] = useState<Board[]>([])
    const [loading, setLoading] = useState(true)
    const [inviteCode, setInviteCode] = useState('')
    const [joining, setJoining] = useState(false)

    useEffect(() => {
        fetchBoards()
    }, [])

    const fetchBoards = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            router.push('/login')
            return
        }

        // Fetch public boards + boards I created + boards I'm invited to
        const { data, error } = await supabase
            .from('boards')
            .select('*')
            .or(`is_public.eq.true,created_by.eq.${user.id},type.eq.common`)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Fetch error:', error)
        } else {
            setBoards(data || [])
        }
        setLoading(false)
    }

    const handleJoinWithCode = async () => {
        if (!inviteCode.trim()) {
            alert('초대 코드를 입력해주세요.')
            return
        }

        setJoining(true)
        const { data, error } = await supabase
            .from('boards')
            .select('*')
            .eq('invite_code', inviteCode.trim().toUpperCase())
            .single()

        if (error || !data) {
            alert('잘못된 초대 코드입니다.')
            setJoining(false)
            return
        }

        router.push(`/board/${data.id}`)
    }

    const getBoardColor = (board: Board) => {
        if (board.type === 'common') return 'bg-green-100 border-green-300'
        if (board.is_public) return 'bg-yellow-100 border-yellow-300'
        return 'bg-blue-100 border-blue-300'
    }

    const getBoardIcon = (board: Board) => {
        if (board.type === 'common') return <Users className="text-green-600" />
        if (board.is_public) return <Globe className="text-yellow-600" />
        return <Lock className="text-blue-600" />
    }

    return (
        <CorkBoard>
            <div className="min-h-screen p-4 sm:p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-between items-center mb-8 bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg">
                        <h1 className="text-3xl font-bold text-wood flex items-center gap-2">
                            📋 게시판 목록
                        </h1>
                        <Link
                            href="/boards/create"
                            className="bg-wood text-white px-6 py-3 rounded-lg font-bold hover:bg-wood-dark transition-colors flex items-center gap-2 shadow-md"
                        >
                            <Plus size={20} />
                            새 게시판
                        </Link>
                    </div>

                    {/* Join with invite code */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8 border-2 border-wood/20">
                        <h2 className="text-xl font-bold mb-4 text-wood-dark flex items-center gap-2">
                            🔑 초대 코드로 입장
                        </h2>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={inviteCode}
                                onChange={(e) => setInviteCode(e.target.value)}
                                placeholder="초대 코드 입력 (예: AB12CD34)"
                                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-wood focus:outline-none uppercase font-mono text-lg"
                                maxLength={8}
                            />
                            <button
                                onClick={handleJoinWithCode}
                                disabled={joining}
                                className="bg-wood text-white px-6 py-3 rounded-lg font-bold hover:bg-wood-dark transition-colors disabled:opacity-50 shadow-md"
                            >
                                {joining ? '확인 중...' : '입장'}
                            </button>
                        </div>
                    </div>

                    {/* Boards list */}
                    {loading ? (
                        <div className="text-center text-white font-bold text-2xl py-20 drop-shadow-md">로딩 중...</div>
                    ) : boards.length === 0 ? (
                        <div className="text-center bg-white/80 p-10 rounded-xl shadow-lg">
                            <p className="text-xl mb-4 text-gray-600">아직 게시판이 없습니다.</p>
                            <Link href="/boards/create" className="text-wood hover:underline font-bold text-lg">
                                첫 게시판을 만들어보세요!
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {boards.map((board, index) => (
                                <motion.div
                                    key={board.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Link
                                        href={`/board/${board.id}`}
                                        className={`block h-full rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 p-6 cursor-pointer border-b-4 ${getBoardColor(board)} relative overflow-hidden group`}
                                    >
                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                            {getBoardIcon(board)}
                                        </div>

                                        <div className="flex items-start justify-between mb-3 relative z-10">
                                            <h3 className="text-xl font-bold text-gray-800 line-clamp-1">{board.name}</h3>
                                            <div className="bg-white/50 p-2 rounded-full shadow-sm">
                                                {getBoardIcon(board)}
                                            </div>
                                        </div>

                                        <p className="text-gray-700 line-clamp-3 mb-4 min-h-[3rem] relative z-10 font-medium">
                                            {board.description || '설명이 없습니다.'}
                                        </p>

                                        <div className="text-xs text-gray-500 font-mono relative z-10 flex justify-between items-end mt-auto">
                                            <span>{new Date(board.created_at).toLocaleDateString('ko-KR')}</span>
                                            <span className="bg-white/50 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                                                {board.type === 'common' ? 'COMMON' : board.is_public ? 'PUBLIC' : 'PRIVATE'}
                                            </span>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <UserBoardMenu />
        </CorkBoard>
    )
}
