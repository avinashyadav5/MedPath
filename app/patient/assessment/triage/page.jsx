import { PatientTriageChat } from "@/components/patient/PatientTriageChat"

export default function TriagePage() {
    return (
        <div className="container mx-auto py-8">
            <div className="max-w-4xl mx-auto mb-8 text-center">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                    AI Triage Assistant
                </h1>
                <p className="text-muted-foreground">
                    Chat with our advanced AI nurse to get a preliminary assessment before seeing a doctor.
                </p>
            </div>

            <PatientTriageChat />
        </div>
    )
}
