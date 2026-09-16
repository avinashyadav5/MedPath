/**
 * Drop-in replacements for the handful of next/* APIs the components used.
 * Everything here is backed by react-router so the component bodies didn't
 * have to change.
 */
import { useCallback, useMemo } from "react"
import { useLocation, useNavigate, useSearchParams as useRouterSearchParams } from "react-router-dom"

/** next/navigation useRouter() -> push/replace/back/forward/refresh */
export function useRouter() {
    const navigate = useNavigate()

    return useMemo(
        () => ({
            push: (href) => navigate(href),
            replace: (href) => navigate(href, { replace: true }),
            back: () => navigate(-1),
            forward: () => navigate(1),
            prefetch: () => { },
            // Next's router.refresh() re-ran the server component. There is no
            // server render here, so components listen for this event and refetch.
            refresh: () => window.dispatchEvent(new CustomEvent("medpath:refresh")),
        }),
        [navigate]
    )
}

/** next/navigation usePathname() */
export function usePathname() {
    return useLocation().pathname
}

/** next/navigation useSearchParams() — react-router's has the same .get()/.toString() */
export function useSearchParams() {
    const [params] = useRouterSearchParams()
    return params
}

/** Mutable variant, handy when a component needs to write filters back to the URL */
export function useSetSearchParams() {
    const [, setParams] = useRouterSearchParams()
    return useCallback((next) => setParams(next), [setParams])
}

/** next/navigation redirect() outside of a hook */
export function redirect(href) {
    window.location.assign(href)
}

/** next/navigation notFound() */
export function notFound() {
    const error = new Error("NEXT_NOT_FOUND")
    error.notFound = true
    throw error
}

/** next/image -> plain img; the Next config already had optimisation disabled */
export function Image({ src, alt = "", width, height, className, style, priority: _priority, ...rest }) {
    return <img src={src} alt={alt} width={width} height={height} className={className} style={style} {...rest} />
}

export default Image
