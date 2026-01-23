"use client";
import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Video, VideoOff, Phone, PhoneOff, X } from "lucide-react";
import { saveSignal, getSignals, clearSignals } from "@/app/actions/video-call-actions";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
export default function VideoCallOverlay({ appointmentId, currentUserId, otherName, initialOffer, onClose }) {
    const localRef = useRef(null);
    const remoteRef = useRef(null);
    const pcRef = useRef(null);
    const streamRef = useRef(null);
    const handled = useRef(new Set());
    const [incomingOffer, setIncomingOffer] = useState(initialOffer);
    const [connected, setConnected] = useState(false);
    const [remoteStream, setRemoteStream] = useState(null);
    const iceCandidatesQueue = useRef([]);
    const [micOn, setMicOn] = useState(true);
    const [camOn, setCamOn] = useState(true);
    const [calling, setCalling] = useState(false);
    const [duration, setDuration] = useState(0);
    const [isPIP, setIsPIP] = useState(true);
    // Call timer
    useEffect(() => {
        let interval;
        if (connected) {
            interval = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [connected]);
    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };
    // Fetch initial signals on mount to avoid reacting to stale signals
    useEffect(() => {
        const initSignals = async () => {
            const res = await getSignals(appointmentId);
            if (res.success) {
                res.signals.forEach(s => {
                    // If this is an active call attempt, we don't want to swallow 
                    // ICE candidates or answers that just arrived.
                    if (s.signal_type === 'ice' || s.signal_type === 'answer')
                        return;
                    handled.current.add(s.id);
                });
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
        pcRef.current.ontrack = (e) => {
            console.log("Remote track received:", e.track.kind);
            if (e.streams && e.streams[0]) {
                setRemoteStream(e.streams[0]);
            }
            setConnected(true);
            setCalling(false);
        };
        pcRef.current.onicecandidate = (e) => {
            if (e.candidate) {
                saveSignal(appointmentId, "ice", JSON.stringify(e.candidate));
            }
        };
        // Auto-init media for early preview and permissions
        initMedia();
        const i = setInterval(checkSignals, 1000);
        return () => {
            clearInterval(i);
            cleanup();
        };
    }, [appointmentId]);
    const initMedia = async () => {
        if (streamRef.current)
            return streamRef.current;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            streamRef.current = stream;
            stream.getTracks().forEach((t) => pcRef.current?.addTrack(t, stream));
            if (localRef.current)
                localRef.current.srcObject = stream;
            return stream;
        }
        catch (err) {
            console.error("Media error:", err);
            return null;
        }
    };
    /* CHECK SIGNALS */
    const checkSignals = async () => {
        const res = await getSignals(appointmentId);
        if (!res.success)
            return;
        for (const s of res.signals) {
            if (handled.current.has(s.id))
                continue;
            handled.current.add(s.id);
            // IMPORTANT: Ignore signals sent by self
            if (s.sender_id === currentUserId)
                continue;
            if (s.signal_type === "offer") {
                setIncomingOffer(s.signal_data);
            }
            if (s.signal_type === "answer") {
                const desc = new RTCSessionDescription(JSON.parse(s.signal_data));
                await pcRef.current?.setRemoteDescription(desc);
                // Process queued ice candidates
                for (const cand of iceCandidatesQueue.current) {
                    try {
                        await pcRef.current?.addIceCandidate(cand);
                    }
                    catch (err) {
                        console.error("Delayed ICE Error:", err);
                    }
                }
                iceCandidatesQueue.current = [];
            }
            if (s.signal_type === "ice") {
                try {
                    const candidate = new RTCIceCandidate(JSON.parse(s.signal_data));
                    if (pcRef.current?.remoteDescription) {
                        await pcRef.current?.addIceCandidate(candidate);
                    }
                    else {
                        iceCandidatesQueue.current.push(candidate);
                    }
                }
                catch (e) {
                    console.error("Error adding ice candidate", e);
                }
            }
            if (s.signal_type === "end") {
                cleanup();
                onClose();
            }
        }
    };
    /* START CALL */
    const startCall = async () => {
        // Clear old signals before starting a fresh call to avoid signaling confusion
        await clearSignals(appointmentId);
        const stream = await initMedia();
        if (!stream)
            return;
        setCalling(true);
        const offer = await pcRef.current.createOffer();
        await pcRef.current.setLocalDescription(offer);
        await saveSignal(appointmentId, "offer", JSON.stringify(offer));
    };
    /* ACCEPT CALL */
    const accept = async () => {
        if (!incomingOffer)
            return;
        const stream = await initMedia();
        if (!stream)
            return;
        await pcRef.current.setRemoteDescription(JSON.parse(incomingOffer));
        // Process queued ice candidates
        for (const cand of iceCandidatesQueue.current) {
            try {
                await pcRef.current?.addIceCandidate(cand);
            }
            catch (err) {
                console.error("Delayed ICE Error (Accept):", err);
            }
        }
        iceCandidatesQueue.current = [];
        const answer = await pcRef.current.createAnswer();
        await pcRef.current.setLocalDescription(answer);
        await saveSignal(appointmentId, "answer", JSON.stringify(answer));
        setIncomingOffer(null);
        setConnected(true);
    };
    /* REJECT */
    const reject = async () => {
        await saveSignal(appointmentId, "end", "reject");
        setIncomingOffer(null);
        onClose();
    };
    /* END CALL */
    const endCall = async () => {
        await saveSignal(appointmentId, "end", "end");
        cleanup();
        onClose();
    };
    // Attach remote stream when element is ready
    useEffect(() => {
        if (remoteRef.current && remoteStream) {
            console.log("Attaching remote stream to video element");
            remoteRef.current.srcObject = remoteStream;
        }
    }, [remoteStream, connected]);
    const cleanup = () => {
        console.log("Cleaning up video call overlay...");
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
    return (<AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-neutral-950 z-50 flex items-center justify-center font-sans">
        <div className="relative w-full h-full flex flex-col items-center justify-center">

          {/* MAIN VIEWPORT (Remote Video) */}
          <div className="relative w-full h-full bg-neutral-900 flex items-center justify-center overflow-hidden">
            {connected ? (<video ref={remoteRef} autoPlay playsInline className="w-full h-full object-cover transition-opacity duration-700"/>) : (<div className="flex flex-col items-center justify-center gap-6">
                <Avatar className="h-32 w-32 bg-primary/10 border-2 border-primary/20 ring-4 ring-primary/5 animate-pulse">
                  <AvatarFallback className="text-4xl font-bold bg-neutral-800 text-white">
                    {otherName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white mb-1">{otherName}</h2>
                  <p className="text-neutral-400">
                    {calling ? "Ringing..." : "Not connected"}
                  </p>
                </div>
              </div>)}

            {/* PIP / LOCAL VIDEO */}
            <motion.div drag={connected} dragConstraints={{ left: -500, right: 500, top: -500, bottom: 500 }} className={`absolute overflow-hidden rounded-2xl border-2 border-white/20 shadow-2xl z-40 transition-all duration-500
                ${connected
            ? 'bottom-24 right-8 w-64 h-40'
            : 'w-[480px] h-[320px] relative'}`}>
              <video ref={localRef} autoPlay muted playsInline className={`w-full h-full object-cover ${!camOn ? 'opacity-0' : 'opacity-100'}`}/>
              {!camOn && (<div className="absolute inset-0 flex items-center justify-center bg-neutral-800">
                  <Avatar className="h-20 w-20 bg-neutral-700 border border-white/10">
                    <AvatarFallback className="text-2xl font-bold text-white">You</AvatarFallback>
                  </Avatar>
                </div>)}
              {connected && (<div className="absolute bottom-2 left-3 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-white font-medium uppercase tracking-wider">
                  You
                </div>)}
            </motion.div>

            {/* CALL INFO OVERLAY */}
            {connected && (<div className="absolute top-6 left-8 flex items-center gap-4 z-40">
                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 shadow-2xl">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                  <span className="text-white text-sm font-medium tracking-tight">
                    {formatDuration(duration)}
                  </span>
                  <div className="h-4 w-px bg-white/20 mx-1"></div>
                  <span className="text-white text-sm font-medium tracking-tight">{otherName}</span>
                </div>
              </div>)}

            {/* CLOSE BUTTON */}
            <Button variant="ghost" size="icon" onClick={onClose} className="absolute top-6 right-8 text-white/70 hover:text-white hover:bg-white/10 bg-black/20 backdrop-blur-lg rounded-full h-10 w-10 z-50 transition-all">
              <X className="w-5 h-5"/>
            </Button>
          </div>

          {/* DYNAMIC INTERFACE (Incoming Call) */}
          <AnimatePresence>
            {incomingOffer && !connected && (<motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="absolute inset-0 bg-neutral-950/90 backdrop-blur-3xl z-[60] flex flex-col items-center justify-center p-8">
                <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }} className="relative mb-10">
                  <div className="absolute inset-0 bg-teal-500/20 rounded-full blur-3xl"></div>
                  <Avatar className="h-40 w-40 bg-teal-500/10 border-4 border-teal-500/30 ring-8 ring-teal-500/10">
                    <AvatarFallback className="text-5xl font-bold bg-teal-600 text-white">
                      {otherName[0]}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>

                <h3 className="text-3xl font-bold text-white mb-2">Incoming Call</h3>
                <p className="text-neutral-400 text-lg mb-12 text-center max-w-md sans">
                  {otherName} is calling you for your appointment.
                </p>

                <div className="flex gap-10">
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={reject} className="w-18 h-18 rounded-full bg-red-500/20 border border-red-500/30 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-2xl shadow-red-500/20">
                    <PhoneOff className="w-8 h-8"/>
                  </motion.button>

                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={accept} className="w-18 h-18 rounded-full bg-teal-500 text-white flex items-center justify-center hover:bg-teal-600 transition-all shadow-2xl shadow-teal-500/30 active:scale-95">
                    <Phone className="w-8 h-8"/>
                  </motion.button>
                </div>
              </motion.div>)}
          </AnimatePresence>

          {/* CONTROLS TOOLBAR */}
          <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-neutral-900/60 backdrop-blur-2xl px-6 py-4 rounded-[2.5rem] border border-white/10 shadow-2xl">
            {/* Start Call Button (if not connected and idle) */}
            {!connected && !incomingOffer && !calling && (<motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={startCall} className="bg-primary text-white px-6 py-2.5 rounded-full font-bold flex items-center gap-2 shadow-lg shadow-primary/20 mr-2">
                <Video className="w-4 h-4"/>
                Join Call
              </motion.button>)}

            <ControlBtn active={micOn} onClick={() => {
            const s = streamRef.current;
            s?.getAudioTracks().forEach(t => (t.enabled = !micOn));
            setMicOn(!micOn);
        }} icon={micOn ? <Mic className="w-5 h-5 text-white"/> : <MicOff className="w-5 h-5 text-red-500"/>}/>

            <ControlBtn active={camOn} onClick={() => {
            const s = streamRef.current;
            s?.getVideoTracks().forEach(t => (t.enabled = !camOn));
            setCamOn(!camOn);
        }} icon={camOn ? <Video className="w-5 h-5 text-white"/> : <VideoOff className="w-5 h-5 text-red-500"/>}/>

            <div className="h-8 w-px bg-white/10 mx-1"></div>

            <ControlBtn danger onClick={endCall} icon={<PhoneOff className="w-5 h-5"/>}/>
          </motion.div>

        </div>
      </motion.div>
    </AnimatePresence>);
}
function ControlBtn({ icon, onClick, active = true, danger = false }) {
    return (<motion.button whileHover={{ scale: 1.1, backgroundColor: danger ? "rgba(239, 68, 68, 1)" : "rgba(255, 255, 255, 0.2)" }} whileTap={{ scale: 0.9 }} onClick={onClick} className={`p-3 rounded-full transition-all flex items-center justify-center
        ${danger
            ? 'bg-red-500 text-white w-12 h-12 shadow-lg shadow-red-500/30'
            : active ? 'bg-white/10 text-white w-12 h-12' : 'bg-red-500/10 text-red-500 border border-red-500/20 w-12 h-12'}`}>
      {icon}
    </motion.button>);
}
