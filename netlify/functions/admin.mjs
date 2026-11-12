// Admin-Schnittstelle: nur mit dem Passwort aus der Netlify-Umgebungsvariable ADMIN_PASSWORD
import { getStore } from "@netlify/blobs";
import { createHash, timingSafeEqual } from "node:crypto";
import { STORE, alle, aenderung, importieren, ausEvent } from "../lib/anmeldungen.mjs";

export const config = { path: "/api/admin" };

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

function passwortOk(req) {
  const soll = process.env.ADMIN_PASSWORD || "";
  const ist = req.headers.get("x-admin-password") || "";
  if (!soll) return false;
  const a = createHash("sha256").update(soll).digest();
  const b = createHash("sha256").update(ist).digest();
  return timingSafeEqual(a, b);
}

export default async (req) => {
  if (!process.env.ADMIN_PASSWORD) return json({ error: "kein_passwort_gesetzt" }, 500);
  if (!passwortOk(req)) {
    await new Promise((r) => setTimeout(r, 800));
    return json({ error: "falsches_passwort" }, 401);
  }
  const store = getStore({ name: STORE, consistency: "strong" });

  if (req.method === "GET") return json({ items: await alle(store) });

  if (req.method === "POST") {
    let body;
    try { body = await req.json(); } catch { return json({ error: "ungueltig" }, 400); }
    if (body.action === "update") {
      const id = String(body.id || "");
      const cur = await store.get(id, { type: "json" });
      if (!cur) return json({ error: "nicht_gefunden" }, 404);
      const next = aenderung(cur, body);
      await store.setJSON(id, next);
      return json({ item: next });
    }
    if (body.action === "event") return json({ ergebnis: await ausEvent(store, body.event) });
    if (body.action === "import") return json(await importieren(store, body.zeilen));
    if (body.action === "delete") {
      await store.delete(String(body.id || ""));
      return json({ ok: true });
    }
    return json({ error: "unbekannte_aktion" }, 400);
  }
  return json({ error: "methode" }, 405);
};
