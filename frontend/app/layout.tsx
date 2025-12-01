import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Time-Swap Network',
  description: 'Mon premier projet Full Stack - Échange de crédits temps',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  console.log('[RootLayout] Layout rendu');
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
