'use server'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Papel } from '@/types/database'

export async function criarUsuario(formData: FormData) {
  const email = (formData.get('email') as string).trim()
  const nome = (formData.get('nome') as string).trim()
  const senha = (formData.get('senha') as string).trim()
  const papel = formData.get('papel') as Papel
  const igreja_id = (formData.get('igreja_id') as string) || null

  const admin = createAdminClient()

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
    user_metadata: { nome },
  })
  if (error) return { error: error.message }

  const { error: perfErr } = await admin
    .from('perfis')
    .update({ nome, papel, igreja_id, ativo: true })
    .eq('id', data.user.id)

  if (perfErr) return { error: perfErr.message }

  revalidatePath('/usuarios')
  return { ok: true }
}

export async function atualizarPapel(userId: string, papel: Papel) {
  const admin = createAdminClient()
  const { error } = await admin.from('perfis').update({ papel }).eq('id', userId)
  if (error) return { error: error.message }
  revalidatePath('/usuarios')
  return { ok: true }
}

export async function atualizarIgreja(userId: string, igreja_id: string | null) {
  const admin = createAdminClient()
  const { error } = await admin.from('perfis').update({ igreja_id }).eq('id', userId)
  if (error) return { error: error.message }
  revalidatePath('/usuarios')
  return { ok: true }
}

export async function toggleAtivo(userId: string, ativo: boolean) {
  const admin = createAdminClient()
  const { error } = await admin.from('perfis').update({ ativo }).eq('id', userId)
  if (error) return { error: error.message }
  revalidatePath('/usuarios')
  return { ok: true }
}
