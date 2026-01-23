import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
export async function POST(req) {
    const data = await req.formData();
    const file = data.get("file");
    if (!file)
        return NextResponse.json({ error: "No file" });
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const dir = path.join(process.cwd(), "public/uploads");
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir, { recursive: true });
    const name = `${Date.now()}-${file.name}`;
    fs.writeFileSync(path.join(dir, name), buffer);
    return NextResponse.json({
        url: `/uploads/${name}`,
        type: file.type.startsWith("image") ? "image" : "file",
    });
}
