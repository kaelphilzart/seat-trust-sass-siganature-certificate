import { ShieldCheck, FileText, Fingerprint } from 'lucide-react';
import Image from 'next/image';

export default function Solutions() {
  return (
    <section id="solutions" className="relative py-28 overflow-hidden bg-white">
      {/* FLOATING GLOW (match hero vibe) */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-1506h-150[#FF7F11]/10 blur-3xl rounded-full" />
        <div className="absolute -bottom-37.5 -right-30 w-125 h-125 bg-orange-200/20 blur-3xl rounded-full" />
      </div>

      <div className="max-w-6xl mx-auto px-6 relative">
        {/* HEADER */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-[#FF7F11] border border-orange-100 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF7F11] animate-ping" />
            Solutions
          </span>

          <h2 className="mt-6 text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            Built for
            <span className="text-[#FF7F11]"> trust infrastructure</span>
            <br />
            at scale
          </h2>

          <p className="mt-4 text-gray-500 text-lg leading-relaxed">
            Seal Trust replaces manual signing with verifiable digital identity,
            cryptographic proof, and instant certificate generation.
          </p>
        </div>

        {/* GRID */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          {/* CARD 1 */}
          <div className="group relative rounded-2xl overflow-hidden border bg-white transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
            <div className="absolute inset-0 bg-linear-to-brrom-[#FF7F11]/5 to-transparent opacity-0 group-hover:opacity-100 transition" />

            <div className="relative h-44 w-full overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1555949963-aa79dcee981c"
                alt="security"
                fill
                className="object-cover group-hover:scale-110 transition duration-700"
              />
            </div>

            <div className="p-6">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-[#FF7F11]" size={18} />
                <span className="text-xs text-gray-400">
                  Verification Layer
                </span>
              </div>

              <h3 className="mt-3 font-semibold text-lg text-gray-900 group-hover:text-[#FF7F11] transition">
                Digital Signature Verification
              </h3>

              <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                Cryptographic validation ensures documents cannot be modified
                after signing.
              </p>
            </div>
          </div>

          {/* CARD 2 */}
          <div className="group relative rounded-2xl overflow-hidden border bg-white transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
            <div className="absolute inset-0 bg-linear-to-br from-[#FF7F11]/5 to-transparent opacity-0 group-hover:opacity-100 transition" />

            <div className="relative h-44 w-full overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85"
                alt="certificate"
                fill
                className="object-cover group-hover:scale-110 transition duration-700"
              />
            </div>

            <div className="p-6">
              <div className="flex items-center gap-2">
                <FileText className="text-[#FF7F11]" size={18} />
                <span className="text-xs text-gray-400">Automation Engine</span>
              </div>

              <h3 className="mt-3 font-semibold text-lg text-gray-900 group-hover:text-[#FF7F11] transition">
                Certificate Generator
              </h3>

              <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                Generate and distribute certificates instantly with QR
                verification system.
              </p>
            </div>
          </div>

          {/* CARD 3 */}
          <div className="group relative rounded-2xl overflow-hidden border bg-white transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
            <div className="absolute inset-0 bg-linear-to-br from-[#FF7F11]/5 to-transparent opacity-0 group-hover:opacity-100 transition" />

            <div className="relative h-44 w-full overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1551836022-d5d88e9218df"
                alt="identity"
                fill
                className="object-cover group-hover:scale-110 transition duration-700"
              />
            </div>

            <div className="p-6">
              <div className="flex items-center gap-2">
                <Fingerprint className="text-[#FF7F11]" size={18} />
                <span className="text-xs text-gray-400">Identity Layer</span>
              </div>

              <h3 className="mt-3 font-semibold text-lg text-gray-900 group-hover:text-[#FF7F11] transition">
                Identity & Role Binding
              </h3>

              <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                Assign verified representatives for secure organizational
                authority flow.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
