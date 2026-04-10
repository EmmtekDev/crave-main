'use client'
import React from 'react'
import Title from './Title'
import ProductCard from './ProductCard'
import { useProducts } from '@/lib/instantdbHooks'

const LatestProducts = () => {

    const displayQuantity = 4
    const { products, isLoading } = useProducts()

    if (isLoading) {
        return <div className="px-6 my-30 max-w-6xl mx-auto"><p className="text-slate-500">Loading products...</p></div>
    }

    if (products.length === 0) {
        return null
    }

    return (
        <div className='px-6 my-30 max-w-6xl mx-auto'>
            <Title title='Latest Products' description={`Showing ${products.length < displayQuantity ? products.length : displayQuantity} of ${products.length} products`} href='/shop' />
            <div className='mt-12 grid grid-cols-2 sm:flex flex-wrap gap-6 justify-between'>
                {products.slice(0, displayQuantity).map((product, index) => (
                    <ProductCard key={index} product={product} />
                ))}
            </div>
        </div>
    )
}

export default LatestProducts