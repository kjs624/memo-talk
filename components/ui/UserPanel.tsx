'use client'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function UserPanel({ user }: { user: User }) {
    const supabase = createClient()
    const router = useRouter()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-4 rounded-lg bg-white p-4 shadow-memo border-2 border-wood">
            <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-700">{user.email}</span>
            </div>
            <button
                onClick={handleLogout}
                className="rounded bg-gray-200 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-300 transition-colors"
            >
                로그아웃
            </button>
        </div>
    )
}
