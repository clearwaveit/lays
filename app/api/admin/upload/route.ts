import { randomBytes } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

export const dynamic = "force-dynamic";

const UPLOAD_DIR = path.join(process.cwd(), "public", "assets", "uploads");
const MAX_BYTES = 5 * 1024 * 1024;

function isUploadFile(value: FormDataEntryValue | null): value is File {
  return (
    typeof value === "object" &&
    value !== null &&
    "arrayBuffer" in value &&
    typeof value.arrayBuffer === "function"
  );
}

function detectImageExtension(buffer: Buffer): string | null {
  if (
    buffer.length >= 4 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return ".png";
  }
  if (buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xd8) {
    return ".jpg";
  }
  if (buffer.length >= 3 && buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
    return ".gif";
  }
  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return ".webp";
  }

  const preview = buffer.toString("utf8", 0, Math.min(buffer.length, 4096)).trimStart();
  if (preview.startsWith("<svg") || preview.startsWith("<?xml")) {
    return isSafeSvg(buffer) ? ".svg" : null;
  }

  return null;
}

function isSafeSvg(buffer: Buffer): boolean {
  const text = buffer.toString("utf8").toLowerCase();
  if (!text.includes("<svg")) return false;

  const blocked = [
    "<script",
    "javascript:",
    "onload=",
    "onerror=",
    "onclick=",
    "<foreignobject",
  ];
  return !blocked.some((pattern) => text.includes(pattern));
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!isUploadFile(file)) {
      return Response.json({ error: "Missing file" }, { status: 400 });
    }
    if (file.size === 0) {
      return Response.json({ error: "Empty file" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return Response.json({ error: "File too large (max 5MB)" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = detectImageExtension(buffer);
    if (!ext) {
      return Response.json(
        { error: "Unsupported file type. Use PNG, JPG, GIF, WebP, or SVG." },
        { status: 400 },
      );
    }

    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const filename = `${Date.now()}-${randomBytes(8).toString("hex")}${ext}`;
    const filePath = path.join(UPLOAD_DIR, filename);
    await fs.writeFile(filePath, buffer);

    return Response.json({ path: `/assets/uploads/${filename}` });
  } catch (error) {
    console.error("Failed to upload admin asset", error);
    return Response.json({ error: "Upload failed" }, { status: 500 });
  }
}
