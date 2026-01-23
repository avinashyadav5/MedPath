"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, User, Calendar, MapPin, Stethoscope, Clock, Pill, AlertTriangle } from "lucide-react";
import { submitAssessment } from "@/app/actions/diagnosis-actions";
export function AssessmentForm({ userName }) {
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    async function handleSubmit(formData) {
        setIsLoading(true);
        setError(null);
        const result = await submitAssessment(formData);
        if (result?.error) {
            setError(result.error);
            setIsLoading(false);
        }
    }
    return (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card className="border-0 shadow-xl bg-card backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Stethoscope className="w-5 h-5 text-teal-600"/>
            Patient Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-6">
            {error && (<Alert variant="destructive">
                <AlertTriangle className="h-4 w-4"/>
                <AlertDescription>{error}</AlertDescription>
              </Alert>)}

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2 text-foreground">
                  <User className="w-4 h-4 text-muted-foreground"/>
                  Full Name *
                </Label>
                <Input id="name" name="name" defaultValue={userName} placeholder="John Doe" required/>
              </div>

              <div className="space-y-2">
                <Label htmlFor="age" className="flex items-center gap-2 text-foreground">
                  <Calendar className="w-4 h-4 text-muted-foreground"/>
                  Age *
                </Label>
                <Input id="age" name="age" type="number" min="1" max="120" placeholder="35" required/>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender" className="flex items-center gap-2 text-foreground">
                  Gender *
                </Label>
                <Select name="gender" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender"/>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city" className="flex items-center gap-2 text-foreground">
                  <MapPin className="w-4 h-4 text-muted-foreground"/>
                  City *
                </Label>
                <Input id="city" name="city" placeholder="New York" required/>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="symptoms" className="flex items-center gap-2 text-foreground">
                <AlertTriangle className="w-4 h-4 text-muted-foreground"/>
                Describe Your Symptoms *
              </Label>
              <Textarea id="symptoms" name="symptoms" placeholder="Please describe your symptoms in detail. For example: I have been experiencing severe headaches, dizziness, and blurred vision for the past week..." className="min-h-[120px]" required/>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration" className="flex items-center gap-2 text-foreground">
                <Clock className="w-4 h-4 text-muted-foreground"/>
                Duration of Symptoms
              </Label>
              <Input id="duration" name="duration" placeholder="e.g., 3 days, 2 weeks, 1 month"/>
            </div>

            <div className="space-y-2">
              <Label htmlFor="existingConditions" className="text-foreground">
                Existing Medical Conditions
              </Label>
              <Textarea id="existingConditions" name="existingConditions" placeholder="List any existing medical conditions (e.g., diabetes, hypertension, asthma)" className="min-h-[80px]"/>
            </div>

            <div className="space-y-2">
              <Label htmlFor="medications" className="flex items-center gap-2 text-foreground">
                <Pill className="w-4 h-4 text-muted-foreground"/>
                Current Medications
              </Label>
              <Textarea id="medications" name="medications" placeholder="List any medications you are currently taking" className="min-h-[80px]"/>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-lg p-4">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Disclaimer:</strong> This AI assessment is for informational purposes only and does not
                constitute medical advice. Please consult a qualified healthcare provider for proper diagnosis and
                treatment.
              </p>
            </div>

            <Button type="submit" className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-medium h-12 text-lg" disabled={isLoading}>
              {isLoading ? (<>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin"/>
                  Analyzing Symptoms...
                </>) : ("Get AI Assessment")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>);
}
