import path from "path"
import fs from "fs-extra"

export function slugify(text: string) {
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "")
        .replace(/--+/g, "-")
        .replace(/^-+/, "")
        .replace(/-+$/, "")
}

export async function saveBase64(base64: string, filename: string) {
    const baseDir = "/uploads/series"

    const base64Data = base64.split(";base64,").pop();
    const filepath = path.join(process.cwd(), baseDir, filename)

    await fs.ensureDir(path.dirname(filepath))

    await fs.writeFile(filepath, base64Data as string, { encoding: "base64" })

    return new URL(path.join(baseDir, filename), process.env.APP_URL).href
}