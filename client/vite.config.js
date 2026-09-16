import path from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        // keeps the "@/..." imports the components already used
        alias: { "@": path.resolve(process.cwd(), "src") },
    },
    server: {
        port: 5173,
    },
})
