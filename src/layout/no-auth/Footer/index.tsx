'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Icon } from '@iconify/react/dist/iconify.js';
import { FooterLinkData } from '../menu';
import withBasePath from '@/utils/basePath';

import React from 'react';

export default function index() {
  return (
    <footer className="bg-[#0B0F19] relative overflow-hidden">
      {/* GLOW */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-125 h-125[#FF7F11]/10 blur-3xl rounded-full" />
        <div className="absolute -bottom-50 -right-25 w-100 h-100 bg-orange-500/10 blur-3xl rounded-full" />
      </div>

      <div className="container pt-32 pb-12 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-16 xl:gap-10">
          {/* BRAND */}
          <div className="col-span-4 flex flex-col gap-5">
            <Image
              src={withBasePath('/images/logos/seal-trust-logo-single.png')}
              alt="Seal Trust"
              width={48}
              height={64}
            />

            <p className="text-white/70 text-base leading-7">
              Trust infrastructure for digital certificates.
              <br />
              Issue, verify, and secure documents with cryptographic proof.
            </p>

            <div className="flex gap-3">
              {[
                'tabler:brand-twitter',
                'tabler:brand-linkedin',
                'tabler:brand-github',
                'tabler:brand-instagram',
              ].map((icon, i) => (
                <Link
                  key={i}
                  href="#"
                  className="bg-white/10 hover:bg-[#FF7F11] transition rounded-full p-2 text-white"
                >
                  <Icon icon={icon} className="text-xl" />
                </Link>
              ))}
            </div>
          </div>

          {/* LINKS */}
          <div className="col-span-5">
            <div className="grid grid-cols-2 gap-10">
              {FooterLinkData.map((section, i) => (
                <div key={i}>
                  <p className="text-white text-lg font-semibold mb-6">
                    {section.section}
                  </p>

                  <ul className="space-y-3">
                    {section.links.map((item, i) => (
                      <li key={i}>
                        <Link
                          href={item.href}
                          className="text-white/60 hover:text-white text-sm transition"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* SYSTEM CTA */}
          <div className="col-span-3">
            <h3 className="text-white text-lg font-semibold mb-4">
              System Alerts
            </h3>

            <p className="text-white/60 text-sm mb-5 leading-6">
              Get updates about certificate verification, security patches, API
              changes, and system health status.
            </p>

            <div className="relative">
              <input
                type="email"
                placeholder="Enter email for system updates"
                className="w-full py-3 px-4 rounded-lg bg-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7F11]"
              />

              <button className="mt-3 w-full py-3 rounded-lg bg-[#FF7F11] text-white font-medium hover:scale-[1.02] transition">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="border-t border-white/10 py-6 relative z-10">
        <div className="text-center text-white/50 text-sm space-y-1">
          <div>© 2026 Seal Trust — Digital Certificate Infrastructure</div>
          <div className="text-xs">Secure • Verified • Immutable</div>
        </div>
      </div>
    </footer>
  );
}
