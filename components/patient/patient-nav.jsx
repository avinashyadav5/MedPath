"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, } from "@/components/ui/sheet";
import { FileText, Calendar, History, User, LogOut, Menu } from "lucide-react";
import { logout } from "@/app/actions/auth-actions";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/ui/logo";
import { useEffect, useState } from "react";
const navItems = [
  { href: "/patient/assessment", label: "New Assessment", icon: FileText },
  { href: "/patient/history", label: "History", icon: History },
  { href: "/patient/appointments", label: "Appointments", icon: Calendar },
];
export function PatientNav({ user }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) {
    return (<header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border w-full">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>);
  }
  return (<header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
    <div className="container mx-auto px-4">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center gap-4">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="w-5 h-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[350px] p-0">
              <SheetHeader className="p-6 border-b">
                <SheetTitle className="flex items-center gap-2">
                  <Logo width={32} height={32} />
                  <span className="font-bold text-xl">MedPath</span>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 p-4">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (<Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}>
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>);
                })}
              </nav>
            </SheetContent>
          </Sheet>

          <Link href="/patient/assessment" className="flex items-center gap-2">
            <Logo className="w-8 h-8 sm:w-10 sm:h-10 border border-primary/20 shadow-sm" width={40} height={40} />
            <span className="font-bold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              MedPath
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <nav className="hidden md:flex items-center gap-1 mr-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (<Link key={item.href} href={item.href} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"}`}>
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>);
            })}
          </nav>

          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2 sm:px-4">
                <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-teal-600" />
                </div>
                <span className="hidden lg:inline text-sm font-medium text-foreground">{user.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center gap-2 p-2">
                <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-teal-600" />
                </div>
                <div className="flex flex-col space-y-0.5">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate w-40">{user.email}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <form action={logout}>
                  <button type="submit" className="flex items-center w-full text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </button>
                </form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  </header>);
}
