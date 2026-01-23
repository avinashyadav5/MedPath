"use client";
import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Calendar, ChevronLeft, ChevronRight, MoreHorizontal, Clock, User, Stethoscope } from "lucide-react";
import { updateAppointmentStatus } from "@/app/actions/admin-actions";
import { format } from "date-fns";
const statusColors = {
    pending: "bg-amber-500/10 text-amber-500 border-0",
    confirmed: "bg-blue-500/10 text-blue-500 border-0",
    completed: "bg-emerald-500/10 text-emerald-500 border-0",
    cancelled: "bg-red-500/10 text-red-500 border-0",
};
export function AppointmentsManagement({ appointments, total, page, totalPages }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [dateFilter, setDateFilter] = useState(searchParams.get("date") || "");
    const updateFilters = (key, value) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value && value !== "all") {
            params.set(key, value);
        }
        else {
            params.delete(key);
        }
        params.set("page", "1");
        router.push(`/admin/appointments?${params.toString()}`);
    };
    const handleDateFilter = () => {
        updateFilters("date", dateFilter);
    };
    const handleStatusChange = async (appointmentId, status) => {
        startTransition(async () => {
            await updateAppointmentStatus(appointmentId, status);
        });
    };
    const goToPage = (newPage) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", newPage.toString());
        router.push(`/admin/appointments?${params.toString()}`);
    };
    return (<div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Appointment Management</h1>
            <p className="text-muted-foreground mt-1">{total} total appointments</p>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
        <Card className="border-0 shadow-md bg-card">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex gap-2">
                <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="w-[200px]"/>
                <Button onClick={handleDateFilter} variant="outline">
                  Filter
                </Button>
              </div>
              <Select defaultValue={searchParams.get("status") || "all"} onValueChange={(value) => updateFilters("status", value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Appointments Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
        <Card className="border-0 shadow-md bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Calendar className="w-5 h-5 text-violet-500"/>
              Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Diagnosis</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((apt) => (<TableRow key={apt.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-emerald-500/10 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-emerald-500"/>
                        </div>
                        <div>
                          <p className="font-medium text-card-foreground">{apt.patient_name}</p>
                          <p className="text-xs text-muted-foreground">{apt.patient_email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center">
                          <Stethoscope className="w-4 h-4 text-blue-500"/>
                        </div>
                        <div>
                          <p className="font-medium text-card-foreground">Dr. {apt.doctor_name}</p>
                          <p className="text-xs text-muted-foreground">{apt.specialty}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground opacity-90">
                        <Calendar className="w-4 h-4"/>
                        {format(new Date(apt.appointment_date), "MMM d, yyyy")}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground opacity-60 text-sm">
                        <Clock className="w-3 h-3"/>
                        {apt.time_slot}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-muted-foreground max-w-[200px] truncate">{apt.diagnosis || "N/A"}</p>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[apt.status]}>{apt.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" disabled={isPending}>
                            <MoreHorizontal className="w-4 h-4"/>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleStatusChange(apt.id, "confirmed")}>
                            Mark Confirmed
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(apt.id, "completed")}>
                            Mark Completed
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(apt.id, "cancelled")} className="text-red-600">
                            Cancel Appointment
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (<div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => goToPage(page - 1)} disabled={page <= 1}>
                    <ChevronLeft className="w-4 h-4"/>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => goToPage(page + 1)} disabled={page >= totalPages}>
                    <ChevronRight className="w-4 h-4"/>
                  </Button>
                </div>
              </div>)}
          </CardContent>
        </Card>
      </motion.div>
    </div>);
}
