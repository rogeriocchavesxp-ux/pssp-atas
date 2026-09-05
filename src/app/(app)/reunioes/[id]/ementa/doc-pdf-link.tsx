'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function DocPdfLink({ path }: { path: string }) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function abrir() {
    setLoading(true)
    const { data } = await supabase.storage
      .from('documentos')
      .createSignedUrl(path, 300) // 5 minutos
    setLoading(false)
    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank')
    }
  }

  return (
    <button
      onClick={abrir}
      disabled={loading}
      className="text-xs font-medium px-2 py-1 rounded border text-blue-600 border-blue-200 hover:bg-blue-50 disabled:opacity-50"
    >
      {loading ? '...' : '📄 PDF'}
    </button>
  )
}
