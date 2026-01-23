import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";
import { BookingForm } from "@/components/patient/booking-form";
async function getDoctorInfo(doctorId) {
    if (isNaN(doctorId))
        return null;
    try {
        const result = await sql `
      SELECT 
        u.id,
        u.name,
        dp.specialty,
        dp.city,
        dp.hospital_name,
        dp.availability
      FROM users u
      JOIN doctor_profiles dp ON u.id = dp.user_id
      WHERE u.id = ${doctorId} AND u.role = 'doctor'
    `;
        return (result[0] || null);
    }
    catch (error) {
        console.error("Error fetching doctor:", error);
        return null;
    }
}
export default async function BookingPage({ params, searchParams, }) {
    const session = await getSession();
    if (!session)
        redirect("/login");
    const { doctorId } = await params;
    const { predictionId, diagnosis } = await searchParams;
    const doctor = await getDoctorInfo(Number.parseInt(doctorId));
    if (!doctor) {
        notFound();
    }
    return (<div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Book Appointment</h1>
        <p className="text-muted-foreground">Schedule your visit with Dr. {doctor.name}</p>
      </div>
      <BookingForm doctor={doctor} predictionId={predictionId} diagnosis={diagnosis}/>
    </div>);
}
