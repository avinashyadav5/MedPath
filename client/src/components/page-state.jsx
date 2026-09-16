import { Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function PageLoader({ label = "Loading" }) {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <p className="text-sm">{label}</p>
        </div>
    )
}

export function PageError({ error, onRetry }) {
    return (
        <Alert variant="destructive" className="max-w-xl mx-auto my-12">
            <AlertDescription className="flex items-center justify-between gap-4">
                <span>{error?.message || "Something went wrong."}</span>
                {onRetry && (
                    <button type="button" onClick={onRetry} className="underline shrink-0">
                        Try again
                    </button>
                )}
            </AlertDescription>
        </Alert>
    )
}

export function NotFound({ message = "We couldn't find that page." }) {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
            <h1 className="text-4xl font-bold mb-2">404</h1>
            <p className="text-muted-foreground">{message}</p>
        </div>
    )
}
