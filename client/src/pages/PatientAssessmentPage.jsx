import { AssessmentForm } from "@/components/patient/assessment-form"
import { useAuth } from "@/context/auth-context"

export default function PatientAssessmentPage() {
    const { user } = useAuth()

    return (
        <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">Health Assessment</h1>
                <p className="text-muted-foreground">
                    Describe your symptoms and let our AI provide an initial evaluation
                </p>
            </div>
            <AssessmentForm userName={user?.name || ""} />
        </div>
    )
}
