"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Calendar, Clock, User, MoreVertical, CheckCircle, XCircle, MessageCircle, } from "lucide-react";
import { updateAppointmentStatus } from "@/app/actions/doctor-actions";
/* ---------------- CONSTANTS ---------------- */
const statusColors = {
    pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    confirmed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    completed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
};
/* ---------------- HELPERS ---------------- */
function formatDate(dateStr) {
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}
/* ---------------- COMPONENT ---------------- */
export function AppointmentCard({ appointment, compact = false }) {
    const router = useRouter();
    const [status, setStatus] = useState(appointment.status);
    const [isUpdating, setIsUpdating] = useState(false);
    const handleStatusChange = async (newStatus) => {
        setIsUpdating(true);
        const res = await updateAppointmentStatus(appointment.id, newStatus);
        if (res.success)
            setStatus(newStatus);
        setIsUpdating(false);
    };
    /* -------- COMPACT MODE -------- */
    if (compact) {
        return (<div className="flex items-center justify-between p-4 bg-muted/50 border border-border/50 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-primary"/>
          </div>

          <div>
            <p className="font-medium">{appointment.patient_name}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-3 h-3"/>
              {formatDate(appointment.appointment_date)}
              <Clock className="w-3 h-3 ml-2"/>
              {appointment.time_slot}
            </div>
          </div>
        </div>

        <Badge className={`${statusColors[status]} border`}>{status}</Badge>
      </div>);
    }
    /* -------- FULL CARD -------- */
    return (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="border border-border/50 shadow-md bg-card">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              {/* LEFT INFO */}
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 sm:w-6 sm:h-6 text-primary"/>
                </div>

                <div className="space-y-2 min-w-0 flex-1">
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg truncate">{appointment.patient_name}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{appointment.patient_email}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5"/>
                      {formatDate(appointment.appointment_date)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5"/>
                      {appointment.time_slot}
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Badge className={`${statusColors[status]} border shadow-none text-[10px] sm:text-xs px-2 py-0`}>
                      {status}
                    </Badge>

                    {appointment.urgency && (<Badge className="bg-primary/10 text-primary border-primary/20 shadow-none text-[10px] sm:text-xs px-2 py-0">
                        {appointment.urgency} urgency
                      </Badge>)}

                    {appointment.risk_percent !== undefined && (<Badge variant="outline" className="border-border/50 text-[10px] sm:text-xs px-2 py-0">
                        Risk: {appointment.risk_percent}%
                      </Badge>)}
                  </div>
                </div>
              </div>

              {/* ACTIONS - Desktop (sm and up) */}
              <div className="hidden sm:flex items-center gap-2">
                {status === "confirmed" && (<Button variant="outline" size="sm" onClick={() => router.push(`/doctor/chat/${appointment.id}`)}>
                    <MessageCircle className="w-4 h-4 mr-2"/>
                    Chat
                  </Button>)}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={isUpdating}>
                      <MoreVertical className="w-4 h-4"/>
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleStatusChange("confirmed")} disabled={status === "confirmed"}>
                      <CheckCircle className="w-4 h-4 mr-2"/>
                      Confirm
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => handleStatusChange("completed")} disabled={status === "completed"}>
                      <CheckCircle className="w-4 h-4 mr-2 text-green-600"/>
                      Mark Complete
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => handleStatusChange("cancelled")} disabled={status === "cancelled"} className="text-red-600">
                      <XCircle className="w-4 h-4 mr-2"/>
                      Cancel
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* DIAGNOSIS & SYMPTOMS */}
            <div className="space-y-2 pt-2 border-t border-border/50">
              {appointment.diagnosis && (<div className="text-xs sm:text-sm bg-muted/50 text-card-foreground p-2 rounded">
                  <strong className="text-primary font-semibold">Diagnosis:</strong> {appointment.diagnosis}
                </div>)}

              {appointment.symptoms && (<div className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                  <strong className="text-foreground font-medium">Symptoms:</strong> {appointment.symptoms}
                </div>)}
            </div>

            {/* MOBILE ACTIONS (only xs) */}
            <div className="flex sm:hidden items-center gap-2 pt-2">
              {status === "confirmed" && (<Button variant="outline" size="sm" className="flex-1 h-9" onClick={() => router.push(`/doctor/chat/${appointment.id}`)}>
                  <MessageCircle className="w-4 h-4 mr-2"/>
                  Chat
                </Button>)}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1 h-9" disabled={isUpdating}>
                    <MoreVertical className="w-4 h-4 mr-2"/>
                    Status
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuItem onClick={() => handleStatusChange("confirmed")} disabled={status === "confirmed"}>
                    <CheckCircle className="w-4 h-4 mr-2"/>
                    Confirm
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange("completed")} disabled={status === "completed"}>
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600"/>
                    Mark Complete
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange("cancelled")} disabled={status === "cancelled"} className="text-red-600">
                    <XCircle className="w-4 h-4 mr-2"/>
                    Cancel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>);
}
