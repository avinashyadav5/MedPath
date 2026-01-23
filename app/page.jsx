import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Stethoscope, Calendar, MapPin, Shield } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
export default async function HomePage() {
  const session = await getSession();
  if (session) {
    if (session.role === "doctor") {
      redirect("/doctor/dashboard");
    }
    else {
      redirect("/patient/assessment");
    }
  }
  return (<main className="min-h-screen">
    {/* Header */}
    <header className="absolute top-0 w-full z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Logo width={32} height={32} />
          <span className="font-bold text-lg bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            MedPath
          </span>
        </div>
        <ThemeToggle />
      </div>
    </header>

    {/* Hero Section - Patient Registration */}
    <section className="relative bg-gradient-to-b from-teal-50/80 via-teal-50/40 to-white dark:from-slate-900 dark:via-slate-800 dark:to-background pt-24 sm:pt-32">
      <div className="container mx-auto px-4 py-16 sm:py-24 lg:py-32">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-xs sm:text-sm font-medium mb-6 sm:mb-8 border border-primary/20">
            <Logo width={16} height={16} />
            Intelligent Healthcare
          </div>
          <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Your Health <br className="hidden sm:block" />
            Journey, <span className="text-teal-500">Simplified</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 sm:mb-10 max-w-2xl mx-auto px-2">
            Get instant AI-powered health assessments, connect with verified doctors, and book appointments - all in
            one seamless platform.
          </p>
          <div className="flex flex-col xs:flex-row gap-4 justify-center px-4 xs:px-0">
            <Button asChild size="lg" className="bg-teal-500 hover:bg-teal-600 text-white font-medium px-8 py-6 text-base rounded-full w-full xs:w-auto">
              <Link href="/register">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-input hover:bg-accent hover:text-accent-foreground bg-background text-foreground font-medium px-8 py-6 text-base rounded-full w-full xs:w-auto">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>

    {/* Features Section */}
    <section className="py-16 sm:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-xl mx-auto px-2">
            Experience healthcare made simple with our intelligent platform
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
          <Card className="border border-border shadow-sm bg-card hover:shadow-md transition-shadow">
            <CardContent className="pt-8 text-center">
              <div className="w-14 h-14 bg-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">AI Assessment</h3>
              <p className="text-muted-foreground">
                Describe your symptoms and receive an instant AI-powered health evaluation with risk analysis.
              </p>
            </CardContent>
          </Card>
          <Card className="border border-border shadow-sm bg-card hover:shadow-md transition-shadow">
            <CardContent className="pt-8 text-center">
              <div className="w-14 h-14 bg-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Find Specialists</h3>
              <p className="text-muted-foreground">
                Discover nearby doctors and hospitals matched to your specific health needs.
              </p>
            </CardContent>
          </Card>
          <Card className="border border-border shadow-sm bg-card hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
            <CardContent className="pt-8 text-center">
              <div className="w-14 h-14 bg-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Book Instantly</h3>
              <p className="text-muted-foreground">
                Schedule appointments with doctors directly from the platform - no calls needed.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>

    {/* For Doctors Section */}
    <section className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-teal-500 via-teal-600 to-cyan-700 rounded-3xl p-8 md:p-12 text-white shadow-xl overflow-hidden relative">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm mb-6">
                <Stethoscope className="w-4 h-4" />
                For Healthcare Providers
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Join Our Doctor Network</h2>
              <p className="text-teal-100 mb-8 text-lg leading-relaxed max-w-lg">
                Expand your practice, manage appointments efficiently, and connect with patients seeking your
                expertise through our intelligent matching system.
              </p>
              <Button asChild size="lg" className="bg-white text-teal-600 hover:bg-gray-100 font-medium px-6 py-6 text-base rounded-lg">
                <Link href="/register">Register as Doctor</Link>
              </Button>
            </div>
            <div className="w-28 h-28 md:w-36 md:h-36 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center">
              <Shield className="w-14 h-14 md:w-20 md:h-20 text-white/70" strokeWidth={1.5} />
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Footer */}
    <footer className="py-8 border-t border-border bg-background">
      <div className="container mx-auto px-4 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} MedPath. All rights reserved.</p>
      </div>
    </footer>
  </main>);
}
