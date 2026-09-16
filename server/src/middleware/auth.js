import { SESSION_COOKIE, verifyToken } from "../lib/auth.js"

/**
 * Replaces `getSession()` from lib/auth.js. Runs on every request and puts the
 * decoded JWT payload on `req.user` (or null). Never rejects — route guards do that.
 */
export async function attachUser(req, _res, next) {
    const token = req.cookies?.[SESSION_COOKIE]
    req.user = token ? await verifyToken(token) : null
    next()
}

export function requireAuth(req, res, next) {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" })
    next()
}

/** requireRole("patient") / requireRole("doctor") / requireRole("admin") */
export function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user) return res.status(401).json({ error: "Unauthorized" })
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: "Forbidden: insufficient role" })
        }
        next()
    }
}

export const requireAdmin = requireRole("admin")

/** Wraps an async handler so thrown errors reach the error middleware. */
export const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next)
