 'use client'

import { Star } from 'lucide-react';
import React, { useState } from 'react'
import { XIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import db from '@/lib/instantdb'
import { id } from '@instantdb/react'
import { useDispatch } from 'react-redux'
import { addRating } from '@/lib/features/rating/ratingSlice'

const RatingModal = ({ ratingModal, setRatingModal }) => {

    const dispatch = useDispatch()
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async () => {
        if (rating <= 0 || rating > 5) {
            return toast.error('Please select a rating')
        }

        setSubmitting(true)

        try {
            const payload = {
                orderId: ratingModal?.orderId || null,
                productId: ratingModal?.productId || null,
                rating,
                review,
                createdAt: new Date().toISOString(),
            }

            await db.transact(db.tx.ratings[id()].update(payload))

            // Optimistically add to Redux store for immediate UI update
            dispatch(addRating(payload))

            toast.success('Thanks for your rating')
            setRatingModal(null)
        } catch (err) {
            console.error('Failed to save rating', err)
            toast.error('Failed to submit rating. Try again.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className='fixed inset-0 z-120 flex items-center justify-center bg-black/10'>
            <div className='bg-white p-8 rounded-lg shadow-lg w-96 relative'>
                <button onClick={() => setRatingModal(null)} className='absolute top-3 right-3 text-gray-500 hover:text-gray-700'>
                    <XIcon size={20} />
                </button>
                <h2 className='text-xl font-medium text-slate-600 mb-4'>Rate Product</h2>
                <div className='flex items-center justify-center mb-4'>
                    {Array.from({ length: 5 }, (_, i) => (
                        <Star
                            key={i}
                            className={`size-8 cursor-pointer ${rating > i ? "text-orange-400 fill-current" : "text-gray-300"}`}
                            onClick={() => setRating(i + 1)}
                        />
                    ))}
                </div>
                <textarea
                    className='w-full p-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-orange-400'
                    placeholder='Write your review (optional)'
                    rows='4'
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                ></textarea>
                <button onClick={e => toast.promise(handleSubmit(), { loading: 'Submitting...' })} disabled={submitting} className='w-full bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600 transition disabled:opacity-60'>
                    Submit Rating
                </button>
            </div>
        </div>
    )
}

export default RatingModal