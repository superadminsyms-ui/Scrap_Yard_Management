import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion'
import { APP_VERSION } from '@/config/version'
import {
  Warehouse,
  Package,
  Receipt,
  Wallet,
  FileText,
  ShieldCheck,
  Users,
  ArrowRightLeft,
  BarChart3,
  Building2,
  ArrowRight,
  Menu,
  X,
  ChevronDown,
  Mail,
  MapPin,
  Phone,
  TrendingUp,
  Globe,
  Lock,
  Zap,
  CheckCircle2,
} from 'lucide-react'

const FEATURES = [
  {
    icon: Warehouse,
    title: 'Yard Management',
    desc: 'Centralize control of multiple scrapyards. Monitor operations, assign managers, and track performance across all locations from a single dashboard.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Package,
    title: 'Container Tracking',
    desc: 'Register and monitor containers by material type, size, and weight. Real-time visibility into every container\'s status and location.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: Receipt,
    title: 'Invoicing & Billing',
    desc: 'Generate professional invoices with automatic price calculations, multi-material line items, and flexible discount management.',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Wallet,
    title: 'Cash Flow Control',
    desc: 'Track daily income and expenses per yard. Maintain accurate financial records with categorized cash flow entries.',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    icon: FileText,
    title: 'Reports & Analytics',
    desc: 'Generate periodic reports — daily, weekly, monthly, or quarterly. Export to PDF for stakeholder presentations.',
    gradient: 'from-rose-500 to-red-500',
  },
  {
    icon: ShieldCheck,
    title: 'Security & Roles',
    desc: 'Enterprise-grade security with JWT authentication, optional two-factor authentication, and role-based access control.',
    gradient: 'from-indigo-500 to-violet-500',
  },
]

const MODULES = [
  { icon: Warehouse, title: 'Yard Management', desc: 'Multi-scrapyard operations control' },
  { icon: Package, title: 'Container Tracking', desc: 'Material type & weight monitoring' },
  { icon: Receipt, title: 'Invoicing & Billing', desc: 'Automated price calculations' },
  { icon: Wallet, title: 'Cash Flow Control', desc: 'Income & expense tracking' },
  { icon: FileText, title: 'Reports & Analytics', desc: 'Periodic PDF exports' },
  { icon: Users, title: 'Customer Management', desc: 'Regular, VIP & Wholesale types' },
  { icon: ArrowRightLeft, title: 'Movement Tracking', desc: 'Inbound, outbound & transfers' },
  { icon: BarChart3, title: 'Stock Control', desc: 'Real-time inventory levels' },
  { icon: Building2, title: 'Multi-Company', desc: 'Hierarchical organization structure' },
  { icon: Lock, title: 'Security & Roles', desc: 'JWT + 2FA authentication' },
]

const STATS = [
  { value: 50, suffix: '+', label: 'Yards Managed' },
  { value: 10, suffix: 'K+', label: 'Tons Tracked' },
  { value: 500, suffix: '+', label: 'Invoices Generated' },
  { value: 99.9, suffix: '%', label: 'Uptime Guaranteed' },
]

const STEPS = [
  { icon: Building2, title: 'Register Your Company', desc: 'Add your company details and configure your operational structure.' },
  { icon: Warehouse, title: 'Set Up Your Yards', desc: 'Register scrapyards, assign managers, and configure containers.' },
  { icon: TrendingUp, title: 'Start Managing', desc: 'Track invoices, cash flow, and generate reports — all in one place.' },
]

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const motionValue = useMotionValue(0)
  const rounded = useTransform(motionValue, (v) => {
    if (value % 1 !== 0) return v.toFixed(1)
    return Math.round(v).toString()
  })

  useEffect(() => {
    if (isInView) {
      const controls = animate(motionValue, value, { duration: 2, ease: 'easeOut' })
      return controls.stop
    }
  }, [isInView, motionValue, value])

  return (
    <span ref={ref}>
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  )
}

