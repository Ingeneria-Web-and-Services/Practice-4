import React from 'react'
import Link from 'next/link'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex min-h-screen flex-col'>
      <header className='w-full bg-red-950/90'>
        <div className='mx-auto flex h-24 max-w-7xl items-center justify-center px-6 sm:px-8 lg:px-10'>
          <Link
            href='/'
            className='flex shrink-0 items-center space-x-4 text-white'
          >
            <img className='block h-12 w-auto' src='/img/logo.svg' alt='DriveDeal logo'/>
            <span className='text-3xl font-bold'>DriveDeal</span>
          </Link>
        </div>
      </header>
      <main className='flex flex-1 flex-col items-center justify-center'>
        {children}
      </main>
    </div>
  )
}