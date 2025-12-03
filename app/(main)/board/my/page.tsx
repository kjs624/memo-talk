import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import RealtimeBoard from '@/components/board/RealtimeBoard'

export default async function MyArchivePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login?error=' + encodeURIComponent('로그인이 필요한 서비스입니다.'))
    }

    // 1. Find existing private board
    let { data: board } = await supabase
        .from('boards')
        .select('*')
        .eq('type', 'private')
        .eq('created_by', user.id)
        .single()

    // 2. If not exists, create one
    if (!board) {
        const { data: newBoard, error } = await supabase
            .from('boards')
            .insert({
                name: '나의 게시판',
                type: 'private',
                created_by: user.id
            })
            .select()
            .single()

        if (error) {
            console.error('Failed to create archive board:', error)
            throw new Error('보관함을 생성할 수 없습니다.')
        }
        board = newBoard
    }

    // 3. Fetch initial memos
    const { data: initialMemos } = await supabase
        .from('memos')
        .select('*')
        .eq('board_id', board.id)
        .order('created_at', { ascending: true })

    return (
        <RealtimeBoard
            boardId={board.id}
            initialMemos={initialMemos || []}
            boardName="나의 게시판"
        />
    )
}