function FadeInSection({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-white text-secondary-800 font-sans">
      {/* ── Navbar ── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-elevation-2 border-b border-navy-100'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="flex items-center gap-3"
              >
                <img src="/recycling_logo.png" alt="SYMS" className="h-8 w-8" />
                <span className={`text-lg font-bold tracking-wide ${scrolled ? 'text-navy-900' : 'text-white'}`}>
                  SYMS
                </span>
              </button>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollTo('features')} className={`text-sm transition-colors ${scrolled ? 'text-secondary-600 hover:text-navy-700' : 'text-white/80 hover:text-white'}`}>
                Features
              </button>
              <button onClick={() => scrollTo('modules')} className={`text-sm transition-colors ${scrolled ? 'text-secondary-600 hover:text-navy-700' : 'text-white/80 hover:text-white'}`}>
                Modules
              </button>
              <button onClick={() => scrollTo('about')} className={`text-sm transition-colors ${scrolled ? 'text-secondary-600 hover:text-navy-700' : 'text-white/80 hover:text-white'}`}>
                About
              </button>
              <button onClick={() => scrollTo('contact')} className={`text-sm transition-colors ${scrolled ? 'text-secondary-600 hover:text-navy-700' : 'text-white/80 hover:text-white'}`}>
                Contact
              </button>
              <Link to="/login" className="px-5 py-2 text-sm font-medium text-white bg-navy-700 rounded-full hover:bg-navy-800 transition-colors shadow-elevation-1">
                Sign In
              </Link>
            </div>

            <button className={`md:hidden ${scrolled ? 'text-navy-900' : 'text-white'}`} onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-white border-t border-navy-100 shadow-elevation-3">
            <div className="px-4 py-4 space-y-3">
              <button onClick={() => scrollTo('features')} className="block w-full text-left text-sm text-secondary-700 hover:text-navy-700 py-2">Features</button>
              <button onClick={() => scrollTo('modules')} className="block w-full text-left text-sm text-secondary-700 hover:text-navy-700 py-2">Modules</button>
              <button onClick={() => scrollTo('about')} className="block w-full text-left text-sm text-secondary-700 hover:text-navy-700 py-2">About</button>
              <button onClick={() => scrollTo('contact')} className="block w-full text-left text-sm text-secondary-700 hover:text-navy-700 py-2">Contact</button>
              <Link to="/login" className="block w-full text-center px-5 py-2.5 text-sm font-medium text-white bg-navy-700 rounded-full hover:bg-navy-800">
                Sign In
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }} />

        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-navy-700/50 border border-navy-600/50 mb-8"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-medium text-navy-200">Scrap Yard Management System</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
              >
                Streamline Your{' '}
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Scrapyard Operations
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg text-navy-300 max-w-xl mb-10 leading-relaxed"
              >
                Real-time tracking, invoicing, and cash flow management — all in one enterprise platform built for the recycling industry.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-semibold text-white bg-navy-600 rounded-full hover:bg-navy-500 shadow-elevation-3 transition-all hover:shadow-elevation-4"
                >
                  Get Started <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => scrollTo('features')}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-semibold text-navy-200 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all"
                >
                  Learn More <ChevronDown className="w-4 h-4" />
                </button>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="hidden lg:block"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl" />
                <div className="relative bg-navy-800/80 backdrop-blur-sm border border-navy-600/50 rounded-2xl p-6 shadow-2xl">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                    <span className="ml-2 text-xs text-navy-400">SYMS Dashboard</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-navy-700/50 rounded-lg p-3">
                      <div className="text-xs text-navy-400 mb-1">Revenue</div>
                      <div className="text-lg font-bold text-white">$24.5K</div>
                      <div className="text-xs text-emerald-400">+12.5%</div>
                    </div>
                    <div className="bg-navy-700/50 rounded-lg p-3">
                      <div className="text-xs text-navy-400 mb-1">Containers</div>
                      <div className="text-lg font-bold text-white">142</div>
                      <div className="text-xs text-blue-400">+8 today</div>
                    </div>
                    <div className="bg-navy-700/50 rounded-lg p-3">
                      <div className="text-xs text-navy-400 mb-1">Invoices</div>
                      <div className="text-lg font-bold text-white">38</div>
                      <div className="text-xs text-amber-400">5 pending</div>
                    </div>
                  </div>
                  <div className="bg-navy-700/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-navy-400">Weekly Performance</span>
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="flex items-end gap-1 h-20">
                      {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                        <motion.div
                          key={i}
                          className="flex-1 bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t"
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ duration: 0.8, delay: 0.8 + i * 0.1 }}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between mt-2">
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                        <span key={i} className="text-[10px] text-navy-500 flex-1 text-center">{d}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* ── Stats ── */}
      <section className="py-16 bg-white border-b border-navy-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {STATS.map((s, i) => (
              <FadeInSection key={s.label} delay={i * 0.1} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-navy-900 mb-1">
                  <AnimatedCounter value={s.value} suffix={s.suffix} />
                </div>
                <div className="text-sm text-secondary-500">{s.label}</div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-20 sm:py-28 bg-surface-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection className="text-center mb-16">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-navy-700 bg-navy-100 rounded-full mb-4">
              Core Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-secondary-500 max-w-xl mx-auto">
              A complete toolkit to manage your scrapyard operations efficiently and securely.
            </p>
          </FadeInSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="group bg-white rounded-2xl border border-navy-100 p-6 hover:shadow-elevation-4 hover:border-navy-200 transition-all"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-4 shadow-elevation-1`}>
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-navy-900 mb-2">{f.title}</h3>
                <p className="text-sm text-secondary-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Modules ── */}
      <section id="modules" className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection className="text-center mb-16">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-full mb-4">
              System Modules
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-4">
              Complete Operational Coverage
            </h2>
            <p className="text-secondary-500 max-w-xl mx-auto">
              Ten integrated modules working together to give you full control over your recycling business.
            </p>
          </FadeInSection>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {MODULES.map((m, i) => (
              <motion.div
                key={m.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                className="group relative bg-gradient-to-br from-navy-50 to-blue-50 rounded-xl p-5 text-center hover:shadow-elevation-3 transition-all cursor-default"
              >
                <div className="w-10 h-10 rounded-lg bg-white shadow-elevation-1 flex items-center justify-center mx-auto mb-3 group-hover:shadow-elevation-2 transition-shadow">
                  <m.icon className="w-5 h-5 text-navy-700" />
                </div>
                <h4 className="text-sm font-semibold text-navy-900 mb-1">{m.title}</h4>
                <p className="text-xs text-secondary-500">{m.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Dashboard Preview ── */}
      <section className="py-20 sm:py-28 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <FadeInSection>
              <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-300 bg-blue-500/10 border border-blue-500/20 rounded-full mb-4">
                Powerful Dashboard
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Real-Time Insights at Your Fingertips
              </h2>
              <p className="text-navy-300 leading-relaxed mb-8">
                Get a comprehensive overview of your operations with interactive charts, key metrics, and actionable insights — all updated in real-time.
              </p>
              <div className="space-y-4">
                {[
                  { icon: BarChart3, text: 'Interactive charts and visualizations' },
                  { icon: Zap, text: 'Real-time data synchronization' },
                  { icon: Globe, text: 'Multi-yard consolidated view' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-blue-400" />
                    </div>
                    <span className="text-navy-200">{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </FadeInSection>

            <FadeInSection delay={0.2}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-cyan-500/30 rounded-2xl blur-2xl" />
                <div className="relative bg-navy-800/90 backdrop-blur-sm border border-navy-600/50 rounded-2xl p-6 shadow-2xl">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-navy-700/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-navy-400">Total Revenue</span>
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="text-2xl font-bold text-white">$124,500</div>
                      <div className="text-xs text-emerald-400 mt-1">+18.2% vs last month</div>
                    </div>
                    <div className="bg-navy-700/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-navy-400">Active Yards</span>
                        <Warehouse className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="text-2xl font-bold text-white">12</div>
                      <div className="text-xs text-blue-400 mt-1">All operational</div>
                    </div>
                  </div>
                  <div className="bg-navy-700/30 rounded-lg p-4 mb-4">
                    <div className="text-xs text-navy-400 mb-3">Material Distribution</div>
                    <div className="space-y-2">
                      {[
                        { label: 'Aluminium', pct: 85, color: 'bg-blue-400' },
                        { label: 'Copper', pct: 62, color: 'bg-amber-400' },
                        { label: 'Iron', pct: 48, color: 'bg-emerald-400' },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center gap-3">
                          <span className="text-xs text-navy-300 w-20">{item.label}</span>
                          <div className="flex-1 h-2 bg-navy-600 rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full ${item.color} rounded-full`}
                              initial={{ width: 0 }}
                              whileInView={{ width: `${item.pct}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 1, delay: 0.5 }}
                            />
                          </div>
                          <span className="text-xs text-navy-400 w-8">{item.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {['Containers', 'Customers', 'Invoices'].map((label, i) => (
                      <div key={label} className="bg-navy-700/30 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-white">{[142, 89, 38][i]}</div>
                        <div className="text-[10px] text-navy-400">{label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-20 sm:py-28 bg-surface-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection className="text-center mb-16">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-navy-700 bg-navy-100 rounded-full mb-4">
              Getting Started
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-4">
              Up and Running in Minutes
            </h2>
            <p className="text-secondary-500 max-w-xl mx-auto">
              Three simple steps to transform your scrapyard management.
            </p>
          </FadeInSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-navy-200 via-blue-300 to-navy-200" />

            {STEPS.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
                className="relative text-center"
              >
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-navy-100 to-blue-100 border-4 border-white shadow-elevation-2 flex items-center justify-center mx-auto mb-6 relative z-10">
                  <s.icon className="w-10 h-10 text-navy-700" />
                </div>
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-navy-700 text-white text-sm font-bold mb-3 shadow-elevation-1">
                  {i + 1}
                </div>
                <h3 className="text-lg font-semibold text-navy-900 mb-2">{s.title}</h3>
                <p className="text-sm text-secondary-500 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section id="about" className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <FadeInSection>
              <div className="relative">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-navy-50 to-blue-50 flex items-center justify-center">
                  <img src="/Recycle-Logo.png" alt="Recycling" className="w-3/4 h-3/4 object-contain" />
                </div>
                <div className="absolute -bottom-4 -right-4 w-32 h-32 rounded-2xl bg-gradient-to-br from-navy-700 to-blue-600 border-4 border-white shadow-elevation-3 flex items-center justify-center">
                  <ShieldCheck className="w-12 h-12 text-white" />
                </div>
              </div>
            </FadeInSection>

            <FadeInSection delay={0.2}>
              <span className="inline-block px-3 py-1 text-xs font-semibold text-navy-700 bg-navy-100 rounded-full mb-4">
                About SYMS
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-6">
                Built for the Recycling Industry
              </h2>
              <p className="text-secondary-500 leading-relaxed mb-6">
                SYMS (Scrap Yard Management System) was designed specifically for scrapyards and recycling operations. We understand the unique challenges of managing multiple yards, tracking containers, processing invoices, and maintaining accurate cash flow records.
              </p>
              <p className="text-secondary-500 leading-relaxed mb-8">
                Our platform consolidates all your daily operations into a single, intuitive interface — giving you real-time visibility and control over every aspect of your business.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  'Multi-yard support',
                  'Real-time tracking',
                  'PDF report exports',
                  'Role-based access',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm text-secondary-700">{item}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => scrollTo('contact')}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-navy-700 bg-navy-50 rounded-full hover:bg-navy-100 transition-colors"
              >
                Get in Touch <ArrowRight className="w-4 h-4" />
              </button>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* ── CTA / Contact ── */}
      <section id="contact" className="py-20 sm:py-28 bg-gradient-to-br from-navy-900 via-navy-800 to-blue-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeInSection>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to Optimize Your Operations?
            </h2>
            <p className="text-lg text-navy-300 max-w-xl mx-auto mb-10">
              Join the yards already using SYMS to manage their daily operations with confidence.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold text-navy-900 bg-white rounded-full hover:bg-navy-50 shadow-elevation-3 transition-all"
              >
                Start Now <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
              {[
                { icon: Mail, label: 'Email', value: 'superadminsyms@gmail.com' },
                { icon: Phone, label: 'Phone', value: '8765805762' },
                { icon: MapPin, label: 'Location', value: 'Jamaica' },
              ].map((c) => (
                <div key={c.label} className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <c.icon className="w-5 h-5 text-blue-300" />
                  </div>
                  <span className="text-xs text-navy-400">{c.label}</span>
                  <span className="text-sm font-medium text-white">{c.value}</span>
                </div>
              ))}
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-navy-950 border-t border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src="/recycling_logo.png" alt="SYMS" className="h-6 w-6" />
              <span className="text-sm font-semibold text-navy-300">SYMS Management</span>
            </div>
            <p className="text-xs text-navy-500">
              © 2026 SYMS Management · {APP_VERSION}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
