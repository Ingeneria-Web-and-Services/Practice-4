'use client'

import { MinusIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface QuantitySelectorProps {
  userId: string
  productId: string
  qty: number
  disabled?: boolean
}

const buttonClasses =
  'rounded-md border border-red-200 bg-white p-1.5 text-gray-700 hover:bg-red-50 focus:outline-hidden focus:ring-2 focus:ring-red-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white'

/**
 * Add / remove an item or remove the product from the cart.
 */
export default function QuantitySelector({
  userId,
  productId,
  qty,
  disabled = false,
}: QuantitySelectorProps) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)
  const onPlusBtnClick = async function () {
    setIsUpdating(true)
    try {
      await fetch(`/api/users/${userId}/cart/${productId}`, {
        method: 'PUT',
        body: JSON.stringify({
          qty: qty + 1,
        }),
      })
      router.refresh()
    } finally {
      setIsUpdating(false)
    }
  }

  const onMinusBtnClick = async function () {
    setIsUpdating(true)
    try {
      if (qty - 1 <= 0) {
        // The API does not accept qty 0, so the product is removed instead
        await fetch(`/api/users/${userId}/cart/${productId}`, {
          method: 'DELETE',
        })
      } else {
        await fetch(`/api/users/${userId}/cart/${productId}`, {
          method: 'PUT',
          body: JSON.stringify({
            qty: qty - 1,
          }),
        })
      }
      router.refresh()
    } finally {
      setIsUpdating(false)
    }
  }

  const onTrashBtnClick = async function () {
    setIsUpdating(true)
    try {
      await fetch(`/api/users/${userId}/cart/${productId}`, {
        method: 'DELETE',
      })
      router.refresh()
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className='inline-flex items-center gap-2'>
      <button
        type='button'
        className={buttonClasses}
        onClick={onMinusBtnClick}
        disabled={disabled || isUpdating || qty <= 0}
        aria-label='Remove one item'
      >
        <MinusIcon className='h-4 w-4' aria-hidden='true' />
      </button>
      <span className='min-w-8 text-center text-sm font-medium text-gray-900'>
        {qty}
      </span>
      <button
        type='button'
        className={buttonClasses}
        onClick={onPlusBtnClick}
        disabled={disabled || isUpdating}
        aria-label='Add one item'
      >
        <PlusIcon className='h-4 w-4' aria-hidden='true' />
      </button>
      <button
        type='button'
        className={`${buttonClasses} text-red-700`}
        onClick={onTrashBtnClick}
        disabled={disabled || isUpdating || qty <= 0}
        aria-label='Remove product from the cart'
      >
        <TrashIcon className='h-4 w-4' aria-hidden='true' />
      </button>
    </div>
  )
}
