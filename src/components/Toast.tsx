'use client'

import { useEffect, useState } from 'react'
import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface ToastProps {
  message: string
}

export default function Toast({ message }: ToastProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    // Remove ?signedOut=1 from the URL so the message is not shown again on refresh
    window.history.replaceState(null, '', window.location.pathname)

    // Hide the message after 4 seconds
    const timer = setTimeout(() => setVisible(false), 4000)
    return () => clearTimeout(timer)
  }, [])

  if (!visible) {
    return null
  }

  return (
    <div
      role='status'
      className='fixed right-4 top-20 z-50 flex items-center gap-3 rounded-md bg-white px-4 py-3 text-sm text-gray-900 shadow-lg ring-1 ring-gray-200'
    >
      <CheckCircleIcon className='h-5 w-5 text-green-600' aria-hidden='true' />
      <span>{message}</span>
      <button
        type='button'
        onClick={() => setVisible(false)}
        className='rounded-md p-1 text-gray-400 hover:text-gray-600'
      >
        <span className='sr-only'>Close</span>
        <XMarkIcon className='h-4 w-4' aria-hidden='true' />
      </button>
    </div>
  )
}