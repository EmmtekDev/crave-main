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

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressString)}&limit=1`,
      {
        headers: {
          'User-Agent': 'Crave-App'
        }
      }
    )

    if (!response.ok) {
      return null
    }

    const results = await response.json()

    if (results.length === 0) {
      return null
    }

    return {
      lat: parseFloat(results[0].lat),
      lng: parseFloat(results[0].lon)
    }
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
