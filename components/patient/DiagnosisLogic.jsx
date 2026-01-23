"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BrainCircuit, CheckCircle2, XCircle } from "lucide-react"

export function DiagnosisLogic({ hypotheses, reasoning_trace }) {
    if (!hypotheses && !reasoning_trace) return null

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-center gap-2 mb-4">
                    <BrainCircuit className="w-6 h-6 text-purple-600" />
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">AI Reasoning Engine</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Bayesian Probabilities */}
                    {hypotheses && hypotheses.length > 0 && (
                        <Card className="border-purple-100 dark:border-purple-900 shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    📊 Bayesian Analysis (Top Hypotheses)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {hypotheses.map((h, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex justify-between items-center text-sm font-medium">
                                            <span>{h.name}</span>
                                            <span className="text-purple-600">{h.probability}%</span>
                                        </div>
                                        <Progress value={h.probability} className="h-2 bg-gray-100 dark:bg-gray-800" />
                                        <div className="grid grid-cols-2 gap-2 text-xs mt-1">
                                            <div className="space-y-1">
                                                {h.evidence_for.slice(0, 2).map((ev, j) => (
                                                    <div key={j} className="flex items-start gap-1 text-green-600 dark:text-green-400">
                                                        <CheckCircle2 className="w-3 h-3 mt-0.5 shrink-0" />
                                                        <span>{ev}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="space-y-1">
                                                {h.evidence_against.slice(0, 2).map((ev, j) => (
                                                    <div key={j} className="flex items-start gap-1 text-red-500 dark:text-red-400">
                                                        <XCircle className="w-3 h-3 mt-0.5 shrink-0" />
                                                        <span>{ev}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Logical Deduction Trace */}
                    {reasoning_trace && reasoning_trace.length > 0 && (
                        <Card className="border-indigo-100 dark:border-indigo-900 shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    🧠 Logical Inference Trace
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="relative pl-4 border-l-2 border-indigo-200 dark:border-indigo-800 space-y-4">
                                    {reasoning_trace.map((step, i) => (
                                        <div key={i} className="relative">
                                            <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-indigo-500 border-2 border-white dark:border-gray-950"></div>
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                {step}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </motion.div>
        </div>
    )
}
