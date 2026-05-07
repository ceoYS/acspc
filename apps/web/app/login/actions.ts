'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signUp(formData: FormData) {
  const email = formData.get('email')
  const password = formData.get('password')
  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
    redirect('/login?error=' + encodeURIComponent('email/password required'))
  }
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) {
    redirect('/login?error=' + encodeURIComponent(error.message))
  }
  if (!data.session) {
    redirect('/login?error=' + encodeURIComponent('Sign up succeeded but session missing — check Supabase Confirm email policy'))
  }
  revalidatePath('/login', 'layout')
  redirect('/login')
}

export async function signIn(formData: FormData) {
  const email = formData.get('email')
  const password = formData.get('password')
  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
    redirect('/login?error=' + encodeURIComponent('email/password required'))
  }
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    redirect('/login?error=' + encodeURIComponent(error.message))
  }
  revalidatePath('/login', 'layout')
  redirect('/login')
}

export async function signOut() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()
  if (error) {
    redirect('/login?error=' + encodeURIComponent(error.message))
  }
  revalidatePath('/login', 'layout')
  redirect('/login')
}

export async function createProject(formData: FormData) {
  const name = formData.get('name')
  if (typeof name !== 'string' || !name.trim()) {
    redirect('/login?error=' + encodeURIComponent('Project name required'))
  }
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect('/login?error=' + encodeURIComponent('Not authenticated'))
  }
  const { error } = await supabase.from('projects').insert({ name: name.trim(), user_id: user.id })
  if (error) {
    redirect('/login?error=' + encodeURIComponent(error.message))
  }
  revalidatePath('/login', 'layout')
  redirect('/login')
}
