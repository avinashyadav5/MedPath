"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Mail, Lock, User, Stethoscope, UserCircle } from "lucide-react";
import Link from "next/link";
import { register } from "@/app/actions/auth-actions";
import { Logo } from "@/components/ui/logo";
export function RegisterForm() {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState("patient");
  async function handleSubmit(formData) {
    setIsLoading(true);
    setError(null);
    const result = await register(formData);
    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  }
  return (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
    <Card className="w-full max-w-4xl shadow-xl border-0 bg-card backdrop-blur-sm">
      <CardHeader className="text-center space-y-4">
        <motion.div className="mx-auto" whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
          <Logo width={80} height={80} className="w-20 h-20 border-2 border-primary/20 shadow-xl mx-auto" />
        </motion.div>
        <div className="space-y-1">
          <CardTitle className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Create Account
          </CardTitle>
          <CardDescription className="text-muted-foreground text-base">Join MedPath today</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          {error && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>)}

          <div className="space-y-3">
            <Label className="text-foreground">I am a</Label>
            <RadioGroup value={role} onValueChange={(value) => setRole(value)} className="grid grid-cols-2 gap-4">
              <div>
                <RadioGroupItem value="patient" id="patient" className="peer sr-only" />
                <Label htmlFor="patient" className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 cursor-pointer transition-all">
                  <UserCircle className="mb-2 h-6 w-6 text-primary" />
                  <span className="text-sm font-medium text-card-foreground">Patient</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="doctor" id="doctor" className="peer sr-only" />
                <Label htmlFor="doctor" className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 cursor-pointer transition-all">
                  <Stethoscope className="mb-2 h-6 w-6 text-primary" />
                  <span className="text-sm font-medium text-card-foreground">Doctor</span>
                </Label>
              </div>
            </RadioGroup>
            <input type="hidden" name="role" value={role} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground">
              Full Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input id="name" name="name" type="text" placeholder="John Doe" className="pl-10" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input id="email" name="email" type="email" placeholder="you@example.com" className="pl-10" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input id="password" name="password" type="password" placeholder="••••••••" className="pl-10" minLength={6} required />
            </div>
            <p className="text-xs text-muted-foreground">At least 6 characters</p>
          </div>

          <Button type="submit" className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-medium" disabled={isLoading}>
            {isLoading ? (<>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>) : ("Create Account")}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-teal-600 hover:text-teal-700 font-medium">
              Sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  </motion.div>);
}
