// Wird von Netlify automatisch bei jeder bestätigten Formular-Anmeldung aufgerufen.
import { connectLambda, getStore } from "@netlify/blobs";
import { STORE, ausEvent } from "../lib/anmeldungen.mjs";

export const handler = async (event) => {
  try {
    connectLambda(event);
    const store = getStore({ name: STORE, consistency: "strong" });
    const ergebnis = await ausEvent(store, JSON.parse(event.body || "{}"));
    return { statusCode: 200, body: ergebnis };
  } catch (e) {
    console.error("submission-created", e);
    return { statusCode: 200, body: "fehler" };
  }
};
