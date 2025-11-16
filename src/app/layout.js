import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import localFont from "next/font/local"
import { Quicksand } from 'next/font/google'

const quicksand = Quicksand({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'], // choose the weights you need
  variable: '--font-quicksand' // optional but recommended
})


const myFont = localFont({
  src: "./fonts/fields-display.otf",
variable: "--font-fields-display",
display: "swap",
})

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "LifeLong",
  description: "Your treasured moments, beautifully preserved.",
  icons: {
    icon: '/notebook.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased ${myFont.variable} ${quicksand.variable} h-full`}
      >
        {children}
      </body>
    </html>
  );
}
