import { Resend } from "resend";
import { siteUrl } from "./utils";

const SITE_NAME = process.env.SITE_NAME ?? "АнимеХаб";

/**
 * Отправляет письмо со ссылкой подтверждения через Resend.
 * До верификации домена в Resend используйте from = "onboarding@resend.dev"
 * (письма уйдут только на email владельца аккаунта Resend).
 */
export async function sendVerificationEmail(to: string, token: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not set");
  const resend = new Resend(apiKey);
  const from = process.env.EMAIL_FROM ?? "onboarding@resend.dev";
  const link = `${siteUrl()}/verify-email?token=${token}`;

  const html = `<!DOCTYPE html>
<html lang="ru">
<body style="margin:0;padding:0;background:#0b0e14;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:480px;margin:40px auto;background:#12151d;border:1px solid #262b38;border-radius:16px;padding:32px;">
    <div style="font-size:22px;font-weight:bold;color:#fff;margin-bottom:16px;">${SITE_NAME}</div>
    <div style="font-size:15px;line-height:1.6;color:#c9cede;">
      Здравствуйте!<br/><br/>
      Кто-то указал этот e-mail при регистрации на сайте ${SITE_NAME}.
      Чтобы подтвердить почту и активировать аккаунт, нажмите кнопку:
    </div>
    <div style="text-align:center;margin:28px 0;">
      <a href="${link}" style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;font-size:16px;font-weight:bold;padding:14px 28px;border-radius:10px;">Подтвердить почту</a>
    </div>
    <div style="font-size:13px;line-height:1.6;color:#8b91a5;">
      Или скопируйте ссылку в браузер:<br/>
      <a href="${link}" style="color:#a78bfa;word-break:break-all;">${link}</a>
    </div>
    <div style="font-size:12px;color:#646b7d;margin-top:24px;border-top:1px solid #262b38;padding-top:16px;">
      Ссылка действует 24 часа. Если вы не регистрировались — просто проигнорируйте это письмо.
    </div>
  </div>
</body>
</html>`;

  const { error } = await resend.emails.send({
    from,
    to: [to],
    subject: `Подтвердите почту — ${SITE_NAME}`,
    html,
  });
  if (error) throw new Error(error.message);
}
