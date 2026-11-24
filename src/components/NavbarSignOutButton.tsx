'use client'

import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { navbarButtonClasses } from '@/components/NavbarButton'

interface NavbarSignOutButtonProps {
  children: ReactNode
  className?: string
}

export default function NavbarSignOutButton({
  children,
  className = navbarButtonClasses,
}: NavbarSignOutButtonProps) {
  const router = useRouter()

  const handleClick = async function () {
    await fetch('/api/auth/signout', {
      method: 'POST',
    })
    router.push('/?signedOut=1')
    router.refresh()
  }

  return (
    <button
      type='button'
      onClick={handleClick}
      className={className}
    >
      {children}
    </button>
  )
}