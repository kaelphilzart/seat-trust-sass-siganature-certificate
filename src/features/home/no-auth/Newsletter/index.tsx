
import React from 'react'

export default function index() {
    return (
        <section id='contact' className='relative -mb-40 overflow-hidden'>

            {/* BACKGROUND GLOW */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-175 h-175 bg-[#FF7F11]/10 blur-3xl rounded-full" />
                <div className="absolute -bottom-50 -right-30 w-125 h-125 bg-orange-200/20 blur-3xl rounded-full" />
            </div>

            <div className='relative z-10'>
                <div className='mx-auto max-w-2xl md:max-w-7xl lg:px-24 px-6'>

                    <div className='
                        grid grid-cols-1 sm:grid-cols-2 gap-12
                        bg-white border rounded-3xl shadow-xl
                        px-8 py-16 md:py-20
                        relative overflow-hidden
                    '>

                        {/* LEFT CONTENT */}
                        <div>

                            {/* badge */}
                            <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-[#FF7F11] border border-orange-100 text-xs'>
                                <span className='w-2 h-2 rounded-full bg-[#FF7F11] animate-ping'></span>
                                Contact & Integration
                            </div>

                            {/* TITLE */}
                            <h3 className='text-4xl md:text-5xl font-bold mt-5 text-gray-900 leading-tight'>
                                Build your
                                <span className='text-[#FF7F11]'> certificate system</span>
                                <br />
                                in minutes
                            </h3>

                            {/* DESC */}
                            <p className='text-gray-500 mt-5 text-lg leading-relaxed'>
                                Get early access, request API integration, or talk to our team for enterprise deployment.
                                We help you automate certificate issuance, QR verification, and representative binding.
                            </p>

                            {/* TRUST LINE */}
                            <div className='mt-6 text-xs text-gray-400'>
                                Trusted for HR onboarding • Event certification • Enterprise verification
                            </div>

                            {/* INPUT CTA */}
                            <div className='mt-8 flex gap-3'>

                                <input
                                    type='email'
                                    placeholder='Enter your email for access'
                                    className='
                                        w-full px-4 py-4 rounded-xl
                                        border bg-white
                                        focus:outline-none focus:ring-2 focus:ring-[#FF7F11]/30
                                        transition
                                    '
                                />

                                <button className='
                                    px-6 py-4 rounded-xl
                                    bg-[#FF7F11] text-white font-medium
                                    hover:scale-105 active:scale-95
                                    transition shadow-lg
                                '>
                                    Get Access
                                </button>

                            </div>

                            {/* micro note */}
                            <p className='mt-3 text-xs text-gray-400'>
                                No spam. Only product updates & integration access.
                            </p>

                        </div>

                        {/* RIGHT VISUAL */}
                        <div className='relative hidden sm:flex items-center justify-center'>

                            <div className='relative w-full h-full flex items-center justify-center'>

                                <div className='
    w-70 h-80
    bg-white border rounded-2xl shadow-xl
    p-5
    hover:scale-105 transition duration-500
    relative overflow-hidden
'>

                                    {/* HEADER */}
                                    <div className="flex items-center justify-between">
                                        <div className="text-[11px] text-gray-400 tracking-wide">
                                            REPRESENTATIVE
                                        </div>

                                        <div className="flex items-center gap-1 text-green-600 text-[11px] font-medium">
                                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                            Verified
                                        </div>
                                    </div>

                                    {/* STATUS ICON */}
                                    <div className="mt-5 flex flex-col items-center text-center">
                                        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                                            <svg
                                                width="22"
                                                height="22"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                className="text-green-600"
                                            >
                                                <path
                                                    d="M9 12l2 2 4-4"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                                <path
                                                    d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                />
                                            </svg>
                                        </div>

                                        <div className="mt-3 text-sm font-semibold text-gray-900">
                                            Signature Verified
                                        </div>

                                        <div className="text-[11px] text-gray-400 mt-1">
                                            Representative identity validated
                                        </div>
                                    </div>

                                    {/* IDENTITY BLOCK */}
                                    <div className="mt-5 bg-gray-50 border rounded-xl p-3">
                                        <div className="text-[10px] text-gray-400">
                                            DIGITAL IDENTITY
                                        </div>

                                        <div className="mt-1 text-sm font-bold text-gray-900 uppercase tracking-wide">
                                            JOHN DOE
                                        </div>

                                        <div className="text-[11px] text-gray-500">
                                            Event Administrator
                                        </div>
                                    </div>

                                    {/* SIGNATURE LINE */}
                                    <div className="mt-4">
                                        <div className="flex items-center justify-between text-[10px] text-gray-400">
                                            <span>Seal Trust Network</span>
                                            <span className="text-green-600 font-medium">VALID</span>
                                        </div>

                                        <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div className="h-full w-3/4 bg-linear-to-r from-[#FF7F11] to-orange-300 rounded-full" />
                                        </div>
                                    </div>

                                </div>

                                {/* glow behind card */}
                                <div className='absolute w-75 h-75 bg-[#FF7F11]/20 blur-3xl rounded-full -z-10'></div>

                            </div>

                        </div>

                    </div>

                </div>
            </div>
        </section>
    )
}
