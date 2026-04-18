'use client'

import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import SocialSignIn from './SocialSignIn'
import Logo from '@/layout/no-auth/Header/Logo'
import Loader from '@/components/Common/Loader'
import { useAlert } from '@/components/alert/alert-dialog-global'

export default function SignIn() {
  const router = useRouter()
  const alert = useAlert()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const loginUser = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      alert.error('Email dan password wajib diisi!')
      return
    }

    try {
      setLoading(true)

      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (res?.error) {
        alert.error(res.error || 'Email atau password salah')
        setLoading(false)
        return
      }

      alert.success('Login berhasil!')
      router.push('/')
      router.refresh()

    } catch (error: any) {
      alert.error(error?.message || 'Terjadi kesalahan saat login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className='mb-10 text-center mx-auto inline-block max-w-[160px]'>
        <Logo />
      </div>

      <SocialSignIn />

      <span className="z-1 relative my-8 block text-center before:absolute before:h-px before:w-[40%] before:bg-black/20 before:left-0 before:top-3 after:absolute after:h-px after:w-[40%] after:bg-black/20 after:top-3 after:right-0">
        <span className='relative z-10 inline-block px-3 text-base text-black'>
          OR
        </span>
      </span>

      <form onSubmit={loginUser}>
        <div className='mb-[22px]'>
          <input
            type='email'
            placeholder='Email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className='w-full rounded-md border px-5 py-3 border-gray-200 placeholder:text-black/30 focus:border-primary text-black'
          />
        </div>

        <div className='mb-[22px]'>
          <input
            type='password'
            placeholder='Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className='w-full rounded-md border px-5 py-3 border-gray-200 placeholder:text-black/30 focus:border-primary text-black'
          />
        </div>

        <div className='mb-9'>
          <button
            type='submit'
            disabled={loading}
            className='bg-primary w-full py-3 rounded-lg text-white border border-primary hover:text-primary hover:bg-transparent transition duration-300 disabled:opacity-60 flex items-center justify-center'
          >
            {loading ? <Loader /> : 'Sign In'}
          </button>
        </div>
      </form>

      <Link
        href='/forgot-password'
        className='mb-2 inline-block text-base text-primary hover:underline'
      >
        Forgot Password?
      </Link>

      <p className='text-black text-base'>
        Not a member yet?{' '}
        <Link href='/signup' className='text-primary hover:underline'>
          Sign Up
        </Link>
      </p>
    </>
  )
}