/**
 * Safe wrapper for Instant DB transactions
 * Handles connection closing errors and retries
 */
export const safeTransact = async (txFn, maxRetries = 2) => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await txFn()
    } catch (err) {
      // Check if it's a connection closing error
      if (err.message && err.message.includes('closing') && attempt < maxRetries) {
        // Wait before retrying (exponential backoff)
        const delay = Math.pow(2, attempt) * 100
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }
      // If it's a different error or max retries reached, throw
      throw err
    }
  }
}

/**
 * Geocode address to latitude and longitude coordinates
 * Uses OpenStreetMap Nominatim API (free, no key required)
 */
export const geocodeAddress = async (addressObj) => {
  try {
    // Format address from object
    const addressString = [
      addressObj.street,
      addressObj.city,
      addressObj.state,
      addressObj.country
    ].filter(Boolean).join(', ')

    console.log('Geocoding address:', addressString)
    console.log('Address object:', addressObj)

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressString)}&limit=1`,
      {
        headers: {
          'User-Agent': 'Crave-App'
        }
      }
    )

    if (!response.ok) {
      console.error('Geocoding API error:', response.status, response.statusText)
      return null
    }

    const results = await response.json()
    console.log('Geocoding results:', results)

    if (results.length === 0) {
      console.warn('No geocoding results found for address:', addressString)
      return null
    }

    const coords = {
      lat: parseFloat(results[0].lat),
      lng: parseFloat(results[0].lon)
    }
    console.log('Geocoded coordinates:', coords)
    return coords
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}

/**
 * Alaba sorting hub coordinates
 */
export const SORTING_HUB = {
  lat: 6.5244,
  lng: 3.3342,
  name: 'CB 45, 46 & 53 CB Plaza, Fancy and Furniture, Alaba International Market, Ojo Lagos'
}

/**
 * Calculate midpoint between two coordinates
 */
export const calculateMidpoint = (coords1, coords2) => {
  if (!coords1 || !coords2) return null
  return {
    lat: (coords1.lat + coords2.lat) / 2,
    lng: (coords1.lng + coords2.lng) / 2
  }
}

/**
 * Manually geocode an existing order and update its coordinates
 * Useful for fixing orders that failed geocoding during placement
 */
export const geocodeExistingOrder = async (orderId) => {
  try {
    console.log('Attempting to geocode order:', orderId)

    // Import db here to avoid circular imports
    const db = (await import('@/lib/instantdb')).default

    // Get the order
    const { data } = await db.query({ orders: { $: { where: { id: orderId } } } })
    const order = data?.orders?.[0]

    if (!order) {
      throw new Error('Order not found')
    }

    if (!order.address) {
      throw new Error('Order has no address')
    }

    // Check if already geocoded
    if (order.address.lat && order.address.lng) {
      console.log('Order already has coordinates:', order.address.lat, order.address.lng)
      return { success: true, message: 'Already geocoded' }
    }

    // Geocode the address
    const coordinates = await geocodeAddress(order.address)

    if (!coordinates) {
      throw new Error('Failed to geocode address')
    }

    // Update the order with coordinates
    await db.transact(db.tx.orders[orderId].update({
      address: {
        ...order.address,
        lat: coordinates.lat,
        lng: coordinates.lng,
      }
    }))

    console.log('Successfully geocoded order:', orderId, coordinates)
    return { success: true, coordinates }

  } catch (error) {
    console.error('Failed to geocode existing order:', error)
    return { success: false, error: error.message }
  }
}
