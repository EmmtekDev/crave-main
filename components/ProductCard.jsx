'use client'
import { StarIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { useRouter } from 'next/navigation'

const ProductCard = ({ product }) => {

    const router = useRouter()
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'
    const shippingEstimate = parseInt(process.env.NEXT_PUBLIC_DISPATCH_START || '2200', 10)

    // calculate the average rating of the product (guard against undefined)
    const ratingsArray = Array.isArray(product?.rating) ? product.rating : []
    const rating = ratingsArray.length
        ? Math.round(ratingsArray.reduce((acc, curr) => acc + (curr?.rating || 0), 0) / ratingsArray.length)
        : 0

    const openProduct = (anchor = '') => {
        router.push(`/product/${product.id}${anchor ? `#${anchor}` : ''}`)
    }

    return (
        <div className='group max-xl:mx-auto'>
            <Link href={`/product/${product.id}`} className='block'>
                <div className='bg-[#F5F5F5] h-40 sm:w-60 sm:h-68 rounded-lg flex items-center justify-center'>
                    {product?.images && product.images.length > 0 ? (
                        <Image width={500} height={500} className='max-h-30 sm:max-h-40 w-auto group-hover:scale-115 transition duration-300' src={product.images[0]} alt={product.name || 'product image'} />
                    ) : (
                        <div className='w-full h-full flex items-center justify-center text-sm text-slate-500'>No image</div>
                    )}
                </div>
            </Link>

            <div className='flex justify-between gap-3 text-sm text-slate-800 pt-2 max-w-60 items-start'>
                <div className='flex-1'>
                    <p className='font-medium'>{product.name}</p>
                    <div className='flex items-center gap-2 mt-1'>
                        <div className='flex'>
                            {Array(5).fill('').map((_, index) => (
                                <button key={index} onClick={() => openProduct('reviews')} aria-label={`View reviews for ${product.name}`}>
                                    <StarIcon size={14} className='text-transparent mt-0.5' fill={rating >= index + 1 ? "#00C950" : "#D1D5DB"} />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className='mt-2'>
                        <button onClick={() => openProduct()} className='text-xs text-orange-600 hover:underline'>See full details</button>
                    </div>
                </div>

                <div className='text-right'>
                    <p className='text-lg font-semibold'>{currency}{((product?.price || 0) / 100).toLocaleString()}</p>
                    <p className='text-xs text-slate-500 mt-1'>Delivery from {currency}{(shippingEstimate).toLocaleString()}</p>
                </div>
            </div>
        </div>
    )
}

export default ProductCard