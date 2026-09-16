import { getPatientHistory } from "@/api/diagnosis-actions"
import { HistoryList } from "@/components/patient/history-list"
import { PageLoader } from "@/components/page-state"
import { useAsync } from "@/hooks/use-async"

export default function PatientHistoryPage() {
    const { data: history, loading } = useAsync(() => getPatientHistory(), [], { initialData: [] })

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">Assessment History</h1>
                <p className="text-muted-foreground">View your previous health assessments</p>
            </div>
            {loading ? <PageLoader label="Loading your assessments" /> : <HistoryList history={history || []} />}
        </div>
    )
}
