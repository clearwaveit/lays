import {
  type AdminDraft,
  initialAdminDraft,
  normalizeAdminDraft,
} from "@/app/lib/campaignDraftCore";
import { promises as fs } from "node:fs";
import path from "node:path";

export const dynamic = "force-dynamic";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "campaign-admin-draft.json");

async function readDraft() {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    return normalizeAdminDraft(JSON.parse(raw) as Partial<AdminDraft>);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error("Failed to read campaign draft", error);
    }
    return initialAdminDraft();
  }
}

async function writeDraft(draft: AdminDraft) {
  const normalized = normalizeAdminDraft(draft);
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(normalized, null, 2), "utf8");
  return normalized;
}

export async function GET() {
  const draft = await readDraft();
  return Response.json(draft, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<AdminDraft>;
    const draft = await writeDraft(normalizeAdminDraft(body));
    return Response.json(draft, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Failed to save campaign draft", error);
    return Response.json(
      { error: "Unable to save campaign draft" },
      { status: 400 },
    );
  }
}
