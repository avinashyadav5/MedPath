import { getPatientHistory } from "@/app/actions/diagnosis-actions";
import { HistoryList } from "@/components/patient/history-list";
export default async function HistoryPage() {
    const history = await getPatientHistory();
    return (<div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Assessment History</h1>
        <p className="text-muted-foreground">View your previous health assessments</p>
      </div>
      <HistoryList history={history}/>
    </div>);
}
