# Beat the Beast Ultra – Webseite

- `site/` – die fertige Webseite (wird von Netlify veröffentlicht), inkl. `site/admin/` (Admin-Bereich unter /admin)
- `netlify/functions/submission-created.mjs` – speichert jede neue Anmeldung automatisch (Netlify Blobs, Store „anmeldungen“)
- `netlify/functions/admin.mjs` – Schnittstelle `/api/admin` für den Admin-Bereich, geschützt durch die Netlify-Umgebungsvariable `ADMIN_PASSWORD`

Anmeldungen kommen weiterhin zusätzlich über Netlify Forms (E-Mail-Benachrichtigung, Zapier-Bestätigungsmail).

## Bestätigungsmail
Jede neue Anmeldung bekommt automatisch eine Bestätigungsmail (netlify/lib/mail.mjs), verschickt über das IONOS-Postfach mail@beatthebeast-ultra.com. Dafür muss bei Netlify die Variable SMTP_PASSWORD gesetzt sein.
