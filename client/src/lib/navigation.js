/**
 * Server actions used to call Next's `redirect()`. The API modules in src/api
 * can't do that, so App.jsx registers react-router's navigate() here and the
 * API modules call navigateTo() at the same points the actions redirected.
 * That keeps every component's call site unchanged.
 */
let navigator = null

export function setNavigator(fn) {
    navigator = fn
}

export function navigateTo(path, options) {
    if (navigator) {
        navigator(path, options)
    } else {
        window.location.assign(path)
    }
}

/**
 * Stands in for Next's revalidatePath(). The server actions called it after every
 * mutation and the page re-rendered with fresh data. Here the mutation helpers
 * fire this instead, and useAsync() reloads whatever is on screen.
 */
export function revalidate() {
    window.dispatchEvent(new CustomEvent("medpath:refresh"))
}
