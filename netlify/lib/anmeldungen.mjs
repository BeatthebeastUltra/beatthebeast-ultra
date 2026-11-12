// Gemeinsame Logik für Anmeldungen (Speicher: Netlify Blobs, Store "anmeldungen")
import { createHash } from "node:crypto";

export const STORE = "anmeldungen";
const TECHNISCH = ["ip", "user_agent", "referrer", "bot-field", "form-name"];
const ANSPRECH = ["", "Tobias", "Marisa"];

export function sauber(daten = {}) {
  const d = {};
  for (const [k, v] of Object.entries(daten)) {
    if (TECHNISCH.includes(k)) continue;
    d[k] = typeof v === "string" ? v.slice(0, 4000) : v;
  }
  return d;
}

export function schluessel(daten) {
  const s = [daten.vorname, daten.nachname, daten.email]
    .map((x) => String(x || "").trim().toLowerCase())
    .join("|");
  return s;
}

export function neuerEintrag(id, daten, eingang) {
  return {
    id: String(id),
    eingang: eingang || new Date().toISOString(),
    daten: sauber(daten),
    bezahlt: false,
    ansprechpartner: "",
    kontaktiert: false,
    notiz: "",
  };
}

export function importId(daten) {
  return "import-" + createHash("sha1").update(schluessel(daten)).digest("hex").slice(0, 16);
}

export function aenderung(cur, body) {
  const next = { ...cur };
  if ("bezahlt" in body) next.bezahlt = !!body.bezahlt;
  if ("kontaktiert" in body) next.kontaktiert = !!body.kontaktiert;
  if ("ansprechpartner" in body)
    next.ansprechpartner = ANSPRECH.includes(body.ansprechpartner) ? body.ansprechpartner : "";
  if ("notiz" in body) next.notiz = String(body.notiz || "").slice(0, 1000);
  return next;
}

export async function alle(store) {
  const { blobs } = await store.list();
  const items = await Promise.all(blobs.map((b) => store.get(b.key, { type: "json" })));
  return items.filter(Boolean).sort((a, b) => String(a.eingang).localeCompare(String(b.eingang)));
}

// Netlify-Event "submission-created": legt die Anmeldung einmalig an
export async function ausEvent(store, body) {
  const p = (body && body.payload) || {};
  const formName = p.form_name || (p.data && p.data["form-name"]) || "";
  if (formName && formName !== "anmeldung") return "ignoriert";
  const id = String(p.id || p.number || Date.now());
  const vorhanden = await store.get(id, { type: "json" });
  if (vorhanden) return "schon_da";
  await store.setJSON(id, neuerEintrag(id, p.data || {}, p.created_at));
  return "gespeichert";
}

// Import aus der Netlify-CSV: überspringt Personen, die schon in der Liste sind
export async function importieren(store, zeilen) {
  const liste = await alle(store);
  const bekannt = new Set(liste.map((e) => schluessel(e.daten || {})));
  let neu = 0, uebersprungen = 0;
  for (const z of (zeilen || []).slice(0, 1000)) {
    const daten = sauber(z.daten || {});
    if (!daten.vorname && !daten.nachname) continue;
    const k = schluessel(daten);
    if (bekannt.has(k)) { uebersprungen++; continue; }
    bekannt.add(k);
    const id = importId(daten);
    await store.setJSON(id, neuerEintrag(id, daten, z.eingang));
    neu++;
  }
  return { neu, uebersprungen };
}
