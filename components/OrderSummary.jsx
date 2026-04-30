import { PlusIcon, SquarePenIcon, XIcon } from 'lucide-react';
import React, { useState, useEffect } from 'react'
import AddressModal from './AddressModal';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import db from '@/lib/instantdb';
import { id } from '@instantdb/react';
import { clearCart } from '@/lib/features/cart/cartSlice';
import { useAddresses } from '@/lib/instantdbHooks';
import { geocodeAddress } from '@/lib/dbUtils';

const OrderSummary = ({ totalPrice, items }) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';
    const dispatch = useDispatch();
    const router = useRouter();
    const { user } = db.useAuth();

    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [couponCodeInput, setCouponCodeInput] = useState('');
    const [coupon, setCoupon] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const dispatchFee = 2000; // Naira
    const dispatchFeeRaw = dispatchFee * 100; // in minor currency units

    const { addresses, isLoading: addressesLoading } = useAddresses(user?.id);

    useEffect(() => {
        // Auto-select first address if available and none is selected
        if (addresses.length > 0 && !selectedAddress) {
            setSelectedAddress(addresses[0])
        }
    }, [addresses, selectedAddress])

    const handleCouponCode = async (event) => {
        event.preventDefault();
        toast.success('Demo: Coupon verification coming soon')
    }

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        try {
            if (!selectedAddress) {
                throw new Error('Please select an address')
            }
            if (!user) {
                throw new Error('Please log in first')
            }

            setSubmitting(true)
            const orderId = id()
            const couponDiscountRaw = coupon ? Math.round(((coupon?.discount || 0) / 100) * totalPrice) : 0;
            const orderTotal = totalPrice + dispatchFeeRaw - couponDiscountRaw;

            // Use coordinates from the selected address (already set during address creation)
            const coordinates = {
                lat: selectedAddress.lat,
                lng: selectedAddress.lng
            }

            const orderData = {
                id: orderId,
                items,
                total: orderTotal,
                address: {
                    ...selectedAddress,
                    lat: coordinates?.lat || null,
                    lng: coordinates?.lng || null,
                },
                paymentMethod,
                coupon: coupon || null,
                dispatchFee: dispatchFeeRaw,
                status: 'pending',
                userId: user.id,
                createdAt: new Date().toISOString(),
                paymentStatus: paymentMethod === 'COD' ? 'pending' : 'pending_payment',
            }

            // For online payment, initiate payment first
            if (paymentMethod === 'CARD') {
                const paymentResponse = await fetch('/api/payment/initiate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        amount: orderTotal,
                        currency: process.env.NEXT_PUBLIC_CURRENCY_CODE || 'ngn',
                        email: user.email,
                        name: `${selectedAddress.name}`,
                        type: 'order',
                        reference: `order-${orderId}`,
                    }),
                })

                const paymentData = await paymentResponse.json()

                if (!paymentResponse.ok || paymentData.status !== 'success') {
                    throw new Error(paymentData.error || 'Payment initiation failed')
                }

                // Save order with pending payment status
                await db.transact(db.tx.orders[orderId].update(orderData)).catch(err => {
                    if (err.message?.includes('closing')) {
                        throw new Error('Connection lost. Order could not be saved. Please try again.')
                    }
                    throw err
                })

                // Redirect to Flutterwave payment page
                window.location.href = paymentData.data.link
                return 'Redirecting to payment...'
            }

            // For COD, save order directly
            await db.transact(db.tx.orders[orderId].update(orderData)).catch(err => {
                if (err.message?.includes('closing')) {
                    throw new Error('Connection lost. Order could not be saved. Please try again.')
                }
                throw err
            })

            // Send SMS notification to admin
            try {
                const notifyResponse = await fetch('/api/order-sms', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                      orderId, 
                      total: orderData.total, 
                      userId: user.id, 
                      type: 'order',
                      items: items.map(item => ({ name: item.name, quantity: item.quantity })),
                      address: `${selectedAddress.name}, ${selectedAddress.city}, ${selectedAddress.state}`,
                      paymentMethod: paymentMethod === 'COD' ? 'Cash on Delivery' : 'Card Payment'
                    }),
                })

                if (!notifyResponse.ok) {
                    const notifyData = await notifyResponse.json().catch(() => ({}))
                    console.error('Order SMS notification failed', notifyData)
                    toast.error('Order placed, but notification failed. Check server logs.')
                }
            } catch (notifyError) {
                console.error('Order SMS notification error', notifyError)
                toast.error('Order placed, but SMS notification failed. Check server logs.')
            }

            dispatch(clearCart())
            setSubmitting(false)

            toast.success('Order placed successfully')
            router.push('/orders')

            return 'Order placed successfully'
        } catch (err) {
            console.error(err)
            setSubmitting(false)
            throw err
        }
    }

    return (
        <div className='w-full max-w-lg lg:max-w-[340px] bg-slate-50/30 border border-slate-200 text-slate-500 text-sm rounded-xl p-7'>
            <h2 className='text-xl font-medium text-slate-600'>Payment Summary</h2>
            <p className='text-slate-400 text-xs my-4'>Payment Method</p>
            <div className='flex gap-2 items-center'>
                <input type="radio" id="COD" onChange={() => setPaymentMethod('COD')} checked={paymentMethod === 'COD'} className='accent-gray-500' />
                <label htmlFor="COD" className='cursor-pointer'>Cash on Delivery</label>
            </div>
            <div className='flex gap-2 items-center mt-1'>
                <input type="radio" id="CARD" name='payment' onChange={() => setPaymentMethod('CARD')} checked={paymentMethod === 'CARD'} className='accent-gray-500' />
                <label htmlFor="CARD" className='cursor-pointer'>Card Payment</label>
            </div>
            <div className='my-4 py-4 border-y border-slate-200 text-slate-400'>
                <p>Address</p>
                {
                    selectedAddress ? (
                        <div className='flex gap-2 items-center'>
                            <p>{selectedAddress?.name || ''}, {selectedAddress?.city || ''}, {selectedAddress?.state || ''}, {selectedAddress?.zip || ''}</p>
                            <SquarePenIcon onClick={() => setSelectedAddress(null)} className='cursor-pointer' size={18} />
                        </div>
                    ) : (
                        <div>
                            {
                                addresses.length > 0 && (
                                    <select className='border border-slate-400 p-2 w-full my-3 outline-none rounded' onChange={(e) => {
                                        if (e.target.value) {
                                            setSelectedAddress(addresses[parseInt(e.target.value)])
                                        } else {
                                            setSelectedAddress(null)
                                        }
                                    }} >
                                        <option value="">Select Address</option>
                                        {
                                            addresses.map((address, index) => (
                                                <option key={index} value={index}>{address?.name || ''}, {address?.city || ''}, {address?.state || ''}, {address?.zip || ''}</option>
                                            ))
                                        }
                                    </select>
                                )
                            }
                            <button type="button" className='flex items-center gap-1 text-slate-600 mt-1' onClick={() => setShowAddressModal(true)} >Add Address <PlusIcon size={18} /></button>
                        </div>
                    )
                }
            </div>
            <div className='pb-4 border-b border-slate-200'>
                <div className='flex justify-between'>
                    <div className='flex flex-col gap-1 text-slate-400'>
                        <p>Subtotal:</p>
                        <p>Dispatch fee:</p>
                        {coupon && <p>Coupon:</p>}
                    </div>
                    <div className='flex flex-col gap-1 font-medium text-right'>
                        <p>{currency}{((totalPrice || 0) / 100).toLocaleString?.() || '0'}</p>
                        <p>{currency}{(dispatchFee).toLocaleString?.() || '0'}</p>
                        {coupon && <p>{`-${currency}${(((coupon?.discount || 0) / 100 * ((totalPrice || 0) / 100))).toFixed(2)}`}</p>}
                    </div>
                </div>
                {
                    !coupon ? (
                        <form onSubmit={e => toast.promise(handleCouponCode(e), { loading: 'Checking Coupon...' })} className='flex justify-center gap-3 mt-3'>
                            <input onChange={(e) => setCouponCodeInput(e.target.value)} value={couponCodeInput} type="text" placeholder='Coupon Code' className='border border-slate-400 p-1.5 rounded w-full outline-none' />
                            <button className='bg-slate-600 text-white px-3 rounded hover:bg-slate-800 active:scale-95 transition-all'>Apply</button>
                        </form>
                    ) : (
                        <div className='w-full flex items-center justify-center gap-2 text-xs mt-2'>
                            <p>Code: <span className='font-semibold ml-1'>{coupon?.code?.toUpperCase?.() || ''}</span></p>
                            <p>{coupon?.description || ''}</p>
                            <XIcon size={18} onClick={() => setCoupon('')} className='hover:text-red-700 transition cursor-pointer' />
                        </div>
                    )
                }
            </div>
            <div className='flex justify-between py-4'>
                <p>Total:</p>
                <p className='font-medium text-right'>{currency}{((totalPrice + dispatchFeeRaw - (coupon ? Math.round(((coupon?.discount || 0) / 100) * totalPrice) : 0)) / 100).toFixed(2)}</p>
            </div>
            {!user ? (
                <p className='w-full text-center py-2.5 rounded bg-slate-300 text-slate-600 text-sm'>Please log in to place order</p>
            ) : (
                <button disabled={submitting || !user} onClick={e => toast.promise(handlePlaceOrder(e), { loading: 'placing Order...' })} className='w-full bg-slate-700 text-white py-2.5 rounded hover:bg-slate-900 active:scale-95 transition-all disabled:bg-slate-400'>{submitting ? 'Placing...' : 'Place Order'}</button>
            )}

            {showAddressModal && <AddressModal setShowAddressModal={setShowAddressModal} onAddressAdded={() => {
                // Refresh addresses by resetting selected address to trigger refetch
                setSelectedAddress(null)
            }} />}

        </div>
    )
}

export default OrderSummary