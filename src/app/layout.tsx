import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PSSP — Presbitério Leste de São Paulo',
  description: 'Sistema de Gestão de Atas e Reuniões Presbiterianas',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
