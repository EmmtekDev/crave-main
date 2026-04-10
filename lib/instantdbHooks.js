import db from './instantdb'

// Use Instant DB's `useQuery` hook which is provided on the client instance
export const useProducts = () => {
  const { isLoading, error, data } = db.useQuery({ products: {} })
  return {
    products: data?.products || [],
    isLoading,
    error,
  }
}

export const useProduct = (id) => {
  const { isLoading, error, data } = db.useQuery({ products: {} })
  const product = (data?.products || []).find(p => p.id === id) || null
  return { product, isLoading, error }
}

export const useOrders = () => {
  const { isLoading, error, data } = db.useQuery({ orders: {} })
  return {
    orders: data?.orders || [],
    isLoading,
    error,
  }
}

export const useAddresses = (userId) => {
  const { isLoading, error, data } = db.useQuery({ addresses: {} })
  const userAddresses = userId 
    ? (data?.addresses || []).filter(a => a.userId === userId)
    : []
  return {
    addresses: userAddresses,
    isLoading,
    error,
  }
}

export const useUserOrders = (userId) => {
  const { isLoading, error, data } = db.useQuery({ orders: {} })
  const userOrders = userId
    ? (data?.orders || []).filter(order => {
        // Orders are tied to user by checking the address or user field
        return order.userId === userId
      })
    : []
  return {
    orders: userOrders,
    isLoading,
    error,
  }
}

export const useUpdates = () => {
  const { isLoading, error, data } = db.useQuery({ updates: {} })
  const activeUpdates = (data?.updates || []).filter(u => u.isActive !== false)
  return {
    updates: data?.updates || [],
    activeUpdates,
    isLoading,
    error,
  }
}

export const useRiders = () => {
  const { isLoading, error, data } = db.useQuery({ riders: {} })
  return {
    riders: data?.riders || [],
    isLoading,
    error,
  }
}

export const useRiderByCode = (code) => {
  const { isLoading, error, data } = db.useQuery({ riders: {} })
  const rider = code 
    ? (data?.riders || []).find(r => r.uniqueCode === code) || null
    : null
  return { rider, isLoading, error }
}

export const useRider = (riderId) => {
  const { isLoading, error, data } = db.useQuery({ riders: {} })
  const rider = riderId
    ? (data?.riders || []).find(r => r.id === riderId) || null
    : null
  return { rider, isLoading, error }
}

export const useDeliveries = () => {
  const { isLoading, error, data } = db.useQuery({ deliveries: {} })
  return {
    deliveries: data?.deliveries || [],
    isLoading,
    error,
  }
}

export const useRiderDeliveries = (riderId) => {
  const { isLoading, error, data } = db.useQuery({ deliveries: {} })
  const deliveries = riderId
    ? (data?.deliveries || []).filter(d => d.riderId === riderId)
    : []
  return {
    deliveries,
    isLoading,
    error,
  }
}

export const useActiveDeliveries = () => {
  const { isLoading, error, data } = db.useQuery({ deliveries: {} })
  const activeDeliveries = (data?.deliveries || []).filter(
    d => d.status !== 'delivered' && d.status !== 'cancelled'
  )
  return {
    deliveries: activeDeliveries,
    isLoading,
    error,
  }
}