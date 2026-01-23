"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, Stethoscope, MapPin, Building, Clock, AlertTriangle, X } from "lucide-react";
import { saveDoctorProfile } from "@/app/actions/auth-actions";
const specialties = [
    "General Practice",
    "Cardiology",
    "Dermatology",
    "Endocrinology",
    "Gastroenterology",
    "Neurology",
    "Oncology",
    "Ophthalmology",
    "Orthopedics",
    "Pediatrics",
    "Psychiatry",
    "Pulmonology",
    "Rheumatology",
    "Urology",
    "Emergency Medicine",
    "Internal Medicine",
    "Family Medicine",
    "Surgery",
];
const timeSlots = [
    "09:00 AM",
    "09:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "12:00 PM",
    "12:30 PM",
    "02:00 PM",
    "02:30 PM",
    "03:00 PM",
    "03:30 PM",
    "04:00 PM",
    "04:30 PM",
    "05:00 PM",
];
export function OnboardingForm() {
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedSlots, setSelectedSlots] = useState([]);
    const [selectedSpecialties, setSelectedSpecialties] = useState([]);
    const toggleSlot = (slot) => {
        setSelectedSlots((prev) => (prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]));
    };
    const toggleSpecialty = (specialty) => {
        setSelectedSpecialties((prev) => prev.includes(specialty) ? prev.filter((s) => s !== specialty) : [...prev, specialty]);
    };
    async function handleSubmit(formData) {
        setIsLoading(true);
        setError(null);
        if (selectedSpecialties.length === 0) {
            setError("Please select at least one specialty");
            setIsLoading(false);
            return;
        }
        selectedSpecialties.forEach((specialty) => {
            formData.append("specialty", specialty);
        });
        // Add selected time slots to form data
        selectedSlots.forEach((slot) => {
            formData.append("availability", slot);
        });
        const result = await saveDoctorProfile(formData);
        if (result?.error) {
            setError(result.error);
            setIsLoading(false);
        }
    }
    return (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Stethoscope className="w-5 h-5 text-teal-600"/>
            Professional Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-6">
            {error && (<Alert variant="destructive">
                <AlertTriangle className="h-4 w-4"/>
                <AlertDescription>{error}</AlertDescription>
              </Alert>)}

            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-foreground">
                <Stethoscope className="w-4 h-4 text-muted-foreground"/>
                Medical Specialties * <span className="text-sm text-muted-foreground">(Select one or more)</span>
              </Label>

              {/* Selected specialties badges */}
              {selectedSpecialties.length > 0 && (<div className="flex flex-wrap gap-2 p-3 bg-teal-50 rounded-lg border border-teal-200">
                  {selectedSpecialties.map((specialty) => (<Badge key={specialty} variant="secondary" className="bg-teal-100 text-teal-800 hover:bg-teal-200 cursor-pointer pr-1" onClick={() => toggleSpecialty(specialty)}>
                      {specialty}
                      <X className="w-3 h-3 ml-1"/>
                    </Badge>))}
                </div>)}

              {/* Specialty checkboxes */}
              <div className="max-h-48 overflow-y-auto border rounded-lg p-3 bg-background">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {specialties.map((specialty) => (<div key={specialty} className="flex items-center space-x-2">
                      <Checkbox id={`specialty-${specialty}`} checked={selectedSpecialties.includes(specialty)} onCheckedChange={() => toggleSpecialty(specialty)}/>
                      <label htmlFor={`specialty-${specialty}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-foreground">
                        {specialty}
                      </label>
                    </div>))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city" className="flex items-center gap-2 text-foreground">
                <MapPin className="w-4 h-4 text-muted-foreground"/>
                City *
              </Label>
              <Input id="city" name="city" placeholder="e.g., New York" required/>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hospitalName" className="flex items-center gap-2 text-foreground">
                <Building className="w-4 h-4 text-muted-foreground"/>
                Hospital/Clinic Name
              </Label>
              <Input id="hospitalName" name="hospitalName" placeholder="e.g., City General Hospital"/>
            </div>

            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-foreground">
                <Clock className="w-4 h-4 text-muted-foreground"/>
                Available Time Slots
              </Label>
              <p className="text-sm text-muted-foreground">
                Select the time slots when you are available for appointments
              </p>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                {timeSlots.map((slot) => (<div key={slot} className="flex items-center space-x-2">
                    <Checkbox id={slot} checked={selectedSlots.includes(slot)} onCheckedChange={() => toggleSlot(slot)}/>
                    <label htmlFor={slot} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-foreground">
                      {slot}
                    </label>
                  </div>))}
              </div>
            </div>

            <Button type="submit" className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-medium h-12 text-lg" disabled={isLoading}>
              {isLoading ? (<>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin"/>
                  Saving Profile...
                </>) : ("Complete Setup")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>);
}
