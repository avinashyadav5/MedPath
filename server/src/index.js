import "dotenv/config"
import path from "node:path"
import { fileURLToPath } from "node:url"
import cookieParser from "cookie-parser"
import cors from "cors"
import express from "express"
import morgan from "morgan"

import { attachUser } from "./middleware/auth.js"
import adminRoutes from "./routes/admin.js"
import appointmentRoutes from "./routes/appointments.js"
import authRoutes from "./routes/auth.js"
import chatRoutes from "./routes/chat.js"
import diagnosisRoutes from "./routes/diagnosis.js"
import doctorRoutes from "./routes/doctor.js"
import locationRoutes from "./routes/location.js"
import setupRoutes from "./routes/setup.js"
import triageRoutes from "./routes/triage.js"
import uploadRoutes from "./routes/upload.js"
import videoRoutes from "./routes/video.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()

const configuredOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((o) => o.trim().replace(/\/+$/, ""))
    .filter(Boolean)

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true)
            const cleanOrigin = origin.replace(/\/+$/, "")
            if (
                configuredOrigins.includes(cleanOrigin) ||
                cleanOrigin.startsWith("http://localhost:") ||
                cleanOrigin.startsWith("http://127.0.0.1:") ||
                /\.vercel\.app$/.test(new URL(origin).hostname)
            ) {
                return callback(null, true)
            }
            return callback(new Error(`CORS origin ${origin} not allowed`))
        },
        credentials: true,
    })
)
app.use(express.json({ limit: "2mb" }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(morgan("dev"))
app.use(attachUser)

app.use("/uploads", express.static(path.join(__dirname, "../uploads")))

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "medpath-api" }))

app.use("/api/auth", authRoutes)
app.use("/api/diagnosis", diagnosisRoutes)
app.use("/api/doctor", doctorRoutes)
app.use("/api/appointments", appointmentRoutes)
app.use("/api/chat", chatRoutes)
app.use("/api/video", videoRoutes)
app.use("/api/location", locationRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/triage", triageRoutes)
app.use("/api/upload", uploadRoutes)
app.use("/api/setup", setupRoutes)

// In production the built client is served from here, so deep links like
// /patient/result/12 fall through to index.html instead of 404ing.
const clientDist = path.join(__dirname, "../../client/dist")
if (process.env.SERVE_CLIENT === "true") {
    app.use(express.static(clientDist))
    app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(path.join(clientDist, "index.html")))
}

app.use((_req, res) => res.status(404).json({ error: "Not found" }))

app.use((err, _req, res, _next) => {
    console.error("[error]", err)
    const status = err.status || 500
    res.status(status).json({ error: err.message || "Internal server error" })
})

const port = Number(process.env.PORT) || 4000
app.listen(port, () => {
    console.log(`MedPath API listening on http://localhost:${port}`)
    console.log(`CORS origin: ${clientOrigin}`)
})
