'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

interface CheckOutFormProps {
  userId: string
}

interface FormValues {
  address: string
  cardHolder: string
  cardNumber: string
}

const inputClasses =
  'peer mt-1 block w-full rounded-md border border-red-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-red-700 focus:outline-hidden focus:ring-1 focus:ring-gray-800 invalid:[&:not(:placeholder-shown):not(:focus)]:border-red-500'
const labelClasses = 'block text-sm font-medium text-gray-700'
const fieldErrorClasses =
  'mt-1 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):not(:focus):invalid]:block'

export default function CheckOutForm({ userId }: CheckOutFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formValues, setFormValues] = useState<FormValues>({
    address: '',
    cardHolder: '',
    cardNumber: '',
  })

  const handleSubmit = async function (
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()
    if (!event.currentTarget.checkValidity()) {
      return false
    }

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/users/${userId}/orders`, {
        method: 'POST',
        body: JSON.stringify({
          ...formValues,
        }),
      })
      if (res.ok) {
        const order: { _id: string } = await res.json()
        setError('')
        router.push(`/orders/${order._id}`)
        router.refresh()
      } else {
        const data = await res.json()
        setError(
          data.message ??
            'An error occurred while processing your request. Please try again later.'
        )
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className='group mt-8 space-y-4'
    >
      <div>
        <label htmlFor='address' className={labelClasses}>
          Shipping address
        </label>
        <input
          id='address'
          name='address'
          type='text'
          required
          autoComplete='street-address'
          placeholder='Unnamed Street 123, 12345 London, UK'
          className={inputClasses}
          value={formValues.address}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormValues((prevFormValues) => ({
              ...prevFormValues,
              address: e.target.value,
            }))
          }
        />
        <p className={fieldErrorClasses}>Please input the shipping address.</p>
      </div>

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <div>
          <label htmlFor='cardHolder' className={labelClasses}>
            Card holder
          </label>
          <input
            id='cardHolder'
            name='cardHolder'
            type='text'
            required
            autoComplete='cc-name'
            placeholder='John Doe'
            className={inputClasses}
            value={formValues.cardHolder}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormValues((prevFormValues) => ({
                ...prevFormValues,
                cardHolder: e.target.value,
              }))
            }
          />
          <p className={fieldErrorClasses}>Please input the card holder.</p>
        </div>
        <div>
          <label htmlFor='cardNumber' className={labelClasses}>
            Card number
          </label>
          <input
            id='cardNumber'
            name='cardNumber'
            type='text'
            inputMode='numeric'
            required
            pattern='[0-9 ]{13,23}'
            placeholder='0000 0000 0000 0000'
            autoComplete='cc-number'
            className={inputClasses}
            value={formValues.cardNumber}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormValues((prevFormValues) => ({
                ...prevFormValues,
                cardNumber: e.target.value,
              }))
            }
          />
          <p className={fieldErrorClasses}>
            Please input a valid card number (13-23 digits).
          </p>
        </div>
      </div>

      <div className={error ? '' : 'hidden'}>
        <p className='rounded-md bg-red-500/30 px-3 py-1.5 text-sm text-gray-900 ring-1 ring-inset ring-red-500'>
          {error}
        </p>
      </div>

      <div className='flex justify-center pt-2'>
        <button
          type='submit'
          disabled={isSubmitting}
          className='rounded-md bg-red-700 px-6 py-2 text-sm font-medium text-white hover:bg-red-800 focus:ring-2 focus:ring-red-700 focus:ring-offset-2 focus:outline-hidden disabled:opacity-50 group-invalid:pointer-events-none group-invalid:opacity-30'
        >
          {isSubmitting ? 'Processing…' : 'Purchase'}
        </button>
      </div>
    </form>
  )
}