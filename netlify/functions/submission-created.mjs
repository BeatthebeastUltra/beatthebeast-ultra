// Wird von Netlify automatisch bei jeder bestätigten Formular-Anmeldung aufgerufen:
// speichert die Anmeldung für den Admin-Bereich und schickt die Bestätigungsmail.
import { connectLambda, getStore } from "@netlify/blobs";
import { STORE, ausEvent } from "../lib/anmeldungen.mjs";
import { bestaetigungSenden } from "../lib/mail.mjs";

async function speichern(event, body) {
  // Direkt speichern, falls Netlify den Speicher-Zugang mitliefert
  if (event.blobs) {
    try {
      connectLambda(event);
      const store = getStore({ name: STORE, consistency: "strong" });
      return await ausEvent(store, body);
    } catch (e) {
      console.error("speichern direkt", e);
    }
  }
  // Sonst über die Admin-Schnittstelle der eigenen Seite speichern
  const basis = process.env.URL || "https://beatthebeast-ultra.com";
  const res = await fetch(basis + "/api/admin", {
    method: "POST",
    headers: { "content-type": "application/json", "x-admin-password": process.env.ADMIN_PASSWORD || "" },
    body: JSON.stringify({ action: "event", event: body }),
  });
  if (!res.ok) throw new Error("admin-api " + res.status);
  const ergebnis = (await res.json()).ergebnis;
  if (!["gespeichert", "schon_da", "ignoriert"].includes(ergebnis)) throw new Error("admin-api antwort " + ergebnis);
  return ergebnis;
}

export const handler = async (event) => {
  let ergebnis = "fehler";
  let daten = {};
  try {
    const body = JSON.parse(event.body || "{}");
    daten = (body.payload && body.payload.data) || {};
    ergebnis = await speichern(event, body);
  } catch (e) {
    console.error("submission-created speichern", e);
  }
  console.log("anmeldung", ergebnis);
  // Mail nur bei neuer Anmeldung (nicht doppelt) – auch wenn das Speichern scheitert
  if (ergebnis === "gespeichert" || ergebnis === "fehler") {
    try {
      console.log("bestaetigungsmail", await bestaetigungSenden(daten));
    } catch (e) {
      console.error("bestaetigungsmail", e);
    }
  }
  return { statusCode: 200, body: String(ergebnis) };
};
