"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, Navigation, Phone, Globe, Stethoscope, Building, User, Calendar, ExternalLink, AlertTriangle, } from "lucide-react";
export function NearbyDoctorsView({ hospitals, registeredDoctors, city, specialty, predictionId, diagnosis, error, }) {
    const cleanData = (str) => {
        if (!str)
            return "";
        if (typeof str !== "string")
            return str;
        const trimmed = str.trim();
        if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
            try {
                const parsed = JSON.parse(trimmed);
                return Array.isArray(parsed) ? parsed.filter(Boolean).join(", ") : trimmed;
            }
            catch {
                return trimmed.replace(/[\[\]"]/g, "").trim();
            }
        }
        return trimmed;
    };
    const getGoogleMapsLink = (name, lat, lon) => {
        return `https://www.google.com/maps/search/?api=1&query=${lat},${lon}&query_place_id=${encodeURIComponent(name)}`;
    };
    const getDirectionsLink = (lat, lon) => {
        return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
    };
    return (<div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Nearby Healthcare Providers</h1>
          <p className="text-muted-foreground">
            Showing results near <strong>{city}</strong> for <strong>{specialty}</strong>
          </p>
        </div>
      </motion.div>

      {error && (<Alert variant="destructive">
          <AlertTriangle className="h-4 w-4"/>
          <AlertDescription>{error}</AlertDescription>
        </Alert>)}

      {/* Registered Doctors Section */}
      {registeredDoctors.length > 0 && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-500 to-cyan-600 dark:from-teal-600 dark:to-cyan-900 text-white overflow-hidden">
            <CardHeader className="relative z-10">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <User className="w-5 h-5"/>
                    Book with Our Doctors
                  </CardTitle>
                  <p className="text-teal-50/90 dark:text-teal-100/80 text-sm">
                    Verified matches for <strong>{specialty}</strong> in <strong>{city}</strong>
                  </p>
                </div>
                <Badge className="bg-white/20 text-white border-white/20 backdrop-blur-sm">
                  {registeredDoctors.length} Matches Found
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6 relative z-10">
              {registeredDoctors.map((doctor, index) => (<motion.div key={doctor.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }} className="bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-xl p-4 sm:p-5 border border-white/10 dark:border-white/5 hover:bg-white/15 dark:hover:bg-black/25 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 dark:bg-white/10 rounded-full flex items-center justify-center shrink-0 border border-white/20">
                        <User className="w-5 h-5 sm:w-6 sm:h-6 text-white"/>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-base sm:text-lg truncate text-white">Dr. {doctor.name}</h3>
                          <Badge className="h-5 text-[10px] bg-teal-400/20 text-teal-100 border-teal-400/30">Verified Match</Badge>
                        </div>
                        <div className="flex flex-col gap-1.5 mt-1">
                          <div className="flex items-start gap-1.5 text-xs sm:text-sm text-teal-50/90">
                            <Stethoscope className="w-3.5 h-3.5 sm:w-4 sm:h-4 mt-0.5 shrink-0"/>
                            <div className="flex flex-wrap gap-1">
                              {(cleanData(doctor.specialty).split(", ")).map((s, i) => (<Badge key={i} variant="secondary" className="text-[10px] sm:text-xs bg-black/20 dark:bg-black/40 text-white hover:bg-black/30 border-white/10 px-1.5 py-0">
                                  {s}
                                </Badge>))}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-teal-50/90">
                            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0"/>
                            <span className="truncate">{cleanData(doctor.city)}</span>
                          </div>
                          {doctor.hospital_name && (<div className="flex items-center gap-1.5 text-xs sm:text-sm text-teal-50/90">
                              <Building className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0"/>
                              <span className="truncate">{cleanData(doctor.hospital_name)}</span>
                            </div>)}
                        </div>
                      </div>
                    </div>
                    <Button asChild className="bg-white text-teal-600 hover:bg-teal-50 dark:bg-teal-50 dark:hover:bg-white w-full sm:w-auto h-9 sm:h-10 text-xs sm:text-sm font-bold shrink-0 shadow-lg shadow-teal-900/20">
                      <Link href={`/patient/book/${doctor.id}?predictionId=${predictionId}&diagnosis=${encodeURIComponent(diagnosis)}`}>
                        <Calendar className="w-4 h-4 mr-2"/>
                        Book Now
                      </Link>
                    </Button>
                  </div>
                </motion.div>))}
            </CardContent>
            {/* Subtle decorative elements for dark mode depth */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none"/>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400/10 rounded-full -ml-32 -mb-32 blur-3xl pointer-events-none"/>
          </Card>
        </motion.div>)}

      {/* Nearby Hospitals Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
        <Card className="border-0 shadow-lg bg-card/80 dark:bg-card/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Building className="w-5 h-5 text-teal-600"/>
              Nearby Hospitals & Clinics
            </CardTitle>
            <p className="text-muted-foreground text-sm">Healthcare facilities within 10km of {city}</p>
          </CardHeader>
          <CardContent>
            {hospitals.length === 0 ? (<div className="text-center py-8">
                <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4"/>
                <h3 className="text-lg font-medium text-foreground mb-2">No hospitals found nearby</h3>
                <p className="text-muted-foreground mb-4">
                  We could not find hospitals matching your needs in this area.
                </p>
                <Button asChild variant="outline" className="bg-transparent">
                  <a href={`https://www.google.com/maps/search/hospital+near+${encodeURIComponent(city)}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2"/>
                    Search on Google Maps
                  </a>
                </Button>
              </div>) : (<div className="space-y-4">
                {hospitals.map((hospital, index) => (<motion.div key={hospital.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }} className="p-4 sm:p-5 bg-muted/40 dark:bg-slate-900/40 rounded-xl hover:bg-muted/60 dark:hover:bg-slate-900/60 transition-colors border border-border/50">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-teal-500/10 dark:bg-teal-500/20 rounded-xl flex items-center justify-center shrink-0 border border-teal-500/20">
                          <Building className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600"/>
                        </div>
                        <div className="space-y-1.5 min-w-0">
                          <h3 className="font-semibold text-sm sm:text-base text-foreground leading-tight">{hospital.name}</h3>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary" className="capitalize text-[10px] sm:text-xs">
                              {hospital.type}
                            </Badge>
                            <Badge variant="outline" className="bg-transparent text-[10px] sm:text-xs border-slate-300">
                              <MapPin className="w-3 h-3 mr-1"/>
                              {hospital.distance} km
                            </Badge>
                          </div>
                          {hospital.address && <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">{hospital.address}</p>}
                          <div className="flex flex-wrap gap-x-4 gap-y-2 pt-1 border-t border-border/50 mt-2">
                            {hospital.phone && (<a href={`tel:${hospital.phone}`} className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-teal-600 hover:text-teal-700 font-medium">
                                <Phone className="w-3.5 h-3.5"/>
                                {hospital.phone}
                              </a>)}
                            {hospital.website && (<a href={hospital.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-teal-600 hover:text-teal-700 font-medium">
                                <Globe className="w-3.5 h-3.5"/>
                                Website
                              </a>)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 xs:shrink-0 pt-2 md:pt-0">
                        <Button asChild variant="outline" size="sm" className="bg-background hover:bg-accent flex-1 md:flex-none h-9 border-border text-xs sm:text-sm">
                          <a href={getGoogleMapsLink(hospital.name, hospital.lat, hospital.lon)} target="_blank" rel="noopener noreferrer">
                            <MapPin className="w-4 h-4 mr-1.5"/>
                            Map
                          </a>
                        </Button>
                        <Button asChild size="sm" className="bg-teal-600 hover:bg-teal-700 text-white flex-1 md:flex-none h-9 text-xs sm:text-sm">
                          <a href={getDirectionsLink(hospital.lat, hospital.lon)} target="_blank" rel="noopener noreferrer">
                            <Navigation className="w-4 h-4 mr-1.5"/>
                            Directions
                          </a>
                        </Button>
                      </div>
                    </div>
                  </motion.div>))}
              </div>)}
          </CardContent>
        </Card>
      </motion.div>

      {/* Fallback Google Maps Link */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.3 }} className="text-center">
        <p className="text-muted-foreground mb-2">{"Can't find what you're looking for?"}</p>
        <Button asChild variant="outline" className="bg-transparent">
          <a href={`https://www.google.com/maps/search/${encodeURIComponent(specialty)}+near+${encodeURIComponent(city)}`} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 mr-2"/>
            Search on Google Maps
          </a>
        </Button>
      </motion.div>
    </div>);
}
