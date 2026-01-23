import { getChatDetails } from "@/app/actions/appointment-actions";
import ClientChatShell from "@/components/chat/client-chat-shell";
import { notFound } from "next/navigation";
export default async function DoctorChatPage({ params, }) {
    const { appointmentId } = await params;
    const id = Number(appointmentId);
    if (isNaN(id))
        return notFound();
    const details = await getChatDetails(id);
    if (!details)
        return notFound();
    return (<ClientChatShell appointmentId={id} role="doctor" isConfirmed={details.status === 'confirmed'} details={details}/>);
}
