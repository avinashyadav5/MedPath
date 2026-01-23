"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Video, ArrowLeft, Clock, Calendar, AlertCircle } from "lucide-react";
import VideoCallOverlay from "./video-call-overlay";
import { ChatPanel } from "@/components/chat/chat-panel";
import { getSignals, clearSignals } from "@/app/actions/video-call-actions";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
export default function ClientChatShell({ appointmentId, role, isConfirmed, details }) {
    const [openVideo, setOpenVideo] = useState(false);
    const [hasIncomingCall, setHasIncomingCall] = useState(false);
    const handledSignals = useRef(new Set());
    const router = useRouter();
    const currentUserId = role === 'patient' ? details.patient_id : details.doctor_id;
    const otherName = role === 'patient' ? details.doctor_name : details.patient_name;
    const otherSubtext = role === 'patient'
        ? details.doctor_specialty
        : details.patient_email;
    const [initialOffer, setInitialOffer] = useState(null);
    // Background signal listener for incoming calls
    useEffect(() => {
        // Populate handled signals on mount so we don't react to stale offers
        const initSignals = async () => {
            const res = await getSignals(appointmentId);
            if (res.success) {
                res.signals.forEach(s => handledSignals.current.add(s.id));
            }
        };
        initSignals();
    }, [appointmentId]);
    useEffect(() => {
        if (openVideo)
            return; // Don't poll here if overlay is already open (it has its own listener)
        const checkIncoming = async () => {
            const res = await getSignals(appointmentId);
            if (res.success && res.signals.length > 0) {
                // Find if there's an offer we haven't handled and it's from the OTHER user
                const newOffer = res.signals.find(s => s.signal_type === 'offer' &&
                    !handledSignals.current.has(s.id) &&
                    s.sender_id !== currentUserId);
                if (newOffer) {
                    console.log("New incoming call detected via background listener");
                    // Mark ALL current signals as handled so we don't pop up again for this batch
                    res.signals.forEach(s => handledSignals.current.add(s.id));
                    setInitialOffer(newOffer.signal_data);
                    setHasIncomingCall(true);
                    setOpenVideo(true);
                }
            }
        };
        const interval = setInterval(checkIncoming, 3000);
        return () => clearInterval(interval);
    }, [appointmentId, openVideo, currentUserId]);
    return (<div className="flex flex-col h-screen w-full bg-background">
      {/* HEADER */}
      <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5"/>
          </Button>

          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 bg-primary/10 text-primary border border-primary/20">
              <AvatarFallback className="font-bold">{otherName?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-bold text-foreground leading-tight">{otherName}</h1>
              <p className="text-sm text-muted-foreground leading-tight">{otherSubtext}</p>
            </div>
          </div>
        </div>

        <Button className="bg-teal-500 hover:bg-teal-600 text-white" onClick={async () => {
            await clearSignals(appointmentId);
            setOpenVideo(true);
        }} disabled={!isConfirmed}>
          <Video className="w-4 h-4 mr-2"/>
          Video Call
        </Button>
      </header>

      <div className="flex flex-1 overflow-hidden max-w-7xl mx-auto w-full p-6 gap-6">
        {/* LEFT SIDEBAR - APPOINTMENT DETAILS */}
        <div className="w-[320px] shrink-0">
          <div className="bg-card rounded-xl shadow-sm p-6 h-full flex flex-col overflow-y-auto border border-border">
            <h2 className="font-semibold text-lg mb-6 text-card-foreground">Appointment Details</h2>

            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground mt-0.5"/>
                <div>
                  <p className="text-sm font-medium text-card-foreground">
                    {new Date(details.appointment_date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-muted-foreground mt-0.5"/>
                <div>
                  <p className="text-sm font-medium text-card-foreground">{details.time_slot}</p>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <h3 className="text-sm font-medium text-card-foreground mb-2">Diagnosis</h3>
                <p className="text-sm text-muted-foreground">
                  {details.appointment_diagnosis || details.prediction_diagnosis || "Pending"}
                </p>
              </div>

              <div className="border-t border-border pt-4">
                <h3 className="text-sm font-medium text-card-foreground mb-2">Symptoms</h3>
                <p className="text-sm text-muted-foreground">{details.symptoms || "No symptoms recorded"}</p>
              </div>

              <div className="border-t border-border pt-4 flex flex-wrap gap-2">
                {details.urgency && (<Badge variant="outline" className="flex gap-1 items-center">
                    <AlertCircle className="w-3 h-3"/>
                    {details.urgency} Urgency
                  </Badge>)}
                {details.risk_percent && (<Badge variant="outline">
                    Risk: {details.risk_percent}%
                  </Badge>)}
              </div>

              <div className="border-t border-border pt-4">
                <h3 className="text-sm font-medium text-card-foreground mb-1">Hospital</h3>
                <p className="text-sm text-muted-foreground">{details.hospital_name || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT CHAT AREA */}
        <div className="flex-1 bg-card rounded-xl shadow-sm overflow-hidden flex flex-col border border-border">
          <ChatPanel appointmentId={appointmentId} role={role} isConfirmed={isConfirmed} otherName={otherName} // Passing name for chat logic if needed
    />
        </div>
      </div>

      {/* VIDEO OVERLAY */}
      {openVideo && (<VideoCallOverlay appointmentId={appointmentId} currentUserId={currentUserId} otherName={otherName} initialOffer={initialOffer} onClose={async () => {
                setOpenVideo(false);
                setInitialOffer(null);
                // After closing, quickly refresh handled signals to include everything from that session
                const res = await getSignals(appointmentId);
                if (res.success) {
                    res.signals.forEach(s => handledSignals.current.add(s.id));
                }
            }}/>)}
    </div>);
}
