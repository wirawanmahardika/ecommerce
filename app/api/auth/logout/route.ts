import { clearSessionCookie } from "@/src/lib/auth";
import { ok } from "@/src/lib/response";

export async function POST() {
  await clearSessionCookie();
  return ok(null, "Berhasil logout");
}
