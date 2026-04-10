import hero_model_img from "./hero_model_img.png"
import hero_product_img1 from "./hero_product_img1.png"
import hero_product_img2 from "./hero_product_img2.png"
import { ClockFadingIcon, HeadsetIcon } from "lucide-react"

export const assets = {
    hero_model_img,
    hero_product_img1,
    hero_product_img2,
}

export const categories = ["Power Banks", "Chargers", "Cables"]

export const ourSpecsData = [
    { title: "7 Days easy Return", description: "Change your mind? No worries. Return any item within 7 days.", icon: ClockFadingIcon, accent: '#FFAD51' },
    { title: "24/7 Customer Support", description: "We're here for you. Get expert help with our customer support.", icon: HeadsetIcon, accent: '#A684FF' }
]

// Dummy data for development
export const couponDummyData = [
    { id: 1, code: 'SAVE10', discount: 10, type: 'percentage', minOrder: 5000, expiry: '2024-12-31' },
    { id: 2, code: 'FLAT200', discount: 200, type: 'fixed', minOrder: 1000, expiry: '2024-12-31' }
]

export const productDummyData = [
    { id: 1, name: 'Power Bank 10000mAh', price: 250000, category: 'Power Banks', stock: 50, images: [] },
    { id: 2, name: 'USB C Cable', price: 150000, category: 'Cables', stock: 100, images: [] }
]

export const orderDummyData = [
    { id: 'order-1', customer: 'John Doe', total: 250000, status: 'pending', date: '2024-01-15' },
    { id: 'order-2', customer: 'Jane Smith', total: 150000, status: 'shipped', date: '2024-01-14' }
]

export const dummyStoreDashboardData = {
    totalOrders: 45,
    totalRevenue: 1250000,
    totalProducts: 12,
    recentOrders: orderDummyData.slice(0, 5)
}