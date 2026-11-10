"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function LandingPage() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState('hero')

  // Simple particle generator for hero section
  const [particles, setParticles] = useState<Array<{ id: number; left: string; size: number; delay: number; duration: number }>>([])

  useEffect(() => {
    // Generate particles on client side to avoid SSR mismatch
    const generated = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 4 + 2,
      delay: Math.random() * 5,
      duration: Math.random() * 10 + 10
    }))
    setParticles(generated)
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as any } }
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const techBadges = [
    { name: "Next.js 15", emoji: "⚡", color: "border-white/20 text-white" },
    { name: "TypeScript", emoji: "📘", color: "border-blue-500/30 text-blue-400" },
    { name: "Three.js", emoji: "🌍", color: "border-emerald-500/30 text-emerald-400" },
    { name: "Django REST", emoji: "🐍", color: "border-green-600/30 text-green-400" },
    { name: "Flask ML", emoji: "🧪", color: "border-teal-500/30 text-teal-400" },
    { name: "PostgreSQL", emoji: "🐘", color: "border-sky-500/30 text-sky-400" },
    { name: "Redis", emoji: "❤️", color: "border-red-500/30 text-red-400" },
    { name: "WebSockets", emoji: "🔌", color: "border-amber-500/30 text-amber-400" },
    { name: "Gemini 2.0", emoji: "♊", color: "border-indigo-500/30 text-indigo-400" },
    { name: "Llama 3.3", emoji: "🦙", color: "border-orange-500/30 text-orange-400" },
    { name: "LangChain", emoji: "🦜", color: "border-lime-500/30 text-lime-400" },
    { name: "Ethereum", emoji: "💎", color: "border-violet-500/30 text-violet-400" },
    { name: "Docker", emoji: "🐳", color: "border-cyan-500/30 text-cyan-400" },
    { name: "Tailwind CSS", emoji: "🎨", color: "border-sky-400/30 text-sky-300" },
    { name: "Framer Motion", emoji: "🎬", color: "border-pink-500/30 text-pink-400" },
  ]

  const features = [
    {
      emoji: "🌍",
      title: "Global Tracking",
      desc: "Real-time 3D globe showing all 85 shipments across 15 logistics hubs on 6 continents"
    },
    {
      emoji: "🌡️",
      title: "Temperature Monitoring",
      desc: "Live IoT telemetry with instant alerts when cold chain compliance is breached (2°C - 8°C threshold)"
    },
    {
      emoji: "🤖",
      title: "AI Assistant (ARIA)",
      desc: "Voice-enabled AI assistant supporting Hindi and English. Powered by Llama 3.3 70B via Groq with LangChain memory"
    },
    {
      emoji: "⛓️",
      title: "Blockchain Verification",
      desc: "Every delivery cryptographically verified on Ethereum Sepolia testnet. Immutable proof of custody"
    },
    {
      emoji: "📊",
      title: "ML Predictions",
      desc: "5 machine learning models: spoilage prediction, ETA accuracy, anomaly detection, demand forecasting, route optimization"
    },
    {
      emoji: "⚡",
      title: "Real-time Updates",
      desc: "Django Channels WebSocket architecture broadcasts live temperature fluctuations every 10 seconds"
    }
  ]

  return (
    <div className="bg-[#0a0e1a] text-slate-100 min-h-screen relative font-sans overflow-x-hidden selection:bg-sky-500/30 selection:text-sky-300 scroll-smooth">
      
      {/* Background Glow Elements */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-[40%] right-1/4 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Floating Particles CSS Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-sky-500/20"
            style={{
              left: p.left,
              bottom: '-20px',
              width: `${p.size}px`,
              height: `${p.size}px`,
              animation: `floatUp ${p.duration}s linear infinite`,
              animationDelay: `${p.delay}s`
            }}
          />
        ))}
      </div>

      <style jsx global>{`
        @keyframes floatUp {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          90% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(-110vh) scale(0.5);
            opacity: 0;
          }
        }
        @keyframes spinSlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes orbit {
          0% { transform: rotate(0deg) translateX(100px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(100px) rotate(-360deg); }
        }
        @keyframes orbitReverse {
          0% { transform: rotate(360deg) translateX(140px) rotate(-360deg); }
          100% { transform: rotate(0deg) translateX(140px) rotate(0deg); }
        }
      `}</style>

      {/* HEADER / NAVBAR */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-[#0a0e1a]/80 backdrop-blur-md border-b border-white/5 py-4 px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-2 font-mono font-bold text-lg text-white cursor-pointer select-none" onClick={() => scrollToSection('hero')}>
          <span className="text-xl animate-pulse">❄️</span>
          <span>COLD CHAIN <span className="text-sky-400">AI</span></span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <button onClick={() => scrollToSection('features')} className="hover:text-sky-400 transition-colors">Features</button>
          <button onClick={() => scrollToSection('techstack')} className="hover:text-sky-400 transition-colors">Tech Stack</button>
          <button onClick={() => scrollToSection('about')} className="hover:text-sky-400 transition-colors">About</button>
          <button onClick={() => scrollToSection('cta')} className="hover:text-sky-400 transition-colors">Demo Credentials</button>
        </div>

        <div>
          <button 
            onClick={() => router.push('/login')}
            className="bg-sky-500/10 border border-sky-500/30 text-sky-400 hover:bg-sky-500/25 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg transition-all"
          >
            Launch App →
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section id="hero" className="min-h-screen pt-28 flex flex-col justify-between items-center relative z-10 px-6 max-w-7xl mx-auto">
        <div className="flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-8">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-full text-xs font-bold tracking-wide"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
              NEXT-GEN ENTERPRISE TELEMETRY
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight"
            >
              <span className="bg-gradient-to-r from-white via-sky-100 to-sky-400 bg-clip-text text-transparent block">
                Cold Chain AI
              </span>
              <span className="text-xl sm:text-2xl font-mono text-slate-400 block mt-2 font-semibold">
                v2.0 Enterprise Logistics Platform
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto lg:mx-0"
            >
              AI-powered real-time monitoring for temperature-sensitive cargo. 
              Blockchain-verified deliveries. Powered by Gemini, Llama 3.3, and Ethereum.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2"
            >
              <button
                onClick={() => router.push('/login')}
                className="w-full sm:w-auto bg-[#0ea5e9] text-white hover:bg-sky-500 shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-[0_0_25px_rgba(14,165,233,0.5)] font-bold text-xs uppercase tracking-wider px-8 py-3.5 rounded-lg transition-all"
              >
                🚀 Launch Dashboard
              </button>
              
              <button
                onClick={() => scrollToSection('features')}
                className="w-full sm:w-auto bg-[#0f1629] border border-white/10 hover:bg-white/5 text-slate-300 font-bold text-xs uppercase tracking-wider px-8 py-3.5 rounded-lg transition-all"
              >
                📖 Learn More
              </button>
            </motion.div>
          </div>

          {/* Right CSS Orbiting Globe Column */}
          <div className="lg:col-span-5 flex justify-center items-center py-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 flex items-center justify-center pointer-events-none select-none"
            >
              {/* Outer Glow Circle representing Planet */}
              <div className="absolute w-44 h-44 sm:w-52 sm:h-52 md:w-60 md:h-60 rounded-full border border-sky-500/20 bg-sky-500/[0.03] shadow-[0_0_50px_rgba(14,165,233,0.1)] flex items-center justify-center">
                {/* Visual grid lines on globe */}
                <div className="absolute inset-0 rounded-full border-t border-b border-sky-500/10 scale-y-50" />
                <div className="absolute inset-0 rounded-full border-l border-r border-sky-500/10 scale-x-50" style={{ transform: 'rotate(45deg)' }} />
                <div className="absolute inset-0 rounded-full border border-dashed border-sky-500/15" />
                <span className="text-3xl sm:text-4xl animate-pulse">🌍</span>
              </div>

              {/* Orbit Path 1 */}
              <div 
                className="absolute w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 rounded-full border border-dashed border-[#0ea5e9]/25"
                style={{ transform: 'rotateX(70deg) rotateY(15deg)' }}
              />

              {/* Orbiting Dot 1 */}
              <div
                className="absolute w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_10px_#0ea5e9]"
                style={{
                  animation: 'orbit 8s linear infinite'
                }}
              />

              {/* Orbit Path 2 */}
              <div 
                className="absolute w-72 h-72 sm:w-80 sm:h-80 md:w-88 md:h-88 rounded-full border border-dashed border-indigo-500/20"
                style={{ transform: 'rotateX(30deg) rotateY(-30deg)' }}
              />

              {/* Orbiting Dot 2 */}
              <div
                className="absolute w-2.5 h-2.5 rounded-full bg-indigo-400 shadow-[0_0_10px_#6366f1]"
                style={{
                  animation: 'orbitReverse 12s linear infinite'
                }}
              />

              {/* Technical HUD details overlaying preview */}
              <div className="absolute top-2 left-2 font-mono text-[8px] sm:text-[9px] text-[#0ea5e9]/50 space-y-1">
                <p>SYS.LOCK: ONLINE</p>
                <p>GPS.LAT: 19.0760</p>
                <p>GPS.LON: 72.8777</p>
              </div>
              
              <div className="absolute bottom-2 right-2 font-mono text-[8px] sm:text-[9px] text-emerald-400/50 space-y-1 text-right">
                <p>NODES ACTIVE: 85</p>
                <p>LEDGER STATE: SYNCED</p>
                <p>ERR.LOG: 0</p>
              </div>
            </motion.div>
          </div>

        </div>

        {/* Hero Bottom Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="w-full border-t border-white/5 py-6 mt-4 flex flex-wrap justify-center md:justify-between items-center gap-4 text-slate-400 text-xs font-mono font-bold uppercase tracking-widest text-center"
        >
          <span>📦 85+ Shipments</span>
          <span className="hidden md:inline text-white/10">|</span>
          <span>🏢 15 Global Hubs</span>
          <span className="hidden md:inline text-white/10">|</span>
          <span>🤖 3 AI Models</span>
          <span className="hidden md:inline text-white/10">|</span>
          <span>⚡ Real-time WebSockets</span>
          <span className="hidden md:inline text-white/10">|</span>
          <span>⛓️ Blockchain Verified</span>
        </motion.div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto relative z-10 scroll-mt-16">
        
        {/* Header titles */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="text-xs font-bold font-mono text-sky-400 uppercase tracking-widest">
            LOGISTICS FRAMEWORK CORE
          </h2>
          <h3 className="text-2xl sm:text-4xl font-extrabold text-white">
            Everything you need to monitor cold chain logistics
          </h3>
          <p className="text-slate-400 text-sm font-mono mt-2">
            Built as an academic project at VIT Vellore
          </p>
        </div>

        {/* Feature 3x2 Grid */}
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((f, i) => (
            <motion.div
              key={i}
              variants={fadeInUp}
              className="bg-white/[0.02] hover:bg-white/[0.05] backdrop-blur border border-white/5 hover:border-sky-500/30 p-6 rounded-xl transition-all duration-300 group hover:shadow-[0_0_30px_rgba(14,165,233,0.1)]"
            >
              <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300 select-none">
                {f.emoji}
              </div>
              <h4 className="text-lg font-bold text-white mb-2 font-mono group-hover:text-sky-400 transition-colors">
                {f.title}
              </h4>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>

      </section>

      {/* TECH STACK SECTION */}
      <section id="techstack" className="py-20 bg-[#070b14]/50 border-y border-white/5 relative z-10 px-6">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-xs font-bold font-mono text-sky-400 uppercase tracking-widest">
              TECHNOLOGY BLUEPRINT
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Built with cutting-edge technology
            </h3>
          </div>

          {/* Staggered Animated Badges */}
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-3.5 max-w-4xl mx-auto"
          >
            {techBadges.map((badge, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                className={`flex items-center gap-1.5 border px-4 py-2 rounded-full bg-white/[0.01] hover:bg-white/[0.04] text-xs font-mono font-bold tracking-wide transition-all cursor-default select-none ${badge.color}`}
              >
                <span>{badge.emoji}</span>
                <span>{badge.name}</span>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </section>

      {/* ABOUT / PROJECT INFO SECTION */}
      <section id="about" className="py-24 px-6 max-w-7xl mx-auto relative z-10 scroll-mt-16">
        
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
          <h2 className="text-xs font-bold font-mono text-sky-400 uppercase tracking-widest">
            PROJECT OVERVIEW
          </h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
            About This Project
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* LEFT: Project Details Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white/[0.02] backdrop-blur border border-white/5 rounded-xl p-8 space-y-6 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-2 h-full bg-sky-500" />
            <h4 className="text-lg font-bold font-mono text-white uppercase tracking-wider border-b border-white/5 pb-3">
              🏛️ Academic Documentation
            </h4>
            
            <div className="space-y-4 text-xs sm:text-sm font-mono">
              <div className="flex justify-between items-start gap-4 py-1.5 border-b border-white/5">
                <span className="text-slate-500 uppercase font-semibold text-[10px]">Project</span>
                <span className="text-slate-200 text-right font-medium">Cold Chain Logistics Monitoring System</span>
              </div>
              <div className="flex justify-between items-start gap-4 py-1.5 border-b border-white/5">
                <span className="text-slate-500 uppercase font-semibold text-[10px]">Institution</span>
                <span className="text-slate-200 text-right">VIT Vellore</span>
              </div>
              <div className="flex justify-between items-start gap-4 py-1.5 border-b border-white/5">
                <span className="text-slate-500 uppercase font-semibold text-[10px]">Program</span>
                <span className="text-slate-200 text-right">Master of Computer Applications (MCA)</span>
              </div>
              <div className="flex justify-between items-start gap-4 py-1.5 border-b border-white/5">
                <span className="text-slate-500 uppercase font-semibold text-[10px]">Semester</span>
                <span className="text-slate-200 text-right">4th Semester Final Year</span>
              </div>
              <div className="flex justify-between items-start gap-4 py-1.5 border-b border-white/5">
                <span className="text-slate-500 uppercase font-semibold text-[10px]">Developer</span>
                <span className="text-slate-200 text-right font-bold text-sky-400">Rajiv Kumar</span>
              </div>
              <div className="flex justify-between items-start gap-4 py-1.5">
                <span className="text-slate-500 uppercase font-semibold text-[10px]">Arch Key</span>
                <span className="text-slate-300 text-right text-xs bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                  Full-Stack + AI + Blockchain + ML
                </span>
              </div>
            </div>
          </motion.div>

          {/* RIGHT: Architecture Diagram */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white/[0.02] backdrop-blur border border-white/5 rounded-xl p-8 space-y-6 shadow-2xl relative"
          >
            <h4 className="text-lg font-bold font-mono text-white uppercase tracking-wider border-b border-white/5 pb-3">
              ⚙️ Architecture Topology
            </h4>

            {/* Visual Node Diagram */}
            <div className="space-y-4 font-mono text-[10px] sm:text-xs">
              
              {/* Client layer */}
              <div className="flex justify-center">
                <div className="bg-sky-500/10 border border-sky-500/30 text-sky-300 px-4 py-2 rounded font-bold text-center w-40 shadow-[0_0_10px_rgba(14,165,233,0.1)]">
                  Browser (UI/Voice)
                </div>
              </div>
              
              {/* Arrow */}
              <div className="text-center text-slate-500">↓</div>

              {/* NextJS Node */}
              <div className="flex justify-center">
                <div className="bg-slate-800/80 border border-slate-700 text-slate-100 px-4 py-2 rounded font-bold text-center w-48">
                  Next.js 15 Middleware / API
                </div>
              </div>

              {/* Multi-directional Arrows */}
              <div className="grid grid-cols-3 text-center text-slate-500 max-w-sm mx-auto">
                <span>↙</span>
                <span>↓</span>
                <span>↘</span>
              </div>

              {/* Subsystems layer */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-center">
                <div className="bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 p-2 rounded">
                  <p className="font-bold">Django REST</p>
                  <p className="text-[8px] text-slate-500">Core Telemetry & Auth</p>
                </div>
                <div className="bg-teal-500/5 border border-teal-500/20 text-teal-400 p-2 rounded">
                  <p className="font-bold">Flask ML</p>
                  <p className="text-[8px] text-slate-500">Spoilage & Anomaly</p>
                </div>
                <div className="bg-indigo-500/5 border border-indigo-500/20 text-indigo-400 p-2 rounded">
                  <p className="font-bold">AI Integrations</p>
                  <p className="text-[8px] text-slate-500">Gemini & Llama 3.3</p>
                </div>
              </div>

              {/* Arrow */}
              <div className="grid grid-cols-3 text-center text-slate-500 max-w-sm mx-auto">
                <span>↓</span>
                <span></span>
                <span>↓</span>
              </div>

              {/* Persistence/Broker layer */}
              <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                <div className="bg-slate-900 border border-white/5 text-slate-400 p-2 rounded text-center">
                  <p className="font-bold">PostgreSQL & Redis</p>
                  <p className="text-[8px] text-slate-600">DB & WebSockets</p>
                </div>
                <div className="bg-violet-500/5 border border-violet-500/20 text-violet-400 p-2 rounded text-center">
                  <p className="font-bold">Sepolia Blockchain</p>
                  <p className="text-[8px] text-slate-500">Proof of Custody</p>
                </div>
              </div>

            </div>
          </motion.div>

        </div>
      </section>

      {/* CTA SECTION WITH DEMO CREDENTIALS */}
      <section id="cta" className="py-24 bg-[#070b14] border-t border-white/5 relative z-10 px-6 scroll-mt-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          
          <div className="space-y-2">
            <h2 className="text-xs font-bold font-mono text-sky-400 uppercase tracking-widest animate-pulse">
              GET AUTHORIZED ACCESS
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white">
              Ready to explore the dashboard?
            </h3>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              Login with the following pre-configured demonstration credentials to view the secure network panel.
            </p>
          </div>

          {/* Credentials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
            
            {/* Admin Credentials */}
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 text-left font-mono relative">
              <span className="absolute top-3 right-3 text-[9px] font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-1.5 py-0.5 rounded">
                WRITE/EDIT
              </span>
              <h4 className="text-slate-300 font-bold text-xs uppercase mb-3 flex items-center gap-1.5">
                <span>🔑</span> Admin Console
              </h4>
              <p className="text-slate-500 text-[10px] uppercase font-bold">Email</p>
              <p className="text-slate-200 text-xs select-all mb-2 font-semibold">admin@coldchain.com</p>
              <p className="text-slate-500 text-[10px] uppercase font-bold">Password</p>
              <p className="text-slate-200 text-xs select-all font-semibold">admin123</p>
            </div>

            {/* Viewer Credentials */}
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 text-left font-mono relative">
              <span className="absolute top-3 right-3 text-[9px] font-bold text-slate-400 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded">
                READ ONLY
              </span>
              <h4 className="text-slate-300 font-bold text-xs uppercase mb-3 flex items-center gap-1.5">
                <span>👁️</span> Viewer Console
              </h4>
              <p className="text-slate-500 text-[10px] uppercase font-bold">Email</p>
              <p className="text-slate-200 text-xs select-all mb-2 font-semibold">viewer@coldchain.com</p>
              <p className="text-slate-500 text-[10px] uppercase font-bold">Password</p>
              <p className="text-slate-200 text-xs select-all font-semibold">viewer123</p>
            </div>

          </div>

          <div>
            <button
              onClick={() => router.push('/login')}
              className="bg-[#0ea5e9] text-white hover:bg-sky-500 shadow-[0_0_25px_rgba(14,165,233,0.3)] hover:shadow-[0_0_35px_rgba(14,165,233,0.5)] font-bold text-sm uppercase tracking-wider px-12 py-4 rounded-lg transition-all"
            >
              🚀 Launch Dashboard →
            </button>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 border-t border-white/5 bg-[#05080f] relative z-10 px-6 text-center text-xs text-slate-500 space-y-3 font-mono">
        <p className="text-slate-400 font-bold text-sm font-sans">
          ❄️ Cold Chain AI v2.0 — MCA Final Year Project
        </p>
        <p className="max-w-2xl mx-auto leading-relaxed">
          VIT Vellore | Built with Next.js, Django, Flask, Gemini AI, Llama 3.3, Ethereum
        </p>
        <p className="text-slate-600">
          &copy; 2026 Rajiv Kumar. All rights reserved.
        </p>
      </footer>

    </div>
  )
}
