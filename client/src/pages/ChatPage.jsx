import { useParams } from "react-router-dom"
import { getChatDetails } from "@/api/appointment-actions"
import ClientChatShell from "@/components/chat/client-chat-shell"
import { NotFound, PageLoader } from "@/components/page-state"
import { useAsync } from "@/hooks/use-async"

/** Serves both /patient/chat/:id and /doctor/chat/:id — the old app had one page each. */
export default function ChatPage({ role }) {
    const params = useParams()
    const appointmentId = Number(params.id ?? params.appointmentId)

    const { data: details, loading } = useAsync(
        () => (Number.isNaN(appointmentId) ? Promise.resolve(null) : getChatDetails(appointmentId)),
        [appointmentId]
    )

    if (loading) return <PageLoader label="Opening conversation" />
    if (!details) return <NotFound message="That conversation isn't available." />

    return (
        <ClientChatShell
            appointmentId={appointmentId}
            role={role}
            isConfirmed={details.status === "confirmed"}
            details={details}
        />
    )
}
