import Navbar from '@/components/Navbar'
import './globals.css'
import KakaoChatButton from '@/components/KakaoChatButton'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-black-50" suppressHydrationWarning>
        <Navbar />
        {children}
        <KakaoChatButton />
      </body>
    </html>
  )
}