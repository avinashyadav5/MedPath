"use client";
import { useState, useEffect, useRef } from "react";
import { Send, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getMessages, sendMessage } from "@/app/actions/chat-actions";
import { cn } from "@/lib/utils";
export function ChatPanel({ appointmentId, role, isConfirmed, otherName }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    const loadMessages = async () => {
        const result = await getMessages(appointmentId);
        if (result.success) {
            setMessages(result.messages);
        }
    };
    useEffect(() => {
        loadMessages();
        const interval = setInterval(loadMessages, 3000);
        return () => clearInterval(interval);
    }, [appointmentId]);
    useEffect(() => {
        scrollToBottom();
    }, [messages.length]);
    const handleSend = async (e) => {
        e?.preventDefault();
        if (!newMessage.trim() || !isConfirmed)
            return;
        setLoading(true);
        const result = await sendMessage(appointmentId, newMessage);
        setLoading(false);
        if (result.success) {
            setNewMessage("");
            loadMessages();
        }
    };
    return (<div className="flex flex-col h-full bg-background relative">
      {/* MESSAGES AREA */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (<div className="h-full flex flex-col items-center justify-center text-center opacity-0 animate-in fade-in duration-500">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
              <Send className="w-8 h-8 ml-1"/>
            </div>
            <h3 className="font-semibold text-lg text-foreground">No messages yet</h3>
            <p className="text-muted-foreground max-w-sm mt-1">Start the conversation with {otherName || "your doctor"}!</p>
          </div>) : (messages.map((msg) => {
            const isMe = msg.sender_role === role;
            return (<div key={msg.id} className={cn("flex flex-col max-w-[70%]", isMe ? "ml-auto items-end" : "mr-auto items-start")}>
                {!isMe && (<span className="text-xs text-muted-foreground mb-1 ml-1">{otherName}</span>)}
                <div className={cn("rounded-2xl px-5 py-3 text-sm relative shadow-sm", isMe
                    ? "bg-primary text-primary-foreground rounded-tr-none"
                    : "bg-muted text-foreground rounded-tl-none")}>
                  {msg.message}
                </div>
                <span className="text-[10px] text-muted-foreground mt-1 px-1">
                  {new Date(msg.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>);
        }))}
        <div ref={messagesEndRef}/>
      </div>

      {/* INPUT AREA */}
      <div className="p-4 border-t bg-background/95 backdrop-blur-sm sticky bottom-0 z-10">
        {!isConfirmed ? (<div className="bg-muted border border-border rounded-xl p-4 text-center">
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4"/>
              Chat will be available once the appointment is confirmed by the doctor.
            </p>
          </div>) : (<form onSubmit={handleSend} className="flex gap-3 items-center">
            <div className="relative flex-1">
              <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." disabled={loading} className="rounded-full pl-5 pr-5 py-6 bg-muted/50 border-input focus-visible:ring-primary focus-visible:ring-offset-0"/>
            </div>
            <Button type="submit" disabled={!newMessage.trim() || loading} size="icon" className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shrink-0 shadow-sm transition-all">
              <Send className="w-5 h-5 ml-0.5"/>
            </Button>
          </form>)}
      </div>
    </div>);
}
