// Bestätigungsmail an Läufer, verschickt über das IONOS-Postfach (SMTP)
import nodemailer from "nodemailer";

const ABSENDER = "mail@beatthebeast-ultra.com";

function esc(s) {
  return String(s || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

export function mailHtml(vorname) {
  const name = esc(String(vorname || "").trim()) || "Beast";
  return `<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Du bist angemeldet</title></head>
<body style="margin:0;padding:0;background:#0A0A0A;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0A0A0A;">
<tr><td align="center" style="padding:32px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#151515;border-top:4px solid #EA632B;">
<tr><td align="center" style="padding:36px 28px 8px;">
<img src="https://beatthebeast-ultra.com/assets/btb-logo.png" width="220" alt="Beat the Beast Ultra" style="display:block;width:220px;max-width:100%;height:auto;border:0;">
</td></tr>
<tr><td style="padding:24px 28px 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:bold;letter-spacing:3px;text-transform:uppercase;color:#EA632B;">Anmeldung eingegangen</td></tr>
<tr><td style="padding:8px 28px 0;font-family:Impact,'Arial Black',Arial,sans-serif;font-size:38px;line-height:42px;text-transform:uppercase;color:#F5F5F5;">Herzlichen Glückwunsch!</td></tr>
<tr><td style="padding:20px 28px 0;font-family:Arial,Helvetica,sans-serif;font-size:17px;line-height:26px;color:#D6D6D6;">
Hallo ${name},<br><br>
du bist beim <strong style="color:#F5F5F5;">Beat the Beast Ultra 2027</strong> angemeldet!<br><br>
Alle weiteren Infos, auch die Zahlungsinformationen für das Startgeld, bekommst du von uns persönlich per <strong style="color:#F5F5F5;">WhatsApp</strong>. Halte dein Handy bereit.
</td></tr>
<tr><td style="padding:28px 28px 0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #2A2A2A;border-bottom:1px solid #2A2A2A;">
<tr><td style="padding:12px 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#ABABAB;">Start</td><td align="right" style="padding:12px 0;font-family:Arial,Helvetica,sans-serif;font-size:17px;font-weight:bold;color:#F5F5F5;">01.05.2027 · 10 Uhr</td></tr>
<tr><td style="padding:12px 0;border-top:1px solid #2A2A2A;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#ABABAB;">Ort</td><td align="right" style="padding:12px 0;border-top:1px solid #2A2A2A;font-family:Arial,Helvetica,sans-serif;font-size:17px;font-weight:bold;color:#F5F5F5;">Am Bahndamm 1, Tensfeld</td></tr>
<tr><td style="padding:12px 0;border-top:1px solid #2A2A2A;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#ABABAB;">Loop</td><td align="right" style="padding:12px 0;border-top:1px solid #2A2A2A;font-family:Arial,Helvetica,sans-serif;font-size:17px;font-weight:bold;color:#F5F5F5;">6,706 km · jede Stunde</td></tr>
</table>
</td></tr>
<tr><td style="padding:28px 28px 0;font-family:Arial,Helvetica,sans-serif;font-size:17px;line-height:26px;color:#D6D6D6;">Wir sehen uns an der Startlinie.<br><strong style="color:#F5F5F5;">Tobias und Marisa</strong></td></tr>
<tr><td style="padding:28px 28px 32px;">
<a href="https://beatthebeast-ultra.com" style="display:inline-block;background:#EA632B;color:#0A0A0A;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;text-decoration:none;padding:14px 26px;">Zur Webseite</a>
</td></tr>
</table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">
<tr><td align="center" style="padding:18px 12px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#8E8E8E;">
Beat the Beast Ultra · mail@beatthebeast-ultra.com · Instagram: beatthebeast_ultra
</td></tr>
</table>
</td></tr></table>
</body></html>
`;
}

export function mailText(vorname) {
  const name = String(vorname || "").trim() || "Beast";
  return `Hallo ${name},

du bist beim Beat the Beast Ultra 2027 angemeldet!

Alle weiteren Infos, auch die Zahlungsinformationen für das Startgeld, bekommst du von uns persönlich per WhatsApp. Halte dein Handy bereit.

Start: 01.05.2027, 10 Uhr
Ort: Am Bahndamm 1, Tensfeld

Wir sehen uns an der Startlinie.
Tobias und Marisa
https://beatthebeast-ultra.com`;
}

export async function bestaetigungSenden(daten) {
  const pass = process.env.SMTP_PASSWORD;
  const an = String((daten && daten.email) || "").trim();
  if (!pass) return "kein_smtp_passwort";
  if (!/^[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]+$/.test(an)) return "keine_gueltige_email";
  const user = process.env.SMTP_USER || ABSENDER;
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.ionos.de",
    port: 465,
    secure: true,
    auth: { user, pass },
  });
  await transport.sendMail({
    from: `"Beat the Beast Ultra" <${user}>`,
    replyTo: ABSENDER,
    to: an,
    subject: "Du bist angemeldet: Beat the Beast Ultra 2027",
    html: mailHtml(daten.vorname),
    text: mailText(daten.vorname),
  });
  return "gesendet";
}
