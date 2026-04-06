import { useState } from 'react'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'
import { SignInPage } from '../components/ui/sign-in'

const testimonials = [
  {
    avatarSrc: "https://randomuser.me/api/portraits/women/57.jpg",
    name: "Sarah Chen",
    handle: "@sarahdigital",
    text: "Amazing platform! The user experience is seamless and the features are exactly what I needed."
  },
  {
    avatarSrc: "https://randomuser.me/api/portraits/men/64.jpg",
    name: "Marcus Johnson",
    handle: "@marcustech",
    text: "This service has transformed how I work. Clean design, powerful features, and excellent support."
  },
  {
    avatarSrc: "https://randomuser.me/api/portraits/men/32.jpg",
    name: "David Martinez",
    handle: "@davidcreates",
    text: "I've tried many platforms, but this one stands out. Intuitive, reliable, and genuinely helpful for productivity."
  },
]

function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  async function handleSignIn(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const email = formData.get('email')
    const password = formData.get('password')
    try {
      await login(email, password)
      toast.success('Welcome back!')
      navigate('/chat', { replace: true })
    } catch (error) {
      const message = error?.response?.data?.message || 'Login failed.'
      toast.error(message)
    }
  }

  function handleCreateAccount() {
    navigate('/register')
  }

  function handleResetPassword() {
    toast.info('Password reset coming soon!')
  }

  function handleGoogleSignIn() {
    toast.info('Google Sign-In coming soon!')
  }

  return (
    <div className="dark bg-background text-foreground h-screen overflow-hidden">
      <SignInPage
        title={<span className="font-light text-foreground tracking-tighter">Welcome Back</span>}
        description="Sign in to continue your real-time messaging experience."
        heroImageSrc="https://images.unsplash.com/photo-1642615835477-d303d7dc9ee9?w=2160&q=80"
        testimonials={testimonials}
        onSignIn={handleSignIn}
        onGoogleSignIn={handleGoogleSignIn}
        onResetPassword={handleResetPassword}
        onCreateAccount={handleCreateAccount}
      />
    </div>
  )
}

export default LoginPage
