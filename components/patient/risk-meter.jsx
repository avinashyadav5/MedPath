"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export function RiskMeter({ riskPercent }) {
    const [animatedPercent, setAnimatedPercent] = useState(0)

    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimatedPercent(riskPercent)
        }, 300)
        return () => clearTimeout(timer)
    }, [riskPercent])

    const getRiskLabel = (percent) => {
        if (percent <= 25) return { text: "text-green-600", label: "Low Risk" }
        if (percent <= 50) return { text: "text-yellow-600", label: "Moderate Risk" }
        if (percent <= 75) return { text: "text-orange-600", label: "High Risk" }
        return { text: "text-red-600", label: "Critical Risk" }
    }

    const { text, label } = getRiskLabel(riskPercent)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Risk Score</span>
                    <span className={`text-4xl font-black ${text}`}>{animatedPercent}%</span>
                </div>
                <div className={`px-4 py-1.5 rounded-full font-bold text-sm bg-muted/50 ${text} border border-current/20`}>
                    {label}
                </div>
            </div>

            <div className="relative pt-6 pb-2">
                {/* Gradient Bar */}
                <div className="h-6 w-full rounded-full bg-gradient-to-r from-green-500 via-yellow-500 via-orange-500 to-red-600 shadow-inner" />

                {/* Needle Indicator */}
                <motion.div
                    className="absolute top-0 bottom-0 w-1"
                    style={{ left: `${animatedPercent}%` }}
                    initial={{ left: "0%" }}
                    animate={{ left: `${animatedPercent}%` }}
                    transition={{ type: "spring", stiffness: 50, damping: 15, delay: 0.2 }}
                >
                    {/* The Needle Graphic */}
                    <div className="absolute -top-1 -left-3 w-6 h-6">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="text-foreground drop-shadow-md">
                            <path d="M12 2L15 10H9L12 2Z" /> {/* Top Triangle */}
                            <path d="M12 22L9 14H15L12 22Z" /> {/* Bottom Triangle (optional, or just use top marker) */}
                        </svg>
                    </div>
                    {/* The vertical line through the bar */}
                    <div className="absolute top-4 h-8 w-0.5 bg-foreground/80 -left-[1px]" />
                </motion.div>

                {/* Ticks/Scale */}
                <div className="absolute top-6 inset-x-0 h-full pointer-events-none">
                    <div className="w-0.5 h-full bg-white/20 absolute left-[25%]" />
                    <div className="w-0.5 h-full bg-white/20 absolute left-[50%]" />
                    <div className="w-0.5 h-full bg-white/20 absolute left-[75%]" />
                </div>
            </div>

            <div className="flex justify-between text-xs font-medium text-muted-foreground px-0.5">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
            </div>
        </div>
    )
}
