import { createServerClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import RealtimeBoard from '@/components/board/RealtimeBoard'

export default async function BoardPage({ params }: { params: { id: string } }) {
    const supabase = await createServerClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return notFound()
    }

    const { data: board } = await supabase
        .from('boards')
        .select('*')
        .eq('id', params.id)
        .single()

    if (!board) {
        return notFound()
    }

    // Check access: public boards or user is creator
    if (!board.is_public && board.created_by !== user.id) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-red-600 mb-4">🔒 비공개 게시판</h1>
                    <p className="text-gray-600">이 게시판에 접근할 권한이 없습니다.</p>
                </div>
            </div>
        )
    }

    const { data: memos } = await supabase
        .from('memos')
        .select('*')
        .eq('board_id', params.id)
        .order('created_at', { ascending: false })

    return <RealtimeBoard boardId={params.id} initialMemos={memos || []} boardName={board.name} />
}
