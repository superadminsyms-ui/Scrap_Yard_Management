import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { APP_VERSION } from '@/config/version'
import {
  Warehouse,
  Package,
  Receipt,
  Wallet,
  FileText,
  ShieldCheck,
  ArrowRight,
  Menu,
  X,
  ChevronDown,
  Mail,
  MapPin,
  Phone,
} from 'lucide-react'
const FEATURES = [
  { icon: Warehouse, title: 'Yard Management', desc: 'Administer multiple scrapyards with full visibility and real-time tracking.' },
  { icon: Package, title: 'Container Tracking', desc: 'Register and monitor containers by material type, weight, and location.' },
  { icon: Receipt, title: 'Invoicing & Billing', desc: 'Generate invoices with automatic price calculations and discount management.' },
  { icon: Wallet, title: 'Cash Flow Control', desc: 'Daily balance registration with income and expense tracking per yard.' },
  { icon: FileText, title: 'Reports & Analytics', desc: 'Periodic reports (daily, weekly, monthly) with PDF export capabilities.' },
  { icon: ShieldCheck, title: 'Security & Roles', desc: 'JWT authentication, optional 2FA, and role-based access control.' },
]

const STEPS = [
  { icon: Warehouse, title: 'Register Your Yard', desc: 'Add your scrapyard details and configure your operational parameters.' },
  { icon: Package, title: 'Set Up Containers', desc: 'Register containers with material types, weights, and pricing.' },
  { icon: FileText, title: 'Start Managing', desc: 'Track invoices, cash flow, and generate reports — all in one place.' },
]

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
    <div className="min-h-screen bg-surface text-secondary-800 font-sans">
      {/* ── Navbar ── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-sidebar/95 backdrop-blur-md shadow-elevation-2' : 'bg-transparent'
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
                <span className="text-lg font-bold text-white tracking-wide">SYMS</span>
              </button>
            </div>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollTo('about')} className="text-sm text-sidebar-text hover:text-white transition-colors">About</button>
              <button onClick={() => scrollTo('contact')} className="text-sm text-sidebar-text hover:text-white transition-colors">Contact</button>
              <Link to="/login" className="px-5 py-2 text-sm font-medium text-white bg-emerald-600 rounded-full hover:bg-emerald-700 transition-colors">
                Sign In
              </Link>
            </div>

            {/* Mobile toggle */}
            <button className="md:hidden text-white" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-sidebar border-t border-sidebar-border">
            <div className="px-4 py-4 space-y-3">
              <button onClick={() => scrollTo('about')} className="block w-full text-left text-sm text-sidebar-text hover:text-white py-2">About</button>
              <button onClick={() => scrollTo('contact')} className="block w-full text-left text-sm text-sidebar-text hover:text-white py-2">Contact</button>
              <Link to="/login" className="block w-full text-center px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-full hover:bg-emerald-700">
                Sign In
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ─ Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-sidebar via-sidebar-active to-sidebar overflow-hidden">
        {/* Decorative grid pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium text-emerald-400">Smart Yard Management System</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            Streamline Your<br />
            <span className="text-emerald-400">Scrapyard Operations</span>
          </h1>

          <p className="text-lg sm:text-xl text-sidebar-text max-w-2xl mx-auto mb-10 leading-relaxed">
            Real-time tracking, invoicing, and cash flow management — all in one platform built for the recycling industry.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold text-white bg-emerald-600 rounded-full hover:bg-emerald-700 shadow-elevation-2 transition-all hover:shadow-elevation-3"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={() => scrollTo('about')}
              className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold text-sidebar-textActive bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all"
            >
              Learn More <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto">
            {[
              { value: '50+', label: 'Yards Managed' },
              { value: '1K+', label: 'Invoices' },
              { value: '99.9%', label: 'Uptime' },
              { value: '24/7', label: 'Support' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white">{s.value}</div>
                <div className="text-xs text-sidebar-text mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-surface to-transparent" />
      </section>

      {/* ── Features ── */}
      <section className="py-20 sm:py-28 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-secondary-800 mb-4">Everything You Need</h2>
            <p className="text-secondary-500 max-w-xl mx-auto">A complete toolkit to manage your scrapyard operations efficiently and securely.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="group bg-white rounded-2xl border border-outline p-6 hover:shadow-elevation-2 hover:border-emerald-200 transition-all">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
                  <f.icon className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-secondary-800 mb-2">{f.title}</h3>
                <p className="text-sm text-secondary-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-20 sm:py-28 bg-sidebar">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-sidebar-text max-w-xl mx-auto">Get up and running in three simple steps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line (desktop) */}
            <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-0.5 bg-sidebar-border" />

            {STEPS.map((s, i) => (
              <div key={s.title} className="relative text-center">
                <div className="w-24 h-24 rounded-full bg-sidebar-active border-4 border-sidebar flex items-center justify-center mx-auto mb-6 relative z-10">
                  <s.icon className="w-10 h-10 text-emerald-400" />
                </div>
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 text-white text-sm font-bold mb-3">
                  {i + 1}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{s.title}</h3>
                <p className="text-sm text-sidebar-text leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About ─ */}
      <section id="about" className="py-20 sm:py-28 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image side */}
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden flex items-center justify-center bg-[#f0f0f0]">
                <img
                  src="/tractor.jpeg"
                  alt="Scrapyard tractor"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 rounded-2xl bg-emerald-100 border-4 border-surface flex items-center justify-center">
                <ShieldCheck className="w-12 h-12 text-emerald-600" />
              </div>
            </div>

            {/* Text side */}
            <div>
              <span className="inline-block px-3 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-full mb-4">About SYMS</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-secondary-800 mb-6">Built for the Recycling Industry</h2>
              <p className="text-secondary-500 leading-relaxed mb-6">
                SYMS (Smart Yard Management System) was designed specifically for scrapyards and recycling operations. We understand the unique challenges of managing multiple yards, tracking containers, processing invoices, and maintaining accurate cash flow records.
              </p>
              <p className="text-secondary-500 leading-relaxed mb-8">
                Our platform consolidates all your daily operations into a single, intuitive interface — giving you real-time visibility and control over every aspect of your business.
              </p>
              <button
                onClick={() => scrollTo('contact')}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-emerald-700 bg-emerald-50 rounded-full hover:bg-emerald-100 transition-colors"
              >
                Get in Touch <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─ CTA / Contact ── */}
      <section id="contact" className="py-20 sm:py-28 bg-gradient-to-br from-emerald-600 to-emerald-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Ready to Optimize Your Operations?</h2>
          <p className="text-lg text-emerald-100 max-w-xl mx-auto mb-10">
            Join the yards already using SYMS to manage their daily operations with confidence.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold text-emerald-700 bg-white rounded-full hover:bg-emerald-50 shadow-elevation-2 transition-all"
            >
              Start Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Contact info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
            {[
              { icon: Mail, label: 'Email', value: 'info@syms.com' },
              { icon: Phone, label: 'Phone', value: '+1 (555) 123-4567' },
              { icon: MapPin, label: 'Location', value: 'Kingston, Jamaica' },
            ].map((c) => (
              <div key={c.label} className="flex flex-col items-center gap-2">
                <c.icon className="w-5 h-5 text-emerald-200" />
                <span className="text-xs text-emerald-200">{c.label}</span>
                <span className="text-sm font-medium text-white">{c.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─ Footer ── */}
      <footer className="bg-sidebar border-t border-sidebar-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src="/recycling_logo.png" alt="SYMS" className="h-6 w-6" />
              <span className="text-sm font-semibold text-sidebar-textActive">SYMS Management</span>
            </div>
            <p className="text-xs text-sidebar-text">
              © 2026 SYMS Management · {APP_VERSION}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
