"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, Clock, User, MapPin, Stethoscope, Loader2, AlertTriangle, Building } from "lucide-react";
import { bookAppointment, getDoctorAvailableSlots } from "@/app/actions/appointment-actions";
import { useRouter } from "next/navigation";
export function BookingForm({ doctor, predictionId, diagnosis }) {
    const router = useRouter();
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState("");
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState("");
    const [loadingSlots, setLoadingSlots] = useState(false);
    // Get min date (tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split("T")[0];
    // Get max date (30 days from now)
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    const maxDateStr = maxDate.toISOString().split("T")[0];
    const parseJson = (field) => {
        if (Array.isArray(field))
            return field;
        if (typeof field === "string") {
            try {
                return JSON.parse(field);
            }
            catch {
                return field ? [field] : [];
            }
        }
        return [];
    };
    useEffect(() => {
        if (selectedDate) {
            setLoadingSlots(true);
            setSelectedSlot("");
            getDoctorAvailableSlots(doctor.id, selectedDate).then((slots) => {
                setAvailableSlots(slots);
                setLoadingSlots(false);
            });
        }
    }, [selectedDate, doctor.id]);
    async function handleSubmit(formData) {
        if (!selectedDate || !selectedSlot) {
            setError("Please select a date and time slot");
            return;
        }
        setIsLoading(true);
        setError(null);
        formData.append("doctorId", doctor.id.toString());
        formData.append("appointmentDate", selectedDate);
        formData.append("timeSlot", selectedSlot);
        if (predictionId)
            formData.append("predictionId", predictionId);
        if (diagnosis)
            formData.append("diagnosis", diagnosis);
        const hospitals = parseJson(doctor.hospital_name);
        if (hospitals.length > 0) {
            formData.append("hospitalName", hospitals[0]); // Just take the first one for the booking record
        }
        const result = await bookAppointment(formData);
        if (result?.error) {
            setError(result.error);
            setIsLoading(false);
        }
        else if (result?.success) {
            router.push("/patient/appointments?success=true");
        }
    }
    return (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card className="border border-border/50 shadow-xl bg-card/80 backdrop-blur-sm mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <User className="w-5 h-5 text-teal-600"/>
            Doctor Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center shrink-0 border border-primary/20">
              <User className="w-8 h-8 text-primary"/>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground">Dr. {doctor.name}</h3>
              <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Stethoscope className="w-4 h-4"/>
                  <div className="flex flex-wrap gap-1">
                    {parseJson(doctor.specialty).map((s, i) => (<span key={i} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                        {s}
                      </span>))}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  <MapPin className="w-4 h-4 text-primary"/>
                  {parseJson(doctor.city).map((c, i) => (<span key={i} className="text-xs bg-muted p-1 rounded-md border border-border/50">{c}</span>))}
                </div>
                {parseJson(doctor.hospital_name).filter(Boolean).length > 0 && (<div className="flex items-center gap-1 flex-wrap">
                    <Building className="w-4 h-4 text-primary"/>
                    {parseJson(doctor.hospital_name).filter(Boolean).map((h, i) => (<span key={i} className="text-xs bg-muted p-1 rounded-md border border-border/50">{h}</span>))}
                  </div>)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border/50 shadow-xl bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Calendar className="w-5 h-5 text-primary"/>
            Select Date & Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-6">
            {error && (<Alert variant="destructive">
                <AlertTriangle className="h-4 w-4"/>
                <AlertDescription>{error}</AlertDescription>
              </Alert>)}

            {diagnosis && (<div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <p className="text-sm text-foreground/80">
                  <strong className="text-primary font-bold">Booking for:</strong> {diagnosis}
                </p>
              </div>)}

            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2 text-foreground">
                <Calendar className="w-4 h-4 text-muted-foreground"/>
                Appointment Date
              </Label>
              <input type="date" id="date" min={minDate} max={maxDateStr} value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground" required/>
            </div>

            {selectedDate && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-3">
                <Label className="flex items-center gap-2 text-foreground">
                  <Clock className="w-4 h-4 text-muted-foreground"/>
                  Available Time Slots
                </Label>

                {loadingSlots ? (<div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-teal-600"/>
                  </div>) : availableSlots.length === 0 ? (<p className="text-muted-foreground text-center py-4">
                    No available slots for this date. Please select another date.
                  </p>) : (<div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                    {availableSlots.map((slot) => (<button key={slot} type="button" onClick={() => setSelectedSlot(slot)} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${selectedSlot === slot
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-muted/50 text-foreground/70 hover:bg-primary/20 hover:text-primary"}`}>
                        {slot}
                      </button>))}
                  </div>)}
              </motion.div>)}

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium h-12 text-lg" disabled={isLoading || !selectedDate || !selectedSlot}>
              {isLoading ? (<>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin"/>
                  Booking...
                </>) : ("Confirm Booking")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>);
}
