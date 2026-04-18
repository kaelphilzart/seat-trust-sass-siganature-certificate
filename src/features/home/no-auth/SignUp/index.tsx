'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import SocialSignUp from './SocialSignUp'
import Logo from '@/layout/no-auth/Header/Logo'
import Loader from '@/components/Common/Loader'

export default function SignUp() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const email = form.get('email') as string
    const password = form.get('password') as string

    try {
      const res = await fetch('/api/auth/signUp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      toast.success('Successfully registered')
      router.push('/auth/signin')
    } catch (err: any) {
      toast.error(err?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className='mb-10 text-center mx-auto inline-block max-w-[160px]'><Logo /></div>
      <SocialSignUp />
      <span className="relative my-8 block text-center before:absolute before:h-px before:w-[40%] before:bg-black/20 before:left-0 before:top-3 after:absolute after:h-px after:w-[40%] after:bg-black/20 after:right-0 after:top-3">
        <span className='relative z-10 inline-block px-3 text-base text-black'>OR</span>
      </span>

      <form onSubmit={handleSubmit}>
        <div className='mb-5'>
          <input type='email' name='email' placeholder='Email' required
            className='w-full rounded-md border px-5 py-3 border-gray-200 placeholder:text-black/30 focus:border-primary text-black'/>
        </div>
        <div className='mb-5'>
          <input type='password' name='password' placeholder='Password' required minLength={6}
            className='w-full rounded-md border px-5 py-3 border-gray-200 placeholder:text-black/30 focus:border-primary text-black'/>
        </div>
        <div className='mb-9'>
          <button type='submit' disabled={loading}
            className='flex w-full items-center justify-center rounded-md bg-primary px-5 py-3 text-white border border-primary transition duration-300 hover:bg-transparent hover:text-primary disabled:opacity-60'>
            {loading ? <Loader /> : 'Sign Up'}
          </button>
        </div>
      </form>

      <p className='mb-4 text-black text-base'>
        By creating an account you agree with our <Link href='/#' className='text-primary hover:underline'>Privacy</Link> and <Link href='/#' className='text-primary hover:underline'>Policy</Link>
      </p>

      <p className='text-black text-base'>
        Already have an account?
        <Link href='/auth/signin' className='pl-2 text-primary hover:underline'>Sign In</Link>
      </p>
    </>
  )
}