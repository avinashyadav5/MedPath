import { useParams, useSearchParams } from "react-router-dom"
import { getDoctorInfo } from "@/api/doctor-actions"
import { BookingForm } from "@/components/patient/booking-form"
import { NotFound, PageLoader } from "@/components/page-state"
import { useAsync } from "@/hooks/use-async"

export default function PatientBookingPage() {
    const { doctorId } = useParams()
    const [searchParams] = useSearchParams()

    const predictionId = searchParams.get("predictionId") || undefined
    const diagnosis = searchParams.get("diagnosis") || undefined

    const { data: doctor, loading } = useAsync(
        () => getDoctorInfo(Number.parseInt(doctorId)),
        [doctorId]
    )

    if (loading) return <PageLoader label="Loading doctor details" />
    if (!doctor) return <NotFound message="We couldn't find that doctor." />

    return (
        <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">Book Appointment</h1>
                <p className="text-muted-foreground">Schedule your visit with Dr. {doctor.name}</p>
            </div>
            <BookingForm doctor={doctor} predictionId={predictionId} diagnosis={diagnosis} />
        </div>
    )
}
