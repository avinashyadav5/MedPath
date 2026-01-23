"use client";
import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";
import { saveSignal, getSignals } from "@/app/actions/video-call-actions";
export default function VideoCall({ appointmentId, onEnd }) {
    const pcRef = useRef(null);
    const localRef = useRef(null);
    const remoteRef = useRef(null);
    const streamRef = useRef(null);
    const handled = useRef(new Set());
    const [micOn, setMicOn] = useState(true);
    const [camOn, setCamOn] = useState(true);
    // Fetch initial signals on mount to avoid reacting to stale signals
    useEffect(() => {
        const initSignals = async () => {
            const res = await getSignals(appointmentId);
            if (res.success) {
                res.signals.forEach(s => handled.current.add(s.id));
            }
        };
        initSignals();
    }, [appointmentId]);
    /* INIT */
    useEffect(() => {
        const configuration = {
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" },
                { urls: "stun:stun1.l.google.com:19302" },
                { urls: "stun:stun2.l.google.com:19302" },
            ],
        };
        pcRef.current = new RTCPeerConnection(configuration);
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((stream) => {
            streamRef.current = stream;
            stream.getTracks().forEach((t) => pcRef.current?.addTrack(t, stream));
            if (localRef.current)
                localRef.current.srcObject = stream;
        })
            .catch(err => console.error("Media error:", err));
        pcRef.current.ontrack = (e) => {
            if (remoteRef.current)
                remoteRef.current.srcObject = e.streams[0];
        };
        pcRef.current.onicecandidate = (e) => {
            if (e.candidate) {
                saveSignal(appointmentId, "ice", JSON.stringify(e.candidate));
            }
        };
        const interval = setInterval(checkSignals, 1000);
        return () => {
            clearInterval(interval);
            cleanup();
        };
    }, [appointmentId]);
    /* POLLING SIGNALS */
    const checkSignals = async () => {
        const res = await getSignals(appointmentId);
        if (!res.success)
            return;
        for (const s of res.signals) {
            if (handled.current.has(s.id))
                continue;
            handled.current.add(s.id);
            if (s.signal_type === "offer") {
                const desc = new RTCSessionDescription(JSON.parse(s.signal_data));
                await pcRef.current?.setRemoteDescription(desc);
                const answer = await pcRef.current?.createAnswer();
                await pcRef.current?.setLocalDescription(answer);
                await saveSignal(appointmentId, "answer", JSON.stringify(answer));
            }
            if (s.signal_type === "answer") {
                const desc = new RTCSessionDescription(JSON.parse(s.signal_data));
                await pcRef.current?.setRemoteDescription(desc);
            }
            if (s.signal_type === "ice") {
                try {
                    const candidate = new RTCIceCandidate(JSON.parse(s.signal_data));
                    await pcRef.current?.addIceCandidate(candidate);
                }
                catch (e) {
                    console.error("Error adding ice candidate", e);
                }
            }
            if (s.signal_type === "end") {
                cleanup();
                onEnd();
            }
        }
    };
    /* TOGGLES */
    const toggleMic = () => {
        if (streamRef.current) {
            streamRef.current.getAudioTracks().forEach((t) => (t.enabled = !micOn));
            setMicOn(!micOn);
        }
    };
    const toggleCam = () => {
        if (streamRef.current) {
            streamRef.current.getVideoTracks().forEach((t) => (t.enabled = !camOn));
            setCamOn(!camOn);
        }
    };
    /* END CALL */
    const endCall = async () => {
        try {
            await saveSignal(appointmentId, "end", "end");
        }
        catch (e) {
            console.error("Error sending end signal", e);
        }
        cleanup();
        onEnd();
    };
    const cleanup = () => {
        console.log("Cleaning up video call...");
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => {
                t.stop();
                console.log(`Stopped track: ${t.kind}`);
            });
            streamRef.current = null;
        }
        if (localRef.current) {
            localRef.current.srcObject = null;
        }
        if (remoteRef.current) {
            remoteRef.current.srcObject = null;
        }
        if (pcRef.current) {
            pcRef.current.onicecandidate = null;
            pcRef.current.ontrack = null;
            pcRef.current.close();
            pcRef.current = null;
        }
    };
    return (<div className="relative h-full bg-black">
      {/* Remote video */}
      <video ref={remoteRef} autoPlay playsInline className="w-full h-full object-cover"/>

      {/* Local video */}
      <video ref={localRef} autoPlay muted playsInline className="absolute bottom-4 right-4 w-40 h-28 rounded-lg border border-white/40"/>

      {/* Controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-5">
        <button onClick={toggleMic} className="p-3 rounded-full bg-white/20 text-white">
          {micOn ? <Mic /> : <MicOff />}
        </button>

        <button onClick={toggleCam} className="p-3 rounded-full bg-white/20 text-white">
          {camOn ? <Video /> : <VideoOff />}
        </button>

        <button onClick={endCall} className="p-3 rounded-full bg-red-600 text-white">
          <PhoneOff />
        </button>
      </div>
    </div>);
}
