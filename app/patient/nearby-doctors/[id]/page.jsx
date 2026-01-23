import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getPrediction } from "@/app/actions/diagnosis-actions";
import { getNearbyDoctorsAndHospitals } from "@/app/actions/location-actions";
import NearbyDoctorsClient from "./nearby-doctors-client";
export default async function NearbyDoctorsPage({ params, }) {
    // ✅ FIX: await params
    const { id } = await params;
    const session = await getSession();
    if (!session)
        redirect("/login");
    const predictionId = Number(id);
    if (Number.isNaN(predictionId))
        notFound();
    const prediction = await getPrediction(predictionId);
    if (!prediction)
        notFound();
    const data = await getNearbyDoctorsAndHospitals(predictionId);
    return (<NearbyDoctorsClient hospitals={data.hospitals} registeredDoctors={data.registeredDoctors} city={data.city} specialty={data.specialty} predictionId={predictionId} diagnosis={prediction.diagnosis} error={data.error}/>);
}
