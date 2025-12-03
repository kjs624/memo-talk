import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import UserPanel from '@/components/ui/UserPanel'

export default async function MainLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    return (
        <div className="relative min-h-screen overflow-hidden font-sans">
            {children}
            <UserPanel user={user} />
        </div>
    )
}
