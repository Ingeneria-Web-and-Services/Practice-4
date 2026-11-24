import ProductTile from '@/components/ProductTile'
import Toast from '@/components/Toast'
import { getProducts } from '@/lib/handlers'

export default async function Index({
  searchParams,
}: {
  searchParams: Promise<{ signedOut?: string }>
}) {
  const { signedOut } = await searchParams
  const data = await getProducts()

  return (
    <div className='flex flex-col'>
      {signedOut && <Toast message='You have been signed out.' />}
      <div className='grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8'>
        {data.products.map((product) => (
          <ProductTile key={product._id.toString()} product={product} />
        ))}
      </div>
    </div>
  )
}
