import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { Router } from "express"
import multer from "multer"
import { requireAuth } from "../middleware/auth.js"

const router = Router()
const uploadsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../uploads")
fs.mkdirSync(uploadsDir, { recursive: true })

/**
 * was: app/api/upload/route.js — Next parsed FormData itself; Express needs multer.
 * Files land in server/uploads and are served from /uploads by index.js.
 */
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/[^\w.-]/g, "_")}`),
})

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
})

router.post("/", requireAuth, upload.single("file"), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file" })

    res.json({
        url: `/uploads/${req.file.filename}`,
        type: req.file.mimetype.startsWith("image") ? "image" : "file",
    })
})

export default router
