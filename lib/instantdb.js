import { init } from '@instantdb/react'

const appId = process.env.NEXT_PUBLIC_INSTANT_DB_APP_ID || ''

if (!appId && typeof window !== 'undefined') {
  console.warn('NEXT_PUBLIC_INSTANT_DB_APP_ID not set')
}

const db = init({ appId })

export default db
