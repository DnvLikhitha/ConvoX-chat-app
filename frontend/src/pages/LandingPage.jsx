import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  MessageSquare, Shield, Users, Zap, 
  ArrowRight, Globe, Lock, Cpu
} from 'lucide-react'
import { useAuth } from '../contexts/useAuth'

export default function LandingPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  }

  return (
    <div className="min-h-screen text-[#e6e6e6] selection:bg-white selection:text-black">
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
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="text-center space-y-8"
          >
            <motion.div variants={itemVariants}>
              <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                Next Generation Messaging
              </span>
            </motion.div>
            
            <motion.h1 
              variants={itemVariants}
              className="text-5xl md:text-8xl font-black tracking-tight leading-[0.9] text-white"
            >
              Connect beyond <br /> 
              <span className="text-neutral-500">boundaries.</span>
            </motion.h1>

            <motion.p 
              variants={itemVariants}
              className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto font-medium"
            >
              A premium, monochromatic communication experience designed for clarity, security, and speed. Built for those who value privacy and minimalist design.
            </motion.p>

            <motion.div variants={itemVariants} className="pt-6">
              <button 
                onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
                className="group flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full text-lg font-black hover:bg-neutral-200 transition-all active:scale-95 mx-auto"
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Get Started for Free'}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>
          </motion.div>

          {/* Feature Grid */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32"
          >
            <FeatureCard 
              icon={Lock} 
              title="Privacy First" 
              desc="End-to-end encryption ensures your conversations stay yours. No logging, no tracking."
            />
            <FeatureCard 
              icon={Zap} 
              title="Global Speed" 
              desc="Optimized for low latency. Experience real-time messaging without any lag, anywhere."
            />
            <FeatureCard 
              icon={Shield} 
              title="Moderation Control" 
              desc="Advanced admin tools and automated systems keep your communities safe and focused."
            />
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-neutral-500 text-sm">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="font-bold text-white tracking-tighter">ConvoX</span>
            <span className="ml-2">© 2026. All rights reserved.</span>
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Status</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, desc }) {
  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1 }
      }}
      className="p-8 rounded-3xl bg-[#18181b] border border-[#27272a] hover:border-neutral-500 transition-colors group cursor-default"
    >
      <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-white group-hover:text-black transition-all">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{title}</h3>
      <p className="text-neutral-500 text-sm leading-relaxed">{desc}</p>
    </motion.div>
  )
}
