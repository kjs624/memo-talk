'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function CreateBoardPage() {
    const router = useRouter()
    const supabase = createClient()
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [isPublic, setIsPublic] = useState(true)
    const [creating, setCreating] = useState(false)

    const generateInviteCode = () => {
        return Math.random().toString(36).substring(2, 10).toUpperCase()
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) {
            alert('게시판 이름을 입력해주세요.')
            return
        }

        setCreating(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            alert('로그인이 필요합니다.')
            router.push('/login')
            return
        }

        const inviteCode = isPublic ? null : generateInviteCode()

        const { data, error } = await supabase
            .from('boards')
            .insert({
                name: name.trim(),
                description: description.trim(),
                type: 'common', // or create a new type if needed
                is_public: isPublic,
                invite_code: inviteCode,
                created_by: user.id
            })
            .select()
            .single()

        if (error) {
            console.error('Board creation error:', error)
            alert('게시판 생성 실패: ' + error.message)
            setCreating(false)
            return
        }

        alert('게시판이 생성되었습니다!' + (inviteCode ? `\n초대 코드: ${inviteCode}` : ''))
        router.push('/boards')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-4 sm:p-8">
            <div className="max-w-2xl mx-auto">
                <button
                    onClick={() => router.back()}
                    className="mb-4 text-wood hover:underline"
                >
                    ← 뒤로
                </button>

                <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8">
                    <h1 className="text-3xl font-bold text-wood mb-6">🎨 새 게시판 만들기</h1>

                    <form onSubmit={handleCreate} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                게시판 이름 *
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="예: 우리반 추억 게시판"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-wood focus:outline-none"
                                maxLength={50}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                설명 (선택)
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="게시판에 대한 간단한 설명을 입력하세요"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-wood focus:outline-none"
                                rows={3}
                                maxLength={200}
                            />
                        </div>

                        <div className="border-2 border-gray-200 rounded-lg p-4">
                            <label className="block text-sm font-bold text-gray-700 mb-3">
                                공개 설정
                            </label>
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        checked={isPublic}
                                        onChange={() => setIsPublic(true)}
                                        className="w-5 h-5"
                                    />
                                    <div>
                                        <div className="font-bold">🌍 공개 게시판</div>
                                        <div className="text-sm text-gray-500">모든 사용자가 접근 가능</div>
                                    </div>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        checked={!isPublic}
                                        onChange={() => setIsPublic(false)}
                                        className="w-5 h-5"
                                    />
                                    <div>
                                        <div className="font-bold">🔒 비공개 게시판</div>
                                        <div className="text-sm text-gray-500">초대 코드가 있는 사람만 입장</div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={creating}
                            className="w-full bg-wood text-white py-4 rounded-lg font-bold text-lg hover:bg-wood-dark transition-colors disabled:opacity-50"
                        >
                            {creating ? '생성 중...' : '게시판 만들기 🚀'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
