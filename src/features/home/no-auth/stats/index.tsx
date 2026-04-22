'use client';

import { useEffect, useState, useRef } from 'react';

/* ===== COUNTER ===== */
function Counter({ target }: { target: number }) {
  const [count, setCount] = useState(0);
  const [start, setStart] = useState(false);
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStart(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!start) return;

    let current = 0;
    const duration = 1200;
    const step = target / (duration / 16);

    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [start, target]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

/* ===== SECTION ===== */
export default function StatsSection() {
  return (
    <section className="relative py-24 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      {/* subtle background glow */}
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-orange-200/30 blur-3xl rounded-full" />
      <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-amber-200/30 blur-3xl rounded-full" />

      <div className="relative max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* LEFT SIDE (TEXT) */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              Built for Scale,
              <br />
              <span className="text-primary">Trusted by Teams</span>
            </h2>

            <p className="mt-4 text-gray-500 max-w-md">
              From small events to enterprise workflows, Seal Trust powers
              secure certificate generation and verification at scale.
            </p>
          </div>

          {/* RIGHT SIDE (STATS GRID) */}
          <div className="grid grid-cols-2 gap-6">
            {/* CARD */}
            <div className="group p-6 rounded-2xl bg-white border shadow-sm hover:shadow-lg transition">
              <div className="text-2xl font-bold text-gray-900">
                <Counter target={10000} />+
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Certificates Generated
              </div>
            </div>

            <div className="group p-6 rounded-2xl bg-white border shadow-sm hover:shadow-lg transition">
              <div className="text-2xl font-bold text-gray-900">
                <Counter target={250} />+
              </div>
              <div className="text-sm text-gray-500 mt-1">Organizations</div>
            </div>

            <div className="group p-6 rounded-2xl bg-white border shadow-sm hover:shadow-lg transition">
              <div className="text-2xl font-bold text-gray-900">
                <Counter target={50000} />+
              </div>
              <div className="text-sm text-gray-500 mt-1">Participants</div>
            </div>

            <div className="group p-6 rounded-2xl bg-white border shadow-sm hover:shadow-lg transition">
              <div className="text-2xl font-bold text-gray-900">99.9%</div>
              <div className="text-sm text-gray-500 mt-1">
                Verification Accuracy
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
