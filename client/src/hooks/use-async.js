import { useCallback, useEffect, useState } from "react"

/**
 * Stands in for `await someAction()` at the top of a Next server component.
 * Returns { data, error, loading, reload } and re-runs when deps change or when
 * something fires the "medpath:refresh" event (our router.refresh() equivalent).
 */
export function useAsync(loader, deps = [], { initialData = null } = {}) {
    const [data, setData] = useState(initialData)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true)

    const run = useCallback(async () => {
        setLoading(true)
        try {
            const result = await loader()
            setData(result)
            setError(null)
        } catch (err) {
            setError(err)
        } finally {
            setLoading(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps)

    useEffect(() => {
        run()
    }, [run])

    useEffect(() => {
        const handler = () => run()
        window.addEventListener("medpath:refresh", handler)
        return () => window.removeEventListener("medpath:refresh", handler)
    }, [run])

    return { data, error, loading, reload: run }
}
