import { useState } from 'react'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'
import { SignUpPage } from '../components/ui/sign-up'

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

function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()

  async function handleSignUp(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const username = formData.get('username')
    const email = formData.get('email')
    const password = formData.get('password')
    try {
      await register(username, email, password)
      toast.success('Account created successfully!')
      navigate('/chat', { replace: true })
    } catch (error) {
      const validationErrors = error?.response?.data?.errors
      const message = validationErrors?.[0]?.msg || error?.response?.data?.message || 'Registration failed.'
      toast.error(message)
    }
  }

  function handleSignIn() {
    navigate('/login')
  }

  function handleGoogleSignUp() {
    toast.info('Google Sign-Up coming soon!')
  }

  return (
    <div className="dark bg-background text-foreground h-screen overflow-hidden">
      <SignUpPage
        title={<span className="font-light text-foreground tracking-tighter">Create Account</span>}
        description="Join us and start your real-time messaging journey."
        heroImageSrc="https://images.unsplash.com/photo-1642615835477-d303d7dc9ee9?w=2160&q=80"
        testimonials={testimonials}
        onSignUp={handleSignUp}
        onGoogleSignUp={handleGoogleSignUp}
        onSignIn={handleSignIn}
      />
    </div>
  )
}

export default RegisterPage
