interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Envio de email transacional via Resend.
 * Sem RESEND_API_KEY configurada, apenas registra no log (modo dev) em vez de falhar.
 */
export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "Skafk Promoções <onboarding@resend.dev>";

  if (!apiKey) {
    console.log(`[email:dev] para=${to} assunto="${subject}" (RESEND_API_KEY ausente)`);
    return { skipped: true as const };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [to], subject, html, text }),
  });

  if (!res.ok) {
    throw new Error(`Falha ao enviar email: ${res.status} ${await res.text()}`);
  }
  return { skipped: false as const };
}

export function priceAlertEmail(opts: {
  title: string;
  price: number;
  target: number;
  storeName: string;
  link: string;
  thumb?: string | null;
  siteUrl: string;
  usdToBrl: number;
}) {
  const fmt = (v: number) =>
    (v * opts.usdToBrl).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  return `
  <div style="background:#08080A;padding:32px;font-family:Helvetica,Arial,sans-serif;color:#F4F1EA">
    <div style="max-width:520px;margin:0 auto;border:1px solid #23232B;background:#101014">
      <div style="background:#FF1F6B;padding:14px 20px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#08080A;font-weight:700">
        Skafk Promoções — alerta de preço
      </div>
      <div style="padding:24px">
        ${opts.thumb ? `<img src="${opts.thumb}" alt="" style="width:100%;display:block;margin-bottom:18px" />` : ""}
        <h1 style="font-size:26px;margin:0 0 8px;text-transform:uppercase;line-height:1.1">${opts.title}</h1>
        <p style="color:#8A8896;margin:0 0 18px;font-size:14px">
          Bateu o seu alvo de ${fmt(opts.target)} — agora está
          <strong style="color:#C6FF3D">${fmt(opts.price)}</strong> na ${opts.storeName}.
        </p>
        <a href="${opts.link}" style="display:inline-block;background:#C6FF3D;color:#08080A;padding:12px 22px;font-weight:700;text-decoration:none;text-transform:uppercase;letter-spacing:1px;font-size:13px">
          Pegar a oferta
        </a>
        <p style="color:#5A5866;font-size:11px;margin-top:22px">
          Você recebeu isso porque criou um alerta em <a href="${opts.siteUrl}" style="color:#8A8896">Skafk Promoções</a>.
        </p>
      </div>
    </div>
  </div>`;
}
