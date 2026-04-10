#!/usr/bin/env node

/**
 * Utility script to clear all orders from InstantDB
 * USE WITH CAUTION - This will permanently delete all order data
 */

import db from '../lib/instantdb.js'

async function clearAllOrders() {
  console.log('⚠️  WARNING: This will delete ALL orders from your database!')
  console.log('This action cannot be undone.')

  // In a real script, you'd want user confirmation
  // For now, we'll just show what would be done

  try {
    // Get all orders
    const { data } = await db.query({ orders: {} })
    const orders = data?.orders || []

    console.log(`Found ${orders.length} orders to delete`)

    if (orders.length === 0) {
      console.log('✅ No orders to delete')
      return
    }

    // Delete each order
    const deletePromises = orders.map(order =>
      db.transact(db.tx.orders[order.id].delete())
    )

    await Promise.all(deletePromises)

    console.log(`✅ Successfully deleted ${orders.length} orders`)

  } catch (error) {
    console.error('❌ Error clearing orders:', error)
  }
}

// Uncomment the line below to actually run the deletion
// clearAllOrders()

console.log('Script loaded. Uncomment the clearAllOrders() call to run it.')
console.log('⚠️  Make sure you really want to delete all orders before running!')