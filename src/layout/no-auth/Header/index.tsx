'use client'

import { useEffect, useState } from 'react'
import Logo from './Logo'
import HeaderLink from '../Header/Navigation/HeaderLink'
import MobileHeaderLink from '../Header/Navigation/MobileHeaderLink'
import Signin from '@/features/home/no-auth/SignIn'
import SignUp from '@/features/home/no-auth/SignUp'
import { Icon } from '@iconify/react'
import { HeaderData } from '../menu'
import { Button } from '@/components/ui/button'

export default function index() {
    const [navbarOpen, setNavbarOpen] = useState(false)
    const [sticky, setSticky] = useState(false)
    const [isSignInOpen, setIsSignInOpen] = useState(false)
    const [isSignUpOpen, setIsSignUpOpen] = useState(false)

    // =========================
    // STICKY HEADER
    // =========================
    useEffect(() => {
        const handleScroll = () => {
            setSticky(window.scrollY > 10)
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // =========================
    // LOCK BODY SCROLL
    // =========================
    useEffect(() => {
        if (navbarOpen || isSignInOpen || isSignUpOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
    }, [navbarOpen, isSignInOpen, isSignUpOpen])

    // =========================
    // SMOOTH SCROLL FIX (IMPORTANT)
    // =========================
    const handleNavClick = (href: string) => {
        setNavbarOpen(false)

        if (href.startsWith('/#')) {
            const id = href.replace('/#', '')
            const el = document.getElementById(id)

            if (el) {
                el.scrollIntoView({ behavior: 'smooth' })
            }
        }
    }

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

                    <button
                        onClick={() => setIsSignInOpen(true)}
                        className="hidden lg:block text-primary border border-primary px-5 py-2 rounded-lg hover:bg-primary hover:text-white transition"
                    >
                        Sign In
                    </button>

                    <Button
                        onClick={() => setIsSignUpOpen(true)}
                        className="hidden lg:block"
                    >
                        Sign Up
                    </Button>

                    {/* MOBILE BUTTON */}
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

            {/* MOBILE MENU OVERLAY */}
            {navbarOpen && (
                <div className="fixed inset-0 bg-black/40 z-40" />
            )}

            {/* MOBILE MENU */}
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
                        <div
                            key={index}
                            onClick={() => handleNavClick(item.href)}
                        >
                            <MobileHeaderLink item={item} />
                        </div>
                    ))}
                </nav>
            </div>

            {/* MODALS (UNCHANGED SIMPLIFIED) */}
            {isSignInOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg">
                        <Signin />
                        <button onClick={() => setIsSignInOpen(false)}>Close</button>
                    </div>
                </div>
            )}

            {isSignUpOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg">
                        <SignUp />
                        <button onClick={() => setIsSignUpOpen(false)}>Close</button>
                    </div>
                </div>
            )}
        </header>
    )
}