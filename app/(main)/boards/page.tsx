'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Plus, Lock, Globe } from 'lucide-react'

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
            .or(`is_public.eq.true,created_by.eq.${user.id}`)
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

        // Navigate to the board
        router.push(`/board/${data.id}`)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-4 sm:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-wood">📋 게시판 목록</h1>
                    <Link
                        href="/boards/create"
                        className="bg-wood text-white px-6 py-3 rounded-lg font-bold hover:bg-wood-dark transition-colors flex items-center gap-2"
                    >
                        <Plus size={20} />
                        새 게시판
                    </Link>
                </div>

                {/* Join with invite code */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-bold mb-4">🔑 초대 코드로 입장</h2>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value)}
                            placeholder="초대 코드 입력 (예: AB12CD34)"
                            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-wood focus:outline-none uppercase"
                            maxLength={8}
                        />
                        <button
                            onClick={handleJoinWithCode}
                            disabled={joining}
                            className="bg-wood text-white px-6 py-3 rounded-lg font-bold hover:bg-wood-dark transition-colors disabled:opacity-50"
                        >
                            {joining ? '확인 중...' : '입장'}
                        </button>
                    </div>
                </div>

                {/* Boards list */}
                {loading ? (
                    <div className="text-center text-gray-500 py-20">로딩 중...</div>
                ) : boards.length === 0 ? (
                    <div className="text-center text-gray-500 py-20">
                        <p className="text-xl mb-4">아직 게시판이 없습니다.</p>
                        <Link href="/boards/create" className="text-wood hover:underline font-bold">
                            첫 게시판을 만들어보세요!
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {boards.map((board) => (
                            <Link
                                key={board.id}
                                href={`/board/${board.id}`}
                                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 cursor-pointer border-2 border-transparent hover:border-wood"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="text-xl font-bold text-wood line-clamp-1">{board.name}</h3>
                                    {board.is_public ? (
                                        <Globe size={20} className="text-green-500 flex-shrink-0" />
                                    ) : (
                                        <Lock size={20} className="text-orange-500 flex-shrink-0" />
                                    )}
                                </div>
                                <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                                    {board.description || '설명이 없습니다.'}
                                </p>
                                <div className="text-xs text-gray-400">
                                    {new Date(board.created_at).toLocaleDateString('ko-KR')}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
