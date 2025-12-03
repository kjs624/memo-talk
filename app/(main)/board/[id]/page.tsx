import { createClient } from '@/lib/supabase/server'
import RealtimeBoard from '@/components/board/RealtimeBoard'
import BoardHeader from '@/components/board/BoardHeader'
import { Memo } from '@/types/memo.types'

export default async function BoardPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    let boardId = id
    let boardName = 'Board'

    if (id === 'common') {
        const { data: board } = await supabase.from('boards').select('id, name').eq('type', 'common').single()
        if (board) {
            boardId = board.id
            boardName = board.name || 'Common Board'
        }
    }

    const { data: initialMemos } = await supabase
        .from('memos')
        .select('*')
        .eq('board_id', boardId)

    return (
        <RealtimeBoard
            boardId={boardId}
            initialMemos={(initialMemos as Memo[]) || []}
            boardName={boardName}
        />
    )
}
