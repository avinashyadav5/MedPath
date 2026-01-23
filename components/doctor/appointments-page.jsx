"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Calendar, Search } from "lucide-react";
import { AppointmentCard } from "@/components/doctor/appointment-card";
/* ---------------- COMPONENT ---------------- */
export default function AppointmentsPage({ appointments, }) {
    const [statusFilter, setStatusFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const filteredAppointments = appointments.filter((apt) => {
        const matchesStatus = statusFilter === "all" || apt.status === statusFilter;
        const matchesDate = !dateFilter || apt.appointment_date === dateFilter;
        const matchesSearch = !searchQuery ||
            apt.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            apt.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesDate && matchesSearch;
    });
    return (<div className="space-y-6">
      {/* HEADER */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-3xl font-bold">Appointments</h1>
        <p className="text-muted-foreground">
          Manage all patient appointments
        </p>
      </motion.div>

      {/* FILTERS */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="flex flex-col md:flex-row gap-4 bg-card border border-border/50 p-4 shadow-sm rounded-xl">
        {/* SEARCH */}
        <div className="flex-1">
          <Label className="sr-only">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
            <Input placeholder="Search by patient or diagnosis..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10"/>
          </div>
        </div>

        {/* STATUS FILTER */}
        <div className="w-full md:w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter Status"/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* DATE FILTER */}
        <div className="w-full md:w-48">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
            <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="pl-10"/>
          </div>
        </div>
      </motion.div>

      {/* APPOINTMENTS LIST */}
      <div className="space-y-4">
        {filteredAppointments.length === 0 ? (<div className="text-center py-12 bg-card border border-border/50 shadow-sm rounded-xl">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4"/>
            <h3 className="text-lg font-medium">No appointments found</h3>
            <p className="text-sm text-muted-foreground">
              Try changing the filters.
            </p>
          </div>) : (filteredAppointments.map((apt, i) => (<motion.div key={apt.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <AppointmentCard appointment={apt}/> {/* ✅ FIXED, no red line */}
            </motion.div>)))}
      </div>
    </div>);
}
