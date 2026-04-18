'use client'

import {
  CalendarPlus,
  Upload,
  Move,
  UserCheck,
  QrCode,
  ScanLine,
  DownloadCloud
} from "lucide-react"
import { useEffect, useRef, useState } from "react"

const steps = [
  {
    icon: CalendarPlus,
    title: "Create Event",
    desc: "Initialize certification event and participant structure."
  },
  {
    icon: Upload,
    title: "Upload Template Certificate",
    desc: "Upload base certificate design used for dynamic rendering."
  },
  {
    icon: Move,
    title: "Dynamic Layout (QR Position & Size)",
    desc: "Customize QR placement, size, and certificate layout dynamically."
  },
  {
    icon: UserCheck,
    title: "Assign Representative",
    desc: "Bind authorized representative for digital signature authority."
  },
  {
    icon: QrCode,
    title: "Auto Generate (QR + Signature Binding)",
    desc: "System generates QR and binds cryptographic signature automatically."
  },
  {
    icon: ScanLine,
    title: "Public Verification",
    desc: "Anyone can scan QR to verify authenticity in real-time."
  },
  {
    icon: DownloadCloud,
    title: "Send / Download to Participant",
    desc: "Final output delivered via download or direct distribution."
  }
]

export default function HowItWorks() {
  const [active, setActive] = useState(0)
  const refs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-index"))
            setActive(index)
          }
        })
      },
      {
        threshold: 0.6
      }
    )

    refs.current.forEach((el) => {
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <section 
    id="how-it-works"
    className="relative py-28 overflow-hidden bg-white">

      {/* GLOW */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-175700px] bg-[#FF7F11]/10 blur-3xl rounded-full" />
      </div>

      <div className="max-w-6xl mx-auto px-6 relative">

        {/* HEADER */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="px-3 py-1 text-xs rounded-full bg-orange-50 text-[#FF7F11] border border-orange-100">
            Automation Flow
          </span>

          <h2 className="mt-5 text-4xl md:text-5xl font-bold text-gray-900">
            From creation to <span className="text-[#FF7F11]">verified trust</span>
          </h2>

          <p className="mt-4 text-gray-500">
            Scroll to see how Seal Trust automates certificate issuance end-to-end.
          </p>
        </div>

        {/* TIMELINE */}
        <div className="mt-20 relative">

          {/* PROGRESS LINE BACKGROUND */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 hidden md:block" />

          {/* PROGRESS LINE ACTIVE */}
          <div
            className="absolute left-1/2 top-0 w-px bg-[#FF7F11] transition-all duration-500 hidden md:block"
            style={{
              height: `${(active / (steps.length - 1)) * 100}%`
            }}
          />

          <div className="space-y-24">

            {steps.map((step, i) => {
              const Icon = step.icon
              const isLeft = i % 2 === 0
              const isActive = i <= active

              return (
                <div
                  key={i}
                  data-index={i}
                  ref={(el) => {
                    refs.current[i] = el
                  }}
                  className="grid md:grid-cols-2 gap-10 items-center"
                >

                  {/* TEXT */}
                  <div className={`${isLeft ? "md:text-right" : "md:order-2 md:text-left"}`}>

                    <div className={`text-xs font-medium transition ${isActive ? "text-[#FF7F11]" : "text-gray-400"}`}>
                      Step {String(i + 1).padStart(2, "0")}
                    </div>

                    <h3 className={`mt-2 text-2xl font-semibold transition ${isActive ? "text-gray-900" : "text-gray-400"}`}>
                      {step.title}
                    </h3>

                    <p className="mt-3 text-gray-500">
                      {step.desc}
                    </p>
                  </div>

                  {/* CARD */}
                  <div className={`${isLeft ? "" : "md:order-1"} relative`}>

                    <div className={`p-6 rounded-2xl border transition duration-500 bg-white shadow-sm
                      ${isActive ? "shadow-xl scale-[1.02] border-orange-200" : "opacity-60"}`}>

                      <Icon
                        className={`${isActive ? "text-[#FF7F11]" : "text-gray-400"}`}
                      />

                      <div className="mt-4 space-y-2">
                        <div className={`h-3 rounded w-2/3 transition ${isActive ? "bg-orange-100" : "bg-gray-100"}`} />
                        <div className={`h-3 rounded w-1/2 transition ${isActive ? "bg-orange-100" : "bg-gray-100"}`} />
                      </div>

                    </div>

                  </div>

                </div>
              )
            })}

          </div>
        </div>

      </div>
    </section>
  )
}