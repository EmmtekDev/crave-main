'use client'
import { XIcon, MapPinIcon } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { toast } from "react-hot-toast"
import db from '@/lib/instantdb'
import { id } from '@instantdb/react'

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css'

const AddressModal = ({ setShowAddressModal, onAddressAdded }) => {
    const { user } = db.useAuth()
    const mapRef = useRef(null)
    const mapInstanceRef = useRef(null)
    const markerRef = useRef(null)

    const [address, setAddress] = useState({
        name: '',
        email: '',
        street: '',
        city: '',
        state: '',
        zip: '',
        country: '',
        phone: ''
    })
    const [coordinates, setCoordinates] = useState({ lat: null, lng: null })
    const [showMap, setShowMap] = useState(false)
    const [isClient, setIsClient] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    // Only render map on client side
    useEffect(() => {
        setIsClient(true)
    }, [])

    // Initialize map when showing map view
    useEffect(() => {
        if (!isClient || !showMap || typeof window === 'undefined' || !mapRef.current) return

        // Small delay to ensure container is rendered
        const timer = setTimeout(() => {
            // Dynamically import Leaflet
            import('leaflet').then((L) => {
                // Fix for default markers
                delete L.Icon.Default.prototype._getIconUrl
                L.Icon.Default.mergeOptions({
                    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
                    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                })

                // Create map centered on Lagos, Nigeria
                const map = L.map(mapRef.current, {
                    center: [6.5244, 3.3342],
                    zoom: 10,
                    zoomControl: true,
                })

                // Add tile layer
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; OpenStreetMap contributors',
                    maxZoom: 19,
                }).addTo(map)

                // Force map to recalculate size after container is ready
                setTimeout(() => {
                    map.invalidateSize()
                }, 100)

                // Handle window resize
                const handleResize = () => {
                    map.invalidateSize()
                }
                window.addEventListener('resize', handleResize)

                // Add click handler to place marker
                map.on('click', (e) => {
                    const { lat, lng } = e.latlng
                    setCoordinates({ lat, lng })

                    // Remove existing marker
                    if (markerRef.current) {
                        map.removeLayer(markerRef.current)
                    }

                    // Add new marker
                    const marker = L.marker([lat, lng], { draggable: true }).addTo(map)
                    markerRef.current = marker

                    // Handle marker drag
                    marker.on('dragend', (event) => {
                        const newPos = event.target.getLatLng()
                        setCoordinates({ lat: newPos.lat, lng: newPos.lng })
                    })
                })

                mapInstanceRef.current = map

                // Cleanup
                return () => {
                    window.removeEventListener('resize', handleResize)
                    if (mapInstanceRef.current) {
                        mapInstanceRef.current.remove()
                        mapInstanceRef.current = null
                    }
                }
            })
        }, 200) // Small delay

        return () => clearTimeout(timer)
    }, [isClient, showMap])

    const handleAddressChange = (e) => {
        setAddress({
            ...address,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            setSubmitting(true)
            if (!user) {
                throw new Error('User not logged in')
            }

            if (!coordinates.lat || !coordinates.lng) {
                throw new Error('Please select your location on the map')
            }

            const addressId = id()
            await db.transact(db.tx.addresses[addressId].update({
                ...address,
                lat: coordinates.lat,
                lng: coordinates.lng,
                userId: user.id,
                createdAt: new Date().toISOString(),
            })).catch(err => {
                if (err.message?.includes('closing')) {
                    throw new Error('Connection lost. Please try again.')
                }
                throw err
            })

            toast.success('Address saved with location')
            setShowAddressModal(false)
            if (onAddressAdded) {
                onAddressAdded()
            }
        } catch (err) {
            console.error(err)
            toast.error(err.message || 'Failed to save address')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 bg-white/60 backdrop-blur h-screen flex items-center justify-center">
            <div className="flex flex-col gap-5 text-slate-700 w-full max-w-lg mx-6 bg-white p-6 rounded-lg shadow-xl">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold">Add New Address</h2>
                    <XIcon size={24} className="text-slate-500 hover:text-slate-700 cursor-pointer" onClick={() => setShowAddressModal(false)} />
                </div>

                {!showMap ? (
                    // Address Details Form
                    <form onSubmit={(e) => { e.preventDefault(); setShowMap(true) }} className="space-y-4">
                        <div className="text-sm text-slate-600 mb-4">
                            Step 1: Enter your address details
                        </div>

                        <input name="name" onChange={handleAddressChange} value={address.name} className="p-3 outline-none border border-slate-200 rounded w-full" type="text" placeholder="Enter your name" required />
                        <input name="email" onChange={handleAddressChange} value={address.email} className="p-3 outline-none border border-slate-200 rounded w-full" type="email" placeholder="Email address" required />
                        <input name="street" onChange={handleAddressChange} value={address.street} className="p-3 outline-none border border-slate-200 rounded w-full" type="text" placeholder="Street address" required />

                        <div className="grid grid-cols-2 gap-3">
                            <input name="city" onChange={handleAddressChange} value={address.city} className="p-3 outline-none border border-slate-200 rounded w-full" type="text" placeholder="City" required />
                            <input name="state" onChange={handleAddressChange} value={address.state} className="p-3 outline-none border border-slate-200 rounded w-full" type="text" placeholder="State" required />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <input name="zip" onChange={handleAddressChange} value={address.zip} className="p-3 outline-none border border-slate-200 rounded w-full" type="number" placeholder="Zip code" required />
                            <input name="country" onChange={handleAddressChange} value={address.country} className="p-3 outline-none border border-slate-200 rounded w-full" type="text" placeholder="Country" required />
                        </div>

                        <input name="phone" onChange={handleAddressChange} value={address.phone} className="p-3 outline-none border border-slate-200 rounded w-full" type="text" placeholder="Phone number" required />

                        <button type="submit" className="w-full bg-blue-600 text-white text-sm font-medium py-3 rounded-md hover:bg-blue-700 transition-all">
                            Next: Select Location on Map
                        </button>
                    </form>
                ) : (
                    // Map Selection
                    <div className="space-y-4">
                        <div className="text-sm text-slate-600">
                            Step 2: Click on the map to set your exact location
                        </div>

                        <div className="h-64 border border-slate-200 rounded overflow-hidden relative">
                            <div ref={mapRef} className="w-full h-full absolute inset-0" style={{ minHeight: '256px' }} />
                        </div>

                        {coordinates.lat && coordinates.lng && (
                            <div className="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                                <div className="flex items-center gap-2">
                                    <MapPinIcon size={16} />
                                    <span>Location selected: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}</span>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowMap(false)}
                                className="flex-1 bg-gray-200 text-gray-700 text-sm font-medium py-3 rounded-md hover:bg-gray-300 transition-all"
                            >
                                Back
                            </button>
                            <button
                                onClick={(e) => toast.promise(handleSubmit(e), { loading: 'Adding Address...' })}
                                disabled={submitting || !coordinates.lat || !coordinates.lng}
                                className="flex-1 bg-slate-800 text-white text-sm font-medium py-3 rounded-md hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {submitting ? 'SAVING...' : 'SAVE ADDRESS'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default AddressModal