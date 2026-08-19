import './globals.css'
import { Providers } from './providers'

export const metadata = {
  title: 'Idaguttu Lokesh — AI & Data Science Engineer',
  description: 'A 3D interactive portfolio of Idaguttu Lokesh — AI & Data Science engineer building intelligent full-stack systems.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script dangerouslySetInnerHTML={{__html:'window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);'}} />
      </head>
      <body className="bg-black text-white antialiased overflow-x-hidden">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
