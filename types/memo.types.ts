export type MemoColor = 'yellow' | 'pink' | 'green' | 'blue'

export interface Memo {
    id: string
    board_id: string
    user_id: string
    content: string
    color: MemoColor
    position_x: number
    position_y: number
    rotation: number
    expires_at: string
    created_at: string
    media_url?: string | null
}
