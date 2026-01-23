"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, Lock } from "lucide-react";
import Link from "next/link";
import { login } from "@/app/actions/auth-actions";
import { Logo } from "@/components/ui/logo";
export function LoginForm() {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  async function handleSubmit(formData) {
    setIsLoading(true);
    setError(null);
    try {
      const result = await login(formData);
      console.log("Login result:", result);
      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
      }
      else if (result?.success && result?.redirectTo) {
        console.log("Redirecting to:", result.redirectTo);
        // Use replace to prevent going back to login
        router.replace(result.redirectTo);
      }
      else {
        // Fallback if no redirectTo but success
        setError("Login succeeded but no redirect path provided");
        setIsLoading(false);
      }
    }
    catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  }
  return (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
    <Card className="w-full max-w-2xl shadow-xl border-0 bg-card backdrop-blur-sm">
      <CardHeader className="text-center space-y-4">
        <motion.div className="mx-auto" whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
          <Logo width={80} height={80} className="w-20 h-20 border-2 border-primary/20 shadow-xl mx-auto" />
        </motion.div>
        <div className="space-y-1">
          <CardTitle className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-muted-foreground text-base">Sign in to MedPath</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          {error && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>)}

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
              <Input id="password" name="password" type="password" placeholder="••••••••" className="pl-10" required />
            </div>
          </div>

          <Button type="submit" className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-medium" disabled={isLoading}>
            {isLoading ? (<>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>) : ("Sign In")}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {"Don't have an account? "}
            <Link href="/register" className="text-teal-600 hover:text-teal-700 font-medium">
              Register
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  </motion.div>);
}
