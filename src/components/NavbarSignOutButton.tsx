'use client'

import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { navbarButtonClasses } from '@/components/NavbarButton'

interface NavbarSignOutButtonProps {
  children: ReactNode
}

export default function NavbarSignOutButton({
  children,
}: NavbarSignOutButtonProps) {
  const router = useRouter()

  const handleClick = async function () {
    await fetch('/api/auth/signout', {
      method: 'POST',
    })
    router.push('/')
    router.refresh()
  }

  return (
    <button
      type='button'
      onClick={handleClick}
      className={navbarButtonClasses}
    >
      {children}
    </button>
  )
}