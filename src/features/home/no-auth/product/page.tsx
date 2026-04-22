import Image from 'next/image';
import { CheckCircle2, QrCode, FileSignature } from 'lucide-react';

export default function Product() {
  return (
    <section id="product" className="relative py-28 overflow-hidden bg-white">
      {/* GLOW */}
      <div className="absolute inset-0 pointer-events-none">
        {/* MAIN CENTER GLOW */}
        <div
          className="absolute -top-35 left-1/2 -translate-x-1/2 w-162.5 h-162.5 
    bg-[#FF7F11]/20 opacity-50 blur-3xl rounded-full animate-pulse"
        />

        {/* RIGHT BOTTOM GLOW */}
        <div
          className="absolute -bottom-35 -right-30 w-130 h-130 
    bg-orange-300/20 opacity-40 blur-3xl rounded-full animate-[pulse_6s_ease-in-out_infinite]"
        />

        {/* LEFT MID GLOW */}
        <div
          className="absolute top-[45%] -left-35 w-105 h-105 
    bg-amber-300/20 opacity-30 blur-3xl rounded-full animate-[pulse_8s_ease-in-out_infinite]"
        />
      </div>

      <div className="max-w-6xl mx-auto px-6 relative grid md:grid-cols-2 gap-14 items-center">
        {/* LEFT CONTENT */}
        <div>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-[#FF7F11] border border-orange-100 text-xs">
            Product Overview
          </span>

          <h2 className="mt-5 text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            One system to
            <span className="text-[#FF7F11]"> issue & verify certificates</span>
          </h2>

          <p className="mt-4 text-gray-500 text-lg">
            Seal Trust is a unified platform for generating digital
            certificates, attaching QR verification, and binding cryptographic
            identity.
          </p>

          {/* FEATURES MINI */}
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FileSignature className="text-[#FF7F11]" size={18} />
              Template-based certificate generation
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <QrCode className="text-[#FF7F11]" size={18} />
              Dynamic QR binding per participant
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle2 className="text-[#FF7F11]" size={18} />
              Public verification system
            </div>
          </div>

          {/* CTA */}
          <div className="mt-8 flex gap-3">
            <button className="px-6 py-3 rounded-lg bg-[#FF7F11] text-white font-medium hover:scale-105 transition">
              Try System
            </button>

            <button className="px-6 py-3 rounded-lg border text-gray-700 hover:bg-gray-100 transition">
              View Demo
            </button>
          </div>
        </div>

        {/* RIGHT VISUAL (SYSTEM MOCK) */}
        <div className="relative">
          {/* MAIN CARD */}
          <div className="rounded-2xl border bg-white shadow-xl overflow-hidden hover:scale-[1.02] transition duration-500">
            <Image
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71"
              alt="dashboard"
              width={800}
              height={500}
              className="w-full h-85 object-cover"
            />

            {/* overlay UI mock */}
            <div className="p-6 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-900">
                  Certificate Dashboard
                </span>
                <span className="text-xs text-green-600">● Live System</span>
              </div>

              <div className="h-3 bg-gray-100 rounded w-2/3" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
              <div className="h-3 bg-gray-100 rounded w-3/4" />
            </div>
          </div>

          {/* FLOATING CARD */}
          <div className="absolute -bottom-6 -left-6 bg-white border shadow-lg rounded-xl p-4 w-48 animate-pulse">
            <div className="text-xs text-gray-500">QR Status</div>
            <div className="text-sm font-semibold text-green-600 mt-1">
              Verified ✓
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
