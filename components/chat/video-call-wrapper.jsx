"use client";
import VideoCall from "@/components/chat/video-call";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
export default function VideoCallOverlay({ appointmentId, onClose, }) {
    return (<div className="fixed inset-0 z-50 bg-black">
      {/* CLOSE BUTTON */}
      <Button variant="ghost" size="icon" onClick={onClose} className="absolute top-4 right-4 text-white z-50">
        <X className="w-6 h-6"/>
      </Button>

      {/* VIDEO CALL */}
      <VideoCall appointmentId={appointmentId} onEnd={onClose}/>
    </div>);
}
