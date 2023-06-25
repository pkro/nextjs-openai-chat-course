import './globals.css'
import {Chat} from '@/components/Chat'
import {Provider} from "@radix-ui/react-direction";
import {Providers} from "@/components/Providers";
// main website font

export const metadata = {
    title: 'Bookbuddy',
    description: 'Bookbuddy is a social network for book lovers.',
}

export default function RootLayout({children}: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <Providers>
            <body className={'font-arial'}>
            <Chat/>
            {children}
            </body>
        </Providers>
        </html>
    )
}
