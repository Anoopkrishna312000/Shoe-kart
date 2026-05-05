import React from 'react'
import './styles.css'

export const metadata = {
  description: 'A Payload CMS powered sneaker store built with Next.js.',
  title: 'Kicks Crew | Sneaker Store',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}
