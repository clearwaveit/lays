import {
  initialAdminDraft,
  normalizeAdminDraft,
  type AdminDraft,
} from "@/app/lib/campaignDraftCore";
import { promises as fs } from "node:fs";
import path from "node:path";

export const dynamic = "force-dynamic";

const DATA_FILE = path.join(process.cwd(), "data", "campaign-admin-draft.json");

async function readDraft(): Promise<AdminDraft> {
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

export async function GET() {
  const draft = await readDraft();
  return Response.json(
    {
      matches: draft.matches,
      restaurants: draft.restaurants,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
