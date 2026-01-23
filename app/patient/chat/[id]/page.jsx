import { getChatDetails } from "@/app/actions/appointment-actions";
import ClientChatShell from "@/components/chat/client-chat-shell";
import { notFound } from "next/navigation";
export default async function PatientChatPage({ params }) {
    const { id } = await params;
    const appointmentId = Number(id);
    if (isNaN(appointmentId))
        return notFound();
    const details = await getChatDetails(appointmentId);
    if (!details)
        return notFound();
    return (<ClientChatShell appointmentId={appointmentId} role="patient" isConfirmed={details.status === 'confirmed'} details={details}/>);
}
