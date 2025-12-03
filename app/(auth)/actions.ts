'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    console.log('🔐 Login attempt for:', data.email)
    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        console.error('❌ Login error:', error.message)
        console.error('Full error:', JSON.stringify(error, null, 2))
        redirect(`/login?error=${encodeURIComponent('이메일 또는 비밀번호가 올바르지 않습니다')}`)
    }

    console.log('✅ Login successful for:', data.email)
    revalidatePath('/', 'layout')
    redirect('/board/common')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    console.log('📝 Signup attempt for:', data.email)
    const { error, data: signupData } = await supabase.auth.signUp(data)

    if (error) {
        console.error('❌ Signup error:', error.message)
        console.error('Full error:', JSON.stringify(error, null, 2))
        redirect(`/signup?error=${encodeURIComponent('회원가입에 실패했습니다. 이미 사용 중인 이메일이거나 비밀번호가 너무 짧습니다')}`)
    }

    console.log('✅ Signup successful:', signupData)
    console.log('User needs email confirmation:', signupData.user?.identities?.length === 0)

    revalidatePath('/', 'layout')
    redirect('/board/common')
}
