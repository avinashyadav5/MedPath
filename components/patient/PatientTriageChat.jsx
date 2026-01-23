"use client"

import { useChat } from "@ai-sdk/react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, User, Stethoscope, Loader2 } from "lucide-react"
import { submitTriageAssessment } from "@/app/actions/diagnosis-actions"
import { toast } from "sonner"

export function PatientTriageChat() {
    const scrollRef = useRef(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [hasFinished, setHasFinished] = useState(false)

    const { messages, input, handleInputChange, handleSubmit, toolInvocations, status } = useChat({
        api: "/api/triage",
        maxSteps: 1, // We handle the tool call manually
    })

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    // Monitor for tool calls
    useEffect(() => {
        const checkToolCalls = async () => {
            if (isSubmitting || hasFinished) return

            const lastMessage = messages[messages.length - 1]
            if (!lastMessage || lastMessage.role !== "assistant") return

            // Check tool invocations from the hook
            if (toolInvocations && toolInvocations.length > 0) {
                const lastTool = toolInvocations[toolInvocations.length - 1]

                if (lastTool.toolName === "finishAssessment" && lastTool.state === "call") {
                    setHasFinished(true)
                    setIsSubmitting(true)

                    try {
                        // Visualize the action to the user
                        toast.info("Assessment complete. Analyzing data...")

                        // Extract the arguments
                        const args = lastTool.args

                        // Call the server action
                        const result = await submitTriageAssessment(args)

                        if (result && result.error) {
                            toast.error(result.error)
                            setIsSubmitting(false)
                            setHasFinished(false)
                        }
                        // If successful, the server action will redirect, so we don't need to do anything else.
                    } catch (error) {
                        console.error("Submission error:", error)
                        toast.error("Failed to submit assessment. Please try again.")
                        setIsSubmitting(false)
                        setHasFinished(false)
                    }
                }
            }
        }

        checkToolCalls()
    }, [toolInvocations, messages, isSubmitting, hasFinished])

    return (
        <Card className="w-full max-w-2xl mx-auto h-[700px] flex flex-col shadow-xl border-blue-100 dark:border-blue-900">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-xl">
                <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="w-6 h-6" />
                    Smart Triage Nurse
                </CardTitle>
                <p className="text-blue-100 text-sm">
                    I'll ask you a few questions to understand your condition better.
                </p>
            </CardHeader>

            <CardContent className="flex-1 p-0 overflow-hidden relative">
                <ScrollArea className="h-full p-4" ref={scrollRef}>
                    <div className="space-y-4 pb-4">
                        {messages.length === 0 && (
                            <div className="text-center text-muted-foreground mt-8">
                                <div className="bg-blue-50 dark:bg-blue-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Stethoscope className="w-8 h-8 text-blue-500" />
                                </div>
                                <p>Hello! I'm here to help.</p>
                                <p>Please describe your main symptom to start.</p>
                            </div>
                        )}

                        {messages.map((m) => (
                            <div
                                key={m.id}
                                className={`flex items-start gap-3 ${m.role === "user" ? "flex-row-reverse" : ""
                                    }`}
                            >
                                <Avatar className={`w-8 h-8 ${m.role === "assistant" ? "bg-blue-100" : "bg-gray-100"}`}>
                                    <AvatarFallback>
                                        {m.role === "assistant" ? <Stethoscope className="w-4 h-4 text-blue-600" /> : <User className="w-4 h-4" />}
                                    </AvatarFallback>
                                    {m.role === "assistant" && <AvatarImage src="/nurse-avatar.png" />}
                                </Avatar>

                                <div
                                    className={`
                    max-w-[80%] rounded-2xl px-4 py-2 text-sm
                    ${m.role === "user"
                                            ? "bg-blue-600 text-white rounded-tr-sm"
                                            : "bg-gray-100 dark:bg-gray-800 text-foreground rounded-tl-sm"
                                        }
                  `}
                                >
                                    {/* We don't want to show the tool call json */}
                                    {(!m.toolInvocations || m.toolInvocations.length === 0) && (
                                        <div className="whitespace-pre-wrap">{m.content}</div>
                                    )}
                                    {m.toolInvocations && m.toolInvocations.length > 0 && (
                                        <div className="flex items-center gap-2 italic text-gray-500 dark:text-gray-400">
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                            Analyzing your symptoms...
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {status === "submitted" && (
                            <div className="flex items-start gap-3">
                                <Avatar className="w-8 h-8 bg-blue-100">
                                    <AvatarFallback><Stethoscope className="w-4 h-4 text-blue-600" /></AvatarFallback>
                                </Avatar>
                                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-2">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                {isSubmitting && (
                    <div className="absolute inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center flex-col z-10 transition-all">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl flex flex-col items-center">
                            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Analyzing Assessment</h3>
                            <p className="text-sm text-gray-500 text-center max-w-xs">
                                Our system is reviewing your information to generate a preliminary diagnosis...
                            </p>
                        </div>
                    </div>
                )}
            </CardContent>

            <CardFooter className="p-4 border-t bg-gray-50 dark:bg-gray-900/50">
                <form onSubmit={handleSubmit} className="flex gap-2 w-full">
                    <Input
                        value={input}
                        onChange={handleInputChange}
                        placeholder={isSubmitting ? "Assessment complete" : "Type your answer..."}
                        disabled={isSubmitting || hasFinished}
                        className="flex-1"
                        autoFocus
                    />
                    <Button
                        type="submit"
                        disabled={!input.trim() || isSubmitting || hasFinished}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <Send className="w-4 h-4" />
                        <span className="sr-only">Send</span>
                    </Button>
                </form>
            </CardFooter>
        </Card>
    )
}
