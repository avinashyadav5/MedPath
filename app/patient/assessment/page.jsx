import { AssessmentForm } from "@/components/patient/assessment-form";
import { getSession } from "@/lib/auth";
export default async function AssessmentPage() {
    const session = await getSession();
    return (<div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Health Assessment</h1>
        <p className="text-muted-foreground">Describe your symptoms and let our AI provide an initial evaluation</p>
      </div>
      <AssessmentForm userName={session?.name || ""}/>
    </div>);
}
