import React, { useState, useEffect } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  MessageSquare, Shield, Zap, ArrowRight, Lock 
} from 'lucide-react'
import { useAuth } from '../contexts/useAuth'
import { InteractiveRobotSpline } from '../components/ui/interactive-3d-robot' // Import Robot

export default function LandingPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2
      const y = (e.clientY / window.innerHeight - 0.5) * 2
      setMousePos({ x, y })
    }
    window.addEventListener('mousemove', handleGlobalMouseMove)
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  }

  return (
    <div className="min-h-screen text-[#e6e6e6] selection:bg-white selection:text-black overflow-x-hidden relative bg-[#050505]">
      
      {/* Subtle Background Glow to blend with Robot */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[20%] left-[50%] w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[150px] -translate-x-1/2" />
        <div className="absolute bottom-[10%] right-[-10%] w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[150px]" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-black" />
            </div>
            <span className="font-bold text-xl tracking-tighter text-white">ConvoX</span>
          </div>
          
          <div className="flex items-center gap-6">
            {!isAuthenticated ? (
              <>
                <button 
                  onClick={() => navigate('/login')}
                  className="text-sm font-medium hover:text-white transition-colors"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => navigate('/register')}
                  className="px-4 py-1.5 rounded-full bg-white text-black text-sm font-bold hover:bg-neutral-200 transition-all active:scale-95"
                >
                  Join
                </button>
              </>
            ) : (
              <button 
                onClick={() => navigate('/dashboard')}
                className="px-4 py-1.5 rounded-full border border-white/20 text-white text-sm font-bold hover:bg-white/5 transition-all"
              >
                Dashboard
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-24 pb-20 px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
          
          {/* Main Text Container */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="w-full lg:w-1/2 space-y-8 text-center lg:text-left"
          >
            <motion.div variants={itemVariants}>
              <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 backdrop-blur-md">
                Next Generation Messaging
              </span>
            </motion.div>
            
            <motion.h1 
              variants={itemVariants}
              className="text-5xl md:text-7xl font-black tracking-tight leading-[1] text-white"
            >
              Connect beyond <br /> 
              <span className="text-neutral-500">boundaries.</span>
            </motion.h1>

            <motion.p 
              variants={itemVariants}
              className="text-lg md:text-xl text-neutral-400 max-w-xl mx-auto lg:mx-0 font-medium"
            >
              A premium, monochromatic communication experience designed for clarity, security, and speed. Built for those who value privacy and minimalist design.
            </motion.p>

            <motion.div variants={itemVariants} className="pt-6">
              <button 
                onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
                className="group flex items-center justify-center lg:justify-start gap-3 bg-white text-black px-8 py-4 rounded-full text-lg font-black hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all active:scale-95 mx-auto lg:mx-0"
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Get Started for Free'}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>
          </motion.div>

          {/* Interactive Spline 3D Robot */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="w-full lg:w-1/2 h-[500px] md:h-[600px] relative mt-12 lg:mt-0 overflow-hidden rounded-[40px]"
            title="Interact with Whobee!"
          >
            <InteractiveRobotSpline 
              scene="https://prod.spline.design/PyzDhpQ9E5f1E3MT/scene.splinecode"
              className="absolute inset-x-0 top-0 w-full h-[calc(100%+80px)] cursor-grab active:cursor-grabbing hover:scale-[1.02] transition-transform duration-500"
            />
          </motion.div>

        </div>

        {/* 3D Interactive Feature Grid */}
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 perspective-[1000px]"
          >
            <TiltCard>
              <FeatureCard 
                icon={Lock} 
                title="Privacy First" 
                desc="End-to-end encryption ensures your conversations stay yours. No logging, no tracking."
              />
            </TiltCard>
            <TiltCard>
              <FeatureCard 
                icon={Zap} 
                title="Global Speed" 
                desc="Optimized for low latency. Experience real-time messaging without any lag, anywhere."
              />
            </TiltCard>
            <TiltCard>
              <FeatureCard 
                icon={Shield} 
                title="Moderation Control" 
                desc="Advanced admin tools and automated systems keep your communities safe and focused."
              />
            </TiltCard>
          </motion.div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="py-8 px-6 relative z-10 flex flex-col items-center justify-center text-center">
        <p className="text-neutral-600 text-xs font-medium tracking-wide flex items-center gap-4">
          <span>© 2026 ConvoX. All rights reserved.</span>
          <span className="w-1 h-1 rounded-full bg-neutral-700"></span>
          <a href="#" className="hover:text-neutral-400 transition-colors">Privacy Policy</a>
          <span className="w-1 h-1 rounded-full bg-neutral-700"></span>
          <a href="#" className="hover:text-neutral-400 transition-colors">Terms of Service</a>
        </p>
      </footer>
    </div>
  )
}

function TiltCard({ children }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 })
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 })

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"])

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const xPct = mouseX / width - 0.5
    const yPct = mouseY / height - 0.5
    x.set(xPct)
    y.set(yPct)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className="relative z-10 w-full h-full"
    >
      <div style={{ transform: "translateZ(30px)", height: "100%" }}>
         {children}
      </div>
    </motion.div>
  )
}

function FeatureCard({ icon: Icon, title, desc }) {
  return (
    <div className="p-8 h-full rounded-3xl bg-[#121214]/80 backdrop-blur-xl border border-white/10 hover:border-neutral-400 transition-colors group cursor-default shadow-2xl">
      <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-white group-hover:text-black transition-all">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{title}</h3>
      <p className="text-neutral-500 text-sm leading-relaxed">{desc}</p>
    </div>
  )
}
