"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LayoutDashboard, Users, UserCog, Calendar, Brain, BarChart3, FileText, LogOut, Menu, X, } from "lucide-react";
import { logout } from "@/app/actions/auth-actions";
import { ThemeToggle } from "@/components/theme-toggle";
import { useState } from "react";
const sidebarItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "User Management", icon: Users },
  { href: "/admin/doctors", label: "Doctor Management", icon: UserCog },
  { href: "/admin/appointments", label: "Appointments", icon: Calendar },
  { href: "/admin/diagnoses", label: "AI Diagnoses", icon: Brain },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: FileText },
];
import { Logo } from "@/components/ui/logo";
export function AdminSidebar({ user }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  return (<>
    {/* Mobile menu button */}
    <div className="lg:hidden fixed top-4 left-4 z-50">
      <Button variant="outline" size="icon" onClick={() => setMobileOpen(!mobileOpen)} className="bg-white shadow-md">
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>
    </div>

    {/* Mobile overlay */}
    {mobileOpen && <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileOpen(false)} />}

    {/* Sidebar */}
    <aside className={cn("fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out lg:translate-x-0", mobileOpen ? "translate-x-0" : "-translate-x-full")}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800">
          <Logo className="w-12 h-12 border border-violet-500/30 shadow-md" width={48} height={48} />
          <div>
            <h1 className="font-bold text-xl tracking-tight text-white">MedPath</h1>
            <p className="text-[10px] uppercase font-bold tracking-widest text-violet-400">Admin Portal</p>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <ThemeToggle />
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-4 py-6">
          <nav className="space-y-1">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href;
              return (<Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className={cn("flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors", isActive ? "bg-violet-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white")}>
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>);
            })}
          </nav>
        </ScrollArea>

        {/* User section */}
        <div className="px-4 py-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-800/50">
            <div className="w-10 h-10 bg-violet-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold">{user.name.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
          <form action={logout} className="mt-3">
            <Button type="submit" variant="ghost" className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800">
              <LogOut className="w-4 h-4 mr-3" />
              Sign Out
            </Button>
          </form>
        </div>
      </div>
    </aside>
  </>);
}
