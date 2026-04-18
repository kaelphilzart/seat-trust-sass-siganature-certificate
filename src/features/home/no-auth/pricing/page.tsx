"use client"

import { useEffect, useMemo, useRef, useState } from "react"

export default function Pricing() {
    const [active, setActive] = useState(1)
    const refs = useRef<(HTMLDivElement | null)[]>([])

    const plans = [
        {
            name: "Starter",
            price: 9,
            desc: "For small events & personal use",
            features: [
                "100 Certificates",
                "Basic QR Verification",
                "Template Upload"
            ],
            highlight: false
        },
        {
            name: "Growth",
            price: 29,
            desc: "For startups & growing teams",
            features: [
                "Unlimited Certificates",
                "Dynamic QR Layout",
                "Representative Binding",
                "Batch Automation"
            ],
            highlight: true
        },
        {
            name: "Scale",
            price: "Custom",
            desc: "For enterprises & institutions",
            features: [
                "White-label system",
                "API access",
                "Advanced security layer",
                "Dedicated support"
            ],
            highlight: false
        }
    ]

    /* =========================
       SCROLL ACTIVE TRACKING
    ========================= */
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const idx = Number(entry.target.getAttribute("data-index"))
                        setActive(idx)
                    }
                })
            },
            { threshold: 0.6 }
        )

        refs.current.forEach((el) => {
            if (el) observer.observe(el)
        })

        return () => observer.disconnect()
    }, [])

    /* =========================
       RECOMMENDED ENGINE (fixed Growth)
    ========================= */
    const recommended = useMemo(() => 1, [])

    return (
        <section
            id="pricing"
            className="relative py-28 bg-white overflow-hidden"
        >

            {/* GLOW */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-35 left-1/2 -translate-x-1/2 w-15050 bg-[#FF7F11]/10 blur-3xl rounded-full" />
            </div>

            <div className="max-w-6xl mx-auto px-6 relative">

                {/* HEADER */}
                <div className="text-center max-w-2xl mx-auto">

                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-[#FF7F11] border border-orange-100 text-xs">
                        Pricing
                    </span>

                    <h2 className="mt-6 text-4xl md:text-5xl font-bold text-gray-900">
                        Simple pricing for
                        <span className="text-[#FF7F11]"> every scale</span>
                    </h2>

                    <p className="mt-4 text-gray-500">
                        From small events to enterprise certificate systems — scale as you grow.
                    </p>
                </div>

                {/* GRID */}
                <div className="mt-16 grid md:grid-cols-3 gap-8 items-end">

                    {plans.map((plan, i) => {
                        const isActive = active === i
                        const isRecommended = recommended === i
                        const isGrowth = plan.highlight

                        return (
                            <div
                                key={i}
                                ref={(el) => {
                                    refs.current[i] = el
                                }}
                                data-index={i}
                                className={`
                  relative p-8 rounded-2xl border bg-white
                  transition-all duration-500 cursor-pointer

                  hover:-translate-y-2 hover:shadow-2xl

                  ${isActive ? "scale-[1.06] shadow-2xl z-20" : "opacity-70 scale-95"}
                  ${isGrowth ? "border-[#FF7F11] shadow-orange-200/40" : ""}
                `}
                            >

                                {/* SOFT GLOW */}
                                <div className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition bg-linear-to-br from-[#FF7F11]/10 to-transparent" />

                                {/* RECOMMENDED BADGE */}
                                {isRecommended && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <div className="relative">
                                            <div className="absolute inset-0 rounded-full bg-[#FF7F11]/30 animate-ping" />
                                            <div className="relative bg-[#FF7F11] text-white text-xs px-3 py-1 rounded-full">
                                                Recommended
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TITLE */}
                                <h3
                                    className={`
                    text-lg font-semibold
                    ${isGrowth ? "text-[#FF7F11]" : "text-gray-900"}
                  `}
                                >
                                    {plan.name}
                                </h3>

                                <p className="text-sm text-gray-500 mt-2">
                                    {plan.desc}
                                </p>

                                {/* PRICE */}
                                <div
                                    className={`
                    mt-6 text-3xl font-bold transition-all duration-300
                    ${isGrowth ? "text-[#FF7F11]" : "text-gray-900"}
                  `}
                                >
                                    {typeof plan.price === "number"
                                        ? `$${plan.price}`
                                        : plan.price}
                                    {typeof plan.price === "number" && (
                                        <span className="text-sm text-gray-400">/mo</span>
                                    )}
                                </div>

                                {/* FEATURES */}
                                <ul className="mt-6 space-y-3 text-sm text-gray-600">
                                    {plan.features.map((f, idx) => (
                                        <li key={idx}>✔ {f}</li>
                                    ))}
                                </ul>

                                {/* CTA */}
                                <button
                                    className={`
                    mt-8 w-full py-3 rounded-lg transition-all duration-300

                    ${isGrowth
                                            ? "bg-[#FF7F11] text-white hover:scale-105 shadow-lg"
                                            : "border hover:bg-gray-100"
                                        }
                  `}
                                >
                                    {isGrowth ? "Get Started" : "Select Plan"}
                                </button>

                            </div>
                        )
                    })}

                </div>
            </div>
        </section>
    )
}