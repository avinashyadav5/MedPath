"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Settings, MapPin, Building, Clock, CheckCircle, Plus, Trash2 } from "lucide-react";
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
export function SettingsForm({ profile }) {
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    // Parse JSON fields - handle both string and array
    const parseJsonField = (field) => {
        if (Array.isArray(field)) {
            return field;
        }
        if (typeof field === "string") {
            try {
                return JSON.parse(field);
            }
            catch {
                // Fallback for comma separated or single string
                return field ? [field] : [];
            }
        }
        return [];
    };
    const [selectedSlots, setSelectedSlots] = useState(parseJsonField(profile.availability));
    const [selectedSpecialties, setSelectedSpecialties] = useState(parseJsonField(profile.specialty));
    const [cities, setCities] = useState(parseJsonField(profile.city).length > 0 ? parseJsonField(profile.city) : [""]);
    const [hospitals, setHospitals] = useState(parseJsonField(profile.hospital_name).length > 0 ? parseJsonField(profile.hospital_name) : [""]);
    const toggleSlot = (slot) => {
        setSelectedSlots((prev) => (prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]));
    };
    const toggleSpecialty = (specialty) => {
        setSelectedSpecialties((prev) => (prev.includes(specialty) ? prev.filter((s) => s !== specialty) : [...prev, specialty]));
    };
    const addCity = () => setCities([...cities, ""]);
    const removeCity = (index) => setCities(cities.filter((_, i) => i !== index));
    const updateCity = (index, value) => {
        const newCities = [...cities];
        newCities[index] = value;
        setCities(newCities);
    };
    const addHospital = () => setHospitals([...hospitals, ""]);
    const removeHospital = (index) => setHospitals(hospitals.filter((_, i) => i !== index));
    const updateHospital = (index, value) => {
        const newHospitals = [...hospitals];
        newHospitals[index] = value;
        setHospitals(newHospitals);
    };
    async function handleSubmit(formData) {
        setIsLoading(true);
        setError(null);
        setSuccess(false);
        selectedSlots.forEach((slot) => {
            formData.append("availability", slot);
        });
        selectedSpecialties.forEach((spec) => {
            formData.append("specialty", spec);
        });
        cities.filter(c => c.trim()).forEach((city) => {
            formData.append("city", city);
        });
        hospitals.filter(h => h.trim()).forEach((hospital) => {
            formData.append("hospitalName", hospital);
        });
        const result = await saveDoctorProfile(formData);
        if (result?.error) {
            setError(result.error);
        }
        else {
            setSuccess(true);
        }
        setIsLoading(false);
    }
    return (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card className="border border-border/50 shadow-xl bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Settings className="w-5 h-5 text-primary"/>
            Profile Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-6">
            {error && (<Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>)}

            {success && (<Alert className="bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="h-4 w-4"/>
                <AlertDescription>Profile updated successfully!</AlertDescription>
              </Alert>)}

            <div className="space-y-3">
              <Label className="text-foreground font-medium">
                Medical Specialties
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {specialties.map((specialty) => (<div key={specialty} className={cn("flex items-center space-x-2 p-2 rounded-lg border border-border/50 transition-colors", selectedSpecialties.includes(specialty) ? "bg-primary/10 border-primary" : "bg-muted/50 hover:bg-muted")}>
                    <Checkbox id={`spec-${specialty}`} checked={selectedSpecialties.includes(specialty)} onCheckedChange={() => toggleSpecialty(specialty)}/>
                    <label htmlFor={`spec-${specialty}`} className="text-xs font-medium leading-none cursor-pointer text-foreground">
                      {specialty}
                    </label>
                  </div>))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-foreground font-medium">
                  <MapPin className="w-4 h-4 text-primary"/>
                  Cities
                </Label>
                <Button type="button" variant="ghost" size="sm" onClick={addCity} className="h-8 text-xs gap-1">
                  <Plus className="w-3 h-3"/> Add City
                </Button>
              </div>
              <div className="space-y-2">
                {cities.map((city, index) => (<div key={index} className="flex gap-2">
                    <Input placeholder="Enter city name" value={city} onChange={(e) => updateCity(index, e.target.value)} className="flex-1"/>
                    {cities.length > 1 && (<Button type="button" variant="ghost" size="icon" onClick={() => removeCity(index)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="w-4 h-4"/>
                      </Button>)}
                  </div>))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-foreground font-medium">
                  <Building className="w-4 h-4 text-primary"/>
                  Hospitals/Clinics
                </Label>
                <Button type="button" variant="ghost" size="sm" onClick={addHospital} className="h-8 text-xs gap-1">
                  <Plus className="w-3 h-3"/> Add Hospital
                </Button>
              </div>
              <div className="space-y-2">
                {hospitals.map((hospital, index) => (<div key={index} className="flex gap-2">
                    <Input placeholder="Enter hospital or clinic name" value={hospital} onChange={(e) => updateHospital(index, e.target.value)} className="flex-1"/>
                    {hospitals.length > 1 && (<Button type="button" variant="ghost" size="icon" onClick={() => removeHospital(index)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="w-4 h-4"/>
                      </Button>)}
                  </div>))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-foreground font-medium">
                <Clock className="w-4 h-4 text-primary"/>
                Available Time Slots
              </Label>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                {timeSlots.map((slot) => (<div key={slot} className={cn("flex items-center space-x-2 p-2 rounded-lg border border-border/50 transition-colors", selectedSlots.includes(slot) ? "bg-primary/10 border-primary" : "bg-muted/50 hover:bg-muted")}>
                    <Checkbox id={`slot-${slot}`} checked={selectedSlots.includes(slot)} onCheckedChange={() => toggleSlot(slot)}/>
                    <label htmlFor={`slot-${slot}`} className="text-xs font-medium leading-none cursor-pointer text-foreground">
                      {slot}
                    </label>
                  </div>))}
              </div>
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium" disabled={isLoading}>
              {isLoading ? (<>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                  Saving...
                </>) : ("Save Changes")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>);
}
