'use client'

import { useEffect, useRef, useState } from 'react'
import { SORTING_HUB, calculateMidpoint } from '@/lib/dbUtils'

const MapTracking = ({ orderAddress, orderStatus = 'pending', editable = false, onStatusChange = null }) => {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const [isClient, setIsClient] = useState(false)

  // Only render on client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient || typeof window === 'undefined') return

    // Dynamically import Leaflet to avoid SSR issues
    import('leaflet').then((L) => {
      // Fix for default markers in Next.js
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })

      // Initialize map
      if (!mapRef.current || mapInstanceRef.current) return

      // Create map
      const map = L.map(mapRef.current).setView([6.5244, 3.3342], 10)

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map)

      mapInstanceRef.current = map

      // Cleanup function
      return () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove()
          mapInstanceRef.current = null
        }
      }
    })
  }, [isClient])

  useEffect(() => {
    if (!isClient || !mapInstanceRef.current || !orderAddress || typeof window === 'undefined') return

    // Dynamically import Leaflet for map operations
    import('leaflet').then((L) => {
      const map = mapInstanceRef.current

      // Clear existing markers
      map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          layer.remove()
        }
      })

      // Get destination coordinates (assume they're already geocoded in the orderAddress)
      const destination = {
        lat: orderAddress.lat,
        lng: orderAddress.lng,
      }

      // If coordinates are missing, skip map rendering
      if (!destination.lat || !destination.lng) {
        return
      }

      // Calculate midpoint
      const midpoint = calculateMidpoint(SORTING_HUB, destination)

      // Define status positions
      const statusPositions = {
        pending: SORTING_HUB,
        sorting: SORTING_HUB,
        shipped: midpoint,
        delivered: destination,
      }

      const currentPosition = statusPositions[orderStatus] || SORTING_HUB

      // Hub marker
      const hubIcon = L.divIcon({
        html: `<div class="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-full border-4 border-white shadow-lg">
          <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.5 1.5H3.75A2.25 2.25 0 001.5 3.75v12.5A2.25 2.25 0 003.75 18.5h12.5a2.25 2.25 0 002.25-2.25V9.5" />
          </svg>
        </div>`,
        iconSize: [32, 32],
        className: '',
      })

      L.marker([SORTING_HUB.lat, SORTING_HUB.lng], { icon: hubIcon })
        .bindPopup('<strong>Sorting Hub</strong><br/>Alaba, Lagos')
        .addTo(map)

      // Midpoint marker
      if (midpoint) {
        const midpointIcon = L.divIcon({
          html: `<div class="flex items-center justify-center w-8 h-8 bg-yellow-500 rounded-full border-4 border-white shadow-lg">
            <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.5 1.5H3.75A2.25 2.25 0 001.5 3.75v12.5A2.25 2.25 0 003.75 18.5h12.5a2.25 2.25 0 002.25-2.25V9.5" />
            </svg>
          </div>`,
          iconSize: [32, 32],
          className: '',
        })

        L.marker([midpoint.lat, midpoint.lng], { icon: midpointIcon })
          .bindPopup('<strong>On the Way</strong><br/>Midpoint')
          .addTo(map)
      }

      // Destination marker
      const destinationIcon = L.divIcon({
        html: `<div class="flex items-center justify-center w-8 h-8 bg-green-500 rounded-full border-4 border-white shadow-lg">
          <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.5 1.5H3.75A2.25 2.25 0 001.5 3.75v12.5A2.25 2.25 0 003.75 18.5h12.5a2.25 2.25 0 002.25-2.25V9.5" />
          </svg>
        </div>`,
        iconSize: [32, 32],
        className: '',
      })

      L.marker([destination.lat, destination.lng], { icon: destinationIcon })
        .bindPopup('<strong>Destination</strong><br/>Delivery Address')
        .addTo(map)

      // Current position marker (animated)
      const currentIcon = L.divIcon({
        html: `<div class="flex items-center justify-center w-10 h-10 bg-red-600 rounded-full border-4 border-white shadow-lg animate-pulse">
          <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 9a1 1 0 11-2 0 1 1 0 012 0z" clip-rule="evenodd" />
          </svg>
        </div>`,
        iconSize: [40, 40],
        className: '',
      })

      L.marker([currentPosition.lat, currentPosition.lng], { icon: currentIcon })
        .bindPopup(`<strong>Current Position</strong><br/>${orderStatus}`)
        .addTo(map)

      // Draw polyline route
      const routePoints = [
        [SORTING_HUB.lat, SORTING_HUB.lng],
        midpoint ? [midpoint.lat, midpoint.lng] : [SORTING_HUB.lat, SORTING_HUB.lng],
        [destination.lat, destination.lng],
      ]

      L.polyline(routePoints, {
        color: '#3b82f6',
        weight: 3,
        opacity: 0.7,
        dashArray: '5, 5',
      }).addTo(map)

      // Fit bounds to show all markers
      const bounds = L.latLngBounds(
        [[SORTING_HUB.lat, SORTING_HUB.lng]],
        [[destination.lat, destination.lng]]
      )

      if (midpoint) {
        bounds.extend([midpoint.lat, midpoint.lng])
      }

      map.fitBounds(bounds, { padding: [50, 50] })
    })
  }, [orderAddress, orderStatus, isClient])

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
      {isClient ? (
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      ) : (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
          <div className="text-gray-500">Loading map...</div>
        </div>
      )}
    </div>
  )
}

export default MapTracking
