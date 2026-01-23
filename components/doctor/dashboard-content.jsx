"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Clock, ArrowRight, MapPin, Stethoscope, Building } from "lucide-react";
import { AppointmentCard } from "./appointment-card";
export function DashboardContent({ profile, stats, appointments }) {
    const recentAppointments = appointments.slice(0, 5);
    return (<div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
            <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
              {(typeof profile.specialty === "string" && profile.specialty.startsWith("[")
            ? JSON.parse(profile.specialty)
            : Array.isArray(profile.specialty)
                ? profile.specialty
                : [profile.specialty]).map((s, i) => (<Badge key={i} variant="secondary" className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors">
                  <Stethoscope className="w-3 h-3 mr-1"/>
                  {s}
                </Badge>))}
              {(typeof profile.city === "string" && profile.city.startsWith("[")
            ? JSON.parse(profile.city)
            : Array.isArray(profile.city)
                ? profile.city
                : [profile.city]).map((c, i) => (<Badge key={i} variant="outline" className="border-border/50 bg-muted/30">
                  <MapPin className="w-3 h-3 mr-1"/>
                  {c}
                </Badge>))}
              {(profile.hospital_name && (typeof profile.hospital_name === "string" && profile.hospital_name.startsWith("[")
            ? JSON.parse(profile.hospital_name)
            : Array.isArray(profile.hospital_name)
                ? profile.hospital_name
                : [profile.hospital_name]) || []).filter(Boolean).map((h, i) => (<Badge key={i} variant="outline" className="border-border/50 bg-muted/30">
                  <Building className="w-3 h-3 mr-1"/>
                  {h}
                </Badge>))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="h-full">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-500 to-cyan-500 text-white overflow-hidden h-full">
            <CardContent className="pt-6 h-full flex flex-col justify-center">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-teal-100 text-sm">Total Appointments</p>
                  <p className="text-3xl sm:text-4xl font-bold">{stats?.total || 0}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6"/>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="h-full">
          <Card className="border border-border/50 shadow-lg bg-card/80 backdrop-blur-sm overflow-hidden h-full">
            <CardContent className="pt-6 h-full flex flex-col justify-center">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Pending</p>
                  <p className="text-3xl sm:text-4xl font-bold text-amber-500">{stats?.pending || 0}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500"/>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }} className="h-full sm:col-span-2 lg:col-span-1">
          <Card className="border border-border/50 shadow-lg bg-card/80 backdrop-blur-sm overflow-hidden h-full">
            <CardContent className="pt-6 h-full flex flex-col justify-center">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">{"Today's Appointments"}</p>
                  <p className="text-3xl sm:text-4xl font-bold text-primary">{stats?.today || 0}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-primary"/>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Appointments */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.4 }}>
        <Card className="border border-border/50 shadow-lg bg-card/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-foreground">Recent Appointments</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/doctor/appointments">
                View All
                <ArrowRight className="ml-2 w-4 h-4"/>
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentAppointments.length === 0 ? (<div className="text-center py-8">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4"/>
                <p className="text-muted-foreground">No appointments yet</p>
              </div>) : (<div className="space-y-4">
                {recentAppointments.map((appointment) => (<AppointmentCard key={appointment.id} appointment={appointment} compact/>))}
              </div>)}
          </CardContent>
        </Card>
      </motion.div>
    </div>);
}
