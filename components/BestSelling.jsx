'use client'
import Title from './Title'
import ProductCard from './ProductCard'
import { useProducts } from '@/lib/instantdbHooks'

const BestSelling = () => {

    const displayQuantity = 8
    const { products, isLoading } = useProducts()

    if (isLoading) {
        return <div className="px-6 my-30 max-w-6xl mx-auto"><p className="text-slate-500">Loading products...</p></div>
    }

    if (products.length === 0) {
        return <div className="px-6 my-30 max-w-6xl mx-auto"><p className="text-slate-500">No products found. Add products to your Instant DB instance.</p></div>
    }

    return (
        <div className='px-6 my-30 max-w-6xl mx-auto'>
            <Title title='Best Selling' description={`Showing ${products.length < displayQuantity ? products.length : displayQuantity} of ${products.length} products`} href='/shop' />
            <div className='mt-12  grid grid-cols-2 sm:flex flex-wrap gap-6 xl:gap-12'>
                {products.slice(0, displayQuantity).map((product, index) => (
                    <ProductCard key={index} product={product} />
                ))}
            </div>
        </div>
    )
}

export default BestSelling