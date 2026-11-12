// Wird von Netlify automatisch bei jeder bestätigten Formular-Anmeldung aufgerufen:
// speichert die Anmeldung für den Admin-Bereich und schickt die Bestätigungsmail.
import { connectLambda, getStore } from "@netlify/blobs";
import { STORE, ausEvent } from "../lib/anmeldungen.mjs";
import { bestaetigungSenden } from "../lib/mail.mjs";

export const handler = async (event) => {
  let ergebnis = "fehler";
  let daten = {};
  try {
    const body = JSON.parse(event.body || "{}");
    daten = (body.payload && body.payload.data) || {};
    connectLambda(event);
    const store = getStore({ name: STORE, consistency: "strong" });
    ergebnis = await ausEvent(store, body);
  } catch (e) {
    console.error("submission-created speichern", e);
  }
  // Mail nur bei neuer Anmeldung (nicht doppelt) – auch wenn das Speichern scheitert
  if (ergebnis === "gespeichert" || ergebnis === "fehler") {
    try {
      console.log("bestaetigungsmail", await bestaetigungSenden(daten));
    } catch (e) {
      console.error("bestaetigungsmail", e);
    }
  }
  return { statusCode: 200, body: ergebnis };
};
