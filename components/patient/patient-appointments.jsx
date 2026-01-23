"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger, } from "@/components/ui/tabs";
import { Calendar, Clock, User, MapPin, Stethoscope, XCircle, CheckCircle, Building, MessageCircle, } from "lucide-react";
import { cancelAppointment } from "@/app/actions/appointment-actions";
/* ---------------- CONSTANTS ---------------- */
const statusColors = {
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    confirmed: "bg-blue-100 text-blue-700 border-blue-200",
    completed: "bg-green-100 text-green-700 border-green-200",
    cancelled: "bg-red-100 text-red-700 border-red-200",
};
/* ---------------- HELPERS ---------------- */
function formatDate(dateStr) {
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}
/* ---------------- COMPONENT ---------------- */
export function PatientAppointments({ appointments, currentStatus = "all" }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const showSuccess = searchParams.get("success") === "true";
    const [localAppointments, setLocalAppointments] = useState(appointments);
    const [cancellingId, setCancellingId] = useState(null);
    const handleStatusChange = (value) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value && value !== "all") {
            params.set("status", value);
        }
        else {
            params.delete("status");
        }
        router.push(`/patient/appointments?${params.toString()}`);
    };
    const handleCancel = async (id) => {
        setCancellingId(id);
        const res = await cancelAppointment(id);
        if (res.success) {
            setLocalAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status: "cancelled" } : a)));
        }
        setCancellingId(null);
    };
    return (<div className="space-y-6">
      <Tabs defaultValue={currentStatus} onValueChange={handleStatusChange} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex mb-2">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
      </Tabs>

      {showSuccess && (<Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400"/>
          <AlertDescription>
            Appointment booked successfully!
          </AlertDescription>
        </Alert>)}

      {localAppointments.length === 0 ? (<Card className="border-0 shadow-lg">
          <CardContent className="py-12 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground"/>
            <h3 className="text-lg font-medium mb-2">No appointments found</h3>
            <p className="text-muted-foreground mb-6">
              {currentStatus === "all"
                ? "You haven't booked any appointments yet."
                : `You don't have any appointments with status "${currentStatus}".`}
            </p>

            {currentStatus === "all" && (<Button asChild>
                <Link href="/patient/assessment">Get a New Assessment</Link>
              </Button>)}
          </CardContent>
        </Card>) : (localAppointments.map((a, i) => (<motion.div key={a.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex justify-between gap-4">
                  {/* LEFT INFO */}
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-teal-600"/>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-semibold">Dr. {a.doctor_name}</h3>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Stethoscope className="w-4 h-4"/>
                        {a.specialty}
                      </div>

                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4"/>
                        {formatDate(a.appointment_date)}
                        <Clock className="w-4 h-4 ml-2"/>
                        {a.time_slot}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4"/>
                        {a.doctor_city}

                        {a.hospital_name && (<>
                            <Building className="w-4 h-4 ml-2"/>
                            {a.hospital_name}
                          </>)}
                      </div>

                      {a.diagnosis && (<p className="text-sm bg-muted text-card-foreground p-2 rounded">
                          <strong>Reason:</strong> {a.diagnosis}
                        </p>)}

                      <Badge className={`${statusColors[a.status]} border`}>
                        {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                      </Badge>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex flex-col gap-2">
                    {a.status === "confirmed" && (<Button variant="outline" size="sm" onClick={() => router.push(`/patient/chat/${a.id}`)}>
                        <MessageCircle className="w-4 h-4 mr-2"/>
                        Chat
                      </Button>)}

                    {a.status === "pending" && (<Button variant="outline" size="sm" onClick={() => handleCancel(a.id)} disabled={cancellingId === a.id}>
                        <XCircle className="w-4 h-4 mr-2"/>
                        {cancellingId === a.id ? "Cancelling..." : "Cancel"}
                      </Button>)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>)))}
    </div>);
}
