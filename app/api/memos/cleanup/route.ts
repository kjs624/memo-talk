import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    // Verify authorization header for Vercel Cron
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // For development testing, you might want to allow it or use a different check
        // return new Response('Unauthorized', { status: 401 });
    }

    const supabase = await createClient()

    try {
        const { error } = await supabase
            .from('memos')
            .delete()
            .lt('expires_at', new Date().toISOString())

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Cleanup error:', error)
        return NextResponse.json({ error: 'Failed to cleanup memos' }, { status: 500 })
    }
}
