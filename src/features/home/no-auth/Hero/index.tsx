'use client';

import Link from 'next/link';

export default function Hero() {
  return (
    <section
      id="home"
      className="relative isolate overflow-hidden pt-32 pb-24 bg-linear-to-b from-white via-white to-gray-50"
    >
      {/* BACKGROUND GLOW */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-35 left-1/2 -translate-x-1/2 w-162.5 h-162.5 
        bg-[#FF7F11]/20 opacity-50 blur-3xl rounded-full animate-pulse"
        />

        <div
          className="absolute -bottom-35 -right-30 w-130 h-130 
        bg-orange-300/20 opacity-40 blur-3xl rounded-full animate-[pulse_6s_ease-in-out_infinite]"
        />

        <div
          className="absolute top-[45%] -left-35 w-105 h-105 
        bg-amber-300/20 opacity-30 blur-3xl rounded-full animate-[pulse_8s_ease-in-out_infinite]"
        />
      </div>

      {/* CONTENT */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        {/* BADGE */}
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white border shadow-sm text-xs text-gray-600">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
          Digital Signature & Certificate SaaS
        </div>

        {/* TITLE */}
        <h1 className="mt-6 text-4xl md:text-6xl font-bold tracking-tight text-gray-900">
          Sign, Verify, and Generate
          <br />
          <span className="text-primary">Certificates in Seconds</span>
        </h1>

        {/* SUBTITLE */}
        <p className="mt-5 text-gray-500 text-lg max-w-2xl mx-auto">
          Seal Trust enables secure digital signatures, tamper-proof
          certificates, and instant QR-based verification for modern
          organizations.
        </p>

        {/* CTA */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/#product">
            <button className="px-6 py-3 rounded-lg bg-primary text-white font-medium transition hover:scale-105 active:scale-95 shadow-md">
              Explore Product
            </button>
          </Link>

          <Link href="/#how-it-works">
            <button className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition">
              How It Works
            </button>
          </Link>
        </div>

        {/* TRUST LINE */}
        <div className="mt-10 text-xs text-gray-400">
          Trusted for HR onboarding, event certification, and enterprise
          verification
        </div>

        {/* PREVIEW CARD */}
        <div className="mt-14 mx-auto max-w-3xl transition-transform duration-500 hover:scale-[1.02]">
          <div className="bg-white border rounded-2xl shadow-sm p-6 text-left">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-gray-900">
                Certificate Preview
              </div>
              <div className="text-xs text-green-600 font-medium">
                ✓ Verified by Seal Trust
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <div className="h-3 bg-gray-100 rounded w-2/3"></div>
              <div className="h-3 bg-gray-100 rounded w-1/2"></div>
              <div className="h-3 bg-gray-100 rounded w-3/4"></div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="text-xs text-gray-400">
                QR verified • tamper-proof • secure signature
              </div>
              <div className="w-10 h-10 rounded bg-gray-100 border animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
