'use client'
import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useUpdates } from '@/lib/instantdbHooks'

export default function UpdatesModal() {
  const { activeUpdates, isLoading } = useUpdates()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [countdown, setCountdown] = useState(6)

  useEffect(() => {
    // Open modal if there are active updates and none have been seen
    if (activeUpdates.length > 0 && !localStorage.getItem('updates_seen')) {
      setIsOpen(true)
      setCountdown(6)
    }
  }, [activeUpdates])

  // Countdown effect
  useEffect(() => {
    if (!isOpen) return
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          localStorage.setItem('updates_seen', new Date().toISOString())
          setIsOpen(false)
          return 6
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen])

  if (isLoading || activeUpdates.length === 0) return null

  const current = activeUpdates[currentIndex]

  const handleNext = () => {
    if (currentIndex < activeUpdates.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      localStorage.setItem('updates_seen', new Date().toISOString())
      setIsOpen(false)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleClose = () => {
    localStorage.setItem('updates_seen', new Date().toISOString())
    setIsOpen(false)
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-10 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
        <div 
          className="bg-white shadow-2xl overflow-hidden relative w-80 h-80 flex flex-col justify-between p-6 border-4 border-orange-600"
          style={{
            borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
            animation: 'blob-animation 6s infinite'
          }}
        >
          <style>{`
            @keyframes blob-animation {
              0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
              50% { border-radius: 30% 60% 70% 40% / 40% 60% 30% 70%; }
            }
          `}</style>

          

          {/* Content */}
          <div className="flex flex-col items-center justify-center flex-1 text-center">
            {current.image && (
              <img src={current.image} alt={current.title} className="w-20 h-20 object-cover rounded-full mb-3" />
            )}
            <h2 className="text-lg font-bold text-slate-800 mb-2">{current.title}</h2>
            <p className="text-sm text-slate-600 line-clamp-3">{current.message}</p>
          </div>

          {/* Countdown */}
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 mb-2">{countdown}s</div>
            {/* Close Button */}
            <button
            onClick={() => {
              localStorage.setItem('updates_seen', new Date().toISOString())
              setIsOpen(false)
            }}
            className=" text-orange-600 hover:text-slate-600 p-1 z-10"
          >
            <X size={20} />
          </button>
          </div>
        </div>
      </div>
    </>
  )
}
