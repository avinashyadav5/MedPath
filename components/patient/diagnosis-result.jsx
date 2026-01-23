"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    User,
    Calendar,
    MapPin,
    AlertTriangle,
    Stethoscope,
    Heart,
    ArrowRight,
    Clock,
    FileText,
    ShieldAlert,
} from "lucide-react"
import { RiskMeter } from "./risk-meter"
import { DiagnosisLogic } from "./DiagnosisLogic"

const urgencyColors = {
    low: "bg-green-100 text-green-700 border-green-200",
    medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
    high: "bg-orange-100 text-orange-700 border-orange-200",
    critical: "bg-red-100 text-red-700 border-red-200",
}

export function DiagnosisResult({ prediction }) {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Assessment Results</h1>
                    <p className="text-muted-foreground">AI-generated health evaluation based on your symptoms</p>
                </div>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Patient Summary Card */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                >
                    <Card className="border-0 shadow-lg bg-card backdrop-blur-sm h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg text-foreground">
                                <User className="w-5 h-5 text-teal-600" />
                                Patient Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                                <User className="w-4 h-4 text-muted-foreground" />
                                <span className="text-foreground">{prediction.patient_name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span className="text-foreground">
                                    {prediction.age} years old, {prediction.gender}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                <span className="text-foreground">{prediction.city}</span>
                            </div>
                            {prediction.duration && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Clock className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-foreground">Duration: {prediction.duration}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Risk Meter Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="md:col-span-2"
                >
                    <Card className="border-0 shadow-lg bg-card backdrop-blur-sm h-full">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-lg text-foreground">
                                <Heart className="w-5 h-5 text-teal-600" />
                                Risk Assessment
                            </CardTitle>
                            <Badge className={`${urgencyColors[prediction.urgency]} border`}>
                                {prediction.urgency ? prediction.urgency.toUpperCase() : "UNKNOWN"} URGENCY
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <RiskMeter riskPercent={prediction.risk_percent} />
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Diagnosis Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
            >
                <Card className="border-0 shadow-lg bg-card backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-foreground">
                            <Stethoscope className="w-5 h-5 text-teal-600" />
                            AI Diagnosis
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-primary/10 dark:bg-primary/20 rounded-lg p-4 border border-primary/20">
                            <p className="text-card-foreground leading-relaxed">{prediction.diagnosis}</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Recommended Specialty:</span>
                            <Badge variant="secondary" className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary">
                                {prediction.specialty}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Bayesian & Logical Inference */}
            {prediction.raw_ai_response && (
                <DiagnosisLogic
                    hypotheses={prediction.raw_ai_response.hypotheses}
                    reasoning_trace={prediction.raw_ai_response.reasoning_trace}
                />
            )}

            {/* Advice Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
            >
                <Card className="border-0 shadow-lg bg-card backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-foreground">
                            <FileText className="w-5 h-5 text-teal-600" />
                            Medical Advice
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-foreground leading-relaxed">{prediction.advice}</p>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Red Flags Card */}
            {prediction.red_flags && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 }}
                >
                    <Card className="border-0 shadow-lg bg-destructive/10 dark:bg-destructive/20 backdrop-blur-sm border-destructive/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-destructive">
                                <ShieldAlert className="w-5 h-5" />
                                Warning Signs to Watch For
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-destructive leading-relaxed">{prediction.red_flags}</p>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
            >
                <Button
                    asChild
                    size="lg"
                    className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-medium"
                >
                    <Link href={`/patient/nearby-doctors/${prediction.id}`}>
                        <MapPin className="mr-2 h-5 w-5" />
                        View Nearby Doctors
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-border hover:bg-accent bg-transparent">
                    <Link href="/patient/assessment">
                        <AlertTriangle className="mr-2 h-5 w-5" />
                        New Assessment
                    </Link>
                </Button>
            </motion.div>

            {/* Disclaimer */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.7 }}
                className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-lg p-4 mt-8"
            >
                <p className="text-sm text-amber-800 dark:text-amber-200 text-center">
                    <strong>Important:</strong> This AI assessment is for informational purposes only and should not replace
                    professional medical advice. Please consult a qualified healthcare provider for proper diagnosis and
                    treatment.
                </p>
            </motion.div>
        </div>
    )
}
