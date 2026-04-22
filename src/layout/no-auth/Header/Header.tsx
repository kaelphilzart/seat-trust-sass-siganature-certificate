'use client';

import { useEffect, useState } from 'react';
import Logo from './Logo';
import HeaderLink from './Navigation/HeaderLink';
import MobileHeaderLink from './Navigation/MobileHeaderLink';
import SignIn from '@/features/home/no-auth/SignIn';
import { Icon } from '@iconify/react';
import { HeaderData } from '../menu';
import { Button } from '@/components/ui/button';

export default function Header() {
  const [navbarOpen, setNavbarOpen] = useState(false);
  const [sticky, setSticky] = useState(false);

  const [isSignInOpen, setIsSignInOpen] = useState(false);

  // =========================
  // STICKY HEADER
  // =========================
  useEffect(() => {
    const handleScroll = () => {
      setSticky(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // =========================
  // LOCK BODY SCROLL
  // =========================
  useEffect(() => {
    const isAnyOpen = navbarOpen || isSignInOpen;

    document.body.style.overflow = isAnyOpen ? 'hidden' : '';
  }, [navbarOpen, isSignInOpen]);

  // =========================
  // SMOOTH SCROLL
  // =========================
  const handleNavClick = (href: string) => {
    setNavbarOpen(false);

    if (href.startsWith('/#')) {
      const id = href.replace('/#', '');
      const el = document.getElementById(id);

      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        sticky ? 'bg-white shadow-md py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto max-w-7xl px-4 flex items-center justify-between">
        {/* LOGO */}
        <Logo />

        {/* DESKTOP NAV */}
        <nav className="hidden lg:flex gap-8 ml-12">
          {HeaderData.map((item, index) => (
            <div
              key={index}
              onClick={() => handleNavClick(item.href)}
              className="cursor-pointer"
            >
              <HeaderLink item={item} />
            </div>
          ))}
        </nav>

        {/* ACTIONS */}
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsSignInOpen(true)}
            variant="outline"
            className="hidden lg:block"
          >
            Sign In
          </Button>

          {/* MOBILE MENU BUTTON */}
          <button
            onClick={() => setNavbarOpen(!navbarOpen)}
            className="lg:hidden p-2"
          >
            <span className="block w-6 h-0.5 bg-black"></span>
            <span className="block w-6 h-0.5 bg-black mt-1.5"></span>
            <span className="block w-6 h-0.5 bg-black mt-1.5"></span>
          </button>
        </div>
      </div>

      {/* =========================
          MOBILE OVERLAY
      ========================= */}
      {navbarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setNavbarOpen(false)}
        />
      )}

      {/* =========================
          MOBILE MENU
      ========================= */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg z-50 transform transition-transform duration-300 ${
          navbarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <Logo />
          <button onClick={() => setNavbarOpen(false)}>
            <Icon icon="material-symbols:close" width={24} />
          </button>
        </div>

        <nav className="flex flex-col p-4 gap-4">
          {HeaderData.map((item, index) => (
            <div key={index} onClick={() => handleNavClick(item.href)}>
              <MobileHeaderLink item={item} />
            </div>
          ))}
        </nav>
      </div>

      {/* =========================
          SIGN IN MODAL
      ========================= */}
      {isSignInOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setIsSignInOpen(false)}
        >
          <div
            className="relative w-full max-w-md bg-white rounded-xl p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <SignIn onClose={() => setIsSignInOpen(false)} />
          </div>
        </div>
      )}
    </header>
  );
}
