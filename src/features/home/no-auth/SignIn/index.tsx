'use client';

import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

import SocialSignIn from './SocialSignIn';
import Logo from '@/layout/no-auth/Header/Logo';
import Loader from '@/components/Common/Loader';
import { useAlert } from '@/components/alert/alert-dialog-global';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type Props = {
  onClose: () => void;
};

export default function SignIn({ onClose }: Props) {
  const alert = useAlert();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // ESC CLOSE
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const loginUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      alert.error(res.error || 'Email atau password salah');
      setLoading(false);
      return;
    }

    alert.success('Login berhasil!');

    setLoading(false);
    onClose(); // 🔥 CLOSE MODAL SETELAH LOGIN
  };

  return (
    <div className="relative w-full">
      {/* CLOSE BUTTON */}
      <Button
        onClick={onClose}
        variant="ghost"
        className="absolute right-0 top-0"
      >
        <X size={20} />
      </Button>

      {/* LOGO */}
      <div className="mb-10 text-center mx-auto inline-block max-w-[160px]">
        <Logo />
      </div>

      <SocialSignIn />

      {/* OR */}
      <span className="relative my-8 block text-center before:absolute before:h-px before:w-[40%] before:bg-black/20 before:left-0 before:top-3 after:absolute after:h-px after:w-[40%] after:bg-black/20 after:right-0 after:top-3">
        <span className="relative z-10 inline-block px-3 text-base text-black">
          OR
        </span>
      </span>

      {/* FORM */}
      <form onSubmit={loginUser}>
        <div className="mb-5">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border px-5 py-3 border-gray-200 placeholder:text-black/30 focus:border-primary text-black"
          />
        </div>

        <div className="mb-5">
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border px-5 py-3 border-gray-200 placeholder:text-black/30 focus:border-primary text-black"
          />
        </div>

        <div className="mb-9">
          <Button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-md bg-primary px-5 py-3 text-white border border-primary transition duration-300 hover:bg-transparent hover:text-primary disabled:opacity-60"
          >
            {loading ? <Loader /> : 'Sign In'}
          </Button>
        </div>
      </form>

      {/* LINKS */}
      <Link
        href="/forgot-password"
        className="mb-4 inline-block text-base text-primary hover:underline"
      >
        Forgot Password?
      </Link>

      <p className="text-black text-base">
        Not a member yet?{' '}
        <Link href="/auth/signup" className="text-primary hover:underline">
          Sign Up
        </Link>
      </p>
    </div>
  );
}
