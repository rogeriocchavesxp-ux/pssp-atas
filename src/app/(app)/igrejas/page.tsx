import { createClient } from '@/lib/supabase/server'
import type { Igreja } from '@/types/database'
import { IgrejasClient } from './igrejas-client'

export default async function IgrejasPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('igrejas').select('*').order('nome')
  return <IgrejasClient igrejas={(data ?? []) as Igreja[]} />
}
