'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { id } from '@instantdb/react'
import db from '@/lib/instantdb'
import toast from 'react-hot-toast'
import { Truck, Bike, ShoppingCart, MapPin, Package, DollarSign, Clock, CheckCircle } from 'lucide-react'
import { geocodeAddress } from '@/lib/dbUtils'

export default function DeliveryPage() {
  const router = useRouter()
  const { user } = db.useAuth()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: vehicle type, 2: details, 3: review
  const [submitting, setSubmitting] = useState(false)

  // Vehicle type selection
  const [vehicleType, setVehicleType] = useState('bike') // bike, car, truck

  // Sender info
  const [senderName, setSenderName] = useState('')
  const [senderPhone, setSenderPhone] = useState('')
  const [senderEmail, setSenderEmail] = useState('')
  const [senderAddress, setSenderAddress] = useState('')
  const [senderCity, setSenderCity] = useState('')
  const [senderState, setSenderState] = useState('')
  const [senderCoords, setSenderCoords] = useState(null)

  // Recipient info
  const [recipientName, setRecipientName] = useState('')
  const [recipientPhone, setRecipientPhone] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [recipientAddress, setRecipientAddress] = useState('')
  const [recipientCity, setRecipientCity] = useState('')
  const [recipientState, setRecipientState] = useState('')
  const [recipientCoords, setRecipientCoords] = useState(null)

  // Package info
  const [packageType, setPackageType] = useState('parcel') // parcel, document, fragile
  const [packageWeight, setPackageWeight] = useState('') // kg
  const [packageValue, setPackageValue] = useState('')
  const [packageDescription, setPackageDescription] = useState('')
  const [pickupDate, setPickupDate] = useState('')
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [insurance, setInsurance] = useState(false)

  // Payment info
  const [paymentMethod, setPaymentMethod] = useState('COD') // COD or online

  // Pricing info
  const [pricing, setPricing] = useState({
    baseFee: 0,
    weightFee: 0,
    distanceFee: 0,
    handlingFee: 0,
    insuranceFee: 0,
    total: 0,
  })

  // Vehicle type configurations
  const vehicles = {
    bike: {
      name: 'Motorcycle/Bike',
      icon: Bike,
      maxWeight: 15,
      description: 'Best for documents and small parcels within the city',
      baseFee: 1500, // Naira
      perKgFee: 200,
      color: 'blue',
    },
    car: {
      name: 'Car/Van',
      icon: ShoppingCart,
      maxWeight: 150,
      description: 'Ideal for standard residential and small business deliveries',
      baseFee: 2500,
      perKgFee: 150,
      color: 'green',
    },
    truck: {
      name: 'Truck',
      icon: Truck,
      maxWeight: 1000,
      description: 'Perfect for bulk orders and B2B deliveries',
      baseFee: 5000,
      perKgFee: 100,
      color: 'purple',
    },
  }

  // Calculate pricing based on weight and vehicle
  const calculatePricing = (weight = packageWeight, vehicle = vehicleType) => {
    const config = vehicles[vehicle]
    if (!weight || !config) return

    const weight_num = parseFloat(weight) || 0
    const baseFee = config.baseFee * 100 // Convert to kobo
    const weightFee = Math.max(0, weight_num - 0) * config.perKgFee * 100

    // Additional fees
    const handlingFee = packageType === 'fragile' ? 500 * 100 : 0
    const insuranceFee = insurance && packageValue ? Math.round((parseFloat(packageValue) / 100) * 0.5) : 0

    const total = baseFee + weightFee + handlingFee + insuranceFee

    setPricing({
      baseFee,
      weightFee,
      distanceFee: 0, // Could be calculated from coords later
      handlingFee,
      insuranceFee,
      total,
    })
  }

  // Recalculate on weight, vehicle, or package type change
  useEffect(() => {
    if (packageWeight) {
      calculatePricing()
    }
  }, [packageWeight, vehicleType, packageType, insurance, packageValue])

  // Geocode sender address
  const handleGeocodeSender = async () => {
    if (!senderCity || !senderState) {
      toast.error('Please fill in at least city and state')
      return
    }

    try {
      // Try with full address first
      let coords = await geocodeAddress({
        street: senderAddress,
        city: senderCity,
        state: senderState,
        country: 'Nigeria',
      })

      // If that fails, try with just city and state
      if (!coords) {
        coords = await geocodeAddress({
          city: senderCity,
          state: senderState,
          country: 'Nigeria',
        })
      }

      // If still no results, try with just state
      if (!coords) {
        coords = await geocodeAddress({
          state: senderState,
          country: 'Nigeria',
        })
      }

      if (coords) {
        setSenderCoords(coords)
        toast.success('Sender location confirmed')
      } else {
        toast.error('Address not found. Try using just the city/state name.')
      }
    } catch (err) {
      console.error(err)
      toast.error('Error finding location. Please try a different address format.')
    }
  }

  // Geocode recipient address
  const handleGeocodeRecipient = async () => {
    if (!recipientCity || !recipientState) {
      toast.error('Please fill in at least city and state')
      return
    }

    try {
      // Try with full address first
      let coords = await geocodeAddress({
        street: recipientAddress,
        city: recipientCity,
        state: recipientState,
        country: 'Nigeria',
      })

      // If that fails, try with just city and state
      if (!coords) {
        coords = await geocodeAddress({
          city: recipientCity,
          state: recipientState,
          country: 'Nigeria',
        })
      }

      // If still no results, try with just state
      if (!coords) {
        coords = await geocodeAddress({
          state: recipientState,
          country: 'Nigeria',
        })
      }

      if (coords) {
        setRecipientCoords(coords)
        toast.success('Recipient location confirmed')
      } else {
        toast.error('Address not found. Try using just the city/state name.')
      }
    } catch (err) {
      console.error(err)
      toast.error('Error finding location. Please try a different address format.')
    }
  }

  // Handle delivery request submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!user) {
      toast.error('Please log in to create a delivery request')
      return
    }

    if (!senderCoords || !recipientCoords) {
      toast.error('Please confirm both sender and recipient locations')
      return
    }

    if (!packageWeight) {
      toast.error('Please enter package weight')
      return
    }

    if (parseFloat(packageWeight) > vehicles[vehicleType].maxWeight) {
      toast.error(`Weight exceeds ${vehicleType} capacity of ${vehicles[vehicleType].maxWeight}kg`)
      return
    }

    if (!pickupDate) {
      toast.error('Please select a pickup date')
      return
    }

    try {
      setSubmitting(true)

      console.log('User:', user)
      console.log('User ID:', user?.id)

      // Generate tracking number with prefix
      const trackingId = id()
      const trackingNumber = `DEL-${Date.now().toString().slice(-8)}`

      // Create delivery request in database
      const deliveryData = {
        userId: user.id,
        userEmail: user.email,
        trackingNumber,
        vehicleType,
        status: 'pending',
        
        // Sender info
        senderName,
        senderPhone,
        senderEmail,
        senderAddress,
        senderCity,
        senderState,
        senderCoords,

        // Recipient info
        recipientName,
        recipientPhone,
        recipientEmail,
        recipientAddress,
        recipientCity,
        recipientState,
        recipientCoords,

        // Package info
        packageType,
        packageWeight: parseFloat(packageWeight),
        packageValue: packageValue ? Math.round(parseFloat(packageValue) * 100) : 0,
        packageDescription,
        pickupDate,
        specialInstructions,
        insurance,
        paymentMethod,

        // Pricing (stored in kobo)
        baseFee: pricing.baseFee,
        weightFee: pricing.weightFee,
        handlingFee: pricing.handlingFee,
        insuranceFee: pricing.insuranceFee,
        totalPrice: pricing.total,

        // Payment status
        paymentStatus: paymentMethod === 'COD' ? 'pending' : 'pending_payment',

        // Metadata
        createdAt: new Date().toISOString(),
        estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days
      }

      console.log('Saving delivery:', deliveryData)

      await db.transact(db.tx.deliveries[trackingId].update(deliveryData)).catch((err) => {
        console.error('Transact error:', err)
        if (err.message?.includes('closing')) {
          throw new Error('Connection lost. Please refresh and try again.')
        }
        throw err
      })

      console.log('Delivery saved successfully')

      // Send WhatsApp notification to admin
      try {
        const notifyResponse = await fetch('/api/order-sms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            orderId: trackingNumber, 
            total: pricing.total, 
            userId: user.id, 
            type: 'dispatch',
            senderName,
            senderPhone,
            receiverName,
            receiverPhone,
            vehicleType: selectedVehicle,
            fromLocation,
            toLocation
          }),
        })

        if (!notifyResponse.ok) {
          const notifyData = await notifyResponse.json().catch(() => ({}))
          console.error('Dispatch WhatsApp notification failed', notifyData)
          toast.error('Delivery created, but notification failed. Check server logs.')
        }
      } catch (notifyError) {
        console.error('Dispatch WhatsApp notification error', notifyError)
        toast.error('Delivery created, but notification failed. Check server logs.')
      }

      // For online payment, initiate payment
      if (paymentMethod === 'online') {
        const paymentResponse = await fetch('/api/payment/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: pricing.total,
            currency: process.env.NEXT_PUBLIC_CURRENCY_CODE || 'ngn',
            email: user.email,
            name: senderName,
            type: 'delivery',
            reference: `delivery-${trackingNumber}`,
          }),
        })

        const paymentData = await paymentResponse.json()

        if (!paymentResponse.ok || paymentData.status !== 'success') {
          throw new Error(paymentData.error || 'Payment initiation failed')
        }

        // Redirect to Flutterwave payment page
        window.location.href = paymentData.data.link
        return
      }

      toast.success(`Delivery request created! Tracking: ${trackingNumber}`)
      
      // Redirect to tracking page
      setTimeout(() => {
        router.push(`/delivery/${trackingNumber}`)
        router.refresh()
      }, 1500)
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'Failed to create delivery request')
    } finally {
      setSubmitting(false)
    }
  }

  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₦'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            Send a <span className="text-orange-600">Parcel</span>
          </h1>
          <p className="text-lg text-slate-600">Fast, reliable, and affordable delivery service</p>
        </div>

        {/* Step indicator */}
        <div className="flex justify-between mb-8 max-w-2xl mx-auto">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 ${
                  s <= step
                    ? 'bg-orange-600 text-white'
                    : 'bg-slate-300 text-slate-600'
                }`}
              >
                {s}
              </div>
              <p className="text-sm text-slate-600">
                {s === 1 ? 'Vehicle' : s === 2 ? 'Details' : 'Review'}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Step 1: Vehicle Type Selection */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Choose Your Vehicle</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {Object.entries(vehicles).map(([key, vehicle]) => {
                  const Icon = vehicle.icon
                  return (
                    <div
                      key={key}
                      onClick={() => setVehicleType(key)}
                      className={`p-6 rounded-lg border-2 cursor-pointer transition ${
                        vehicleType === key
                          ? `border-orange-600 bg-orange-50`
                          : 'border-slate-200 hover:border-orange-300'
                      }`}
                    >
                      <Icon className={`w-12 h-12 mb-4 ${vehicleType === key ? 'text-orange-600' : 'text-slate-600'}`} />
                      <h3 className="font-semibold text-slate-800 mb-2">{vehicle.name}</h3>
                      <p className="text-sm text-slate-600 mb-3">{vehicle.description}</p>
                      <div className="space-y-1 text-sm">
                        <p className="font-medium text-slate-700">
                          From: {currency}{(vehicle.baseFee).toLocaleString()}
                        </p>
                        <p className="text-slate-500">
                          Max weight: {vehicle.maxWeight}kg
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-lg transition"
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 2: Fill Details */}
          {step === 2 && (
            <form onSubmit={(e) => { e.preventDefault(); setStep(3); }} className="space-y-8">
              {/* Sender Information */}
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-green-600" />
                  Sender Information
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      required
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Street Address"
                    value={senderAddress}
                    onChange={(e) => setSenderAddress(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                    required
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="City"
                      value={senderCity}
                      onChange={(e) => setSenderCity(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      required
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={senderState}
                      onChange={(e) => setSenderState(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleGeocodeSender}
                    className={`w-full py-2 rounded-lg font-medium transition ${
                      senderCoords
                        ? 'bg-green-100 text-green-700 border border-green-300'
                        : 'bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {senderCoords ? '✓ Location Confirmed' : 'Confirm Location'}
                  </button>
                  <p className="text-xs text-slate-500 text-center">
                    💡 Tip: Use city and state names (e.g., "Lagos, Lagos" or "Lekki, Lagos")
                  </p>
                </div>
              </div>

              {/* Recipient Information */}
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-red-600" />
                  Recipient Information
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      required
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>
                  <input
                    type="email"
                    placeholder="Email Address (Optional)"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Street Address"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                    required
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="City"
                      value={recipientCity}
                      onChange={(e) => setRecipientCity(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      required
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={recipientState}
                      onChange={(e) => setRecipientState(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleGeocodeRecipient}
                    className={`w-full py-2 rounded-lg font-medium transition ${
                      recipientCoords
                        ? 'bg-green-100 text-green-700 border border-green-300'
                        : 'bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {recipientCoords ? '✓ Location Confirmed' : 'Confirm Location'}
                  </button>
                  <p className="text-xs text-slate-500 text-center">
                    💡 Tip: Use city and state names (e.g., "Lagos, Lagos" or "Lekki, Lagos")
                  </p>
                </div>
              </div>

              {/* Package Information */}
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                  <Package className="w-5 h-5 mr-2 text-purple-600" />
                  Package Details
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select
                      value={packageType}
                      onChange={(e) => setPackageType(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                    >
                      <option value="parcel">Standard Parcel</option>
                      <option value="document">Document</option>
                      <option value="fragile">Fragile Item (+₦500)</option>
                      <option value="perishable">Perishable</option>
                    </select>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="Weight (kg)"
                      value={packageWeight}
                      onChange={(e) => setPackageWeight(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>
                  <input
                    type="number"
                    placeholder="Package Value (₦) - Optional"
                    value={packageValue}
                    onChange={(e) => setPackageValue(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  />
                  <textarea
                    placeholder="Package Description (e.g., Electronics, Clothing, etc.)"
                    value={packageDescription}
                    onChange={(e) => setPackageDescription(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none"
                    rows="3"
                  />
                  <input
                    type="date"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                    required
                  />
                  <textarea
                    placeholder="Special Instructions (gate code, best time to deliver, etc.)"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none"
                    rows="2"
                  />
                </div>
              </div>

              {/* Insurance Option */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={insurance}
                    onChange={(e) => setInsurance(e.target.checked)}
                    className="w-4 h-4 accent-orange-600"
                  />
                  <span className="ml-3 text-sm text-slate-700">
                    Add insurance (0.5% of package value)
                  </span>
                </label>
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition"
                >
                  Review
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Review & Confirm */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Review Your Delivery</h2>

              {/* Sender Summary */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-slate-800 mb-2">📍 Sender</h4>
                <p className="text-sm text-slate-700">
                  {senderName} • {senderPhone}
                </p>
                <p className="text-sm text-slate-600">
                  {senderAddress}, {senderCity}, {senderState}
                </p>
              </div>

              {/* Recipient Summary */}
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h4 className="font-semibold text-slate-800 mb-2">📍 Recipient</h4>
                <p className="text-sm text-slate-700">
                  {recipientName} • {recipientPhone}
                </p>
                <p className="text-sm text-slate-600">
                  {recipientAddress}, {recipientCity}, {recipientState}
                </p>
              </div>

              {/* Package Summary */}
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-slate-800 mb-3">📦 Package Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600">Type</p>
                    <p className="font-medium text-slate-800 capitalize">{packageType}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Weight</p>
                    <p className="font-medium text-slate-800">{packageWeight} kg</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Vehicle</p>
                    <p className="font-medium text-slate-800">{vehicles[vehicleType].name}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Pickup Date</p>
                    <p className="font-medium text-slate-800">
                      {new Date(pickupDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {packageDescription && (
                  <div className="mt-3 pt-3 border-t border-purple-200">
                    <p className="text-slate-600 text-sm">Description:</p>
                    <p className="text-slate-800 text-sm">{packageDescription}</p>
                  </div>
                )}
              </div>

              {/* Payment Method Selection */}
              <div className="space-y-4">
                <h4 className="font-semibold text-slate-800">Payment Method</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Cash on Delivery */}
                  <div
                    onClick={() => setPaymentMethod('COD')}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                      paymentMethod === 'COD'
                        ? 'border-orange-600 bg-orange-50'
                        : 'border-slate-200 hover:border-orange-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 mt-1 ${
                        paymentMethod === 'COD'
                          ? 'border-orange-600 bg-orange-600'
                          : 'border-slate-300'
                      }`} />
                      <div>
                        <p className="font-semibold text-slate-800">Cash On Delivery</p>
                        <p className="text-sm text-slate-600">Pay when you receive your package</p>
                      </div>
                    </div>
                  </div>

                  {/* Pay Online */}
                  <div
                    onClick={() => setPaymentMethod('online')}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                      paymentMethod === 'online'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 mt-1 ${
                        paymentMethod === 'online'
                          ? 'border-blue-600 bg-blue-600'
                          : 'border-slate-300'
                      }`} />
                      <div>
                        <p className="font-semibold text-slate-800">Pay Online</p>
                        <p className="text-sm text-slate-600">Pay now with card or bank transfer</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing Summary */}
              <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
                <h4 className="font-semibold text-slate-800 mb-4 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-orange-600" />
                  Cost Breakdown
                </h4>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-slate-700">Base Fee</span>
                    <span className="font-medium">{currency}{(pricing.baseFee / 100).toLocaleString()}</span>
                  </div>
                  {pricing.weightFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-700">Weight Charge</span>
                      <span className="font-medium">{currency}{(pricing.weightFee / 100).toLocaleString()}</span>
                    </div>
                  )}
                  {pricing.handlingFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-700">Fragile Handling</span>
                      <span className="font-medium">{currency}{(pricing.handlingFee / 100).toLocaleString()}</span>
                    </div>
                  )}
                  {pricing.insuranceFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-700">Insurance</span>
                      <span className="font-medium">{currency}{(pricing.insuranceFee / 100).toLocaleString()}</span>
                    </div>
                  )}
                </div>
                <div className="border-t border-orange-300 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-800">Total Cost</span>
                    <span className="text-2xl font-bold text-orange-600">
                      {currency}{(pricing.total / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 flex gap-3">
                <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Estimated Delivery: 2 business days</p>
                  <p>You'll receive SMS/email updates on your delivery status</p>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Create Delivery Request
                    </>
                  )}
                </button>
              </div>

              {/* Terms */}
              <p className="text-xs text-slate-600 text-center">
                By submitting, you agree to our delivery terms and conditions
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
